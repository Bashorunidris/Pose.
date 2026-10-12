'use client';

import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  increment,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';

import { getPoseFirebase } from '@/lib/firebase';
import { toMillis } from './feed';
import type { PoseTabSeason, PoseTabVideo } from './pose-tab';
import type { FirestoreDate, PoseChannel, PoseEpisode, PoseVideo } from './types';

/**
 * `#forYouChannelPage` @90435 — a creator's public channel.
 *
 * The legacy kept the whole page on module-level globals (`_fycCreator`,
 * `_fycChannels`, `_fycActiveChannel`, `_fycVideos`, `_fycSeasons`,
 * `_fycEpisodes`) plus a five-minute cache (`_fycCache` @67918). This holds the
 * reads and the two derivations that decide what the page shows.
 */

export type ChannelDoc = PoseChannel & {
  ownerUid?: string;
  bannerURL?: string;
  description?: string;
  genre?: string;
  verified?: boolean;
  fans?: number;
  subscribers?: number;
  fanCount?: number;
  totalViews?: number;
  viewCount?: number;
  views?: number;
  totalLikes?: number;
  likeCount?: number;
  likes?: number;
  createdAt?: FirestoreDate;
  status?: string;
};

export type ChannelContent = {
  videos: PoseTabVideo[];
  seasons: PoseTabSeason[];
  /**
   * When the read landed. `fycBuildTabs()` @68300 and `fycBuildAllHTML()` @68380
   * both called `Date.now()` to decide what counts as "newly released", which is
   * not something a render may do here, so the timestamp travels with the
   * content instead.
   */
  loadedAt: number;
};

export type ChannelCard =
  | { kind: 'video'; video: PoseTabVideo }
  | { kind: 'featured'; video: PoseTabVideo }
  | { kind: 'soon'; video: PoseTabVideo }
  | { kind: 'season'; season: PoseTabSeason };

export type ChannelSection = {
  key: string;
  title: string;
  /** Font Awesome standing in for the emoji in the legacy section titles. */
  icon: string;
  wide: boolean;
  cards: ChannelCard[];
};

export type ChannelTab = {
  id: string;
  label: string;
  icon?: string;
  tone?: 'new' | 'soon';
};

/** `_FYC_CACHE_TTL` @67919. */
const CACHE_TTL_MS = 5 * 60 * 1000;

/** The window `fycBuildTabs()` @68300 treated as newly released. */
export const NEW_WINDOW_MS = 30 * 86400 * 1000;

/** The categories `fycRenderTab()` @68343 folds into the Movies tab. */
export const MOVIE_CATEGORIES = ['movie', 'movies', 'film', 'films', 'nollywood'];

const contentCache = new Map<string, ChannelContent>();

/** `_fycCacheGet()` @67921. */
export function cachedChannelContent(channelId: string): ChannelContent | null {
  const entry = contentCache.get(channelId);
  if (!entry) return null;
  if (Date.now() - entry.loadedAt > CACHE_TTL_MS) {
    contentCache.delete(channelId);
    return null;
  }
  return entry;
}

/** `isComingSoon` inside `fycBuildTabs()` @68300. */
export function isComingSoon(video: { comingSoon?: boolean; status?: string }): boolean {
  return (
    Boolean(video.comingSoon) ||
    video.status === 'coming_soon' ||
    video.status === 'coming-soon'
  );
}

/** `fycCatLabel()` @68196 — `coming_soon` becomes "Coming Soon". */
export function channelCategoryLabel(category: string | undefined): string {
  if (!category) return 'More Videos';
  return String(category)
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function isMovieCategory(category: string | undefined): boolean {
  return MOVIE_CATEGORIES.includes(String(category ?? '').toLowerCase());
}

function isNew(video: PoseTabVideo, loadedAt: number): boolean {
  const created = toMillis(video.createdAt);
  return created > loadedAt - NEW_WINDOW_MS;
}

/**
 * `openForYouChannel()` @67986 read the channel ids off the user document first
 * (`channelIds`, `channelId`, `lastChannelId`) and only fell back to an
 * `ownerUid` query when none of them resolved. Both paths are kept, because the
 * fast one is a couple of direct reads and the query is a full collection scan.
 */
export async function fetchCreatorChannels(userId: string): Promise<ChannelDoc[]> {
  const { db } = getPoseFirebase();

  try {
    const userSnap = await getDoc(doc(db, 'users', userId));
    const userData = (userSnap.exists() ? userSnap.data() : {}) as Record<string, unknown>;

    const storedIds = [
      ...(Array.isArray(userData.channelIds) ? (userData.channelIds as string[]) : []),
      typeof userData.channelId === 'string' ? userData.channelId : null,
      typeof userData.lastChannelId === 'string' ? userData.lastChannelId : null,
    ]
      .filter((value): value is string => Boolean(value))
      .filter((value, index, all) => all.indexOf(value) === index);

    if (storedIds.length) {
      const fetched = await Promise.all(storedIds.map((id) => getDoc(doc(db, 'channels', id))));
      const owned = fetched
        .filter((snap) => snap.exists() && (snap.data() as ChannelDoc).ownerUid === userId)
        .map((snap) => ({ id: snap.id, ...(snap.data() as Omit<ChannelDoc, 'id'>) }));
      if (owned.length) return sortChannels(owned);
    }
  } catch {
    // Falls through to the query, the way the legacy did.
  }

  const snap = await getDocs(query(collection(db, 'channels')));
  return sortChannels(
    snap.docs
      .map((entry) => ({ id: entry.id, ...(entry.data() as Omit<ChannelDoc, 'id'>) }))
      .filter((channel) => channel.ownerUid === userId),
  );
}

/** Newest channel first, as `openForYouChannel()` @67986 sorted them. */
function sortChannels(channels: ChannelDoc[]): ChannelDoc[] {
  return channels.sort((a, b) => toMillis(b.createdAt) - toMillis(a.createdAt));
}

/**
 * `loadFycChannelContent()` @68454 — `channels/{id}/videos` and
 * `channels/{id}/seasons`, drafts dropped, newest first, both stamped with the
 * channel they belong to.
 */
export async function fetchChannelContent(channel: ChannelDoc): Promise<ChannelContent> {
  const cached = cachedChannelContent(channel.id);
  if (cached) return cached;

  const { db } = getPoseFirebase();
  const base = doc(db, 'channels', channel.id);
  const [videosSnap, seasonsSnap] = await Promise.all([
    getDocs(collection(base, 'videos')),
    getDocs(collection(base, 'seasons')),
  ]);

  const byNewest = (a: { createdAt?: FirestoreDate }, b: { createdAt?: FirestoreDate }) =>
    toMillis(b.createdAt) - toMillis(a.createdAt);

  const videos = videosSnap.docs
    .map((entry) => {
      const video: PoseTabVideo = {
        ...(entry.data() as Omit<PoseVideo, 'id'>),
        id: entry.id,
        channelId: channel.id,
        channelName: channel.name,
        channel,
      };
      return video;
    })
    .filter((video) => video.status !== 'draft')
    .sort(byNewest);

  const seasons = seasonsSnap.docs
    .map((entry) => {
      const season: PoseTabSeason = {
        ...(entry.data() as Omit<PoseTabSeason, 'id' | 'channelId' | 'channel' | 'episodes'>),
        id: entry.id,
        channelId: channel.id,
        channel,
        episodes: [] as PoseEpisode[],
      };
      return season;
    })
    .filter((season) => season.status !== 'draft')
    .sort(byNewest);

  const content: ChannelContent = { videos, seasons, loadedAt: Date.now() };
  contentCache.set(channel.id, content);
  return content;
}

/** `fycOpenSeason()` @68585 — `channels/{id}/seasons/{seasonId}/episodes`. */
export async function fetchSeasonEpisodes(
  channelId: string,
  seasonId: string,
): Promise<PoseEpisode[]> {
  const { db } = getPoseFirebase();
  const snap = await getDocs(
    query(
      collection(db, 'channels', channelId, 'seasons', seasonId, 'episodes'),
      orderBy('episodeNumber'),
    ),
  );
  return snap.docs
    .map((entry) => ({ id: entry.id, ...(entry.data() as Omit<PoseEpisode, 'id'>) }))
    .filter((episode) => episode.status !== 'draft');
}

/** `fycSetHeader()` @68125 read four spellings for each of the three counts. */
export function channelStats(channel: ChannelDoc): {
  fans: number;
  views: number;
  likes: number;
} {
  return {
    fans: Number(channel.fans ?? channel.subscribers ?? channel.fanCount) || 0,
    views: Number(channel.totalViews ?? channel.viewCount ?? channel.views) || 0,
    likes: Number(channel.totalLikes ?? channel.likeCount ?? channel.likes) || 0,
  };
}

/**
 * `_fycRender()` @68425 totalled the video list when the channel document
 * carried no views, and wrote the two totals back onto the header.
 */
export function channelTotalsFromVideos(videos: PoseTabVideo[]): {
  views: number;
  likes: number;
} {
  return videos.reduce(
    (totals, video) => ({
      views: totals.views + (Number(video.viewCount ?? video.views) || 0),
      likes: totals.likes + (Number(video.likeCount ?? video.likes) || 0),
    }),
    { views: 0, likes: 0 },
  );
}

/** `fycCheckFanStatus()` @68540. */
export async function isChannelFan(channelId: string, uid: string): Promise<boolean> {
  try {
    const { db } = getPoseFirebase();
    const snap = await getDoc(doc(db, 'channels', channelId, 'fans', uid));
    return snap.exists();
  } catch {
    return false;
  }
}

/**
 * `fycToggleFan()` @68499 — the fan document and the channel's own counter move
 * together, because the header reads the counter.
 */
export async function setChannelFan(
  channelId: string,
  uid: string,
  fanning: boolean,
): Promise<void> {
  const { db } = getPoseFirebase();
  const channelRef = doc(db, 'channels', channelId);
  if (fanning) {
    await setDoc(doc(channelRef, 'fans', uid), {
      uid,
      channelId,
      timestamp: serverTimestamp(),
    });
    await setDoc(channelRef, { fans: increment(1) }, { merge: true });
    return;
  }
  await deleteDoc(doc(channelRef, 'fans', uid));
  await setDoc(channelRef, { fans: increment(-1) }, { merge: true });
}

/**
 * `fycBuildTabs()` @68300. The legacy labels carried emoji (`'🆕 New'`,
 * `'⏳ Coming Soon'`, `'📺 Series'`, `'🎬 Movies'`); the port carries Font
 * Awesome names and lets the tab bar draw them.
 */
export function channelTabs(content: ChannelContent | null): ChannelTab[] {
  if (!content) return [];
  const { videos, seasons, loadedAt } = content;

  if (!videos.length && !seasons.length) return [];

  const cats = new Set<string>();
  let hasMovies = false;
  videos.forEach((video) => {
    const category = String(video.category ?? '').toLowerCase();
    if (!category) return;
    if (isMovieCategory(category)) {
      hasMovies = true;
      return;
    }
    cats.add(category);
  });

  const tabs: ChannelTab[] = [{ id: 'all', label: 'All' }];
  if (videos.some((video) => isNew(video, loadedAt) && !isComingSoon(video))) {
    tabs.push({ id: 'new', label: 'New', icon: 'fa-solid fa-certificate', tone: 'new' });
  }
  if (videos.some(isComingSoon)) {
    tabs.push({ id: 'soon', label: 'Coming Soon', icon: 'fa-regular fa-clock', tone: 'soon' });
  }
  if (seasons.length) tabs.push({ id: 'series', label: 'Series', icon: 'fa-solid fa-tv' });
  if (hasMovies) tabs.push({ id: 'movies', label: 'Movies', icon: 'fa-solid fa-film' });
  cats.forEach((category) => tabs.push({ id: category, label: channelCategoryLabel(category) }));

  return tabs;
}

function videoCard(video: PoseTabVideo): ChannelCard {
  return { kind: 'video', video };
}

function section(
  key: string,
  title: string,
  icon: string,
  cards: ChannelCard[],
  wide = false,
): ChannelSection {
  return { key, title, icon, wide, cards };
}

/**
 * `fycBuildAllHTML()` @68380 and `fycRenderTab()` @68343 as one derivation: the
 * coming-soon strip first, then the newly-released featured row, then series,
 * then movies, then whatever is left grouped by category.
 */
export function channelSections(
  content: ChannelContent | null,
  tabId: string,
): { sections: ChannelSection[]; empty: { icon: string; message: string } | null } {
  if (!content) return { sections: [], empty: null };
  const { videos, seasons, loadedAt } = content;

  if (!videos.length && !seasons.length) {
    return { sections: [], empty: { icon: 'fa-solid fa-film', message: 'No videos uploaded to this channel yet.' } };
  }

  const soon = videos.filter(isComingSoon);
  const playable = videos.filter((video) => !isComingSoon(video));
  const released = playable.filter((video) => isNew(video, loadedAt));
  const movies = playable.filter((video) => isMovieCategory(video.category));

  if (tabId === 'all') {
    const sections: ChannelSection[] = [];
    if (soon.length) {
      sections.push(section('soon', 'Coming Soon', 'fa-regular fa-clock', soon.map((video) => ({ kind: 'soon', video }))));
    }
    if (released.length) {
      sections.push(
        section('new', 'Newly Released', 'fa-solid fa-certificate', released.map((video) => ({ kind: 'featured', video })), true),
      );
    }
    if (seasons.length) {
      sections.push(
        section('series', 'Series & Seasons', 'fa-solid fa-tv', seasons.map((season) => ({ kind: 'season' as const, season }))),
      );
    }
    if (movies.length) {
      sections.push(section('movies', 'Movies', 'fa-solid fa-film', movies.map(videoCard)));
    }

    const byCategory = new Map<string, PoseTabVideo[]>();
    playable.forEach((video) => {
      if (isMovieCategory(video.category)) return;
      const category = video.category || 'Other';
      const bucket = byCategory.get(category) ?? [];
      bucket.push(video);
      byCategory.set(category, bucket);
    });
    byCategory.forEach((bucket, category) => {
      sections.push(section(category, channelCategoryLabel(category), 'fa-solid fa-film', bucket.map(videoCard)));
    });

    return { sections, empty: null };
  }

  if (tabId === 'new') {
    if (!released.length) return { sections: [], empty: { icon: 'fa-solid fa-film', message: 'No new releases yet.' } };
    return {
      sections: [section('new', 'Newly Released', 'fa-solid fa-certificate', released.map(videoCard))],
      empty: null,
    };
  }

  if (tabId === 'soon') {
    if (!soon.length) return { sections: [], empty: { icon: 'fa-regular fa-clock', message: 'Nothing announced yet.' } };
    return {
      sections: [section('soon', 'Coming Soon', 'fa-regular fa-clock', soon.map((video) => ({ kind: 'soon', video })))],
      empty: null,
    };
  }

  if (tabId === 'series') {
    if (!seasons.length) return { sections: [], empty: { icon: 'fa-solid fa-layer-group', message: 'No series yet.' } };
    return {
      sections: [section('series', 'Series & Seasons', 'fa-solid fa-tv', seasons.map((season) => ({ kind: 'season' as const, season })))],
      empty: null,
    };
  }

  if (tabId === 'movies') {
    if (!movies.length) return { sections: [], empty: { icon: 'fa-solid fa-film', message: 'No movies yet.' } };
    return {
      sections: [section('movies', 'Movies', 'fa-solid fa-film', movies.map(videoCard))],
      empty: null,
    };
  }

  const inCategory = playable.filter(
    (video) => String(video.category ?? '').toLowerCase() === tabId,
  );
  if (!inCategory.length) {
    return { sections: [], empty: { icon: 'fa-solid fa-film', message: 'No videos in this category.' } };
  }
  return {
    sections: [section(tabId, channelCategoryLabel(tabId), 'fa-solid fa-film', inCategory.map(videoCard))],
    empty: null,
  };
}
