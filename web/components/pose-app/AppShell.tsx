'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';

import { AuthModal } from './AuthModal';
import { BottomNav } from './BottomNav';
import { BuzzFeed } from './BuzzFeed';
import { ChatRoom } from './chat/ChatRoom';
import { CommentModal } from './comments/CommentModal';
import { ForYouFeed } from './ForYouFeed';
import { LiveComingSoon } from './LiveComingSoon';
import { NotificationsPanel } from './NotificationsPanel';
import { PoseInfoModal } from './pose/PoseInfoModal';
import { PosePlayer } from './pose/PosePlayer';
import { PoseTab } from './pose/PoseTab';
import { ProfilePage } from './ProfilePage';
import type { CaptureClip } from './recorder/RecordStage';
import { RecorderSheet } from './recorder/RecorderSheet';
import { BuzzSearchOverlay } from './search/BuzzSearchOverlay';
import { SearchOverlay } from './search/SearchOverlay';
import { TopNav, type FeedTab } from './TopNav';
import { TrendModal } from './TrendModal';
import { WalletSheet } from './wallet/WalletSheet';
import { TAB_CONTENT, cx } from './styles';
import { commentTargetKey, type CommentTarget } from '@/lib/pose-app/comments';
import { clearBuzzFeedCache, clearForYouFeedCache, clearPoseTabFeedCache } from '@/lib/pose-app/feed';
import { unreadCount, usePoseNotifications } from '@/lib/pose-app/notifications';
import { clearBuzzSearchCache } from '@/lib/pose-app/search';
import { usePoseSession } from '@/lib/pose-app/session';
import type { PosePlayerVideo } from '@/lib/pose-app/pose-player';
import type { BuzzPost, PoseChannel, PoseVideo } from '@/lib/pose-app/types';

/**
 * The ported `index.html` shell. Both feeds stay mounted and are shown with
 * `display:none` exactly like the legacy `.tab-content` panels @14108, so each
 * keeps its scroll position; `active` is what pauses the clip you left behind,
 * because hiding a `<video>` does not stop it.
 */
export function AppShell() {
  const router = useRouter();
  const { user } = usePoseSession();
  const uid = user?.uid ?? null;

  const [tab, setTab] = useState<FeedTab>('forYou');
  const [trendOpen, setTrendOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [liveOpen, setLiveOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  /** `openWallet()` @61904 — the wallet sheet is a full-bleed surface over the feeds. */
  const [walletOpen, setWalletOpen] = useState(false);
  /** `openRecordingUI()` @58472 behind `#navCreate` @24561. */
  const [recorderOpen, setRecorderOpen] = useState(false);
  /** `postDraft()` @45807's clip, when the recorder is being opened from Drafts. */
  const [draftClip, setDraftClip] = useState<CaptureClip | null>(null);
  // `openSearchForActiveTab()` @79729 dispatched on the active tab; Buzz has its
  // own overlay, so the mode travels with the open state.
  const [searchMode, setSearchMode] = useState<'forYou' | 'buzz' | null>(null);
  /** A buzz post picked out of search, handed to the feed to prepend and reveal. */
  const [buzzJump, setBuzzJump] = useState<BuzzPost | null>(null);
  /**
   * `openCommentModal()` @66211 / `openBuzzComments()` @33961 — whose comment
   * sheet is open. Both sheets are the same component, so the target travels
   * with the open state.
   */
  const [commentsFor, setCommentsFor] = useState<{ target: CommentTarget; ownerId: string | null } | null>(null);
  /**
   * The comment tallies the feed buttons show, keyed by `commentTargetKey()`.
   * `renderCommentsList()` @69769 recounted the real total on every render and
   * wrote it back onto the button, because the stored counter drifts as soon as a
   * comment is deleted.
   */
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>({});
  const [toast, setToast] = useState('');
  const [forYouKey, setForYouKey] = useState(0);
  const [buzzKey, setBuzzKey] = useState(0);
  const [poseKey, setPoseKey] = useState(0);
  /**
   * `loadPoseTabPosts()` fans out one read per channel, so the tab mounts on
   * first visit rather than prefetching on load the way the legacy's 1.5s timer
   * did — and then stays mounted so its rows and scroll survive a tab switch.
   */
  const [poseVisited, setPoseVisited] = useState(false);
  /** The Pose tab's own video player (`openTnPlayer()` @87774). */
  const [playerVideo, setPlayerVideo] = useState<PosePlayerVideo | null>(null);
  /** `tnOpenModal()` @87644 — the hero's "More Info" dialog. */
  const [infoVideo, setInfoVideo] = useState<PosePlayerVideo | null>(null);
  /**
   * `openChatRoomWithUser()` @81223 — the direct-message room is one overlay
   * over the whole shell, opened from a message notification or a profile's
   * Message button.
   */
  const [chatPeer, setChatPeer] = useState<{ userId: string; name: string; pic: string } | null>(
    null,
  );

  const notifications = usePoseNotifications(uid);
  const unread = unreadCount(notifications);
  const overlayOpen =
    playerVideo !== null ||
    infoVideo !== null ||
    trendOpen ||
    notifOpen ||
    liveOpen ||
    authOpen ||
    profileOpen ||
    walletOpen ||
    recorderOpen ||
    chatPeer !== null ||
    searchMode !== null;

  /**
   * `openForYouProfilePage()` @66391 opened another creator at `#forYouProfilePageModal`
   * and, when the id was your own, fell through to `openProfile()`. The port gives
   * the creator its own route and keeps the same self-redirect.
   */
  const openCreator = useCallback(
    (creatorId: string, landingTab?: 'feed' | 'photos' | 'buzzs' | 'liked' | 'stories') => {
      if (!creatorId) return;
      if (uid && creatorId === uid) {
        setProfileOpen(true);
        return;
      }
      router.push(`/u/${encodeURIComponent(creatorId)}${landingTab ? `?tab=${landingTab}` : ''}`);
    },
    [router, uid],
  );

  /** `openBuzzPostFromSearch()` @80498 — the post belongs in the Buzz feed. */
  const openBuzzPost = useCallback((post: BuzzPost) => {
    setTab('buzz');
    setBuzzJump(post);
  }, []);

  const handleBuzzJumpHandled = useCallback(() => setBuzzJump(null), []);

  const openComments = useCallback((video: PoseVideo) => {
    setCommentsFor({ target: { kind: 'video', id: video.id }, ownerId: video.userId ?? null });
  }, []);

  /** `openBuzzComments(event, buzz.id, buzz.date, buzz.userId)` @33961. */
  const openBuzzComments = useCallback((post: BuzzPost) => {
    if (!post.date) return;
    setCommentsFor({ target: { kind: 'buzz', id: post.id, date: post.date }, ownerId: post.userId ?? null });
  }, []);

  const handleCommentCount = useCallback((target: CommentTarget, count: number) => {
    const key = commentTargetKey(target);
    setCommentCounts((current) => (current[key] === count ? current : { ...current, [key]: count }));
  }, []);

  /** The same toast the dashboard uses for screens that are still legacy-only. */
  const showToast = useCallback((message: string) => {
    setToast(message);
    setTimeout(() => setToast(''), 2500);
  }, []);

  /** `openChatRoomWithUser(userId, name, pic)` @81223. */
  const openChat = useCallback((userId: string, name: string, pic: string) => {
    if (!userId) return;
    setChatPeer({ userId, name, pic });
  }, []);

  // Every overlay is a full-bleed fixed panel above both nav bars, so a tab or
  // Home press can only ever fire while nothing is open.
  const handleHome = useCallback(() => {
    // `_homeDetectTab` @42716 reads the feed tab, never the modal, so Home
    // re-pulls whichever feed is underneath. The cache has to go first or the
    // remount reads the same stale page straight back out of localStorage.
    if (tab === 'buzz') {
      clearBuzzFeedCache();
      clearBuzzSearchCache();
      setBuzzKey((key) => key + 1);
      return;
    }
    if (tab === 'pose') {
      clearPoseTabFeedCache();
      setPoseKey((key) => key + 1);
      return;
    }
    clearForYouFeedCache();
    setForYouKey((key) => key + 1);
  }, [tab]);

  const selectTab = useCallback((next: FeedTab) => {
    if (next === 'pose') setPoseVisited(true);
    setTab(next);
  }, []);

  /** Cards and rails in the Pose tab all open the same player. */
  const openPoseVideo = useCallback((video: PosePlayerVideo) => {
    setInfoVideo(null);
    setPlayerVideo(video);
  }, []);

  /**
   * `openChannelDirect()` @67942 opened a creator's channel page. A channel doc
   * carries the owning user id, so that creator's profile is the port's
   * equivalent; without one the channel dashboard is the closest surface.
   */
  const openPoseChannel = useCallback(
    (channelId: string, channel: PoseChannel | null) => {
      const owner = channel?.userId ?? '';
      if (owner) openCreator(owner);
      else if (channelId) router.push('/channel-dashboard');
    },
    [openCreator, router],
  );

  // The legacy pages hard-reload with a cache-busting query after signing in
  // (`clearAllFeedCaches` @30675 + `location.replace`). Dropping the caches and
  // remounting both feeds is the same reset without throwing away the SPA.
  const handleAuthenticated = useCallback(() => {
    setAuthOpen(false);
    clearForYouFeedCache();
    clearBuzzFeedCache();
    clearBuzzSearchCache();
    setForYouKey((key) => key + 1);
    setBuzzKey((key) => key + 1);
  }, []);

  return (
    <div className="min-h-[100dvh] overscroll-y-contain bg-app-black md:bg-app-shell">
      <TopNav
        tab={tab}
        onSelect={selectTab}
        onOpenTrend={() => setTrendOpen(true)}
        user={user}
        onProfileClick={() => setAuthOpen(true)}
        onOpenProfile={() => setProfileOpen(true)}
        onOpenSearch={() => setSearchMode(tab === 'buzz' ? 'buzz' : 'forYou')}
      />

      <div className={cx(TAB_CONTENT, tab === 'forYou' ? 'block' : 'hidden')}>
        <ForYouFeed
          key={`forYou-${forYouKey}`}
          uid={uid}
          active={tab === 'forYou' && !overlayOpen}
          displayName={user?.displayName ?? ''}
          email={user?.email ?? ''}
          onToast={showToast}
          onOpenCreator={openCreator}
          commentCounts={commentCounts}
          onOpenComments={openComments}
        />
      </div>

      <div className={cx(TAB_CONTENT, tab === 'buzz' ? 'block' : 'hidden')}>
        <BuzzFeed
          key={`buzz-${buzzKey}`}
          uid={uid}
          active={tab === 'buzz' && !overlayOpen}
          onOpenCreator={openCreator}
          jumpTo={buzzJump}
          onJumpHandled={handleBuzzJumpHandled}
          commentCounts={commentCounts}
          onOpenComments={openBuzzComments}
        />
      </div>

      {poseVisited ? (
        <PoseTab
          key={`pose-${poseKey}`}
          active={tab === 'pose' && !overlayOpen}
          uid={uid}
          onToast={showToast}
          onOpenVideo={openPoseVideo}
          onOpenInfo={(video) => setInfoVideo(video)}
          onOpenSeason={(season) =>
            openPoseVideo({ ...season, isSeason: true, seasons: [season], title: season.title } as PosePlayerVideo)
          }
          onOpenChannel={openPoseChannel}
          onOpenWallet={() => setWalletOpen(true)}
        />
      ) : null}

      <BottomNav
        unread={unread}
        onHome={handleHome}
        onNotifications={() => setNotifOpen(true)}
        onCreate={() => setRecorderOpen(true)}
        onLive={() => setLiveOpen(true)}
      />

      <TrendModal
        open={trendOpen}
        onClose={() => setTrendOpen(false)}
        uid={uid}
        displayName={user?.displayName ?? ''}
        email={user?.email ?? ''}
        onToast={showToast}
        onOpenCreator={openCreator}
        onOpenComments={openComments}
      />

      <NotificationsPanel
        open={notifOpen}
        onClose={() => setNotifOpen(false)}
        uid={uid}
        displayName={user?.displayName ?? ''}
        items={notifications}
        onOpenChat={(userId, name, pic) => {
          setNotifOpen(false);
          openChat(userId, name, pic);
        }}
        onOpenCreator={(creatorId) => {
          setNotifOpen(false);
          openCreator(creatorId);
        }}
      />

      <LiveComingSoon open={liveOpen} onClose={() => setLiveOpen(false)} uid={uid} />

      {/*
        `openSearchForActiveTab()` @79729 dispatched on the active tab: Buzz opens
        `openBuzzSearch()` @80067, Pose opens `openPoseSearch()` @79789 and
        everything else opens the For You overlay. Pose search is still to come,
        so the Pose tab falls through to the For You overlay for now.
      */}
      {searchMode === 'forYou' && (
        <SearchOverlay
          uid={uid}
          displayName={user?.displayName ?? ''}
          email={user?.email ?? ''}
          onClose={() => setSearchMode(null)}
          onToast={showToast}
          onOpenCreator={openCreator}
          onOpenComments={openComments}
        />
      )}

      {searchMode === 'buzz' && (
        <BuzzSearchOverlay
          uid={uid}
          onClose={() => setSearchMode(null)}
          onToast={showToast}
          onOpenCreator={openCreator}
          onOpenBuzzPost={openBuzzPost}
        />
      )}

      {/*
        `openCommentModal()` did not pause the feed the way the other overlays do
        — the clip keeps playing behind the sheet — so this deliberately stays out
        of `overlayOpen`.
      */}
      <CommentModal
        open={commentsFor !== null}
        target={commentsFor?.target ?? null}
        ownerId={commentsFor?.ownerId ?? null}
        uid={uid}
        viewerName={user?.displayName ?? ''}
        viewerPic={user?.photoURL ?? ''}
        onClose={() => setCommentsFor(null)}
        onToast={showToast}
        onOpenCreator={(creatorId) => {
          setCommentsFor(null);
          openCreator(creatorId);
        }}
        onCount={handleCommentCount}
      />

      <WalletSheet
        open={walletOpen}
        onClose={() => setWalletOpen(false)}
        uid={uid}
        viewer={{ name: user?.displayName ?? '', email: user?.email ?? '' }}
        onToast={showToast}
        onRequestOpen={() => setWalletOpen(true)}
      />

      {/*
        `openRecordingUI()` paused the feeds before it raised the overlay; the
        shell's `overlayOpen` does that here, and unmounting the sheet on close is
        what stops the camera the legacy used to leave running.
      */}
      {recorderOpen ? (
        <RecorderSheet
          uid={uid}
          initialClip={draftClip}
          onClose={() => {
            setRecorderOpen(false);
            // A draft that was opened but never saved must not reopen the editor
            // the next time Create is pressed.
            setDraftClip(null);
          }}
          // `publishRecordingPostToFirebase()` @57684 re-pulled the For You feed
          // itself, because the new video has to be in it.
          onPublished={handleHome}
        />
      ) : null}

      <PosePlayer
        open={playerVideo !== null}
        video={playerVideo}
        uid={uid}
        email={user?.email ?? null}
        displayName={user?.displayName ?? ''}
        onClose={() => setPlayerVideo(null)}
        onToast={showToast}
        onOpenChannel={openPoseChannel}
        onOpenVideo={openPoseVideo}
      />

      <PoseInfoModal
        video={infoVideo}
        onClose={() => setInfoVideo(null)}
        onPlay={(video) => openPoseVideo(video)}
      />

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} onAuthenticated={handleAuthenticated} />

      {profileOpen && uid ? (
        <ProfilePage
          uid={uid}
          email={user?.email ?? ''}
          onClose={() => setProfileOpen(false)}
          onOpenChannel={() => {
            setProfileOpen(false);
            router.push('/channel-dashboard');
          }}
          onOpenWallet={() => setWalletOpen(true)}
          onToast={showToast}
          // `postDraft()` @45807: the draft becomes a clip and the recorder opens
          // straight on the editor, which is where the legacy put it too.
          onEditDraft={(clip) => {
            setDraftClip(clip);
            setProfileOpen(false);
            setRecorderOpen(true);
          }}
          // Logout, deactivation and deletion all end the same way the legacy
          // `location.href = 'index.html'` did: back to the auth screen.
          onSignedOut={() => {
            setProfileOpen(false);
            setAuthOpen(true);
          }}
        />
      ) : null}

      <ChatRoom
        open={chatPeer !== null}
        uid={uid}
        displayName={user?.displayName ?? ''}
        peer={chatPeer}
        onClose={() => setChatPeer(null)}
        onToast={showToast}
      />

      <div
        className="pointer-events-none fixed bottom-[80px] left-1/2 z-[9999] -translate-x-1/2 rounded-[30px] bg-app-interact px-[22px] py-[10px] text-[13px] font-medium whitespace-nowrap text-white transition-all duration-[300ms]"
        style={{ opacity: toast ? 1 : 0 }}
        role="status"
      >
        {toast}
      </div>
    </div>
  );
}
