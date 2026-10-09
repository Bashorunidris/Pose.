/**
 * Config and constants for the host room (`poselivechat.html`). The legacy page
 * read all of this from `location.search`, so the port parses the same params —
 * the setup page is what writes them.
 */

export type GiftKey = 'rose' | 'wave' | 'party' | 'diamond' | 'rocket' | 'crown';
export type GiftAnim = 'float' | 'burst' | 'rocket' | 'crown';

export type Gift = {
  key: GiftKey;
  name: string;
  /** Legacy held an emoji; the port standardises on Font Awesome. */
  icon: string;
  coins: number;
  anim: GiftAnim;
};

/** `GIFTS` @912. */
export const GIFTS: Record<GiftKey, Gift> = {
  rose: { key: 'rose', name: 'Rose', icon: 'fa-solid fa-heart', coins: 10, anim: 'float' },
  wave: { key: 'wave', name: 'Wave', icon: 'fa-solid fa-water', coins: 50, anim: 'float' },
  party: { key: 'party', name: 'Party', icon: 'fa-solid fa-champagne-glasses', coins: 75, anim: 'burst' },
  diamond: { key: 'diamond', name: 'Diamond', icon: 'fa-solid fa-gem', coins: 100, anim: 'burst' },
  rocket: { key: 'rocket', name: 'Rocket', icon: 'fa-solid fa-rocket', coins: 250, anim: 'rocket' },
  crown: { key: 'crown', name: 'Crown', icon: 'fa-solid fa-crown', coins: 500, anim: 'crown' },
};

export function giftOf(key: string): Gift {
  return GIFTS[key as GiftKey] ?? GIFTS.rose;
}

export type RoomPrivacy = 'public' | 'private';
export type RoomTab = 'chat' | 'gifts' | 'controls';
export type SlideType = 'image' | 'video' | 'audio';

export type RoomConfig = {
  mode: string;
  roomName: string;
  streamTitle: string;
  privacy: RoomPrivacy;
  allowImages: boolean;
  allowVideos: boolean;
  allowDonations: boolean;
  minDonation: number;
  subAmount: number;
  followerTarget: number;
  timer: string;
  hostUid: string;
  hostName: string;
  hostPhoto: string;
  sid: string;
};

export const DEFAULT_ROOM_NAME = 'Live Room';
export const DEFAULT_HOST_NAME = 'Host';

/** `URL PARAMS` @878. */
export function readRoomConfig(search: string): RoomConfig {
  const params = new URLSearchParams(search);
  const int = (key: string) => parseInt(params.get(key) ?? '0', 10) || 0;
  return {
    mode: params.get('mode') || 'chat',
    roomName: params.get('roomName') || DEFAULT_ROOM_NAME,
    streamTitle: params.get('streamTitle') || '',
    privacy: params.get('privacy') === 'private' ? 'private' : 'public',
    allowImages: params.get('allowImages') === '1',
    allowVideos: params.get('allowVideos') === '1',
    allowDonations: params.get('allowDonations') === '1',
    minDonation: int('minDonation'),
    subAmount: int('subAmount'),
    followerTarget: int('followerTarget'),
    timer: params.get('timer') || 'no-limit',
    hostUid: params.get('uid') || '',
    hostName: params.get('hostName') || DEFAULT_HOST_NAME,
    hostPhoto: params.get('hostPhoto') || '',
    sid: params.get('sid') || '',
  };
}

const TIMER_SECONDS: Record<string, number> = {
  '30m': 30 * 60,
  '1h': 60 * 60,
  '2h': 2 * 60 * 60,
  '3h': 3 * 60 * 60,
};

/** `timerMap` @963. */
export function timerSecondsFor(setting: string): number {
  return TIMER_SECONDS[setting] ?? 0;
}

/** `HOST_AWAY_LIMIT` @1817. */
export const HOST_AWAY_LIMIT_MS = 5 * 60 * 1000;

/** Where the legacy room sent the host on "back" and after ending a stream. */
export const LIVE_FEED_HREF = '/pose-live';

export function clockLabel(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function countdownLabel(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
  const s = (totalSeconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export function slidePlaceholder(type: SlideType): string {
  return type === 'image' ? 'Paste image URL…' : type === 'video' ? 'Paste video URL…' : 'Paste audio URL…';
}

export function slideIcon(type: SlideType): string {
  return type === 'image' ? 'fa-solid fa-image' : type === 'video' ? 'fa-solid fa-film' : 'fa-solid fa-music';
}

export function slideFileName(url: string): string {
  const tail = url.split('/').pop() ?? url;
  return `${tail.slice(0, 30)}…`;
}

/** The legacy `ranks` array @1431, now icons rather than emoji digits. */
export function rankIcon(index: number): string {
  if (index === 0) return 'fa-solid fa-crown';
  return 'fa-solid fa-medal';
}

export type LedgerEntry<T> = T & { id: string };
