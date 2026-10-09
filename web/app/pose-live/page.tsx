'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePoseSession } from '@/lib/pose-app/session';
import {
  useHostFollowers,
  useLiveSessions,
  useTotalUserCount,
  watchSessionHref,
} from '@/lib/pose-live/live-sessions';
import type { LiveMode, LiveSession } from '@/lib/pose-live/types';
import { Ambient } from '@/components/pose-live/Ambient';
import { FeedPage, type Filter } from '@/components/pose-live/FeedPage';
import { GoLivePage } from '@/components/pose-live/GoLivePage';
import { Loader } from '@/components/pose-live/Loader';
import { SetupPage, type SetupMode, type SetupPayload } from '@/components/pose-live/SetupPage';
import { Toast } from '@/components/pose-live/Toast';
import {
  PAGE,
  PAGE_HIDDEN_LEFT,
  PAGE_HIDDEN_RIGHT,
  PAGE_VISIBLE,
  ROOT,
  cx,
} from '@/components/pose-live/styles';

type Route = 'feed' | 'golive' | 'setup';

/** `auth.onAuthStateChanged` @1929 held the loader for 900ms; the port keeps that beat. */
const LOADER_MS = 900;
const TOAST_MS = 2800;

export default function PoseLivePage() {
  const router = useRouter();
  const { user } = usePoseSession();
  const uid = user?.uid ?? null;

  const { sessions, failed, loaded } = useLiveSessions();
  const totalUsers = useTotalUserCount();
  const followers = useHostFollowers(uid);

  const [route, setRoute] = useState<Route>('feed');
  const [filter, setFilter] = useState<Filter>('all');
  const [tab, setTab] = useState<LiveMode>('video');
  const [setupMode, setSetupMode] = useState<SetupMode>('voice');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), LOADER_MS);
    return () => clearTimeout(timer);
  }, []);

  const showToast = useCallback((message: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(message);
    toastTimer.current = setTimeout(() => setToast(null), TOAST_MS);
  }, []);

  useEffect(
    () => () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    },
    [],
  );

  /** `watchNow` @1748 — the player lives on the still-unported `poselive.html`. */
  const openSession = useCallback(
    (session: LiveSession) => {
      window.location.href = watchSessionHref(session, uid ?? '');
    },
    [uid],
  );

  const openSetup = useCallback((mode: LiveMode) => {
    if (mode !== 'voice' && mode !== 'chat') return;
    setSetupMode(mode);
    setRoute('setup');
  }, []);

  /**
   * `launchLive` @2066. Legacy sent these params to `poselivechat.html`; that page
   * was overwritten by an R2 CORS policy file in commit ade5426 and has been
   * recovered into `legacy/` and ported to `/pose-live/room`, which is where the
   * setup form now hands off.
   */
  const launch = useCallback(
    (payload: SetupPayload) => {
      const params = new URLSearchParams({
        mode: payload.mode,
        roomName: payload.roomName,
        streamTitle: payload.streamTitle,
        privacy: payload.privacy,
        allowImages: payload.allowImages ? '1' : '0',
        allowVideos: payload.allowVideos ? '1' : '0',
        allowDonations: payload.allowDonations ? '1' : '0',
        minDonation: payload.minDonation,
        subAmount: payload.subAmount,
        followerTarget: payload.followerTarget,
        timer: payload.timer,
      });
      if (user) {
        params.set('uid', user.uid);
        if (user.displayName) params.set('hostName', user.displayName);
        if (user.photoURL) params.set('hostPhoto', user.photoURL);
      }
      // The room boots its Firebase session from these params on mount.
      router.push(`/pose-live/room?${params.toString()}`);
    },
    [router, user],
  );

  return (
    <div className={ROOT}>
      <Ambient />
      {/* `#page-feed` @1061 — stays mounted so its scroll position survives a Go Live round trip. */}
      <div className={cx(PAGE, route === 'feed' ? PAGE_VISIBLE : PAGE_HIDDEN_LEFT)}>
        <FeedPage
          sessions={sessions}
          failed={failed}
          loaded={loaded}
          totalUsers={totalUsers}
          filter={filter}
          onFilter={setFilter}
          onGoLive={() => setRoute('golive')}
          onOpen={openSession}
        />
      </div>
      {/* `#page-golive` @1125 */}
      <div
        className={cx(
          PAGE,
          route === 'feed' ? PAGE_HIDDEN_RIGHT : route === 'golive' ? PAGE_VISIBLE : PAGE_HIDDEN_LEFT,
        )}
      >
        <GoLivePage
          tab={tab}
          onTab={setTab}
          onBack={() => setRoute('feed')}
          onOpenSetup={openSetup}
          followers={followers}
        />
      </div>
      {/* `#page-setup` @1406 */}
      <div className={cx(PAGE, route === 'setup' ? PAGE_VISIBLE : PAGE_HIDDEN_RIGHT)}>
        <SetupPage
          mode={setupMode}
          onBack={() => setRoute('golive')}
          onLaunch={launch}
          onWarn={showToast}
        />
      </div>
      <Loader done={!loading} />
      <Toast message={toast} />
    </div>
  );
}
