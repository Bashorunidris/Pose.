/** Firestore shapes used by the channel dashboard (`channeldashboard.html`). */

export type ChannelData = {
  ownerUid?: string;
  name?: string;
  description?: string;
  country?: string;
  bannerURL?: string;
  profileURL?: string;
  fans?: number;
  subscribers?: number;
  totalViews?: number;
  totalLikes?: number;
  [key: string]: unknown;
};

export type VideoDoc = {
  id: string;
  title?: string;
  /** Legacy uploads wrote `name` before `title` existed; both are still read. */
  name?: string;
  views?: number;
  likes?: number;
  /** Legacy accepted `likeCount` as an alias of `likes`. */
  likeCount?: number;
  comments?: number;
  /** Coin balance credited to this video, per the earnings screens. */
  revenue?: number;
  thumbnailURL?: string;
  videoUrl?: string;
  /** `paid` videos are the only monetised ones, so only they carry a pool. */
  priceMode?: string;
  /** Money accrued on this video that has not been released into the wallet yet. */
  poolBalanceNGN?: number;
  /** Views sitting below the next full release batch. */
  poolPendingViews?: number;
  createdAt?: unknown;
  [key: string]: unknown;
};

export type EarningsSummary = {
  directRevenue?: number;
  /** Pre-formatted `+12%` style delta the pool flush writes alongside the total. */
  directChange?: string;
  dailyTrend?: { label: string; ngn: number }[];
  /** Per-period transaction rows, keyed by the timeline pill (`24h`, `7d`, …). */
  timeline?: Record<string, { label: string; ngn?: number; diff?: boolean }[]>;
  [key: string]: unknown;
} | null;

export type InboxMessage = {
  id: string;
  subject?: string;
  message?: string;
  read?: boolean;
  createdAt?: unknown;
  [key: string]: unknown;
};

export type SeasonDoc = {
  id: string;
  title?: string;
  seasonNumber?: number;
  episodeCount?: number;
  plannedEpisodeCount?: number;
  priceMode?: string;
  fullSeasonCoins?: number;
  totalRevenue?: number;
  /** Older records stored an upload object here instead of a URL string. */
  thumbnailURL?: unknown;
  status?: string;
  ageRating?: string;
  createdAt?: unknown;
  [key: string]: unknown;
};

export type WithdrawalRequest = {
  id: string;
  amount?: number;
  fee?: number;
  netAmount?: number;
  bankName?: string;
  bankAcctNum?: string;
  bankAcctName?: string;
  status?: string;
  requestedAt?: unknown;
};
