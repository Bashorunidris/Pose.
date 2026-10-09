/**
 * Earnings tab maths, lifted from `channeldashboard.html`: the currency display
 * switch, the withdrawal fee ladder, the paid-view pool breakdown and the
 * release-rate tiers. Every number here is derived from Firestore data — the
 * legacy page never fabricated a figure and neither does this.
 */

import type { ChannelData, EarningsSummary, VideoDoc } from './types';

export type EarnCurrency = 'NGN' | 'COIN' | 'USER';

export type TimelineEntry = { label: string; ngn?: number; diff?: boolean };

/**
 * A paid video starts earning at all once it passes this many views, and each
 * completed batch releases into the wallet every `POOL_FLUSH_INTERVAL_MS`.
 * The legacy page kept this at 1 while the on-screen copy said "10 total views"
 * — the copy is what shipped to creators, so the banner text keeps saying 10.
 */
export const PAID_VIEW_THRESHOLD = 1;
export const POOL_FLUSH_INTERVAL_MS = 5 * 60 * 60 * 1000;
export const PAID_VIEW_COPY = 10;
export const MIN_WITHDRAWAL = 500;

export const COIN_LOGO_URL = 'https://i.ibb.co/k62g7222/Chat-GPT-Image-Apr-28-2026-11-33-52-PM.png';

const CURRENCY_MAP: Record<string, { code: string; symbol: string }> = {
  'Nigeria': { code: 'NGN', symbol: '₦' },
  'United States': { code: 'USD', symbol: '$' },
  'United Kingdom': { code: 'GBP', symbol: '£' },
  'Ghana': { code: 'GHS', symbol: 'GH₵' },
  'Kenya': { code: 'KES', symbol: 'KSh' },
  'South Africa': { code: 'ZAR', symbol: 'R' },
  'Canada': { code: 'CAD', symbol: 'CA$' },
  'Australia': { code: 'AUD', symbol: 'A$' },
  'India': { code: 'INR', symbol: '₹' },
  'Germany': { code: 'EUR', symbol: '€' },
  'France': { code: 'EUR', symbol: '€' },
  'Italy': { code: 'EUR', symbol: '€' },
  'Spain': { code: 'EUR', symbol: '€' },
  'Netherlands': { code: 'EUR', symbol: '€' },
  'Brazil': { code: 'BRL', symbol: 'R$' },
  'Mexico': { code: 'MXN', symbol: 'MX$' },
  'UAE': { code: 'AED', symbol: 'AED' },
  'Saudi Arabia': { code: 'SAR', symbol: 'SAR' },
  'Egypt': { code: 'EGP', symbol: 'E£' },
  'Tanzania': { code: 'TZS', symbol: 'TSh' },
  'Uganda': { code: 'UGX', symbol: 'USh' },
  'Rwanda': { code: 'RWF', symbol: 'RF' },
  'Cameroon': { code: 'XAF', symbol: 'FCFA' },
  'Senegal': { code: 'XOF', symbol: 'CFA' },
  'Ivory Coast': { code: 'XOF', symbol: 'CFA' },
  'Ethiopia': { code: 'ETB', symbol: 'Br' },
  'Zimbabwe': { code: 'USD', symbol: '$' },
  'Zambia': { code: 'ZMW', symbol: 'ZK' },
};

export const FALLBACK_RATES: Record<string, number> = {
  NGN: 1620,
  USD: 1,
  GBP: 0.79,
  GHS: 12,
  KES: 130,
};

export type UserCurrency = { code: string; symbol: string };

export function getUserCurrency(country: string | undefined): UserCurrency {
  return CURRENCY_MAP[country ?? ''] ?? { code: 'USD', symbol: '$' };
}

/** `fmtCurr()` — the same amount in whichever currency the creator selected. */
export function fmtCurr(
  ngn: number,
  currency: EarnCurrency,
  country: string | undefined,
  rates: Record<string, number>,
): string {
  const amount = Number(ngn) || 0;
  if (currency === 'COIN') return `${Math.round(amount).toLocaleString('en-NG')} PCK`;
  if (currency === 'USER') return fmtLocalCurr(amount, country, rates);
  return `₦${Math.round(amount).toLocaleString('en-NG')}`;
}

export function fmtLocalCurr(ngn: number, country: string | undefined, rates: Record<string, number>): string {
  const amount = Number(ngn) || 0;
  const currency = getUserCurrency(country);
  const localRate = rates[currency.code];
  const ngnRate = rates['NGN'] || FALLBACK_RATES['NGN']!;
  if (currency.code === 'NGN' || !localRate) return `₦${Math.round(amount).toLocaleString('en-NG')}`;
  const local = (amount / ngnRate) * localRate;
  return `${currency.symbol}${local.toLocaleString('en', { maximumFractionDigits: 0 })}`;
}

/** `getWithdrawFee()` — the flat fee ladder, not a percentage. */
export function getWithdrawFee(amount: number): number {
  if (amount >= 1_000_000) return 500;
  if (amount >= 50_000) return 200;
  if (amount >= 1_000) return 100;
  return 0;
}

export type WithdrawChip = { amount: number; label: string; isMax: boolean };

/** `buildWdChips()` — up to four presets that fit the balance, then Max. */
export function buildWithdrawChips(balance: number): WithdrawChip[] {
  const chips: WithdrawChip[] = [];
  for (const amount of [500, 2000, 5000, 10000, 20000, 50000]) {
    if (amount <= balance) {
      chips.push({ amount, label: `₦${amount.toLocaleString('en-NG')}`, isMax: false });
    }
    if (chips.length >= 4) break;
  }
  if (balance >= MIN_WITHDRAWAL) {
    chips.push({ amount: balance, label: `Max ₦${balance.toLocaleString('en-NG')}`, isMax: true });
  }
  return chips;
}

/**
 * PCK→₦ tiers by the creator's channel country: Nigeria 1:1, other African
 * countries 3x, everywhere else 6x. Drives both the price-setting preview and
 * the payout maths, so a creator's region changes what their PCK is worth.
 */
const OTHER_AFRICA_COUNTRIES = [
  'Ghana', 'Kenya', 'South Africa', 'Tanzania', 'Uganda', 'Rwanda',
  'Cameroon', 'Senegal', 'Ivory Coast', 'Ethiopia', 'Zimbabwe', 'Zambia', 'Egypt',
];

export function getPckToNgnRate(country: string | undefined): number {
  if (country === 'Nigeria') return 1;
  if (OTHER_AFRICA_COUNTRIES.includes(country ?? '')) return 3;
  return 6;
}

export type PaidBreakdown = {
  total: number;
  released: number;
  locked: number;
  releasedViews: number;
  lockedViews: number;
  videoCount: number;
  threshold: number;
};

/**
 * `getPaidBreakdown()` — only paid videos are monetised, so only paid videos
 * carry a pool. `released` is what has already landed in the wallet; `locked` is
 * whatever is still sitting in a video's pool below the next full batch.
 */
export function getPaidBreakdown(videos: VideoDoc[], earnings: EarningsSummary): PaidBreakdown {
  const paidVideos = videos.filter((video) => video.priceMode === 'paid');

  let locked = 0;
  let lockedViews = 0;
  let liveViews = 0;
  paidVideos.forEach((video) => {
    locked += Number(video.poolBalanceNGN) || 0;
    lockedViews += Number(video.poolPendingViews) || 0;
    liveViews += Number(video.views) || 0;
  });

  const released = Number(earnings?.directRevenue) || 0;

  return {
    total: released + locked,
    released,
    locked,
    releasedViews: liveViews,
    lockedViews,
    videoCount: paidVideos.length,
    threshold: PAID_VIEW_THRESHOLD,
  };
}

/** Withdrawable now — with instant payouts that is simply the released total. */
export function getWithdrawableBalance(earnings: EarningsSummary): number {
  return Number(earnings?.directRevenue) || 0;
}

export function getTimelineEntries(earnings: EarningsSummary, period: string): TimelineEntry[] {
  const timeline = (earnings as { timeline?: Record<string, TimelineEntry[]> } | null)?.timeline;
  const entries = timeline?.[period];
  return Array.isArray(entries) ? entries : [];
}

export type ExchangeRateState = {
  usdToNgn: number;
  rates: Record<string, number>;
  live: boolean;
};

/** `fetchExchangeRate()` — live USD rates, falling back to fixed ones offline. */
export async function fetchExchangeRates(): Promise<ExchangeRateState> {
  try {
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
    const json = (await response.json()) as { rates?: Record<string, number> };
    const rates = json.rates;
    if (!rates || typeof rates['NGN'] !== 'number') throw new Error('no NGN rate');
    return { usdToNgn: rates['NGN'], rates, live: true };
  } catch {
    return { usdToNgn: FALLBACK_RATES['NGN']!, rates: { ...FALLBACK_RATES }, live: false };
  }
}

export function rateNoteText(country: string | undefined, rate: ExchangeRateState): string {
  const currency = getUserCurrency(country);
  const ngnRate = rate.usdToNgn || FALLBACK_RATES['NGN']!;
  const localRate = rate.rates[currency.code] || 1;
  const localToNgn = (ngnRate / localRate).toLocaleString('en', { maximumFractionDigits: 1 });
  const tier = getPckToNgnRate(country);
  const suffix = currency.code !== 'NGN' ? ` · 1 ${currency.code} ≈ ${localToNgn} NGN` : '';
  return `1 PCK = ₦${tier}${suffix} · Updated just now`;
}

/** The revenue-trend line: the 7-day `dailyTrend` the pool flush writes. */
export function trendSeries(earnings: EarningsSummary): { labels: string[]; data: number[] } {
  const trend = Array.isArray(earnings?.dailyTrend) ? earnings.dailyTrend : [];
  if (!trend.length) {
    return { labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], data: [0, 0, 0, 0, 0, 0, 0] };
  }
  return {
    labels: trend.map((day) => String(day.label ?? '')),
    data: trend.map((day) => Number(day.ngn) || 0),
  };
}

export function totalSubtitle(
  total: number,
  currency: EarnCurrency,
  channel: ChannelData | null,
  rates: Record<string, number>,
): string {
  if (total === 0) return 'No earnings yet — keep uploading paid videos to start earning';
  if (currency === 'COIN') return 'Your total earnings in Pose Coin Kobo';
  if (currency === 'NGN') return `≈ ${Math.round(total).toLocaleString('en-NG')} PCK`;
  const currencyInfo = getUserCurrency(channel?.country);
  const ngnRate = rates['NGN'] || FALLBACK_RATES['NGN']!;
  const localRate = rates[currencyInfo.code] || 1;
  const rateDisplay = (ngnRate / localRate).toLocaleString('en', { maximumFractionDigits: 1 });
  return `≈ ₦${Math.round(total).toLocaleString('en-NG')} · 1 ${currencyInfo.code} ≈ ${rateDisplay} NGN`;
}
