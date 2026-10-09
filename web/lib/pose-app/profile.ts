/**
 * The profile screen's data, lifted from `openProfile()` / `updateProfileStats()`
 * / `loadProfileFeed()` in the legacy page.
 *
 * The three reads are deliberately kept apart: the user document is what the
 * header needs, the stats are derived (followers/following are reverse maps on
 * that same document, so their key count is the number), and the grid is the
 * `videos` collection filtered to this creator.
 */

import { collection, doc, getDoc, getDocs, orderBy, query, where } from 'firebase/firestore';

import { getPoseFirebase } from '@/lib/firebase';

import type { PoseUser, PoseVideo } from './types';

/** `FEED_BATCH_SIZE` — the legacy grid appended in batches as you scrolled. */
export const PROFILE_BATCH_SIZE = 12;

export type ProfileStats = {
  followers: number;
  following: number;
  likes: number;
  views: number;
};

export type ProfileData = {
  user: PoseUser | null;
  stats: ProfileStats;
  videos: PoseVideo[];
};

export type ProfileLink = { title: string; url: string };

/** `formatCount()` — the compact form the grid overlays use. */
export function formatCount(value: unknown): string {
  const n = Number(value) || 0;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function toMillis(value: unknown): number {
  if (!value) return 0;
  if (typeof (value as { toMillis?: unknown }).toMillis === 'function') {
    return (value as { toMillis: () => number }).toMillis();
  }
  const seconds = (value as { seconds?: number }).seconds;
  if (seconds != null) return seconds * 1000;
  const parsed = new Date(value as string | number).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
}

export function profileInitial(name: string | undefined): string {
  return (name || 'U').charAt(0).toUpperCase();
}

export function profileDisplayName(user: PoseUser | null): string {
  if (!user) return 'Loading…';
  return user.name || user.displayName || 'Pose User';
}

export function profileUsername(user: PoseUser | null): string {
  const raw = user?.username;
  if (!raw) return '@user';
  return raw.startsWith('@') ? raw : `@${raw}`;
}

/**
 * `renderProfileLinks()` — the legacy stored links as `{title, url}` records,
 * but older documents have plain URL strings and a `label` variant, so every
 * shape that exists in production is accepted here.
 */
export function profileLinks(user: PoseUser | null): ProfileLink[] {
  const raw = (user as { links?: unknown; profileLinks?: unknown } | null);
  const list = raw?.links ?? raw?.profileLinks;
  if (!Array.isArray(list)) return [];

  return list
    .map((entry) => {
      if (typeof entry === 'string') return { title: entry, url: entry };
      if (!entry || typeof entry !== 'object') return null;
      const record = entry as { title?: string; label?: string; name?: string; url?: string; href?: string };
      const url = record.url || record.href || '';
      if (!url) return null;
      return { title: record.title || record.label || record.name || url, url };
    })
    .filter((entry): entry is ProfileLink => entry !== null);
}

export function isVerified(user: PoseUser | null): boolean {
  return Boolean((user as { verified?: boolean } | null)?.verified);
}

/** `updateProfileStats()` — followers/following are key counts, likes are per-video maps. */
export function statsFrom(user: PoseUser | null, videos: PoseVideo[]): ProfileStats {
  const record = user as { followers?: Record<string, unknown>; following?: Record<string, unknown> } | null;
  let likes = 0;
  let views = 0;
  videos.forEach((video) => {
    likes += video.likes && typeof video.likes === 'object'
      ? Object.keys(video.likes).length
      : Number(video.likeCount) || 0;
    views += Number(video.views ?? video.viewCount) || 0;
  });
  return {
    followers: record?.followers ? Object.keys(record.followers).length : 0,
    following: record?.following ? Object.keys(record.following).length : 0,
    likes,
    views,
  };
}

/**
 * `loadProfileFeed()` — the grid is videos-only, so posts saved into the same
 * collection with `type: 'story'` or `type: 'photo'` are filtered out (they have
 * their own tabs; without this they leaked into the Feed grid too).
 */
export async function fetchUserVideos(uid: string): Promise<PoseVideo[]> {
  const { db } = getPoseFirebase();
  const ref = collection(db, 'videos');

  let docs: PoseVideo[] = [];
  try {
    const snapshot = await getDocs(query(ref, where('userId', '==', uid), orderBy('createdAt', 'desc')));
    docs = snapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() }) as PoseVideo);
  } catch {
    // The composite index is not guaranteed on every project — the legacy page
    // fell back to an unordered read and sorted in memory for the same reason.
    const snapshot = await getDocs(query(ref, where('userId', '==', uid)));
    docs = snapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() }) as PoseVideo);
  }

  return docs
    .filter((video) => video.type !== 'story' && video.type !== 'photo')
    .sort((a, b) => toMillis(b.createdAt) - toMillis(a.createdAt));
}

export async function loadProfile(uid: string): Promise<ProfileData> {
  const { db } = getPoseFirebase();
  const snapshot = await getDoc(doc(db, 'users', uid));
  const user = snapshot.exists() ? ({ id: snapshot.id, ...snapshot.data() } as PoseUser) : null;

  let videos: PoseVideo[] = [];
  try {
    videos = await fetchUserVideos(uid);
  } catch (error) {
    // A missing video list is not a dead profile: the header and stats still render.
    console.error('❌ loading profile videos:', error);
  }

  return { user, videos, stats: statsFrom(user, videos) };
}

/** The avatar picture, tolerating the three field names used across versions. */
export function profilePic(user: PoseUser | null): string {
  return (user?.profilePicUrl || user?.userProfilePic || user?.photoURL || '').trim();
}
