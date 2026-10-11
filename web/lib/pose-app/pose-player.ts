'use client';

import { collection, doc, getDoc, getDocs, serverTimestamp, setDoc } from 'firebase/firestore';

import { getPoseFirebase } from '@/lib/firebase';
import { toMillis } from './feed';
import { poseIsPaid, posePrice, type PoseTabSeason, type PoseTabVideo } from './pose-tab';
import type { PoseChannel, PoseEpisode } from './types';

/**
 * `#tnPlayerPage` @27130 — the player the Pose tab and Blink both open. The
 * legacy kept its state on `window` (`_tnpData`, `_tnpMode`, `_tnpUserRating`);
 * this module holds the parts that are document reads and formatting, so the
 * component stays about playback.
 */

export type PosePlayerVideo = PoseTabVideo & {
  /** Every spelling of the media URLs the legacy `tnpBuild()` reads. */
  trailerURL?: string;
  videoURL?: string;
  episodes?: PoseEpisode[];
  purchased?: boolean;
  description?: string;
  bio?: string;
  ageRating?: string;
  maturityRating?: string;
  year?: string | number;
  isScheduled?: boolean;
  scheduledDate?: unknown;
  isSeason?: boolean;
  seasons?: PoseTabSeason[];
  /** Set when the player was opened from Watch Later, so `ended` clears it. */
  _watchLaterId?: string;
  /** `tnpPlayEpisode()` sets this so the next open auto-plays. */
  _autoPlay?: boolean;
  channel?: (PoseChannel & { subscriberCount?: number; videoCount?: number }) | null;
};

export function playerTitle(video: PosePlayerVideo): string {
  return video.title ?? video.name ?? 'Untitled';
}

export function playerDescription(video: PosePlayerVideo): string {
  return video.description ?? video.bio ?? '';
}

export function playerTrailer(video: PosePlayerVideo): string {
  return video.trailerUrl ?? video.trailerURL ?? video.previewUrl ?? '';
}

export function playerVideoUrl(video: PosePlayerVideo): string {
  return video.videoUrl ?? video.videoURL ?? '';
}

export function playerAgeRating(video: PosePlayerVideo): string {
  return video.ageRating ?? video.maturityRating ?? 'PG';
}

/** `tnpBuild()`'s `toDateSafe()` @87874. */
export function playerDate(value: unknown): Date | null {
  if (!value) return null;
  const millis = toMillis(value);
  return millis ? new Date(millis) : null;
}

/** `releasedStr` @87886 — `12 Jan 2026`. */
export function playerReleased(value: unknown): string {
  const date = playerDate(value);
  if (!date) return '';
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function playerScheduled(video: PosePlayerVideo): Date | null {
  if (!video.isScheduled) return null;
  const date = playerDate(video.scheduledDate);
  if (!date || date.getTime() <= Date.now()) return null;
  return date;
}

/**
 * A scheduled episode still lists, with an UPCOMING badge — `tnpRenderEpisodeList()`
 * @89722 compares the release date to now.
 */
export function isUpcoming(value: unknown): boolean {
  const date = playerDate(value);
  return Boolean(date && date.getTime() > Date.now());
}

/** `tnpRenderStats()` @88077 — the three-cell bar under the title. */
export function playerStats(video: PosePlayerVideo): { value: string; label: string }[] {
  const subs = Number(video.channel?.subscriberCount) || 0;
  const total = Number(video.channel?.videoCount) || 0;
  const duration = String(video.duration ?? '');
  const stats: { value: string; label: string }[] = [];
  if (subs) stats.push({ value: compact(subs), label: 'Subscribers' });
  if (total) stats.push({ value: String(total), label: 'Channel videos' });
  if (duration) stats.push({ value: duration, label: 'Length' });
  return stats;
}

function compact(value: number): string {
  if (value >= 1e6) return `${(value / 1e6).toFixed(1).replace(/\.0$/, '')}M`;
  if (value >= 1e3) return `${(value / 1e3).toFixed(1).replace(/\.0$/, '')}K`;
  return String(value);
}

/** `tnpLoadRelated()` @88706 — up to 20 more videos from the same channel. */
export async function fetchPlayerRelated(channelId: string, videoId: string): Promise<PoseTabVideo[]> {
  if (!channelId) return [];
  const { db } = getPoseFirebase();
  const snap = await getDocs(collection(db, 'channels', channelId, 'videos'));
  return snap.docs
    .filter((entry) => entry.id !== videoId)
    .slice(0, 20)
    .map((entry) => {
      const data = entry.data() as Omit<PoseTabVideo, 'id' | 'channelId' | 'channel'>;
      return { ...data, id: entry.id, channelId, channel: null };
    });
}

/** `tnpBuildChannel()` @89409 — the channel doc behind the player's channel block. */
export async function fetchPlayerChannel(
  channelId: string,
): Promise<(PoseChannel & { subscriberCount?: number; videoCount?: number }) | null> {
  if (!channelId) return null;
  const { db } = getPoseFirebase();
  try {
    const snap = await getDoc(doc(db, 'channels', channelId));
    if (!snap.exists()) return null;
    const data = snap.data() as Omit<PoseChannel, 'id'> & { subscriberCount?: number; videoCount?: number };
    return { ...data, id: channelId };
  } catch {
    return null;
  }
}

/* ──────────────────────────────── Ratings ──────────────────────────────── */

export type PoseRating = { average: number; count: number };

function ratingsCollection(channelId: string, videoId: string) {
  const { db } = getPoseFirebase();
  return collection(db, 'channels', channelId, 'videos', videoId, 'ratings');
}

/** `tnpInitRatings()` @88608 — the average line above the star input. */
export async function fetchRatings(channelId: string, videoId: string): Promise<PoseRating> {
  if (!channelId || !videoId) return { average: 0, count: 0 };
  try {
    const snap = await getDocs(ratingsCollection(channelId, videoId));
    let total = 0;
    snap.forEach((entry) => {
      total += Number((entry.data() as { rating?: number }).rating) || 0;
    });
    const count = snap.size;
    return { average: count ? total / count : 0, count };
  } catch {
    return { average: 0, count: 0 };
  }
}

export async function fetchUserRating(channelId: string, videoId: string, uid: string): Promise<number> {
  if (!channelId || !videoId || !uid) return 0;
  const { db } = getPoseFirebase();
  try {
    const snap = await getDoc(doc(db, 'channels', channelId, 'videos', videoId, 'ratings', uid));
    return snap.exists() ? Number((snap.data() as { rating?: number }).rating) || 0 : 0;
  } catch {
    return 0;
  }
}

/** `tnpSubmitRating()` @88665. */
export async function submitRating(
  channelId: string,
  videoId: string,
  uid: string,
  rating: number,
): Promise<PoseRating> {
  const { db } = getPoseFirebase();
  await setDoc(doc(db, 'channels', channelId, 'videos', videoId, 'ratings', uid), {
    rating,
    uid,
    timestamp: serverTimestamp(),
  });
  return fetchRatings(channelId, videoId);
}

/** `tnStars()` @88790 — filled/empty star glyphs at 1× (`ptStars` @31427 is 5×). */
export function ratingStars(rating: number): string {
  const rounded = Math.max(0, Math.min(5, Math.round(rating)));
  return '★'.repeat(rounded) + '☆'.repeat(5 - rounded);
}

/* ─────────────────────────────── Episodes ─────────────────────────────── */

/** The episodes of the season the player is showing. */
export function playerEpisodes(video: PosePlayerVideo): PoseEpisode[] {
  if (Array.isArray(video.episodes)) return video.episodes;
  if (Array.isArray(video.seasons) && video.seasons[0]) return video.seasons[0].episodes ?? [];
  return [];
}

/** `tnpLoadEpisodes()` @89549 — the season the player is currently listing. */
export function playerSeason(video: PosePlayerVideo): PoseTabSeason | null {
  if (video.isSeason) return video as PoseTabSeason;
  return video.seasons?.[0] ?? null;
}

export function playerPlayable(video: PosePlayerVideo): boolean {
  return !poseIsPaid(video) || Boolean(video.purchased) === true;
}

/** The `FREE` / `n PCK` tag the meta row shows (`tnpBuild()` @87920). */
export function playerPriceTag(video: PosePlayerVideo): string {
  if (!poseIsPaid(video)) return 'FREE';
  return `${posePrice(video).toLocaleString()} PCK`;
}
