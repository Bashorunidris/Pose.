'use client';

import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  startAfter,
  type DocumentData,
  type QueryDocumentSnapshot,
} from 'firebase/firestore';

import { getPoseFirebase } from '@/lib/firebase';
import { interactionCount } from './format';
import type {
  BuzzPost,
  PoseChannel,
  PoseEpisode,
  PoseNotification,
  PoseSeason,
  PoseUser,
  PoseVideo,
  TrendRow,
  TrendingDay,
} from './types';

export const FORYOU_BATCH_SIZE = 15;
export const BUZZ_DAYS_BACK = 3;
export const BUZZ_PER_DAY_LIMIT = 50;
const FEED_CACHE_TTL_MS = 5 * 60 * 1000;
const FORYOU_CACHE_DOC_CAP = 20;

export const FORYOU_VIDEOS_CACHE_KEY = 'forYouVideosCache';
export const FORYOU_CACHE_TIME_KEY = 'forYouCacheTime';
export const BUZZ_FEED_CACHE_KEY = 'buzzFeedCache';
export const POSE_TAB_VIDEOS_CACHE_KEY = 'poseTabVideosCache';
export const POSE_TAB_SEASONS_CACHE_KEY = 'poseTabSeasonsCache';
export const POSE_TAB_CACHE_TIME_KEY = 'poseTabCacheTime';

/**
 * `createdAt` is written as a Firestore Timestamp by newer publish paths but as a
 * number or ISO string by older documents, so every screen normalises before
 * comparing or formatting.
 */
export function toMillis(value: unknown): number {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = Date.parse(value);
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  const maybe = value as { seconds?: number; milliseconds?: number; toMillis?: () => number };
  if (typeof maybe.toMillis === 'function') return maybe.toMillis();
  if (typeof maybe.milliseconds === 'number') return maybe.milliseconds;
  if (typeof maybe.seconds === 'number') return maybe.seconds * 1000;
  return 0;
}

function readCache<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function writeCache(key: string, value: unknown): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage quota or private mode: the feed still renders from Firestore.
  }
}

function isFresh(timestamp: number | null | undefined): boolean {
  return typeof timestamp === 'number' && Date.now() - timestamp < FEED_CACHE_TTL_MS;
}

function mapVideoDoc(doc: QueryDocumentSnapshot<DocumentData>): PoseVideo {
  return { id: doc.id, ...(doc.data() as Omit<PoseVideo, 'id'>) };
}

function mapBuzzDoc(doc: QueryDocumentSnapshot<DocumentData>, date: string): BuzzPost {
  return { id: doc.id, date, ...(doc.data() as Omit<BuzzPost, 'id' | 'date'>) };
}

export type ForYouPage = {
  videos: PoseVideo[];
  lastDoc: QueryDocumentSnapshot<DocumentData> | null;
};

/**
 * Newest-first page of the public video feed. The ordered query needs a
 * `videos(createdAt desc)` index; production does not have one, so the legacy app
 * falls back to an unordered read and sorts on the client. Same fallback here —
 * without it the first For You load rejects with "The query requires an index".
 */
export async function fetchForYouPage(lastDoc?: QueryDocumentSnapshot<DocumentData> | null): Promise<ForYouPage> {
  const { db } = getPoseFirebase();
  const base = collection(db, 'videos');
  const size = limit(FORYOU_BATCH_SIZE);

  if (lastDoc) {
    const page = await getDocs(query(base, orderBy('createdAt', 'desc'), startAfter(lastDoc), size));
    return {
      videos: page.docs.map(mapVideoDoc),
      lastDoc: page.empty ? lastDoc : page.docs[page.docs.length - 1] ?? lastDoc,
    };
  }

  try {
    const page = await getDocs(query(base, orderBy('createdAt', 'desc'), size));
    return { videos: page.docs.map(mapVideoDoc), lastDoc: page.docs[page.docs.length - 1] ?? null };
  } catch {
    const page = await getDocs(query(base, size));
    const videos = page.docs.map(mapVideoDoc).sort((a, b) => toMillis(b.createdAt) - toMillis(a.createdAt));
    return { videos, lastDoc: null };
  }
}

export function getCachedForYouVideos(): PoseVideo[] | null {
  if (!isFresh(readCache<number>(FORYOU_CACHE_TIME_KEY))) return null;
  return readCache<PoseVideo[]>(FORYOU_VIDEOS_CACHE_KEY);
}

export function cacheForYouVideos(videos: PoseVideo[]): void {
  const trimmed = videos.slice(0, FORYOU_CACHE_DOC_CAP);
  writeCache(FORYOU_VIDEOS_CACHE_KEY, trimmed);
  writeCache(FORYOU_CACHE_TIME_KEY, Date.now());
}

/**
 * Buzz posts live in daily buckets: `postedtweetdata/{YYYY-MM-DD}/posts`. Only the
 * last three buckets are read, which is what keeps the collection-scannable.
 */
export async function fetchBuzzPosts(): Promise<BuzzPost[]> {
  const { db } = getPoseFirebase();
  const today = new Date();
  const buckets: string[] = [];
  const all: BuzzPost[] = [];

  for (let back = 0; back < BUZZ_DAYS_BACK; back += 1) {
    const date = new Date(today);
    date.setDate(date.getDate() - back);
    const key = [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, '0'),
      String(date.getDate()).padStart(2, '0'),
    ].join('-');
    buckets.push(key);
  }

  const pages = await Promise.allSettled(
    buckets.map((key) =>
      getDocs(query(collection(db, 'postedtweetdata', key, 'posts'), limit(BUZZ_PER_DAY_LIMIT)))
        .then((snap) => snap.docs.map((doc) => mapBuzzDoc(doc, key)))
    ),
  );

  const failures = pages.filter(
    (page): page is PromiseRejectedResult => page.status === 'rejected',
  );
  // A day bucket that does not exist resolves empty, so the only way every bucket
  // rejects is a read the security rules refuse. Swallowing that would paint
  // "No Buzz Yet" over a permissions failure.
  if (failures.length === pages.length && failures[0]) throw failures[0].reason;

  for (const page of pages) {
    if (page.status !== 'fulfilled') continue;
    for (const post of page.value) {
      if (post.type === 'buzz' || post.type === 'tweet') all.push(post);
    }
  }

  return all.sort((a, b) => toMillis(b.createdAt) - toMillis(a.createdAt));
}

export function getCachedBuzzPosts(): BuzzPost[] | null {
  const cached = readCache<{ buzzs?: BuzzPost[]; timestamp?: number }>(BUZZ_FEED_CACHE_KEY);
  if (!cached || !isFresh(cached.timestamp)) return null;
  return cached.buzzs ?? null;
}

export function cacheBuzzPosts(buzzs: BuzzPost[]): void {
  writeCache(BUZZ_FEED_CACHE_KEY, { buzzs, timestamp: Date.now() });
}

export function clearBuzzFeedCache(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(BUZZ_FEED_CACHE_KEY);
}

/** `goToHome` @42716 clears both For You keys before re-pulling, or the remount
 *  would just read the same cached page back out of localStorage. */
export function clearForYouFeedCache(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(FORYOU_VIDEOS_CACHE_KEY);
  window.localStorage.removeItem(FORYOU_CACHE_TIME_KEY);
}

export type PoseTabFeed = {
  videos: (PoseVideo & { channelId: string; channel: PoseChannel | null })[];
  seasons: (PoseSeason & { channelId: string; channel: PoseChannel | null; episodes: PoseEpisode[] })[];
};

/**
 * The Pose tab has no flat feed collection: every channel owns `videos` and
 * `seasons` subcollections, and each season owns `episodes`. This fans out one
 * read per channel plus one per season, which is why the result is cached.
 * Seasons with fewer than two episodes are drafts and stay hidden.
 */
export async function fetchPoseTabFeed(): Promise<PoseTabFeed> {
  const { db } = getPoseFirebase();
  const channelsSnap = await getDocs(collection(db, 'channels'));
  const channelMap = new Map<string, PoseChannel>();
  for (const doc of channelsSnap.docs) {
    channelMap.set(doc.id, { id: doc.id, ...(doc.data() as Omit<PoseChannel, 'id'>) });
  }

  const perChannel = await Promise.allSettled(
    channelsSnap.docs.map(async (channelDoc) => {
      const channelId = channelDoc.id;
      const channel = channelMap.get(channelId) ?? null;
      const [videosSnap, seasonsSnap] = await Promise.all([
        getDocs(collection(db, 'channels', channelId, 'videos')),
        getDocs(collection(db, 'channels', channelId, 'seasons')),
      ]);

      const videos = videosSnap.docs.map((doc) => ({
        id: doc.id,
        channelId,
        channel,
        ...(doc.data() as Omit<PoseVideo, 'id'>),
      }));

      const seasons = await Promise.all(
        seasonsSnap.docs
          .filter((doc) => (doc.data() as PoseSeason).status !== 'draft')
          .map(async (seasonDoc) => {
            const episodesSnap = await getDocs(
              query(
                collection(db, 'channels', channelId, 'seasons', seasonDoc.id, 'episodes'),
                orderBy('episodeNumber', 'asc'),
              ),
            );
            return {
              id: seasonDoc.id,
              channelId,
              channel,
              episodes: episodesSnap.docs.map(
                (episode) => ({ id: episode.id, ...(episode.data() as Omit<PoseEpisode, 'id'>) }),
              ),
              ...(seasonDoc.data() as Omit<PoseSeason, 'id'>),
            };
          }),
      );

      return { videos, seasons };
    }),
  );

  const feed: PoseTabFeed = { videos: [], seasons: [] };
  for (const result of perChannel) {
    if (result.status !== 'fulfilled') continue;
    feed.videos.push(...result.value.videos);
    feed.seasons.push(...result.value.seasons);
  }
  return feed;
}

export function getCachedPoseTabFeed(): PoseTabFeed | null {
  if (!isFresh(readCache<number>(POSE_TAB_CACHE_TIME_KEY))) return null;
  const videos = readCache<PoseTabFeed['videos']>(POSE_TAB_VIDEOS_CACHE_KEY);
  const seasons = readCache<PoseTabFeed['seasons']>(POSE_TAB_SEASONS_CACHE_KEY);
  if (!videos || !seasons) return null;
  return { videos, seasons };
}

export function cachePoseTabFeed(feed: PoseTabFeed): void {
  writeCache(POSE_TAB_VIDEOS_CACHE_KEY, feed.videos);
  writeCache(POSE_TAB_SEASONS_CACHE_KEY, feed.seasons);
  writeCache(POSE_TAB_CACHE_TIME_KEY, Date.now());
}

export function countOf(value: number | Record<string, unknown> | undefined): number {
  if (typeof value === 'number') return value;
  if (value && typeof value === 'object') return Object.keys(value).length;
  return 0;
}

const TREND_VIDEO_SAMPLE_SIZE = 300;
const TREND_PER_DAY = 15;
export const TREND_RAIL_SIZE = 8;

export type TrendFeed = { sample: TrendRow[]; days: TrendingDay[] };

/**
 * Trend is not a stored collection: `loadTrendModalContent` @78781 reads the
 * newest 300 videos and derives everything client-side — the date grid keeps the
 * 15 most-liked videos of each calendar day, and the Today / Week / Month rails
 * are time windows over the same sample. The legacy code sorted the buckets by
 * re-parsing the display label (`new Date('Jan 15, 2025')`); sorting the
 * bucket's own timestamp is the same order without the locale dependency.
 */
export async function fetchTrendFeed(): Promise<TrendFeed> {
  const { db } = getPoseFirebase();
  const snap = await getDocs(query(collection(db, 'videos'), limit(TREND_VIDEO_SAMPLE_SIZE)));

  const sample: TrendRow[] = snap.docs.map((entry) => {
    const video: PoseVideo = { id: entry.id, ...(entry.data() as Omit<PoseVideo, 'id'>) };
    return { video, likeCount: interactionCount(video.likeCount, video.likes) };
  });

  const buckets = new Map<string, { latest: number; rows: TrendRow[] }>();
  for (const row of sample) {
    const millis = toMillis(row.video.createdAt) || Date.now();
    const label = new Date(millis).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    const bucket = buckets.get(label) ?? { latest: 0, rows: [] };
    bucket.latest = Math.max(bucket.latest, millis);
    bucket.rows.push(row);
    buckets.set(label, bucket);
  }

  const days: TrendingDay[] = [...buckets.entries()]
    .sort((a, b) => b[1].latest - a[1].latest)
    .map(([label, bucket]) => ({
      label,
      rows: bucket.rows.sort((a, b) => b.likeCount - a.likeCount).slice(0, TREND_PER_DAY),
    }));

  return { sample, days };
}

/** The most-liked videos posted within the last `hours`, capped at one rail. */
export function trendWindow(sample: TrendRow[], hours: number): TrendRow[] {
  const cutoff = Date.now() - hours * 60 * 60 * 1000;
  return sample
    .filter((row) => (toMillis(row.video.createdAt) || Date.now()) >= cutoff)
    .sort((a, b) => b.likeCount - a.likeCount)
    .slice(0, TREND_RAIL_SIZE);
}

/**
 * Notifications live per-user at `notifications/{uid}/items` (the legacy
 * `PoseNotifications` module writes them with `serverTimestamp`, so ordering is
 * only reliable once Firestore has resolved the pending write — hence the
 * `includeMetadataChanges` listener the legacy app uses for the badge count).
 */
export function watchNotifications(
  uid: string,
  onNext: (items: PoseNotification[]) => void,
  onError: (error: unknown) => void,
): () => void {
  const { db } = getPoseFirebase();
  return onSnapshot(
    query(collection(db, 'notifications', uid, 'items'), orderBy('createdAt', 'desc'), limit(200)),
    (snap) => {
      onNext(
        snap.docs.map((doc) => ({ id: doc.id, ...(doc.data() as Omit<PoseNotification, 'id'>) })),
      );
    },
    onError,
  );
}

export async function fetchUser(uid: string): Promise<PoseUser | null> {
  const { db } = getPoseFirebase();
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    if (!snap.exists()) return null;
    return { id: snap.id, ...(snap.data() as Omit<PoseUser, 'id'>) };
  } catch {
    return null;
  }
}

/**
 * The For You card shows a follower count and a follow toggle, so the feed needs
 * two reads the legacy app cached on `window`: who the signed-in user follows,
 * and how many followers each creator in the feed has. Both are reverse maps on
 * the user document, so counts are derived from their key length.
 */
export async function fetchFollowingMap(uid: string): Promise<Record<string, boolean>> {
  const user = await fetchUser(uid);
  const raw = (user as { following?: Record<string, boolean> } | null)?.following;
  if (!raw || typeof raw !== 'object') return {};
  return Object.fromEntries(
    Object.entries(raw).filter(([, value]) => value === true).map(([key]) => [key, true]),
  );
}

export async function fetchFollowerCounts(userIds: string[]): Promise<Record<string, number>> {
  const { db } = getPoseFirebase();
  const unique = [...new Set(userIds.filter(Boolean))];
  const results = await Promise.allSettled(unique.map((id) => getDoc(doc(db, 'users', id))));
  const counts: Record<string, number> = {};
  results.forEach((result, index) => {
    if (result.status !== 'fulfilled' || !result.value.exists()) return;
    const followers = (result.value.data() as { followers?: Record<string, unknown> }).followers;
    counts[unique[index] ?? ''] = followers ? Object.keys(followers).length : 0;
  });
  return counts;
}
