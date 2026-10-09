'use client';

import {
  collection,
  deleteField,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore';

import { getPoseFirebase } from '@/lib/firebase';

import { toMillis } from './feed';
import type { BuzzPost, PoseVideo } from './types';

/**
 * The creator profile behind `openForYouProfilePage()` @66391 and its five tab
 * loaders (`loadForYouProfileFeed()` @36469, `loadForYouPhotos()` @36813,
 * `loadForYouBuzzs()` @36918, `loadForYouLikedVideos()` @37043,
 * `loadForYouStories()` @37122).
 *
 * Every loader in the legacy page had two definitions — an older pair around
 * @36606 that the file shadowed, and the live pair from @36813 onwards. Only the
 * live ones are ported here.
 */

/** The legacy Buzz tab looked back a full year, where the live feed only needs 3 days. */
export const CREATOR_BUZZ_LOOKBACK_DAYS = 365;

/** `generateUserColor()` @30354 — a stable hue per uid for the header gradient. */
export function generateUserColor(userId: string): string {
  let hash = 0;
  for (let index = 0; index < userId.length; index += 1) {
    hash = (hash << 5) - hash + userId.charCodeAt(index);
    hash &= hash;
  }
  return `hsl(${Math.abs(hash) % 360}, 75%, 55%)`;
}

/** `adjustBrightness()` @30423 — clamped to 20–80% so a header never goes black. */
export function adjustBrightness(hslColor: string, amount: number): string {
  const match = /hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/.exec(hslColor);
  if (!match) return hslColor;
  const lightness = Math.max(20, Math.min(80, Number(match[3]) + amount));
  return `hsl(${match[1]}, ${match[2]}%, ${lightness}%)`;
}

/** `applyForYouHeaderColor()` @45995. */
export function headerGradient(userId: string): string {
  const color = generateUserColor(userId);
  return `linear-gradient(135deg, ${color} 0%, ${adjustBrightness(color, -20)} 100%)`;
}

/**
 * `canViewProfile()` @45139 — public is open to everyone, followers-only needs a
 * follow, private needs to be the owner.
 */
export function canViewProfile(
  owner: Record<string, unknown> | null,
  viewerUid: string | null,
): boolean {
  if (!owner) return true;
  const visibility = String(owner['profileVisibility'] ?? 'public');
  if (visibility === 'public') return true;
  if (!viewerUid) return false;
  const ownerUid = String(owner['uid'] ?? '');
  if (ownerUid && ownerUid === viewerUid) return true;
  if (visibility === 'followers') {
    const followers = owner['followers'];
    if (!followers || typeof followers !== 'object') return false;
    return Boolean((followers as Record<string, unknown>)[viewerUid]);
  }
  return false;
}

export type CreatorProfile = {
  uid: string;
  displayName: string;
  username: string;
  bio: string;
  profilePic: string;
  /**
   * The creator document's `verified` flag. The legacy markup rendered the ∞
   * badge unconditionally @90336, so every creator looked verified; the port
   * reads the flag the way the owner's own profile already does.
   */
  verified: boolean;
  links: { title: string; url: string }[];
  followers: number;
  following: number;
  totalLikes: number;
  totalViews: number;
  /** `channelId` or `channelIds` on the profile — drives the Channel button. */
  hasChannel: boolean;
  isOwner: boolean;
  /** False when the privacy rules hide the profile; the page shows the toast. */
  visible: boolean;
  /** The message the legacy page toasted when `visible` is false. */
  hiddenReason: string;
};

export type CreatorHeader = Pick<CreatorProfile, 'uid' | 'displayName' | 'username' | 'profilePic'>;

/**
 * The user-document half of the page. `ownerFallback` carries the name and
 * avatar the caller already knew, so the header can paint before Firestore
 * answers — the legacy `_fypApplySkeleton()` @66526 did the same thing.
 */
export async function loadCreatorProfile(
  uid: string,
  viewerUid: string | null,
  ownerFallback?: { displayName?: string; username?: string; userProfilePic?: string },
): Promise<CreatorProfile> {
  const { db } = getPoseFirebase();
  const snapshot = await getDoc(doc(db, 'users', uid));
  const data = snapshot.exists() ? (snapshot.data() as Record<string, unknown>) : {};

  const visible = canViewProfile({ ...data, uid }, viewerUid);
  const visibility = String(data['profileVisibility'] ?? 'public');

  return {
    uid,
    displayName: String(data['displayName'] ?? ownerFallback?.displayName ?? 'Creator'),
    username: String(data['username'] ?? ownerFallback?.username ?? 'creator'),
    bio: String(data['bio'] ?? ''),
    profilePic: String(
      data['profilePicUrl'] ?? data['userProfilePic'] ?? data['photoURL'] ?? ownerFallback?.userProfilePic ?? '',
    ),
    verified: Boolean(data['verified']),
    links: readLinks(data['links']),
    followers: countMap(data['followers']),
    following: countMap(data['following']),
    totalLikes: 0,
    totalViews: 0,
    hasChannel: Boolean(
      data['channelId'] ||
        data['lastChannelId'] ||
        (Array.isArray(data['channelIds']) && data['channelIds'].length > 0),
    ),
    isOwner: Boolean(viewerUid && viewerUid === uid),
    visible,
    hiddenReason:
      visibility === 'followers' ? 'This profile is only visible to followers' : 'This profile is private',
  };
}

function countMap(value: unknown): number {
  return value && typeof value === 'object' ? Object.keys(value as Record<string, unknown>).length : 0;
}

function readLinks(value: unknown): { title: string; url: string }[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry) => {
      if (!entry || typeof entry !== 'object') return null;
      const record = entry as { title?: string; url?: string };
      if (!record.title || !record.url) return null;
      return { title: record.title, url: record.url };
    })
    .filter((entry): entry is { title: string; url: string } => entry !== null);
}

function toVideo(uid: string, id: string, data: Record<string, unknown>): PoseVideo {
  return {
    ...(data as PoseVideo),
    id,
    userId: String(data['userId'] ?? uid),
    videoUrl: String(data['videoUrl'] ?? data['url'] ?? ''),
    caption: String(data['caption'] ?? data['text'] ?? 'Untitled'),
  };
}

function newestFirst(a: PoseVideo, b: PoseVideo): number {
  return toMillis(b.createdAt) - toMillis(a.createdAt);
}

/**
 * `loadForYouProfileFeed()` @36469 — the videos grid.
 *
 * The legacy version showed six skeleton tiles, then retried the `userId` query
 * and fell back to a `username` query when that failed. It ran **one** query and
 * used the same snapshot twice: `openForYouProfilePage()` aggregated the Likes
 * and Views totals from every document in it, and the Feed tab then filtered
 * photos and stories out at render time. So the filter is not applied here —
 * `creatorFeedVideos()` does that for the grid.
 */
export async function loadCreatorVideos(uid: string, username: string): Promise<PoseVideo[]> {
  const { db } = getPoseFirebase();
  let docs;
  try {
    docs = await getDocs(query(collection(db, 'videos'), where('userId', '==', uid)));
  } catch (error) {
    if (!username) throw error;
    console.warn('⚠️ userId query failed, falling back to username', error);
    docs = await getDocs(query(collection(db, 'videos'), where('username', '==', username)));
  }

  return docs.docs
    .map((entry) => toVideo(uid, entry.id, entry.data() as Record<string, unknown>))
    .sort(newestFirst);
}

/** The Feed tab drops the photo and story posts that have their own tabs. */
export function creatorFeedVideos(videos: PoseVideo[]): PoseVideo[] {
  return videos.filter((video) => video.type !== 'story' && video.type !== 'photo');
}

/** `loadForYouPhotos()` @36813. */
export async function loadCreatorPhotos(uid: string, username: string): Promise<PoseVideo[]> {
  const { db } = getPoseFirebase();
  let docs;
  try {
    docs = await getDocs(
      query(collection(db, 'videos'), where('userId', '==', uid), where('type', '==', 'photo')),
    );
  } catch (error) {
    if (!username) throw error;
    console.warn('⚠️ photos query failed, falling back to username', error);
    docs = await getDocs(
      query(collection(db, 'videos'), where('username', '==', username), where('type', '==', 'photo')),
    );
  }

  return docs.docs
    .map((entry) => {
      const data = entry.data() as Record<string, unknown>;
      return {
        ...toVideo(uid, entry.id, data),
        type: 'photo',
        imageUrl: String(data['imageUrl'] ?? data['videoUrl'] ?? ''),
      };
    })
    .sort(newestFirst);
}

/**
 * `loadForYouStories()` @37122 — stories live in the creator's user document
 * under `photos`, not in `videos`.
 */
export async function loadCreatorStories(uid: string, username: string): Promise<PoseVideo[]> {
  const { db } = getPoseFirebase();
  const snapshot = await getDoc(doc(db, 'users', uid));
  let data: Record<string, unknown> | null = snapshot.exists()
    ? (snapshot.data() as Record<string, unknown>)
    : null;

  if (!data && username) {
    const fallback = await getDocs(query(collection(db, 'users'), where('username', '==', username)));
    const first = fallback.docs[0];
    data = first ? (first.data() as Record<string, unknown>) : null;
  }
  if (!data) return [];

  const photos = Array.isArray(data['photos']) ? (data['photos'] as Record<string, unknown>[]) : [];
  return photos
    .filter((photo) => photo['type'] === 'story' && photo['isActive'] !== false)
    .map((photo, index) => ({
      ...(photo as unknown as PoseVideo),
      id: String(photo['id'] ?? `story-${index}`),
      type: 'story',
      imageUrl: String(photo['imageUrl'] ?? photo['url'] ?? ''),
      caption: String(photo['caption'] ?? photo['text'] ?? 'Story'),
    }));
}

/**
 * `loadForYouLikedVideos()` @37043.
 *
 * The legacy query read **every** document in `videos` and filtered client-side
 * on `likes[creatorId]`, because Firestore cannot index a map key. That cost is
 * kept as-is rather than quietly changed; the tab is only loaded when the tab is
 * opened, which is the only reason it was bearable.
 */
export async function loadCreatorLiked(uid: string): Promise<PoseVideo[]> {
  const { db } = getPoseFirebase();
  const docs = await getDocs(collection(db, 'videos'));
  return docs.docs
    .filter((entry) => {
      const likes = (entry.data() as Record<string, unknown>)['likes'];
      return Boolean(likes && typeof likes === 'object' && (likes as Record<string, unknown>)[uid]);
    })
    .map((entry) => toVideo(uid, entry.id, entry.data() as Record<string, unknown>))
    .sort(newestFirst);
}

/**
 * `loadForYouBuzzs()` @36918 — buzz posts live under `postedtweetdata/{date}/posts`
 * and the query fires one read per day for a year, in parallel.
 */
export async function loadCreatorBuzzs(uid: string, username: string): Promise<BuzzPost[]> {
  const { db } = getPoseFirebase();
  const today = new Date();
  const fetches: Promise<BuzzPost[]>[] = [];

  for (let day = 0; day < CREATOR_BUZZ_LOOKBACK_DAYS; day += 1) {
    const date = new Date(today);
    date.setDate(date.getDate() - day);
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
      date.getDate(),
    ).padStart(2, '0')}`;

    fetches.push(
      getDocs(collection(db, 'postedtweetdata', dateStr, 'posts'))
        .then((snapshot) =>
          snapshot.docs
            .map((entry) => ({ ...(entry.data() as BuzzPost), id: entry.id, date: dateStr }))
            .filter(
              (buzz) =>
                buzz.type === 'buzz' && (buzz.userId === uid || (username && buzz.username === username)),
            ),
        )
        .catch(() => [] as BuzzPost[]),
    );
  }

  const posts = (await Promise.all(fetches)).flat();
  return posts.sort((a, b) => toMillis(b.createdAt) - toMillis(a.createdAt));
}

/** Aggregates `totalLikes` / `totalViews` the way `openForYouProfilePage()` did. */
export function creatorTotals(videos: PoseVideo[]): { totalLikes: number; totalViews: number } {
  let totalLikes = 0;
  let totalViews = 0;
  for (const video of videos) {
    if (video.type === 'story') continue;
    totalLikes += video.likes && typeof video.likes === 'object' ? Object.keys(video.likes).length : 0;
    totalViews += Number(video.views ?? 0) || 0;
  }
  return { totalLikes, totalViews };
}

export type ViewerFollowState = {
  /** The viewer follows the creator — drives Follow/Unfollow. */
  following: boolean;
  /** They follow each other — the only state in which the Message button opens a chat. */
  mutual: boolean;
};

/**
 * `checkIfFollowingCreator()` @68708 — both flags come out of the viewer's own
 * document: `following[creatorId]` and `followers[creatorId]`. One read, because
 * the legacy function read it once and derived both.
 */
export async function loadViewerFollowState(
  viewerUid: string,
  creatorId: string,
): Promise<ViewerFollowState> {
  const { db } = getPoseFirebase();
  const snapshot = await getDoc(doc(db, 'users', viewerUid));
  const data = snapshot.exists() ? (snapshot.data() as Record<string, unknown>) : {};
  const followingMap = data['following'];
  const followersMap = data['followers'];
  const following =
    Boolean(followingMap && typeof followingMap === 'object') &&
    Boolean((followingMap as Record<string, unknown>)[creatorId]);
  const creatorFollowsViewer =
    Boolean(followersMap && typeof followersMap === 'object') &&
    Boolean((followersMap as Record<string, unknown>)[creatorId]);
  return { following, mutual: following && creatorFollowsViewer };
}

/**
 * `toggleForYouProfileFollow()` @68754 — the follow is written to both sides, the
 * viewer's `following` map and the creator's `followers` map, in one batch-free
 * pair of merges.
 */
export async function setCreatorFollow(
  viewerUid: string,
  creatorId: string,
  following: boolean,
): Promise<void> {
  const { db } = getPoseFirebase();
  const viewerRef = doc(db, 'users', viewerUid);
  const creatorRef = doc(db, 'users', creatorId);

  await setDoc(
    viewerRef,
    {
      following: { [creatorId]: following ? true : deleteField() },
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
  await setDoc(
    creatorRef,
    {
      followers: { [viewerUid]: following ? true : deleteField() },
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}
