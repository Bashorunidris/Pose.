'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  where,
} from 'firebase/firestore';

import { getPoseFirebase } from '@/lib/firebase';

import type { ChannelData, EarningsSummary, InboxMessage, VideoDoc } from './types';

export type DashboardState = {
  channelId: string;
  channel: ChannelData | null;
  videos: VideoDoc[];
  earnings: EarningsSummary;
  inbox: InboxMessage[];
  /** Single videos + the episode count across every season — the "Videos" stat. */
  contentCount: number;
  ready: boolean;
};

function readStoredSessionUid(): string | null {
  try {
    const stored = localStorage.getItem('pose_user_session');
    if (!stored) return null;
    const session = JSON.parse(stored) as { uid?: string };
    return session?.uid ?? null;
  } catch {
    return null;
  }
}

/**
 * Reproduces the legacy `auth.onAuthStateChanged` → `bootDashboard()` boot:
 * resolve the channel id (URL `?uid=`, then the user's last channel, then their
 * newest channel) and subscribe to the channel, its videos, seasons, earnings
 * summary and inbox. Everything the legacy page redirected to `index.html` or
 * `channelintro.html` now routes to the ported `/` and `/create-channel`.
 */
export function useChannelDashboard(channelIdParam: string | null): DashboardState {
  const router = useRouter();
  const [state, setState] = useState<DashboardState>({
    channelId: channelIdParam ?? '',
    channel: null,
    videos: [],
    earnings: null,
    inbox: [],
    contentCount: 0,
    ready: false,
  });

  useEffect(() => {
    const { auth, db } = getPoseFirebase();
    let cancelled = false;
    const unsubscribers: (() => void)[] = [];

    const stop = () => {
      cancelled = true;
      unsubscribers.forEach((off) => off());
      unsubscribers.length = 0;
    };

    async function resolveChannelId(userUid: string): Promise<string | null> {
      if (channelIdParam) return channelIdParam;

      const userSnap = await getDoc(doc(db, 'users', userUid));
      const lastId = userSnap.exists() ? (userSnap.data() as { lastChannelId?: string }).lastChannelId : null;
      if (lastId) {
        const channelSnap = await getDoc(doc(db, 'channels', lastId));
        if (channelSnap.exists() && (channelSnap.data() as ChannelData).ownerUid === userUid) {
          return lastId;
        }
      }

      const newest = await getDocs(
        query(collection(db, 'channels'), where('ownerUid', '==', userUid), orderBy('createdAt', 'desc'), limit(1)),
      );
      if (newest.empty) return null;
      return newest.docs[0]!.id;
    }

    async function boot(channelId: string, userUid: string) {
      setState((prev) => ({ ...prev, channelId }));

      // Legacy wrote the active channel back onto the user doc for hot reloads.
      void setDoc(
        doc(db, 'users', userUid),
        { lastChannelId: channelId, channelId, channelIds: arrayUnion(channelId) },
        { merge: true },
      );

      let videos: VideoDoc[] = [];
      let singleCount = 0;
      const episodes = { count: 0 };

      unsubscribers.push(
        onSnapshot(
          doc(db, 'channels', channelId),
          (snap) => {
            if (!snap.exists()) {
              router.replace('/create-channel?fromDash=1');
              return;
            }
            setState((prev) => ({ ...prev, channel: snap.data() as ChannelData, ready: true }));
          },
          (error) => {
            console.error('Channel error:', error);
            setState((prev) => ({ ...prev, ready: true }));
          },
        ),
      );

      unsubscribers.push(
        onSnapshot(
          query(collection(db, 'channels', channelId, 'videos'), orderBy('createdAt', 'desc')),
          (snap) => {
            videos = snap.docs.map((entry) => ({ id: entry.id, ...entry.data() }) as VideoDoc);
            singleCount = videos.length;
            setState((prev) => ({ ...prev, videos, contentCount: singleCount + episodes.count }));
          },
          (error) => console.error('Videos error:', error),
        ),
      );

      unsubscribers.push(
        onSnapshot(
          collection(db, 'channels', channelId, 'seasons'),
          (snap) => {
            episodes.count = snap.docs.reduce(
              (sum, entry) => sum + (Number((entry.data() as { episodeCount?: number }).episodeCount) || 0),
              0,
            );
            setState((prev) => ({ ...prev, contentCount: singleCount + episodes.count }));
          },
          (error) => console.error('Seasons error:', error),
        ),
      );

      unsubscribers.push(
        onSnapshot(
          doc(db, 'channels', channelId, 'earnings', 'summary'),
          (snap) => {
            setState((prev) => ({ ...prev, earnings: snap.exists() ? (snap.data() as EarningsSummary) : null }));
          },
          (error) => console.error('Earnings error:', error),
        ),
      );

      unsubscribers.push(
        onSnapshot(
          query(collection(db, 'channels', channelId, 'inbox'), orderBy('createdAt', 'desc')),
          (snap) => {
            setState((prev) => ({
              ...prev,
              inbox: snap.docs.map((entry) => ({ id: entry.id, ...entry.data() }) as InboxMessage),
            }));
          },
          (error) => console.error('Inbox error:', error),
        ),
      );
    }

    const off = onAuthStateChanged(auth, async (user) => {
      if (cancelled) return;
      const uid = user?.uid ?? readStoredSessionUid();
      if (!uid) {
        // No Firebase session and no Pose session saved at login → back to the app.
        router.replace('/');
        return;
      }
      if (!user && !channelIdParam) {
        router.replace('/');
        return;
      }
      const channelId = await resolveChannelId(uid);
      if (!channelId) {
        router.replace('/create-channel');
        return;
      }
      if (!cancelled) void boot(channelId, uid);
    });

    unsubscribers.push(off);
    return stop;
  }, [channelIdParam, router]);

  return state;
}
