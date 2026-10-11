'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { FeedLoader } from '../FeedLoader';
import { PoseCard, PoseSeasonCard } from './PoseCards';
import { PoseCategoriesSidebar, PoseCategoryPage, PoseWatchLaterPage } from './PoseCategories';
import { PoseHero } from './PoseHero';
import { PoseYoutubeGrid } from './PoseYoutubeGrid';
import { TAB_CONTENT, cx } from '../styles';
import { cachePoseTabFeed, fetchPoseTabFeed, getCachedPoseTabFeed } from '@/lib/pose-app/feed';
import {
  POSE_SUBTAB_META,
  POSE_TAB_LABELS,
  POSE_TABS,
  poseCategoryItems,
  poseHeroRank,
  poseRows,
  poseSubTabVideos,
  poseVisibleFeed,
  watchLaterToVideo,
  type PoseCategoryRequest,
  type PoseTabKey,
  type PoseTabSeason,
  type PoseTabVideo,
} from '@/lib/pose-app/pose-tab';
import { addWatchLater, openWatchLater, removeWatchLater, type WatchLaterItem } from '@/lib/pose-app/watch-later';
import { loadWalletProfile } from '@/lib/pose-app/wallet';
import type { PoseChannel } from '@/lib/pose-app/types';

type Props = {
  /** `#poseTab` stays mounted once visited (like the legacy `.tab-content`). */
  active: boolean;
  uid: string | null;
  onToast: (message: string) => void;
  onOpenVideo: (video: PoseTabVideo) => void;
  /** `ptOpenHeroInfo()` @31583 — the hero's "More Info" opens `#tnModal`. */
  onOpenInfo: (video: PoseTabVideo) => void;
  onOpenSeason: (season: PoseTabSeason) => void;
  onOpenChannel: (channelId: string, channel: PoseChannel | null) => void;
  onOpenWallet: () => void;
};

/**
 * `#poseTab` @25824 — POSEChannels: the category rail, the rotating hero banner,
 * the YouTube-style chip grid and the 21 sub-tabs. `loadPoseTabPosts()` @31196
 * fans out over every channel; `renderPoseTabFromCache()` @30872 turns that into
 * the category rows.
 */
export function PoseTab({
  active,
  uid,
  onToast,
  onOpenVideo,
  onOpenInfo,
  onOpenSeason,
  onOpenChannel,
  onOpenWallet,
}: Props) {
  const [videos, setVideos] = useState<PoseTabVideo[]>([]);
  const [seasons, setSeasons] = useState<PoseTabSeason[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [subTab, setSubTab] = useState<PoseTabKey>('all');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [category, setCategory] = useState<PoseCategoryRequest | null>(null);
  const [watchLaterOpen, setWatchLaterOpen] = useState(false);
  const [watchLaterItems, setWatchLaterItems] = useState<WatchLaterItem[]>([]);
  const [coins, setCoins] = useState<number | null>(null);
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);
  /**
   * Which sub-tabs have been opened. The legacy filled all 20 hidden grids at
   * once, and every card carries a `preload="metadata"` clip, so that was up to
   * ~800 hidden requests on first paint; mounting a grid the first time its tab
   * is opened keeps the same DOM for a visited tab without the upfront cost.
   */
  const [mountedTabs, setMountedTabs] = useState<Set<PoseTabKey>>(() => new Set<PoseTabKey>(['all']));
  const loaded = useRef(false);

  useEffect(() => {
    void Promise.resolve().then(() => setPortalTarget(document.body));
  }, []);

  const selectSubTab = useCallback((tab: PoseTabKey) => {
    setSubTab(tab);
    setMountedTabs((current) => (current.has(tab) ? current : new Set(current).add(tab)));
  }, []);

  const apply = useCallback((feedVideos: PoseTabVideo[], feedSeasons: PoseTabSeason[]) => {
    const visible = poseVisibleFeed({ videos: feedVideos, seasons: feedSeasons });
    setVideos(visible.videos);
    setSeasons(visible.seasons);
  }, []);

  // ── Load: paint from the localStorage snapshot, then always refetch ──
  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;

    const cached = getCachedPoseTabFeed();
    if (cached) {
      // Painted a tick later: the effect must not setState synchronously.
      void Promise.resolve().then(() => {
        apply(cached.videos as PoseTabVideo[], cached.seasons as PoseTabSeason[]);
        setStatus('ready');
      });
    }

    void fetchPoseTabFeed()
      .then((feed) => {
        cachePoseTabFeed(feed);
        apply(feed.videos as PoseTabVideo[], feed.seasons as PoseTabSeason[]);
        setStatus('ready');
      })
      .catch(() => {
        setStatus((current) => (current === 'ready' ? current : 'error'));
      });
  }, [apply]);

  const rows = useMemo(() => poseRows(videos, seasons), [videos, seasons]);
  const ranked = useMemo(() => poseHeroRank(videos), [videos]);
  const categoryView = useMemo(
    () => (category ? poseCategoryItems(category, videos, seasons) : { items: [], isSeason: false }),
    [category, videos, seasons],
  );

  // `ptCloseCatSidebar()` @31835 / `ptCloseCategoryPage()` @31888 /
  // `ptCloseWatchLaterPage()` @31680 all restore the page scroll when they close.
  useEffect(() => {
    const anyOverlay = sidebarOpen || category !== null || watchLaterOpen;
    document.body.style.overflow = anyOverlay ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [sidebarOpen, category, watchLaterOpen]);

  // `document.addEventListener('keydown', …)` @31933 — ESC pops the top overlay.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (watchLaterOpen) setWatchLaterOpen(false);
      else if (category) setCategory(null);
      else if (sidebarOpen) setSidebarOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [watchLaterOpen, category, sidebarOpen]);

  const openSidebar = () => {
    setSidebarOpen(true);
    if (uid) void loadWalletProfile(uid).then((profile) => setCoins(profile.pCoinBalance));
  };

  const handleWatchLater = async (video: PoseTabVideo) => {
    try {
      const result = await addWatchLater(uid, video);
      onToast(result === 'exists' ? 'Already in Watch Later' : 'Added to Watch Later');
    } catch {
      onToast('Could not save to Watch Later');
    }
  };

  const handleOpenWatchLater = async () => {
    setWatchLaterOpen(true);
    try {
      setWatchLaterItems(await openWatchLater(uid));
    } catch {
      setWatchLaterItems([]);
    }
  };

  const handleRemoveWatchLater = async (videoId: string) => {
    setWatchLaterItems((items) => items.filter((item) => item.videoId !== videoId));
    try {
      await removeWatchLater(uid, videoId);
      if (!uid) onToast('Removed from Watch Later');
    } catch {
      onToast('Could not remove from Watch Later');
    }
  };

  const openWatchLaterItem = (item: WatchLaterItem) => {
    setWatchLaterOpen(false);
    onOpenVideo(watchLaterToVideo(item));
  };

  const openCategoryItem = (item: PoseTabVideo | PoseTabSeason, isSeason: boolean) => {
    setCategory(null);
    if (isSeason) onOpenSeason(item as PoseTabSeason);
    else onOpenVideo(item as PoseTabVideo);
  };

  const openVideo = (video: PoseTabVideo) => onOpenVideo(video);

  const empty = videos.length === 0 && seasons.length === 0;

  return (
    <div className={cx(TAB_CONTENT, 'pose-shell')} id="poseTab" style={{ display: active ? 'block' : 'none' }}>
      {/* ── TOP NAV ── */}
      <div className="pt-nav">
        <div className="pt-logo">
          POSE<span>Channels</span>
        </div>
        <div className="pt-nav-item active-nav" role="button" tabIndex={0} onClick={openSidebar} onKeyDown={openSidebar}>
          <i className="fas fa-bars" style={{ fontSize: 13 }} />
          <span>Categories</span>
        </div>
        <div className="posetab-nav-item">
          <i className="fas fa-fire" />
          <span>BLINK</span>
        </div>
        <div
          className="posetab-nav-item"
          role="button"
          tabIndex={0}
          onClick={handleOpenWatchLater}
          onKeyDown={handleOpenWatchLater}
        >
          <i className="fas fa-bookmark" />
          <span>Watch Later</span>
        </div>
      </div>

      <PoseHero
        videos={ranked}
        active={active}
        onPlay={openVideo}
        onInfo={onOpenInfo}
        onWatchLater={handleWatchLater}
        onOpenChannel={onOpenChannel}
      />

      {/* ── TABS ── */}
      <div className="pt-tabs-wrap">
        <div className="pt-tabs-scroll" id="posTabsScroll">
          {POSE_TABS.map((tab) => (
            <div
              key={tab}
              className={cx('posetab-tab-item', tab === subTab && 'active')}
              onClick={() => selectSubTab(tab)}
            >
              {POSE_TAB_LABELS[tab]}
            </div>
          ))}
        </div>
      </div>

      {status === 'loading' ? (
        <div className="pt-rows">
          <FeedLoader variant="compact" />
        </div>
      ) : status === 'error' ? (
        <div className="flex w-full flex-col items-center justify-center gap-[14px] p-[40px_20px] text-center text-[#ff6b6b]">
          <div className="text-[14px] font-medium">Error loading videos</div>
        </div>
      ) : null}

      {/* ── ALL ── */}
      <div className={cx('posetab-content', subTab === 'all' && 'active')} id="posTabContentAll">
        {/* Sub-tabs are visited lazily; see `mountedTabs`. */}
        <div className="pt-banner-container" style={{ margin: 0 }}>
          <div className="pt-ad-banner" style={{ background: 'linear-gradient(135deg,#6D28D9 0%,#4C1D95 100%)' }}>
            <div className="pt-ad-inner">
              <div className="pt-ad-icon">
                <i className="fas fa-star" />
              </div>
              <div className="pt-ad-text">
                <div className="pt-ad-title">POSE Premium is Here</div>
                <div className="pt-ad-sub">Watch exclusive movies &amp; series in 4K · No ads</div>
              </div>
              <button type="button" className="pt-ad-cta" style={{ color: '#4C1D95' }}>
                Learn More
              </button>
            </div>
            <div className="pt-ad-dots">
              <div className="pt-ad-dot" />
              <div className="pt-ad-dot pt-ad-da" />
              <div className="pt-ad-dot" />
            </div>
          </div>
        </div>

        <PoseYoutubeGrid
          videos={videos}
          seasons={seasons}
          onOpenVideo={openVideo}
          onOpenSeason={onOpenSeason}
          onOpenChannel={onOpenChannel}
        />

        <div className="pt-rows">
          {empty ? (
            <div className="p-[60px_20px] text-center text-[15px] text-[#aaa]">
              No videos yet — check back soon!
            </div>
          ) : (
            <>
              {rows.categories.map((row) => (
                <div key={row.key} className="pt-row" id={`ptCatRow_${row.key}`}>
                  <div className="pt-row-head">
                    <h2>
                      <span className={row.tone}>
                        <i className={`fas ${row.icon}`} />
                      </span>{' '}
                      {row.label}
                    </h2>
                    <span className="pt-row-count">
                      {row.videos.length} video{row.videos.length === 1 ? '' : 's'}
                    </span>
                  </div>
                  <div className="pt-row-scroll" id={`ptCatGrid_${row.key}`}>
                    {row.videos.map((video) => (
                      <PoseCard key={video.id} video={video} onOpen={openVideo} onOpenChannel={onOpenChannel} />
                    ))}
                  </div>
                </div>
              ))}

              {rows.seasons.length > 0 ? (
                <div className="pt-row">
                  <div className="pt-row-head">
                    <h2>
                      <span className="c-green">
                        <i className="fas fa-tv" />
                      </span>{' '}
                      Series &amp; Seasons
                    </h2>
                    <span className="pt-row-count">{rows.seasons.length} series</span>
                  </div>
                  <div className="pt-row-scroll" id="ptCatGrid_seasons">
                    {rows.seasons.map((season) => (
                      <PoseSeasonCard key={season.id} season={season} onOpen={onOpenSeason} onOpenChannel={onOpenChannel} />
                    ))}
                  </div>
                </div>
              ) : null}

              {rows.uncategorised.length > 0 ? (
                <div className="pt-row">
                  <div className="pt-row-head">
                    <h2>
                      <span className="c-gold">
                        <i className="fas fa-bullseye" />
                      </span>{' '}
                      More Videos
                    </h2>
                    <span className="pt-row-count">
                      {rows.uncategorised.length} video{rows.uncategorised.length === 1 ? '' : 's'}
                    </span>
                  </div>
                  <div className="pt-row-scroll" id="ptCatGrid_other">
                    {rows.uncategorised.map((video) => (
                      <PoseCard key={video.id} video={video} onOpen={openVideo} onOpenChannel={onOpenChannel} />
                    ))}
                  </div>
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>

      {/* ── OTHER SUB-TABS ── */}
      {POSE_TABS.filter((tab) => tab !== 'all' && mountedTabs.has(tab)).map((tab) => {
        const meta = POSE_SUBTAB_META[tab];
        const tabVideos = poseSubTabVideos(tab, videos);
        const tabSeasons = tab === 'series' ? seasons : [];
        return (
          <div key={tab} className={cx('posetab-content', tab === subTab && 'active')} id={`posTabContent${tab}`}>
            <div className="pt-rows">
              <div className="pt-row">
                <div className="pt-row-head">
                  <h2>
                    {meta ? (
                      <>
                        <span className={meta.tone}>
                          <i className={`fas ${meta.icon}`} />
                        </span>{' '}
                      </>
                    ) : null}
                    {meta?.label ?? POSE_TAB_LABELS[tab]}
                  </h2>
                </div>
                <div className="pt-cat-grid posetab-video-grid">
                  {tabVideos.length === 0 && tabSeasons.length === 0 ? (
                    <div className="p-[40px_20px] text-center text-[14px] text-[#71717a]">
                      No videos available yet
                    </div>
                  ) : tab === 'series' ? (
                    tabSeasons.map((season) => (
                      <PoseSeasonCard key={season.id} season={season} onOpen={onOpenSeason} onOpenChannel={onOpenChannel} />
                    ))
                  ) : (
                    tabVideos.map((video) => (
                      <PoseCard key={video.id} video={video} onOpen={openVideo} onOpenChannel={onOpenChannel} />
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/*
        The legacy moved `#ptCatOverlay`/`#ptCatSidebar`/`#ptCatPage`/
        `#ptWatchLaterPage` onto `<body>` (`_ptRelocateOverlays()` @31936) so the
        fixed overlays were not clipped by `#poseTab` — portalled here for the
        same reason.
      */}
      {portalTarget
        ? createPortal(
            <div className="pose-shell">
              <PoseCategoriesSidebar
                open={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                onOpenCategory={(request) => {
                  setCategory(request);
                  setSidebarOpen(false);
                }}
                coins={coins}
                onOpenWallet={onOpenWallet}
              />
              <PoseCategoryPage
                open={category !== null}
                title={category?.title ?? 'Category'}
                items={categoryView.items}
                isSeason={categoryView.isSeason}
                onClose={() => setCategory(null)}
                onOpen={openCategoryItem}
              />
              <PoseWatchLaterPage
                open={watchLaterOpen}
                items={watchLaterItems}
                onClose={() => setWatchLaterOpen(false)}
                onRemove={handleRemoveWatchLater}
                onOpen={openWatchLaterItem}
              />
            </div>,
            portalTarget,
          )
        : null}
    </div>
  );
}
