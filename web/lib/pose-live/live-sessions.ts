'use client';

import { useEffect, useState } from 'react';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  where,
  type DocumentData,
} from 'firebase/firestore';

import { getPoseFirebase } from '@/lib/firebase';
import { COMING_SOON_MODES, LIVE_TARGET_USERS, type LiveMode, type LiveSession } from './types';

function str(value: unknown, fallback = ''): string {
  return typeof value === 'string' && value.length > 0 ? value : fallback;
}

function num(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

/** Unknown or absent modes would otherwise render an unstyled card. */
function modeOf(value: unknown): LiveMode {
  return value === 'video' || value === 'voice' || value === 'chat' || value === 'gaming'
    ? value
    : 'video';
}

function normalise(id: string, data: DocumentData): LiveSession {
  return {
    id,
    mode: modeOf(data.mode),
    hostUid: str(data.hostUid),
    hostName: str(data.hostName, 'Anonymous'),
    title: str(data.title),
    viewerCount: num(data.viewerCount),
    status: str(data.status),
  };
}

export type LiveFeedState = {
  sessions: LiveSession[];
  /** Set when the listener itself fails; the feed then reads 'Could not load streams'. */
  failed: boolean;
  loaded: boolean;
};

/** `subscribeLive` @1908 — one listener for every card in the feed. */
export function useLiveSessions(): LiveFeedState {
  const [state, setState] = useState<LiveFeedState>({
    sessions: [],
    failed: false,
    loaded: false,
  });

  useEffect(() => {
    const { db } = getPoseFirebase();
    return onSnapshot(
      query(collection(db, 'live_sessions'), where('status', '==', 'live')),
      (snap) => setState({ sessions: snap.docs.map((d) => normalise(d.id, d.data())), failed: false, loaded: true }),
      (error) => {
        console.error('Firestore error:', error);
        setState((previous) => ({ ...previous, failed: true, loaded: true }));
      },
    );
  }, []);

  return state;
}

/**
 * `loadUserCount` @1922. This reads the whole `users` collection to get a count,
 * exactly as legacy does — one document read per user on every page load.
 */
export function useTotalUserCount(): number | null {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    const { db } = getPoseFirebase();
    getDocs(collection(db, 'users'))
      .then((snap) => {
        if (active) setCount(snap.size);
      })
      .catch(() => {
        if (active) setCount(0);
      });
    return () => {
      active = false;
    };
  }, []);

  return count;
}

/** `loadStats` @1704 — the follower count shown in the video panel. */
export function useHostFollowers(uid: string | null): string {
  const [followers, setFollowers] = useState<string | null>(null);

  useEffect(() => {
    if (!uid) return;
    let active = true;
    const { db } = getPoseFirebase();
    getDoc(doc(db, 'users', uid))
      .then((snap) => {
        if (!active || !snap.exists()) return;
        setFollowers(num(snap.data().followers).toLocaleString());
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [uid]);

  // Signed out, or the doc has not resolved yet, is the legacy `—` placeholder.
  return uid && followers !== null ? followers : '—';
}

export function progressPercent(count: number): number {
  return Math.min((count / LIVE_TARGET_USERS) * 100, 100);
}

export function isComingSoon(mode: LiveMode): boolean {
  return COMING_SOON_MODES.includes(mode);
}

export function fmtViewers(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n || 0);
}

export function initialsOf(name: string): string {
  if (!name) return '?';
  return name
    .split(' ')
    .map((word) => word[0] ?? '')
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

/**
 * `watchNow` @1748. `poselive.html` is still the unported player, so the link
 * stays an absolute path to the legacy page on the same host.
 */
export function watchSessionHref(session: LiveSession, viewerUid: string): string {
  const params = new URLSearchParams({
    sid: session.id,
    mode: session.mode,
    viewerUid,
  });
  return `/poselive.html?${params.toString()}`;
}

/** `startLive` @1685 — an existing live session is rejoined rather than restarted. */
export async function findHostSession(uid: string): Promise<string | null> {
  const { db } = getPoseFirebase();
  const existing = await getDocs(
    query(
      collection(db, 'live_sessions'),
      where('hostUid', '==', uid),
      where('status', '==', 'live'),
    ),
  );
  return existing.empty ? null : existing.docs[0].id;
}

export function startLiveHref(uid: string, mode: LiveMode, sid?: string | null): string {
  const params = new URLSearchParams({ uid, mode });
  if (sid) params.set('sid', sid);
  return `/poselive.html?${params.toString()}`;
}
