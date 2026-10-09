'use client';

import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore';

import { getPoseFirebase } from '@/lib/firebase';

import type { PoseVideo } from './types';

/**
 * The For You card's share menu, block / not-interested flow and report sheets,
 * lifted from `openShareMenu()` @65504 through `submitVideoReport()` @65730.
 *
 * Blocking and "not interested" are stored twice on purpose, exactly as the
 * legacy code did: a `localStorage` list that `isHiddenFromForYou()` @65762 read
 * on every render, and a Firestore subcollection so the choice follows the
 * creator to another device.
 */

/** `#speedOptionsList` @73057. */
export const PLAYBACK_SPEEDS: { rate: number; label: string }[] = [
  { rate: 0.5, label: '0.5x' },
  { rate: 0.75, label: '0.75x' },
  { rate: 1, label: 'Normal (1x)' },
  { rate: 1.25, label: '1.25x' },
  { rate: 1.5, label: '1.5x' },
  { rate: 2, label: '2x' },
];

/** `#reportReasonsSheet` @73107. */
export const REPORT_REASONS = [
  'Spam or scam',
  'Harassment or bullying',
  'Hate speech',
  'Violence or dangerous acts',
  'Adult content / nudity',
  'Misinformation',
  'Self-harm or suicide',
  'Intellectual property violation',
  'Impersonation',
  'Other',
];

export type ReportTarget = 'video' | 'user';

const BLOCKED_USERS_KEY = 'blockedUsers';
const BLOCKED_CONTENT_KEY = 'blockedContent';
const NOT_INTERESTED_KEY = 'notInterestedVideos';
const VIDEO_REPORTS_KEY = 'videoReports';

function readList(key: string): string[] {
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(key) || '[]');
    return Array.isArray(parsed) ? (parsed as string[]) : [];
  } catch {
    return [];
  }
}

function writeList(key: string, values: string[]): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(values));
  } catch {
    // A full or blocked localStorage must not stop the Firestore write.
  }
}

/** `isHiddenFromForYou()` @65762 — the three lists the For You filter consults. */
export function isHiddenFromForYou(video: Pick<PoseVideo, 'id' | 'userId'>): boolean {
  const hiddenUsers = readList(BLOCKED_USERS_KEY);
  const hiddenContent = readList(BLOCKED_CONTENT_KEY);
  const notInterested = readList(NOT_INTERESTED_KEY);
  if (video.userId && hiddenUsers.includes(video.userId)) return true;
  if (hiddenContent.includes(video.id)) return true;
  return notInterested.includes(video.id);
}

/** `generateShareSlug()` @65825 — first four words, slugified, plus the video id. */
export function generateShareSlug(caption: string | undefined, videoId: string): string {
  const words = (caption || 'Amazing video').split(' ').slice(0, 4);
  const slug = words.join('_').toLowerCase().replace(/[^a-z0-9_]/g, '');
  return `${slug}_${videoId}`;
}

/**
 * The share link every platform receives. The legacy code built it from
 * `origin + pathname` and a `?caption=` slug, which the For You feed reads back
 * on load to reopen the shared post.
 */
export function videoShareLink(caption: string | undefined, videoId: string): string {
  const base = `${window.location.origin}${window.location.pathname}`;
  return `${base}?caption=${generateShareSlug(caption, videoId)}`;
}

const SHARE_MESSAGE = 'Check out this amazing video on Pose!';

/**
 * The four external share targets. Legacy `shareToTwitter()` @65728 pointed at
 * `twitter.com/intent/buzz?` — the app-wide "tweet" to "buzz" rename had rewritten
 * the X intent path and broken the link, so this uses the real endpoint.
 */
export function shareTargetUrl(
  target: 'whatsapp' | 'telegram' | 'twitter' | 'facebook',
  link: string,
): string {
  switch (target) {
    case 'whatsapp':
      return `https://api.whatsapp.com/send?text=${encodeURIComponent(`${SHARE_MESSAGE} ${link}`)}`;
    case 'telegram':
      return `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(SHARE_MESSAGE)}`;
    case 'twitter':
      return `https://twitter.com/intent/tweet?text=${encodeURIComponent(SHARE_MESSAGE)}&url=${encodeURIComponent(link)}`;
    case 'facebook':
      return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`;
  }
}

/** `confirmBlockUser()` @65608 — true when the creator was not blocked already. */
export async function blockUser(uid: string, video: PoseVideo): Promise<boolean> {
  if (!video.userId) throw new Error('This video has no creator to block');
  const blocked = readList(BLOCKED_USERS_KEY);
  const isNew = !blocked.includes(video.userId);
  if (isNew) writeList(BLOCKED_USERS_KEY, [...blocked, video.userId]);

  const { db } = getPoseFirebase();
  await setDoc(
    doc(db, 'users', uid, 'blockedUsers', video.userId),
    {
      blockedUserId: video.userId,
      blockedUsername: video.userName ?? video.displayName ?? null,
      blockedProfilePic: video.userProfilePic ?? null,
      createdAt: serverTimestamp(),
    },
    { merge: true },
  );
  return isNew;
}

/** `confirmBlockContent()` @65647. */
export async function blockContent(uid: string, video: PoseVideo): Promise<boolean> {
  const blocked = readList(BLOCKED_CONTENT_KEY);
  const isNew = !blocked.includes(video.id);
  if (isNew) writeList(BLOCKED_CONTENT_KEY, [...blocked, video.id]);

  const { db } = getPoseFirebase();
  await setDoc(
    doc(db, 'users', uid, 'blockedContent', video.id),
    { videoId: video.id, videoOwnerId: video.userId ?? null, createdAt: serverTimestamp() },
    { merge: true },
  );
  return isNew;
}

/** `markNotInterested()` @65690. */
export async function markNotInterested(uid: string, video: PoseVideo): Promise<boolean> {
  const list = readList(NOT_INTERESTED_KEY);
  const isNew = !list.includes(video.id);
  if (isNew) writeList(NOT_INTERESTED_KEY, [...list, video.id]);

  const { db } = getPoseFirebase();
  await setDoc(
    doc(db, 'users', uid, 'notInterested', video.id),
    { videoId: video.id, videoOwnerId: video.userId ?? null, createdAt: serverTimestamp() },
    { merge: true },
  );
  return isNew;
}

/** `submitVideoReport()` @65730 — the local list mirrors the Firestore report. */
export async function submitVideoReport(
  reporter: { uid: string | null; email: string | null },
  target: ReportTarget,
  video: PoseVideo,
  reason: string,
): Promise<void> {
  const entry = {
    target,
    videoId: video.id,
    userId: video.userId ?? null,
    userName: video.userName ?? video.displayName ?? null,
    reason,
    timestamp: new Date().toISOString(),
  };
  const reports = readList(VIDEO_REPORTS_KEY);
  reports.push(JSON.stringify(entry));
  writeList(VIDEO_REPORTS_KEY, reports);

  const { db } = getPoseFirebase();
  await addDoc(collection(db, 'reports_videos'), {
    target,
    videoId: video.id,
    reportedUserId: video.userId ?? null,
    reportedUsername: video.userName ?? video.displayName ?? null,
    reason,
    submittedBy: reporter.uid,
    submittedByEmail: reporter.email,
    status: 'open',
    createdAt: serverTimestamp(),
  });
}

/**
 * `downloadVideoWithWatermark()` @65938.
 *
 * The legacy version built a canvas, drew "Pose" into it, and then downloaded the
 * untouched source blob — the watermark never reached the file. The download is
 * kept as it behaved, with the canvas work dropped rather than left as dead code.
 * The `downloadVideoWithoutWatermark()` fallback @66043 is folded in: any fetch
 * failure downloads the original URL directly.
 */
export async function downloadVideo(video: PoseVideo): Promise<void> {
  const name = `Pose_${video.id}.webm`;
  let href = video.videoUrl ?? '';
  let objectUrl: string | null = null;

  try {
    const response = await fetch(href);
    const blob = await response.blob();
    objectUrl = URL.createObjectURL(blob);
    href = objectUrl;
  } catch {
    // Fall through to the raw URL, exactly like the legacy fallback.
  }

  const link = document.createElement('a');
  link.href = href;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  setTimeout(() => {
    link.remove();
    if (objectUrl) URL.revokeObjectURL(objectUrl);
  }, 100);
}

export type ShareFriend = { uid: string; name: string; pic: string; lastMessage: string };

/**
 * `shareWithFriends()` @66100 — the sheet lists the chats the creator is already
 * part of, newest first, resolved against each participant's user document.
 */
export async function loadShareFriends(uid: string): Promise<ShareFriend[]> {
  const { db } = getPoseFirebase();
  const snapshot = await getDocs(
    query(collection(db, 'chats'), where('participants', 'array-contains', uid), limit(50)),
  );

  const rooms = snapshot.docs.slice().sort((a, b) => {
    const aSeconds = Number((a.data() as { lastTimestamp?: { seconds?: number } }).lastTimestamp?.seconds ?? 0);
    const bSeconds = Number((b.data() as { lastTimestamp?: { seconds?: number } }).lastTimestamp?.seconds ?? 0);
    return bSeconds - aSeconds;
  });

  const friends: ShareFriend[] = [];
  for (const room of rooms) {
    const roomData = room.data() as { participants?: string[]; lastMessage?: string };
    const otherUid = (roomData.participants ?? []).find((participant) => participant !== uid);
    if (!otherUid) continue;

    let name = 'User';
    let pic = '';
    try {
      const user = await getDoc(doc(db, 'users', otherUid));
      if (user.exists()) {
        const userData = user.data() as Record<string, string | undefined>;
        name = userData.name || userData.username || userData.displayName || 'User';
        pic = userData.profilePicUrl || userData.userProfilePic || userData.photoURL || '';
      }
    } catch {
      // A missing profile still lists the room under the fallback name.
    }

    friends.push({ uid: otherUid, name, pic, lastMessage: roomData.lastMessage ?? '' });
  }
  return friends;
}

/** `fyShareToFriend()` @66154 — writes the message and the room summary. */
export async function sendVideoToFriend(
  sender: { uid: string; displayName: string },
  video: PoseVideo,
  friend: ShareFriend,
): Promise<void> {
  const { db } = getPoseFirebase();
  const title = video.caption || 'a video';
  const creator = video.userName || video.displayName || video.userId || '';
  const text = `Check out "${title}"${creator ? ` by @${creator}` : ''}`;
  const roomId = [sender.uid, friend.uid].sort().join('_');
  const room = doc(db, 'chats', roomId);

  await addDoc(collection(room, 'messages'), {
    senderId: sender.uid,
    senderName: sender.displayName || 'User',
    text,
    type: 'text',
    mediaUrl: '',
    timestamp: serverTimestamp(),
  });

  await setDoc(
    room,
    {
      participants: [sender.uid, friend.uid],
      lastMessage: text,
      lastTimestamp: serverTimestamp(),
      [`unread_${friend.uid}`]: 1,
    },
    { merge: true },
  );
}
