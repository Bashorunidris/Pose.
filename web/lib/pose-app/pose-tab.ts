'use client';

import { toMillis } from './feed';
import type { PoseChannel, PoseEpisode, PoseSeason, PoseVideo } from './types';

/**
 * The Pose tab (`#poseTab` @25824) has no flat collection of its own: every
 * channel owns `videos` and `seasons`, and the tab fans out over the `channels`
 * collection (`loadPoseTabPosts()` @31196). `fetchPoseTabFeed()` in `feed.ts`
 * already does that read; this module is the derivation layer the legacy kept in
 * `renderPoseTabFromCache()` @30872, `populateCategoryTabs()` @31366 and
 * `createPoseGridItem()` @32010 — categories, badges, the YouTube-style grid and
 * the newly-paid holdback.
 */

export type PoseTabVideo = PoseVideo & {
  channelId: string;
  channel: PoseChannel | null;
  title?: string;
  channelName?: string;
  genre?: string;
  category?: string;
  duration?: string | number;
  length?: string | number;
  trailerUrl?: string;
  previewUrl?: string;
  coinPrice?: number;
  price?: number;
  priceMode?: string;
  rating?: number | string;
  stars?: number | string;
};

export type PoseTabSeason = PoseSeason & {
  channelId: string;
  channel: PoseChannel | null;
  episodes: PoseEpisode[];
  thumbnailURL?: string;
  thumbnailUrl?: string;
  trailerUrl?: string;
  videoUrl?: string;
  seasonNumber?: number;
  description?: string;
  priceMode?: string;
  fullSeasonCoins?: number;
  coinPrice?: number;
  price?: number;
};

/** The sub-tab strip `#posTabsScroll` @25998 — order is the strip's order. */
export const POSE_TABS = [
  'all',
  'dance',
  'comedy',
  'music',
  'tutorial',
  'trending',
  'recent',
  'movies',
  'series',
  'sports',
  'gaming',
  'news',
  'anime',
  'kids',
  'documentary',
  'fitness',
  'food',
  'travel',
  'romance',
  'thriller',
  'scifi',
] as const;

export type PoseTabKey = (typeof POSE_TABS)[number];

export const POSE_TAB_LABELS: Record<PoseTabKey, string> = {
  all: 'All',
  dance: 'Dance',
  comedy: 'Comedy',
  music: 'Music',
  tutorial: 'Tutorial',
  trending: 'Trending',
  recent: 'Recent',
  movies: 'Movies',
  series: 'Series',
  sports: 'Sports',
  gaming: 'Gaming',
  news: 'News',
  anime: 'Anime',
  kids: 'Kids',
  documentary: 'Docs',
  fitness: 'Fitness',
  food: 'Food',
  travel: 'Travel',
  romance: 'Romance',
  thriller: 'Thriller',
  scifi: 'Sci-Fi',
};

/** The 20 dynamic rows `renderPoseTabFromCache()` @30883 builds in the All tab. */
export type PoseRowDefinition = {
  key: string;
  label: string;
  /** Font Awesome glyph standing in for the legacy row-title emoji. */
  icon: string;
  /** Colour utility the legacy put on the leading glyph (`.c-red` …). */
  tone: 'c-red' | 'c-green' | 'c-gold' | 'c-blue';
  aliases: string[];
};

export const POSE_ROWS: PoseRowDefinition[] = [
  { key: 'comedy', label: 'Comedy', icon: 'fa-face-laugh-squint', tone: 'c-gold', aliases: ['comedy', 'funny'] },
  { key: 'music', label: 'Music / Afrobeats', icon: 'fa-music', tone: 'c-red', aliases: ['music', 'music-video', 'afrobeats', 'highlife', 'gospel', 'afropop'] },
  { key: 'dance', label: 'Dance', icon: 'fa-shoe-prints', tone: 'c-blue', aliases: ['dance'] },
  { key: 'movies', label: 'Movies / Nollywood', icon: 'fa-film', tone: 'c-red', aliases: ['movies', 'movie', 'film', 'nollywood', 'drama'] },
  { key: 'education', label: 'Education', icon: 'fa-graduation-cap', tone: 'c-green', aliases: ['education', 'tutorial'] },
  { key: 'lifestyle', label: 'Lifestyle / Vlog', icon: 'fa-wand-magic-sparkles', tone: 'c-gold', aliases: ['lifestyle', 'vlog'] },
  { key: 'fashion', label: 'Fashion / Beauty', icon: 'fa-shirt', tone: 'c-gold', aliases: ['fashion', 'beauty'] },
  { key: 'food', label: 'Food', icon: 'fa-utensils', tone: 'c-gold', aliases: ['food', 'cooking'] },
  { key: 'sports', label: 'Sports', icon: 'fa-futbol', tone: 'c-green', aliases: ['sports'] },
  { key: 'fitness', label: 'Fitness / Health', icon: 'fa-dumbbell', tone: 'c-green', aliases: ['fitness', 'health'] },
  { key: 'tech', label: 'Tech', icon: 'fa-laptop-code', tone: 'c-blue', aliases: ['tech', 'technology'] },
  { key: 'gaming', label: 'Gaming', icon: 'fa-gamepad', tone: 'c-blue', aliases: ['gaming'] },
  { key: 'news', label: 'News', icon: 'fa-newspaper', tone: 'c-blue', aliases: ['news', 'politics'] },
  { key: 'documentary', label: 'Documentary', icon: 'fa-earth-africa', tone: 'c-green', aliases: ['documentary', 'documentaries'] },
  { key: 'travel', label: 'Travel', icon: 'fa-plane', tone: 'c-blue', aliases: ['travel'] },
  { key: 'anime', label: 'Anime', icon: 'fa-dragon', tone: 'c-gold', aliases: ['anime'] },
  { key: 'kids', label: 'Kids', icon: 'fa-child', tone: 'c-gold', aliases: ['kids'] },
  { key: 'romance', label: 'Romance', icon: 'fa-heart', tone: 'c-red', aliases: ['romance'] },
  { key: 'thriller', label: 'Thriller', icon: 'fa-ghost', tone: 'c-red', aliases: ['thriller'] },
  { key: 'scifi', label: 'Sci-Fi', icon: 'fa-rocket', tone: 'c-blue', aliases: ['scifi', 'sci-fi'] },
];

/** `populateCategoryTabs()`'s `tabAliases` @31382 — the sub-tabs that filter. */
const SUBTAB_ALIASES: Partial<Record<PoseTabKey, string[]>> = {
  dance: ['dance'],
  comedy: ['comedy', 'funny'],
  music: ['music', 'music-video', 'afrobeats', 'highlife', 'gospel'],
  tutorial: ['education', 'tutorial'],
  movies: ['movies', 'nollywood'],
  gaming: ['gaming'],
  sports: ['sports'],
  news: ['news'],
  anime: ['anime'],
  kids: ['kids'],
  documentary: ['documentary', 'documentaries'],
  fitness: ['fitness', 'health'],
  food: ['food'],
  travel: ['travel'],
  romance: ['romance'],
  thriller: ['thriller'],
  scifi: ['scifi', 'sci-fi'],
};

export function poseCategoryKey(video: PoseTabVideo): string {
  const raw = video.category ?? video.channel?.category ?? video.genre ?? '';
  return String(raw).toLowerCase().trim();
}

/** `likesOf()` @30899 — the like map is stored as an object on older docs. */
export function poseLikeCount(video: PoseTabVideo): number {
  const likes = video.likes ?? video.likeCount;
  if (likes && typeof likes === 'object') return Object.keys(likes).length;
  return Number(likes) || 0;
}

/** `tnPopScore()` @87279 / the hero's `views + likes` ranking @31440. */
export function posePopularity(video: PoseTabVideo): number {
  return (Number(video.views ?? video.viewCount) || 0) + poseLikeCount(video);
}

/** `tnIsPaidItem()` @87284, for a single video or a season. */
export function poseIsPaid(item: { priceMode?: string; coinPrice?: number; price?: number; fullSeasonCoins?: number }): boolean {
  if (item.priceMode === 'free') return false;
  if (item.priceMode === 'paid' || item.priceMode === 'full-season' || item.priceMode === 'mixed') return true;
  return Number(item.coinPrice ?? item.price ?? item.fullSeasonCoins ?? 0) > 0;
}

/** The Pose Coin price `createPoseGridItem()` @31957 shows on a card. */
export function posePrice(item: { priceMode?: string; coinPrice?: number; price?: number }): number {
  if (item.priceMode === 'free') return 0;
  return Number(item.coinPrice) || Number(item.price) || 0;
}

const GRADIENTS = ['g1', 'g2', 'g3', 'g4', 'g5', 'g6', 'g7', 'g8'];

/**
 * The legacy picked the fallback gradient at random (`createPoseGridItem()`),
 * which made every render reshuffle the cards' colours. Keying it off the video
 * id keeps the palette varied but stable.
 */
export function poseGradient(id: string | undefined, list: string[] = GRADIENTS): string {
  const key = String(id ?? '');
  let hash = 0;
  for (let index = 0; index < key.length; index += 1) hash = (hash * 31 + key.charCodeAt(index)) >>> 0;
  return list[hash % list.length] ?? list[0]!;
}

export function poseYear(video: PoseTabVideo): number {
  const millis = toMillis(video.createdAt);
  return millis ? new Date(millis).getFullYear() : new Date().getFullYear();
}

/** The 0–5 star strip `createPoseGridItem()` derives from the view count. */
export function poseStars(video: PoseTabVideo): string {
  const views = Number(video.views ?? video.viewCount) || 0;
  if (views > 500) return '★★★★★';
  if (views > 100) return '★★★★☆';
  return '★★★☆☆';
}

export type PoseBadge = 'hot' | 'prem' | 'free';

/** `badgeType`/`badgeLabel` @31960 — HOT wins over a price, then PREM, then FREE. */
export function poseBadge(video: PoseTabVideo): { type: PoseBadge; label: string } {
  const views = Number(video.views ?? video.viewCount) || 0;
  const price = posePrice(video);
  if (views > 1000) return { type: 'hot', label: 'HOT' };
  if (price > 0) return { type: 'prem', label: 'PREM' };
  return { type: 'free', label: 'FREE' };
}

export function poseThumb(video: PoseTabVideo): string {
  return video.thumbnailURL ?? video.thumbnailUrl ?? video.thumbnail ?? video.coverImage ?? '';
}

export function poseChannelName(video: PoseTabVideo): string {
  return video.channel?.name ?? video.channelName ?? 'Channel';
}

export function poseChannelPic(video: PoseTabVideo): string {
  const channel: PoseChannel = video.channel ?? { id: '' };
  return channel.profileURL ?? channel.profilePic ?? channel.photoURL ?? channel.avatar ?? channel.profileImage ?? '';
}

/** The URL a card warms with its hidden `<video preload="metadata">`. */
export function posePreload(video: PoseTabVideo): string {
  return video.trailerUrl ?? video.previewUrl ?? video.videoUrl ?? '';
}

export type PoseCategoryRow = {
  key: string;
  label: string;
  icon: string;
  tone: PoseRowDefinition['tone'];
  videos: PoseTabVideo[];
};

export type PoseTabRows = {
  categories: PoseCategoryRow[];
  seasons: PoseTabSeason[];
  /** `🎯 More Videos` — anything whose category matched no definition. */
  uncategorised: PoseTabVideo[];
};

const ROW_CAP = 20;

/**
 * `renderPoseTabFromCache()` @30883. Empty categories are skipped, each row is
 * sorted by likes descending and capped at 20, seasons sort newest-first and the
 * leftovers land in the catch-all row.
 */
export function poseRows(videos: PoseTabVideo[], seasons: PoseTabSeason[]): PoseTabRows {
  const byLikes = (a: PoseTabVideo, b: PoseTabVideo) => poseLikeCount(b) - poseLikeCount(a);
  const used = new Set<string>();
  const categories: PoseCategoryRow[] = [];

  for (const definition of POSE_ROWS) {
    const matching = videos
      .filter((video) => definition.aliases.includes(poseCategoryKey(video)))
      .sort(byLikes);
    if (matching.length === 0) continue;
    definition.aliases.forEach((alias) => used.add(alias));
    categories.push({
      key: definition.key,
      label: definition.label,
      icon: definition.icon,
      tone: definition.tone,
      videos: matching.slice(0, ROW_CAP),
    });
  }

  const sortedSeasons = [...seasons].sort((a, b) => toMillis(b.createdAt) - toMillis(a.createdAt));
  const uncategorised = videos.filter((video) => !used.has(poseCategoryKey(video))).sort(byLikes);

  return {
    categories,
    seasons: sortedSeasons.slice(0, ROW_CAP),
    uncategorised: uncategorised.slice(0, ROW_CAP),
  };
}

/** The videos one non-All sub-tab lists (40 cap, `populateCategoryTabs()` @31402). */
export function poseSubTabVideos(tab: PoseTabKey, videos: PoseTabVideo[]): PoseTabVideo[] {
  if (tab === 'all') return videos;
  if (tab === 'trending') {
    return [...videos]
      .sort((a, b) => (Number(b.views ?? b.viewCount) || 0) - (Number(a.views ?? a.viewCount) || 0))
      .slice(0, 40);
  }
  if (tab === 'recent') {
    return [...videos].sort((a, b) => toMillis(b.createdAt) - toMillis(a.createdAt)).slice(0, 40);
  }
  if (tab === 'series') return [];
  const aliases = SUBTAB_ALIASES[tab] ?? [];
  return videos.filter((video) => aliases.includes(poseCategoryKey(video))).slice(0, 40);
}

/* ────────────────────────── YouTube-style chip grid ────────────────────────── */

export type PoseYtKind = 'video' | 'music' | 'movie' | 'season';

/** `ptYtClassify()` @30999. */
export function poseYtClassify(video: PoseTabVideo): PoseYtKind {
  const blob = `${String(video.category ?? video.type ?? video.genre ?? '').toLowerCase()} ${(video.tags ?? []).join(' ').toLowerCase()}`;
  if (/music\s*video|music-video|musicvideo/.test(blob)) return 'music';
  if (/movie|film|nollywood/.test(blob)) return 'movie';
  if (/music|song|audio/.test(blob)) return 'music';
  return 'video';
}

/** `ptYtFmtCount()` @31009. */
export function poseYtCount(value: number | undefined): string {
  const count = Number(value) || 0;
  if (count >= 1e9) return `${(count / 1e9).toFixed(1).replace(/\.0$/, '')}B`;
  if (count >= 1e6) return `${(count / 1e6).toFixed(1).replace(/\.0$/, '')}M`;
  if (count >= 1e3) return `${(count / 1e3).toFixed(1).replace(/\.0$/, '')}K`;
  return String(count);
}

/** `ptYtFmtAge()` @31017 / `_ptWLRelTime()` @31687 — one spelling of "3d ago". */
export function poseTimeAgo(value: unknown): string {
  const millis = toMillis(value);
  if (!millis) return '';
  const minutes = Math.floor((Date.now() - millis) / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

export type PoseYtItem = { item: PoseTabVideo | PoseTabSeason; kind: PoseYtKind };

export type PoseYtFilter = 'all' | 'recent' | 'music' | 'movie' | 'season';

export const POSE_YT_FILTERS: { key: PoseYtFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'recent', label: 'Recent' },
  { key: 'music', label: 'Music' },
  { key: 'movie', label: 'Movies' },
  { key: 'season', label: 'Series' },
];

/**
 * `ptRenderYouTubeGrid()` @31117 — videos and seasons in one recency-sorted feed,
 * filtered by the chip, capped at 60 cards.
 */
export function poseYtFeed(
  videos: PoseTabVideo[],
  seasons: PoseTabSeason[],
  filter: PoseYtFilter,
): PoseYtItem[] {
  const feed: PoseYtItem[] = [
    ...videos.map((video) => ({ item: video, kind: poseYtClassify(video) })),
    ...seasons.map((season) => ({ item: season as PoseTabVideo, kind: 'season' as const })),
  ];
  feed.sort((a, b) => toMillis(b.item.createdAt) - toMillis(a.item.createdAt));

  let filtered = feed;
  if (filter === 'recent') filtered = feed.slice(0, 24);
  else if (filter !== 'all') filtered = feed.filter((entry) => entry.kind === filter);

  return filtered.slice(0, 60);
}

/** `ptYtBuildCard()`'s season episode tally @31071. */
export function poseEpisodeCount(season: PoseTabSeason): number {
  if (Array.isArray(season.episodes)) return season.episodes.length;
  return Number(season.episodeCount) || 0;
}

/* ──────────────────────────── Hero banner ranking ──────────────────────────── */

/** `ptLoadHero()` @31438 — most viewed + liked first. */
export function poseHeroRank(videos: PoseTabVideo[]): PoseTabVideo[] {
  return [...videos].sort((a, b) => posePopularity(b) - posePopularity(a));
}

/* ─────────────────── Newly-paid content is a Blink exclusive ─────────────────── */

export const POSE_HOLDBACK_DAYS = 3;

/**
 * `loadPoseTabPosts()` @31310 — a video that has just gone paid premieres on
 * Blink for its first three days and is held back from the Pose tab until that
 * window passes. Free content, and paid content older than the window, is
 * unaffected.
 */
export function poseVisibleFeed<T extends PoseTabVideo | PoseTabSeason>(feed: {
  videos: T[];
  seasons: PoseTabSeason[];
}): { videos: T[]; seasons: PoseTabSeason[] } {
  const cutoff = Date.now() - POSE_HOLDBACK_DAYS * 24 * 60 * 60 * 1000;
  const held = (item: { priceMode?: string; coinPrice?: number; price?: number; fullSeasonCoins?: number; createdAt?: unknown }) => {
    if (!poseIsPaid(item)) return false;
    const millis = toMillis(item.createdAt);
    return millis >= cutoff;
  };
  return {
    videos: feed.videos.filter((video) => !held(video)),
    seasons: feed.seasons.filter((season) => !held(season)),
  };
}

/**
 * `ptSetHero()` @31520 — a video doc usually embeds only a `channelId`, so the
 * hero banner fetches the channel's picture rather than staying on the
 * placeholder.
 */
export async function fetchChannelPicture(channelId: string): Promise<string> {
  if (!channelId) return '';
  const { db } = await import('@/lib/firebase').then((module) => module.getPoseFirebase());
  const { doc, getDoc } = await import('firebase/firestore');
  try {
    const snap = await getDoc(doc(db, 'channels', channelId));
    if (!snap.exists()) return '';
    const data = snap.data() as PoseChannel;
    return data.profileURL ?? data.profilePic ?? data.avatar ?? data.profileImage ?? data.photoURL ?? '';
  } catch {
    return '';
  }
}

/** The `data:image/svg+xml` letter tile `ptSetHero()` falls back to. */
export function letterTile(name: string, size = 40): string {
  const letter = (name.trim()[0] ?? 'C').toUpperCase();
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">` +
    `<rect width="${size}" height="${size}" fill="#333"/>` +
    `<text x="50%" y="55%" fill="#fff" font-family="Arial" font-size="${Math.round(size * 0.45)}" text-anchor="middle">${letter}</text>` +
    '</svg>';
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/* ────────────────── Categories sidebar / category / Watch Later ────────────────── */

export type PoseCategoryType = 'movies' | 'videos' | 'cat' | 'trending' | 'recent';

export type PoseCategoryRequest = {
  type: PoseCategoryType;
  key: string | null;
  title: string;
};

/** One `#ptCatSidebar` entry. The emoji the legacy used became an FA glyph. */
export type PoseSidebarItem = { label: string; icon: string; type: PoseCategoryType; key: string | null };

export const POSE_SIDEBAR_GROUPS: { section: string; items: PoseSidebarItem[] }[] = [
  {
    section: 'Browse by type',
    items: [
      { label: 'Movies', icon: 'fa-film', type: 'movies', key: null },
      { label: 'Videos', icon: 'fa-video', type: 'videos', key: null },
    ],
  },
  {
    section: 'By category',
    items: [
      { label: 'Comedy', icon: 'fa-face-laugh-squint', type: 'cat', key: 'comedy' },
      { label: 'Funny / Skits', icon: 'fa-face-grin-tears', type: 'cat', key: 'funny' },
      { label: 'Dance', icon: 'fa-shoe-prints', type: 'cat', key: 'dance' },
      { label: 'Music Video', icon: 'fa-music', type: 'cat', key: 'music-video' },
      { label: 'Afrobeats / Afropop', icon: 'fa-drum', type: 'cat', key: 'afrobeats' },
      { label: 'Highlife / Juju', icon: 'fa-saxophone', type: 'cat', key: 'highlife' },
      { label: 'Gospel / Worship', icon: 'fa-hands-praying', type: 'cat', key: 'gospel' },
      { label: 'Nollywood / Drama', icon: 'fa-clapperboard', type: 'cat', key: 'nollywood' },
      { label: 'Documentary', icon: 'fa-microphone-lines', type: 'cat', key: 'documentary' },
      { label: 'Education / Tutorial', icon: 'fa-graduation-cap', type: 'cat', key: 'education' },
      { label: 'Lifestyle / Vlog', icon: 'fa-wand-magic-sparkles', type: 'cat', key: 'lifestyle' },
      { label: 'Fashion / Beauty', icon: 'fa-shirt', type: 'cat', key: 'fashion' },
      { label: 'Food / Cooking', icon: 'fa-utensils', type: 'cat', key: 'food' },
      { label: 'Sports / Fitness', icon: 'fa-futbol', type: 'cat', key: 'sports' },
      { label: 'Tech / Gaming', icon: 'fa-laptop-code', type: 'cat', key: 'tech' },
      { label: 'News / Politics', icon: 'fa-newspaper', type: 'cat', key: 'news' },
      { label: 'Travel / Adventure', icon: 'fa-plane', type: 'cat', key: 'travel' },
      { label: 'Kids / Family', icon: 'fa-child', type: 'cat', key: 'kids' },
      { label: 'Romance / Relationships', icon: 'fa-heart', type: 'cat', key: 'romance' },
      { label: 'Motivation / Self-Help', icon: 'fa-fire', type: 'cat', key: 'motivation' },
    ],
  },
  {
    section: 'Discover',
    items: [
      { label: 'Trending', icon: 'fa-fire', type: 'trending', key: null },
      { label: 'Recent', icon: 'fa-clock', type: 'recent', key: null },
    ],
  },
];

/**
 * `ptOpenCategoryPage()` @31845 — what the tapped sidebar entry resolves to.
 * `movies` lists seasons; `cat` filters on the video's category (the channel's
 * genre is the fallback); `trending` and `recent` re-sort the whole feed.
 */
export function poseCategoryItems(
  request: PoseCategoryRequest,
  videos: PoseTabVideo[],
  seasons: PoseTabSeason[],
): { items: (PoseTabVideo | PoseTabSeason)[]; isSeason: boolean } {
  switch (request.type) {
    case 'movies':
      return { items: seasons, isSeason: true };
    case 'videos':
      return { items: videos, isSeason: false };
    case 'cat':
      return {
        items: videos.filter(
          (video) => (video.category ?? video.channel?.category ?? '').toLowerCase() === request.key,
        ),
        isSeason: false,
      };
    case 'trending':
      return { items: poseHeroRank(videos), isSeason: false };
    case 'recent':
      return {
        items: [...videos].sort((a, b) => toMillis(b.createdAt) - toMillis(a.createdAt)),
        isSeason: false,
      };
    default:
      return { items: [], isSeason: false };
  }
}

/** `ptBuildWLCard()` @31701 — a saved video's payload rebuilt into a card. */
export function watchLaterToVideo(item: {
  videoId: string;
  title: string;
  thumbnail: string;
  videoUrl: string;
  trailerUrl: string;
  channelName: string;
  category: string;
  channelId: string;
}): PoseTabVideo {
  return {
    id: item.videoId,
    channelId: item.channelId,
    channel: null,
    title: item.title,
    thumbnailURL: item.thumbnail,
    videoUrl: item.videoUrl,
    trailerUrl: item.trailerUrl,
    channelName: item.channelName,
    category: item.category,
  };
}

/**
 * The heading each non-All sub-tab shows above its grid (`#posTabContentX`
 * @26128) — the legacy emoji became an FA glyph plus the colour utility.
 */
export const POSE_SUBTAB_META: Partial<
  Record<PoseTabKey, { label: string; icon: string; tone: PoseRowDefinition['tone'] }>
> = {
  dance: { label: 'Dance', icon: 'fa-shoe-prints', tone: 'c-blue' },
  comedy: { label: 'Comedy', icon: 'fa-face-laugh-squint', tone: 'c-gold' },
  music: { label: 'Music', icon: 'fa-music', tone: 'c-red' },
  tutorial: { label: 'Tutorial', icon: 'fa-graduation-cap', tone: 'c-green' },
  trending: { label: 'Trending', icon: 'fa-fire', tone: 'c-red' },
  recent: { label: 'Recent', icon: 'fa-clock', tone: 'c-blue' },
  movies: { label: 'Movies', icon: 'fa-film', tone: 'c-red' },
  series: { label: 'Series', icon: 'fa-tv', tone: 'c-blue' },
  sports: { label: 'Sports', icon: 'fa-futbol', tone: 'c-green' },
  gaming: { label: 'Gaming', icon: 'fa-gamepad', tone: 'c-blue' },
  news: { label: 'News', icon: 'fa-newspaper', tone: 'c-blue' },
  anime: { label: 'Anime', icon: 'fa-dragon', tone: 'c-gold' },
  kids: { label: 'Kids', icon: 'fa-child', tone: 'c-gold' },
  documentary: { label: 'Documentaries', icon: 'fa-earth-africa', tone: 'c-green' },
  fitness: { label: 'Fitness', icon: 'fa-dumbbell', tone: 'c-green' },
  food: { label: 'Food', icon: 'fa-utensils', tone: 'c-gold' },
  travel: { label: 'Travel', icon: 'fa-plane', tone: 'c-blue' },
  romance: { label: 'Romance', icon: 'fa-heart', tone: 'c-red' },
  thriller: { label: 'Thriller', icon: 'fa-ghost', tone: 'c-red' },
  scifi: { label: 'Sci-Fi', icon: 'fa-rocket', tone: 'c-blue' },
};
