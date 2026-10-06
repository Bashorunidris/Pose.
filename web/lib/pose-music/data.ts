import type { Song } from './types';

export const GENRE_TABS = [
  'All',
  'Pop',
  'Hip Hop',
  'Rock',
  'Electronic',
  'R&B',
  'Jazz',
  'Country',
  'Latin',
  'Afrobeats',
] as const;

export const COUNTRY_FILTERS: { value: string; label: string }[] = [
  { value: 'All', label: 'All Countries' },
  { value: 'USA', label: 'United States' },
  { value: 'UK', label: 'United Kingdom' },
  { value: 'Nigeria', label: 'Nigeria' },
  { value: 'Ghana', label: 'Ghana' },
  { value: 'South Africa', label: 'South Africa' },
  { value: 'Canada', label: 'Canada' },
  { value: 'Australia', label: 'Australia' },
  { value: 'Brazil', label: 'Brazil' },
  { value: 'Mexico', label: 'Mexico' },
  { value: 'France', label: 'France' },
  { value: 'Germany', label: 'Germany' },
  { value: 'Japan', label: 'Japan' },
  { value: 'South Korea', label: 'South Korea' },
  { value: 'India', label: 'India' },
];

export const SIGNUP_COUNTRIES = [
  'USA',
  'UK',
  'Nigeria',
  'Ghana',
  'South Africa',
  'Canada',
  'Brazil',
  'Australia',
  'India',
  'Japan',
  'Egypt',
  'Mexico',
];

export const CREATOR_TYPES = ['Musician', 'Producer', 'DJ', 'Songwriter', 'Band'];

/** Revenue paid to the creator for a single use of a track, in USD. */
export const REVENUE_PER_USE_USD = 0.05;

export const SONGS_PER_PAGE = 12;
export const AD_EVERY_SONGS = 6;
export const PREVIEW_LIMIT_SECONDS = 30;

export const FALLBACK_SONG_COVER =
  'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=200&h=200&fit=crop';
export const FALLBACK_TRACK_COVER =
  'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=200&h=200&fit=crop';
export const DEFAULT_PLAYER_COVER =
  'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=100&h=100&fit=crop';

const CURRENCY_MAP: Record<string, { symbol: string; rate: number }> = {
  Nigeria: { symbol: '₦', rate: 1600 },
  USA: { symbol: '$', rate: 1 },
  UK: { symbol: '£', rate: 0.79 },
  Ghana: { symbol: 'GH₵', rate: 12 },
  Canada: { symbol: 'C$', rate: 1.35 },
  'South Africa': { symbol: 'R', rate: 18 },
  Brazil: { symbol: 'R$', rate: 5 },
  Mexico: { symbol: 'MX$', rate: 17 },
  Australia: { symbol: 'A$', rate: 1.5 },
  France: { symbol: '€', rate: 0.92 },
  Germany: { symbol: '€', rate: 0.92 },
  Japan: { symbol: '¥', rate: 149 },
  'South Korea': { symbol: '₩', rate: 1320 },
  India: { symbol: '₹', rate: 83 },
  Egypt: { symbol: 'E£', rate: 31 },
};

export function formatCurrency(usd: number, country?: string): string {
  const c = CURRENCY_MAP[country ?? ''] ?? CURRENCY_MAP.USA;
  const v = usd * c.rate;
  const f = v >= 1000 ? v.toFixed(0) : v >= 100 ? v.toFixed(1) : v.toFixed(2);
  return `${c.symbol}${f}`;
}

export function formatNumber(n: number): string {
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return `${n}`;
}

export function formatDuration(seconds: number): string {
  const s = Math.floor(seconds || 0);
  if (!s) return '0:00';
  return `${Math.floor(s / 60)}:${`${s % 60}`.padStart(2, '0')}`;
}

export function initialsOf(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export const DEMO_SONGS: Song[] = [
  { id: 's1', title: 'Summer Vibes', artist: 'DJ Sunset', artistId: 'demo1', duration: 180, genre: 'Electronic', country: 'USA', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', streamCount: 15420, useCount: 892, coverUrl: FALLBACK_SONG_COVER },
  { id: 's2', title: 'Midnight Dreams', artist: 'Luna Wave', artistId: 'demo2', duration: 195, genre: 'Pop', country: 'UK', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', streamCount: 28910, useCount: 1543, coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&h=200&fit=crop' },
  { id: 's3', title: 'Electric Pulse', artist: 'DJ Sunset', artistId: 'demo1', duration: 210, genre: 'Electronic', country: 'USA', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', streamCount: 9234, useCount: 421, coverUrl: FALLBACK_TRACK_COVER },
  { id: 's4', title: 'Lagos Rhythm', artist: 'Ayo Beats', artistId: 'demo3', duration: 175, genre: 'Afrobeats', country: 'Nigeria', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', streamCount: 45200, useCount: 2341, coverUrl: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=200&h=200&fit=crop' },
  { id: 's5', title: 'Country Roads', artist: 'Jake Western', artistId: 'demo4', duration: 200, genre: 'Country', country: 'USA', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3', streamCount: 23400, useCount: 1205, coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&h=200&fit=crop' },
  { id: 's6', title: 'Tokyo Nights', artist: 'Yuki Sound', artistId: 'demo5', duration: 185, genre: 'Pop', country: 'Japan', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3', streamCount: 31500, useCount: 1678, coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&h=200&fit=crop' },
  { id: 's7', title: 'Samba Soul', artist: 'Carlos Rio', artistId: 'demo6', duration: 220, genre: 'Latin', country: 'Brazil', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', streamCount: 19800, useCount: 945, coverUrl: FALLBACK_TRACK_COVER },
  { id: 's8', title: 'Urban Flow', artist: 'MC Drake', artistId: 'demo7', duration: 195, genre: 'Hip Hop', country: 'Canada', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', streamCount: 52300, useCount: 2890, coverUrl: FALLBACK_SONG_COVER },
  { id: 's9', title: 'Reggae Sunset', artist: 'Bob Junior', artistId: 'demo8', duration: 205, genre: 'R&B', country: 'Ghana', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', streamCount: 17600, useCount: 823, coverUrl: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=200&h=200&fit=crop' },
  { id: 's10', title: 'Rock Anthem', artist: 'The Rebels', artistId: 'demo9', duration: 240, genre: 'Rock', country: 'UK', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', streamCount: 38900, useCount: 1956, coverUrl: FALLBACK_TRACK_COVER },
  { id: 's11', title: 'Jazz Cafe', artist: 'Miles Smooth', artistId: 'demo10', duration: 190, genre: 'Jazz', country: 'USA', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3', streamCount: 14200, useCount: 678, coverUrl: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=200&h=200&fit=crop' },
  { id: 's12', title: 'Desert Rose', artist: 'Ahmed Khalil', artistId: 'demo11', duration: 205, genre: 'Pop', country: 'Egypt', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3', streamCount: 22100, useCount: 1134, coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&h=200&fit=crop' },
];
