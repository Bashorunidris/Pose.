import type { BuzzPost, PoseVideo } from './types';

/** `buzz.createdAt` / `video.createdAt` are normalised before they reach here. */
export function relativeTime(millis: number): string {
  if (!millis) return 'now';
  const seconds = Math.floor((Date.now() - millis) / 1000);
  if (seconds < 60) return 'now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function shortTime(millis: number): string {
  if (!millis) return '';
  const seconds = Math.floor((Date.now() - millis) / 1000);
  if (seconds < 60) return 'now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d`;
  return new Date(millis).toLocaleDateString();
}

/**
 * The legacy feed shows caption + hashtags + tags as one run of text
 * (`buildForYouCaptionText`); tags arrive as bare words, so they are re-prefixed
 * the same way before display.
 */
export function captionText(video: PoseVideo): string {
  const base = video.caption ?? '';
  const hashtags = normaliseTags(video.hashtags, '#');
  const tags = normaliseTags(video.tags, '@');
  return [base, hashtags, tags].filter(Boolean).join(' ').trim();
}

export function normaliseTags(values: string[] | string | undefined, prefix: string): string {
  const list = Array.isArray(values) ? values : typeof values === 'string' ? values.split(/[,\s]+/) : [];
  return list
    .map((value) => value.trim())
    .filter(Boolean)
    .map((value) => (value.startsWith(prefix) ? value : `${prefix}${value}`))
    .join(' ');
}

/** Legacy `truncateCaption(..., 7)` — word count, not characters. */
export function truncateWords(text: string, words: number): { text: string; truncated: boolean } {
  const parts = text.split(' ');
  if (parts.length <= words) return { text, truncated: false };
  return { text: parts.slice(0, words).join(' '), truncated: true };
}

export type CaptionToken = { type: 'text' | 'tag'; value: string };

/** Splits `#hashtag` / `@mention` runs so they can be styled without innerHTML. */
export function splitCaptionTokens(text: string): CaptionToken[] {
  const tokens: CaptionToken[] = [];
  const pattern = /[#@]\w+/g;
  let cursor = 0;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(text)) !== null) {
    if (match.index > cursor) tokens.push({ type: 'text', value: text.slice(cursor, match.index) });
    tokens.push({ type: 'tag', value: match[0] });
    cursor = match.index + match[0].length;
  }
  if (cursor < text.length) tokens.push({ type: 'text', value: text.slice(cursor) });
  return tokens;
}

export function videoOwnerName(video: PoseVideo): string {
  return video.userName || video.displayName || video.name || video.creatorName || video.author || 'Creator';
}

export function initials(name: string): string {
  return name
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function videoCover(video: PoseVideo): string {
  const audio = video.customAudio;
  return (
    (audio && (audio.ownerProfilePic || audio.thumbnail || audio.image || audio.cover)) ||
    video.userProfilePic ||
    video.thumbnail ||
    video.thumbnailUrl ||
    video.coverImage ||
    ''
  );
}

export function isPhotoPost(video: PoseVideo): boolean {
  return Boolean(video.isPhoto || video.type === 'photo');
}

/**
 * Recorded clips are captured with the front camera and stored mirrored; uploads
 * are not. The legacy feed only applies the mirror when `isUploadedFile` is false.
 */
export function mediaTransform(video: PoseVideo): string | undefined {
  return video.isUploadedFile ? undefined : 'scaleX(-1)';
}

export function buzzAuthorName(post: BuzzPost): string {
  return post.userName || post.name || post.username || 'Anonymous';
}

export function buzzIsVideo(post: BuzzPost): boolean {
  if (!post.mediaUrl) return false;
  if (post.mediaType) return post.mediaType === 'video';
  return /\.(mp4|webm|ogg|mov)$/i.test(post.mediaUrl);
}

/**
 * Legacy reads counts as `likeCount || Object.keys(likes).length || 0`, so a
 * stored `0` falls through to the voter map rather than short-circuiting. Older
 * documents write either shape.
 */
export function interactionCount(
  ...values: Array<number | Record<string, unknown> | undefined>
): number {
  for (const value of values) {
    if (typeof value === 'number' && value > 0) return value;
    if (value && typeof value === 'object') {
      const size = Object.keys(value).length;
      if (size > 0) return size;
    }
  }
  return 0;
}

export function mapCount(map: Record<string, unknown> | undefined): number {
  return map ? Object.keys(map).length : 0;
}

/**
 * Whether the current user is in a voter map. Documents written before the map
 * shape store the tally as a number, and a number means "nobody in particular".
 */
export function isVotedBy(
  value: number | Record<string, unknown> | undefined,
  uid: string | null,
): boolean {
  if (!uid || typeof value !== 'object' || value === null) return false;
  return Boolean(value[uid]);
}

/**
 * The optimistic twin of `setVideoLike`/`setVideoRepost`: those writes set
 * `likes.{uid}` to `true` or `deleteField()`, so the in-memory copy has to do the
 * same or a re-render would offer the button again.
 */
export function withVote(
  value: number | Record<string, unknown> | undefined,
  uid: string | null,
  active: boolean,
): number | Record<string, unknown> | undefined {
  if (!uid) return value;
  const map = typeof value === 'object' && value !== null ? { ...value } : {};
  if (active) map[uid] = true;
  else delete map[uid];
  return map;
}
