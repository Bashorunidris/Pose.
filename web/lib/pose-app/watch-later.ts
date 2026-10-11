'use client';

import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';

import { getPoseFirebase } from '@/lib/firebase';
import type { PoseTabVideo } from './pose-tab';

/**
 * The Pose tab's Watch Later list. The legacy stored it at
 * `users/{uid}/watchLater/{videoId}` with a `status` of `'pending'` or
 * `'watched'`, and fell back to `localStorage['pt_watch_later']` when nobody was
 * signed in (`ptWatchLater()` @31602, `ptOpenWatchLaterPage()` @31645).
 */

const LOCAL_KEY = 'pt_watch_later';

export type WatchLaterItem = {
  videoId: string;
  channelId: string;
  title: string;
  thumbnail: string;
  videoUrl: string;
  trailerUrl: string;
  channelName: string;
  category: string;
  status: 'pending' | 'watched';
  addedAtMs: number;
};

/** `ptWatchLater()` @31605 — a doc id when there is one, else the title. */
export function watchLaterId(video: { id?: string; videoId?: string; title?: string; name?: string }): string {
  return String(video.id ?? video.videoId ?? video.title ?? video.name ?? 'untitled');
}

export function watchLaterPayload(video: PoseTabVideo): WatchLaterItem {
  return {
    videoId: watchLaterId(video),
    channelId: video.channelId || video.channel?.id || '',
    title: video.title ?? video.name ?? 'Untitled',
    thumbnail: video.thumbnail ?? video.thumbnailUrl ?? video.thumbnailURL ?? video.coverImage ?? '',
    videoUrl: video.videoUrl ?? '',
    trailerUrl: video.trailerUrl ?? video.previewUrl ?? '',
    channelName: video.channel?.name ?? video.channelName ?? '',
    category: video.category ?? video.channel?.category ?? '',
    status: 'pending',
    addedAtMs: Date.now(),
  };
}

function readLocal(): WatchLaterItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(LOCAL_KEY);
    const parsed = raw ? (JSON.parse(raw) as WatchLaterItem[]) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLocal(items: WatchLaterItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(LOCAL_KEY, JSON.stringify(items));
  } catch {
    // Private mode or a full quota: the in-memory list still works this session.
  }
}

export type AddResult = 'added' | 'exists';

/** `ptWatchLater()` @31602 — saves to Firestore when signed in, else locally. */
export async function addWatchLater(uid: string | null, video: PoseTabVideo): Promise<AddResult> {
  const payload = watchLaterPayload(video);
  if (!uid) {
    const list = readLocal();
    if (list.some((item) => item.videoId === payload.videoId)) return 'exists';
    list.push(payload);
    writeLocal(list);
    return 'added';
  }

  const { db } = getPoseFirebase();
  const ref = doc(db, 'users', uid, 'watchLater', payload.videoId);
  const snap = await getDoc(ref);
  if (snap.exists()) return 'exists';
  await setDoc(ref, { ...payload, addedAt: serverTimestamp() });
  return 'added';
}

/** `ptOpenWatchLaterPage()` @31645 — pending items, newest save first. */
export async function openWatchLater(uid: string | null): Promise<WatchLaterItem[]> {
  if (!uid) {
    return readLocal()
      .filter((item) => item.status !== 'watched')
      .sort((a, b) => (b.addedAtMs || 0) - (a.addedAtMs || 0));
  }

  const { db } = getPoseFirebase();
  const snap = await getDocs(query(collection(db, 'users', uid, 'watchLater'), where('status', '==', 'pending')));
  const items = snap.docs.map((entry) => ({ ...(entry.data() as WatchLaterItem), videoId: entry.id }));
  return items.sort((a, b) => (b.addedAtMs || 0) - (a.addedAtMs || 0));
}

/** `ptRemoveWatchLater()` @31743. */
export async function removeWatchLater(uid: string | null, id: string): Promise<void> {
  if (!uid) {
    writeLocal(readLocal().filter((item) => item.videoId !== id));
    return;
  }
  const { db } = getPoseFirebase();
  await deleteDoc(doc(db, 'users', uid, 'watchLater', id));
}

/**
 * `ptMarkWatched()` @31766 — called when the player reports `ended`. The legacy
 * flipped the status and then deleted the doc in the same breath, because only
 * `pending` items are ever listed.
 */
export async function markWatchLaterWatched(uid: string | null, id: string): Promise<void> {
  if (!uid) {
    writeLocal(readLocal().filter((item) => item.videoId !== id));
    return;
  }
  const { db } = getPoseFirebase();
  const ref = doc(db, 'users', uid, 'watchLater', id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;
  await updateDoc(ref, { status: 'watched', watchedAt: serverTimestamp() });
  await deleteDoc(ref);
}
