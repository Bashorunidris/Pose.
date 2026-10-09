/**
 * All Videos maths and loaders, lifted from the legacy `renderAvSingle()`,
 * `renderAvSeasons()`, `renderAvEpisodes()` block.
 */

import { collection, getDocs, orderBy, query } from 'firebase/firestore';

import type { Firestore } from 'firebase/firestore';

import type { SeasonDoc, VideoDoc } from './types';

export type AvSort = 'newest' | 'oldest' | 'views' | 'revenue';

export const AV_GRADIENTS = ['g1', 'g2', 'g3', 'g4', 'g5', 'g6', 'g7'];

/**
 * Coins are derived from the pool's USD revenue at three different divisors in
 * the legacy page — seasons and episodes divide by 30, the expanded episode-list
 * total by 25. That inconsistency is pre-existing, so it is kept verbatim rather
 * than silently "fixed" into numbers no existing record agrees with.
 */
export const AV_COIN_DIVISOR = 30;
export const AV_SEASON_TOTAL_DIVISOR = 25;

export function avGradient(index: number): string {
  return AV_GRADIENTS[index % AV_GRADIENTS.length] as string;
}

function toMs(value: unknown): number {
  if (!value) return 0;
  if (typeof (value as { toMillis?: unknown }).toMillis === 'function') {
    return (value as { toMillis: () => number }).toMillis();
  }
  const seconds = (value as { seconds?: number }).seconds;
  if (seconds != null) return seconds * 1000;
  const parsed = new Date(value as string | number).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
}

export function applyAvSort<T extends { createdAt?: unknown; views?: unknown; revenue?: unknown }>(list: T[], sort: AvSort): T[] {
  return [...list].sort((a, b) => {
    if (sort === 'oldest') return toMs(a.createdAt) - toMs(b.createdAt);
    if (sort === 'views') return (Number(b.views) || 0) - (Number(a.views) || 0);
    if (sort === 'revenue') return (Number(b.revenue) || 0) - (Number(a.revenue) || 0);
    return toMs(b.createdAt) - toMs(a.createdAt);
  });
}

/** `avFmtDate()` — a valid `12 Mar 2026`, never the legacy `Invalid Date`. */
export function formatAvDate(value: unknown): string {
  if (!value) return '—';
  let date: Date | null = null;
  if (typeof (value as { toDate?: unknown }).toDate === 'function') {
    date = (value as { toDate: () => Date }).toDate();
  } else if (typeof (value as { seconds?: number }).seconds === 'number') {
    date = new Date((value as { seconds: number }).seconds * 1000);
  } else {
    const parsed = new Date(value as string | number);
    date = Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  if (!date || Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export type RatingBadge = { icon: string; label: string; tone: 'green' | 'blue' | 'amber' | 'gray' };

const RATING_TONES: Record<string, RatingBadge['tone']> = {
  all: 'green', '3+': 'green', '7+': 'green',
  teen: 'blue', '10+': 'blue', '13+': 'blue',
  mature: 'amber', '16+': 'amber', '18+': 'amber', '25+': 'amber',
};

const RATING_ICONS: Record<string, string> = {
  all: 'fas fa-circle-check', '3+': 'fas fa-circle-check', '7+': 'fas fa-circle-check',
  teen: 'fas fa-user', '10+': 'fas fa-user', '13+': 'fas fa-user',
  mature: 'fas fa-triangle-exclamation', '16+': 'fas fa-triangle-exclamation',
  '18+': 'fas fa-triangle-exclamation', '25+': 'fas fa-triangle-exclamation',
};

/** `avRatingLabel()` — the legacy emoji prefixes became Font Awesome icons. */
export function ratingBadge(rating: unknown): RatingBadge | null {
  const key = String(rating ?? '');
  if (!key) return null;
  const tone = RATING_TONES[key] ?? 'gray';
  const icon = RATING_ICONS[key] ?? '';
  const label = tone === 'green' ? `All Ages` : key;
  const named = key === 'teen' ? 'Teen' : key === 'mature' ? 'Mature' : label;
  return { icon, label: named, tone };
}

export const RATING_TONE_STYLE: Record<RatingBadge['tone'], { background: string; color: string }> = {
  green: { background: '#D1FAE5', color: '#065F46' },
  blue: { background: '#DBEAFE', color: '#1E40AF' },
  amber: { background: '#FEF3C7', color: '#92400E' },
  gray: { background: 'var(--gray-100)', color: 'var(--gray-600)' },
};

/** Coins a video's released pool views are worth at the creator's PCK tier. */
export function releasedCoins(video: VideoDoc, pckToNgn: number, creatorShare = 0.7): number {
  const releasedViews = Number(video.poolReleasedViews) || 0;
  const coins = Number(video.coinPrice) || 0;
  return Math.round(releasedViews * coins * pckToNgn * creatorShare);
}

export function coinsFromUsd(usd: number, usdToNgn: number, divisor = AV_COIN_DIVISOR): number {
  return Math.round((Number(usd) || 0) * (usdToNgn || 1620) / divisor);
}

export function seasonThumb(season: SeasonDoc): string {
  const thumb = season.thumbnailURL;
  // Older records saved an upload object ({url, path, …}) rather than a string.
  if (thumb && typeof thumb === 'object') return String((thumb as { url?: string }).url ?? '');
  return String(thumb ?? '');
}

export function seasonPriceBadge(mode: unknown): { icon: string; label: string; paid: boolean } {
  switch (mode) {
    case 'per-episode': return { icon: 'fas fa-coins', label: 'Per Episode', paid: true };
    case 'full-season': return { icon: 'fas fa-coins', label: 'Full Season', paid: true };
    case 'mixed': return { icon: 'fas fa-shuffle', label: 'Mixed', paid: true };
    default: return { icon: 'fas fa-rectangle-ad', label: 'Free', paid: false };
  }
}

export async function loadSeasons(db: Firestore, channelId: string): Promise<SeasonDoc[]> {
  const snapshot = await getDocs(
    query(collection(db, 'channels', channelId, 'seasons'), orderBy('createdAt', 'desc')),
  );
  return snapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() }) as SeasonDoc);
}

export async function loadEpisodes(db: Firestore, channelId: string, seasonId: string): Promise<VideoDoc[]> {
  const snapshot = await getDocs(
    query(collection(db, 'channels', channelId, 'seasons', seasonId, 'episodes'), orderBy('episodeNumber')),
  );
  return snapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() }) as VideoDoc);
}
