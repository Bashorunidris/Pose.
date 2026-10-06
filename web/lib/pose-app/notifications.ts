'use client';

import { useEffect, useState } from 'react';
import {
  collection,
  doc,
  serverTimestamp,
  setDoc,
  writeBatch,
} from 'firebase/firestore';

import { getPoseFirebase } from '@/lib/firebase';
import { toMillis, watchNotifications } from './feed';
import { setFollow } from './interactions';
import type { PoseNotification } from './types';

/**
 * Port of the `PoseNotifications` IIFE @78211. The list, the per-tab unread
 * counters and the bottom-nav badge all read the same live subscription, so the
 * hook owns one listener and every screen derives from it.
 */

export const NOTIF_TABS = [
  'all',
  'follow',
  'like',
  'comment',
  'mention',
  'message',
  'visit',
  'view',
  'pose',
] as const;

export type NotifTab = (typeof NOTIF_TABS)[number];

export const NOTIF_TAB_LABELS: Record<NotifTab, string> = {
  all: 'All',
  follow: 'Followers',
  like: 'Likes',
  comment: 'Comments',
  mention: 'Mentions',
  message: 'Messages',
  visit: 'Visits',
  view: 'Views',
  pose: 'From Pose',
};

const ICONS: Record<string, string> = {
  follow: 'fa-solid fa-user-plus',
  like: 'fa-solid fa-heart',
  comment: 'fa-solid fa-comment',
  mention: 'fa-solid fa-at',
  message: 'fa-solid fa-envelope',
  visit: 'fa-solid fa-eye',
  view: 'fa-solid fa-chart-line',
  pose: 'fa-solid fa-bolt',
};

export function notifIcon(type: string): string {
  return ICONS[type] ?? 'fa-solid fa-bell';
}

/** Copy per notification type, matching `actionText` @78251. */
export function notifActionText(n: PoseNotification): string {
  switch (n.type) {
    case 'follow':
      return 'started following you';
    case 'like':
      return 'liked your video';
    case 'comment':
      return n.commentText ? `commented: "${n.commentText.slice(0, 60)}"` : 'commented on your video';
    case 'mention':
      return 'mentioned you';
    case 'message':
      return n.preview ? n.preview.slice(0, 80) : 'sent you a message';
    case 'visit':
      return 'visited your profile';
    case 'view':
      return n.message || 'Your video gained new views';
    case 'pose':
      return n.message || 'New update from Pose';
    default:
      return n.message || '';
  }
}

/**
 * `dedupedItems` @78369 collapses repeat follow/visit/message rows for the same
 * person — the snapshot is newest-first, so the first occurrence kept is the one
 * the legacy list showed.
 */
export function dedupeNotifications(items: PoseNotification[]): PoseNotification[] {
  const seen = new Set<string>();
  const out: PoseNotification[] = [];
  for (const n of items) {
    let key: string | null = null;
    if (n.type === 'follow' || n.type === 'visit') key = `${n.type}:${n.fromUserId ?? ''}`;
    else if (n.type === 'message') key = `message:${n.chatRoomId || n.fromUserId || ''}`;
    if (key === null) {
      out.push(n);
      continue;
    }
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(n);
  }
  return out;
}

export function unreadCount(items: PoseNotification[]): number {
  return dedupeNotifications(items).filter((n) => !n.read).length;
}

export function notifTime(value: unknown): string {
  const millis = toMillis(value);
  if (!millis) return '';
  const seconds = Math.floor((Date.now() - millis) / 1000);
  if (seconds < 60) return 'now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d`;
  return new Date(millis).toLocaleDateString();
}

export function usePoseNotifications(uid: string | null): PoseNotification[] {
  // The snapshot carries the uid it belongs to so signing out (or switching
  // account) hides the previous inbox on the next render instead of waiting for
  // a `setItems([])` that would have to run synchronously in the effect body.
  const [snapshot, setSnapshot] = useState<{ uid: string | null; items: PoseNotification[] }>({
    uid: null,
    items: [],
  });

  useEffect(() => {
    if (!uid) return;
    const unsubscribe = watchNotifications(
      uid,
      (next) => setSnapshot({ uid, items: next }),
      (error) => console.error('❌ notification subscription:', error),
    );
    return () => unsubscribe();
  }, [uid]);

  return snapshot.uid === uid ? snapshot.items : [];
}

function notifRef(uid: string, id: string) {
  const { db } = getPoseFirebase();
  return doc(db, 'notifications', uid, 'items', id);
}

export async function markNotificationRead(uid: string, id: string): Promise<void> {
  try {
    await setDoc(notifRef(uid, id), { read: true }, { merge: true });
  } catch (error) {
    console.error('❌ marking notification read:', error);
  }
}

/** `markAllRead` @78505 batches one merge-write per unread document. */
export async function markAllNotificationsRead(uid: string, items: PoseNotification[]): Promise<void> {
  const unread = items.filter((n) => !n.read);
  if (unread.length === 0) return;
  const { db } = getPoseFirebase();
  try {
    const batch = writeBatch(db);
    for (const n of unread) batch.set(notifRef(uid, n.id), { read: true }, { merge: true });
    await batch.commit();
  } catch (error) {
    console.error('❌ marking all notifications read:', error);
  }
}

/**
 * `followBack` @78561 writes the follow graph pair, stamps the card so the button
 * cannot be pressed twice, and notifies the other user. `setFollow` owns the
 * graph write, so it runs first and the rest are best-effort.
 */
export async function followBackNotification(
  uid: string,
  notification: PoseNotification,
  displayName: string,
): Promise<void> {
  const target = notification.fromUserId;
  if (!target) return;
  const { db } = getPoseFirebase();
  try {
    await setFollow(target, uid, true);
    await setDoc(
      notifRef(uid, notification.id),
      { followedBack: true, read: true },
      { merge: true },
    );
    await setDoc(doc(collection(db, 'notifications', target, 'items')), {
      type: 'follow',
      fromUserId: uid,
      fromUserName: displayName || 'Someone',
      read: false,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('❌ following back from a notification:', error);
  }
}
