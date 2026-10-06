'use client';

import { useCallback, useState } from 'react';

import { BottomNav } from './BottomNav';
import { BuzzFeed } from './BuzzFeed';
import { ForYouFeed } from './ForYouFeed';
import { LiveComingSoon } from './LiveComingSoon';
import { NotificationsPanel } from './NotificationsPanel';
import { TopNav, type FeedTab } from './TopNav';
import { TrendModal } from './TrendModal';
import { TAB_CONTENT, cx } from './styles';
import { clearBuzzFeedCache, clearForYouFeedCache } from '@/lib/pose-app/feed';
import { unreadCount, usePoseNotifications } from '@/lib/pose-app/notifications';
import { usePoseSession } from '@/lib/pose-app/session';

/**
 * The ported `index.html` shell. Both feeds stay mounted and are shown with
 * `display:none` exactly like the legacy `.tab-content` panels @14108, so each
 * keeps its scroll position; `active` is what pauses the clip you left behind,
 * because hiding a `<video>` does not stop it.
 */
export function AppShell() {
  const { user } = usePoseSession();
  const uid = user?.uid ?? null;

  const [tab, setTab] = useState<FeedTab>('forYou');
  const [trendOpen, setTrendOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [liveOpen, setLiveOpen] = useState(false);
  const [forYouKey, setForYouKey] = useState(0);
  const [buzzKey, setBuzzKey] = useState(0);

  const notifications = usePoseNotifications(uid);
  const unread = unreadCount(notifications);
  const overlayOpen = trendOpen || notifOpen || liveOpen;

  // Every overlay is a full-bleed fixed panel above both nav bars, so a tab or
  // Home press can only ever fire while nothing is open.
  const handleHome = useCallback(() => {
    // `_homeDetectTab` @42716 reads the feed tab, never the modal, so Home
    // re-pulls whichever feed is underneath. The cache has to go first or the
    // remount reads the same stale page straight back out of localStorage.
    if (tab === 'buzz') {
      clearBuzzFeedCache();
      setBuzzKey((key) => key + 1);
      return;
    }
    clearForYouFeedCache();
    setForYouKey((key) => key + 1);
  }, [tab]);

  return (
    <div className="min-h-[100dvh] overscroll-y-contain bg-app-black md:bg-app-shell">
      <TopNav tab={tab} onSelect={setTab} onOpenTrend={() => setTrendOpen(true)} />

      <div className={cx(TAB_CONTENT, tab === 'forYou' ? 'block' : 'hidden')}>
        <ForYouFeed
          key={`forYou-${forYouKey}`}
          uid={uid}
          active={tab === 'forYou' && !overlayOpen}
        />
      </div>

      <div className={cx(TAB_CONTENT, tab === 'buzz' ? 'block' : 'hidden')}>
        <BuzzFeed key={`buzz-${buzzKey}`} uid={uid} active={tab === 'buzz' && !overlayOpen} />
      </div>

      <BottomNav
        unread={unread}
        onHome={handleHome}
        onNotifications={() => setNotifOpen(true)}
        onLive={() => setLiveOpen(true)}
      />

      <TrendModal open={trendOpen} onClose={() => setTrendOpen(false)} uid={uid} />

      <NotificationsPanel
        open={notifOpen}
        onClose={() => setNotifOpen(false)}
        uid={uid}
        displayName={user?.displayName ?? ''}
        items={notifications}
      />

      <LiveComingSoon open={liveOpen} onClose={() => setLiveOpen(false)} uid={uid} />
    </div>
  );
}
