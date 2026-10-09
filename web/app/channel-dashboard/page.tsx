'use client';

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { doc, updateDoc } from 'firebase/firestore';

import { DashboardMarkup, type DashboardPage } from '@/components/channel-dashboard/DashboardMarkup';
import { AllVideosPage } from '@/components/channel-dashboard/AllVideosPage';
import { EarningsPage } from '@/components/channel-dashboard/EarningsPage';
import { HomePage, type HomeTab } from '@/components/channel-dashboard/HomePage';
import { StudioPage } from '@/components/channel-dashboard/StudioPage';
import { inboxListHtml } from '@/lib/channel-dashboard/inbox';
import { buildImageViewer, buildModalContent, type ModalId } from '@/lib/channel-dashboard/modal-templates';
import { useChannelDashboard } from '@/lib/channel-dashboard/use-channel-dashboard';
import { getPoseFirebase } from '@/lib/firebase';

/**
 * Which shell is on screen. `HomeTab` covers the four tabbed pages, `OwnedPage`
 * adds the ones React renders itself, and `DashboardPage` is everything still
 * coming out of the generated markup.
 */
type OwnedPage = 'allvideos';
type ShellPage = HomeTab | OwnedPage | DashboardPage;

const TOAST_STYLE = {
  position: 'fixed',
  bottom: '80px',
  left: '50%',
  background: 'var(--text-main)',
  color: 'white',
  padding: '10px 22px',
  borderRadius: '30px',
  fontSize: '13px',
  fontWeight: '500',
  transition: 'all .3s',
  zIndex: '9999',
  pointerEvents: 'none',
  whiteSpace: 'nowrap',
} as const;

export default function ChannelDashboardPage() {
  return (
    <Suspense fallback={<div className="channel-dash"><div id="dashLoader" /></div>}>
      <DashboardFromParams />
    </Suspense>
  );
}

/** `channeldashboard.html` reads the channel from `?uid=` (see the legacy boot). */
function DashboardFromParams() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const channelIdParam = searchParams.get('uid');
  const { channelId, channel, inbox, videos, earnings, contentCount, ready } = useChannelDashboard(channelIdParam);

  const rootRef = useRef<HTMLDivElement | null>(null);
  const [page, setPage] = useState<ShellPage>('home');
  const [modalHtml, setModalHtml] = useState('');
  const [toast, setToast] = useState('');
  const [inboxOpen, setInboxOpen] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((message: string) => {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 2500);
  }, []);

  const closeModal = useCallback(() => setModalHtml(''), []);

  const openModal = useCallback(
    (id: ModalId) => setModalHtml(buildModalContent(id, channel ?? {})),
    [channel],
  );

  const viewFullImage = useCallback(
    (url: string | undefined, label: string) => {
      if (!url) {
        showToast('No image uploaded yet');
        return;
      }
      setModalHtml(buildImageViewer(url, label));
    },
    [showToast],
  );

  const goHome = useCallback(() => setPage('home'), []);

  /**
   * Legacy `openVideoDetail()` also remembered the page it was opened from; the
   * detail screen itself is the next port, so the banner/table clicks land on a
   * toast instead of a half-wired page.
   */
  const openVideoDetail = useCallback(() => {
    showToast('Video detail is the next screen to be ported');
  }, [showToast]);

  const onTab = useCallback((tab: HomeTab) => setPage(tab), []);

  const markInboxRead = useCallback(
    async (id: string) => {
      if (!channelId) return;
      try {
        await updateDoc(doc(getPoseFirebase().db, 'channels', channelId, 'inbox', id), { read: true });
      } catch (error) {
        console.error('Failed to mark inbox message read:', error);
      }
    },
    [channelId],
  );

  /**
   * The generated markup keeps the legacy inline `on*` handlers, and the modal
   * templates do the same. They resolve their identifiers against `window`, so
   * every handler this slice implements is published here — the rest are still
   * pending their per-page port and fail soft in `runInline`.
   */
  useEffect(() => {
    const previous = window as unknown as Record<string, unknown>;

    Object.assign(previous, {
      onMainTab: (_el: HTMLElement, tab: HomeTab) => setPage(tab),
      openStudio: () => setPage('studio'),
      openEarnings: () => setPage('earnings'),
      openLegibility: () => setPage('legibility'),
      goBack: goHome,
      goBackFromLegibility: goHome,
      openUpload: () => setPage('upload'),
      closeUpload: goHome,
      openModal: (id: ModalId) => openModal(id),
      closeModal,
      viewFullImage,
      showToast,
      openInboxPopup: () => setInboxOpen(true),
      closeInboxPopup: () => setInboxOpen(false),
      markInboxRead: (id: string) => void markInboxRead(id),
      goBackToPose: () => {
        router.replace('/');
      },
    });
  }, [closeModal, goHome, markInboxRead, openModal, router, showToast, viewFullImage]);

  /** `openLegibility()` animated the bars, the counters and the reveal cards. */
  useEffect(() => {
    const root = rootRef.current;
    if (page !== 'legibility' || !root) return;

    const bars = setTimeout(() => {
      root.querySelectorAll<HTMLElement>('.leg-bar-fill').forEach((bar) => {
        bar.style.width = `${bar.getAttribute('data-w') || 0}%`;
      });
    }, 300);

    const counters: ReturnType<typeof setInterval>[] = [];
    root.querySelectorAll<HTMLElement>('.leg-hstat-val[data-count]').forEach((el) => {
      const target = parseInt(el.getAttribute('data-count') || '0', 10);
      let current = 0;
      const step = Math.ceil(target / 24);
      const timer = setInterval(() => {
        current = Math.min(current + step, target);
        el.textContent = String(current);
        if (current >= target) clearInterval(timer);
      }, 50);
      counters.push(timer);
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 },
    );
    const observe = setTimeout(() => {
      root.querySelectorAll('#page-legibility .leg-reveal').forEach((el) => observer.observe(el));
    }, 100);

    return () => {
      clearTimeout(bars);
      clearTimeout(observe);
      counters.forEach(clearInterval);
      observer.disconnect();
    };
  }, [page]);

  const unreadCount = useMemo(() => inbox.filter((message) => !message.read).length, [inbox]);
  const inboxHtml = useMemo(() => inboxListHtml(inbox), [inbox]);

  return (
    <div className="channel-dash" ref={rootRef}>
      <div id="dashLoader" className={ready ? 'hidden' : undefined}>
        <div className="dash-spinner" />
        <p>Loading your channel…</p>
      </div>

      {page === 'home' ? (
        <HomePage
          channel={channel}
          contentCount={contentCount}
          inboxCount={unreadCount}
          onTab={onTab}
          onOpenModal={openModal}
          onViewImage={viewFullImage}
          onOpenInbox={() => setInboxOpen(true)}
          onOpenSettings={() => showToast('Settings is the next screen to be ported')}
          onLeave={() => router.replace('/')}
          onUpload={() => setPage('upload')}
          onAllVideos={() => setPage('allvideos')}
        />
      ) : null}

      {page === 'studio' ? (
        <StudioPage
          channel={channel}
          videos={videos}
          onBack={goHome}
          onOpenVideo={openVideoDetail}
        />
      ) : null}

      {page === 'allvideos' ? (
        <AllVideosPage
          channelId={channelId}
          channel={channel}
          videos={videos}
          onBack={goHome}
          onUpload={() => setPage('upload')}
          onOpenVideo={openVideoDetail}
          onToast={showToast}
        />
      ) : null}

      {page === 'earnings' ? (
        <EarningsPage
          channelId={channelId}
          channel={channel}
          videos={videos}
          earnings={earnings}
          onBack={goHome}
          onToast={showToast}
        />
      ) : null}

      {page === 'legibility' || page === 'upload' || page === 'videodetail' ? (
        <DashboardMarkup active={page as DashboardPage} />
      ) : null}

      <div
        id="inboxPopup"
        className={`inbox-popup-overlay${inboxOpen ? '' : ' hidden'}`}
        onClick={(event) => {
          if (event.target === event.currentTarget) setInboxOpen(false);
        }}
      >
        <div className="inbox-popup-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: '19px', fontWeight: '700', color: 'var(--text-main)' }}>
              <i className="fas fa-inbox" style={{ marginRight: '6px', color: 'var(--purple-main)' }} /> Inbox
            </div>
            <button
              onClick={() => setInboxOpen(false)}
              style={{ background: 'none', border: 'none', fontSize: '18px', color: 'var(--gray-400)', cursor: 'pointer', padding: '4px' }}
            >
              <i className="fas fa-xmark" />
            </button>
          </div>
          <div id="inboxList" dangerouslySetInnerHTML={{ __html: inboxHtml }} />
        </div>
      </div>

      <div id="settModals" dangerouslySetInnerHTML={{ __html: modalHtml }} />

      <div
        id="settToast"
        style={{
          ...TOAST_STYLE,
          transform: toast ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(20px)',
          opacity: toast ? '1' : '0',
        }}
      >
        {toast}
      </div>
    </div>
  );
}
