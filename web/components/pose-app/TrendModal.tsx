'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { ForYouCard } from './ForYouCard';
import { cx } from './styles';
import {
  fetchFollowingMap,
  fetchFollowerCounts,
  fetchTrendFeed,
  trendWindow,
  type TrendFeed,
} from '@/lib/pose-app/feed';
import { setFollow, setVideoLike, setVideoRepost } from '@/lib/pose-app/interactions';
import { withVote } from '@/lib/pose-app/format';
import type { PoseVideo, TrendRow } from '@/lib/pose-app/types';

type Props = {
  open: boolean;
  onClose: () => void;
  uid: string | null;
  /** Handed to the played card so its share menu can send and report. */
  displayName: string;
  email: string;
  onToast: (message: string) => void;
  /** The Trend player's creator block opens the profile, like the feed cards. */
  onOpenCreator?: (userId: string) => void;
};

const RAILS: { key: string; title: string; icon: string; hours: number; badge: string; badgeIcon: string }[] = [
  {
    key: 'today',
    title: 'Trending Today',
    icon: 'fa-solid fa-fire text-[#ff4500]',
    hours: 24,
    badge: 'bg-[linear-gradient(135deg,rgba(255,0,80,0.2),rgba(255,68,120,0.2))] border-[rgba(255,0,80,0.5)] text-[#ff4488]',
    badgeIcon: 'fa-solid fa-bolt text-[#f1c40f]',
  },
  {
    key: 'week',
    title: 'This Week',
    icon: 'fa-solid fa-chart-column text-[#3498db]',
    hours: 24 * 7,
    badge: 'bg-[linear-gradient(135deg,rgba(109,40,217,0.2),rgba(168,85,247,0.2))] border-[rgba(168,85,247,0.5)] text-[#b794f6]',
    badgeIcon: 'fa-solid fa-star text-[#f5c518]',
  },
  {
    key: 'month',
    title: 'This Month',
    icon: 'fa-solid fa-calendar-days text-[#3498db]',
    hours: 24 * 30,
    badge: 'bg-[linear-gradient(135deg,rgba(59,130,246,0.2),rgba(96,165,250,0.2))] border-[rgba(96,165,250,0.5)] text-[#60a5fa]',
    badgeIcon: 'fa-solid fa-trophy text-[#f5c518]',
  },
];

/** `.trend-modal-overlay` @9647 / `.active` @9662. */
const OVERLAY =
  'fixed inset-0 z-[2000] flex h-[100dvh] w-full animate-app-slide-in flex-col overflow-y-auto bg-black/[0.95]';

/** `.trend-modal-header` @9671 with the @9936/@9966/@10023/@10078 breakpoint paddings. */
const HEADER =
  'sticky top-0 z-[2001] flex items-center justify-between gap-[10px] border-b border-white/10 bg-black/[0.95] ' +
  'px-[20px] py-[16px] max-lg:px-[16px] max-lg:py-[12px] max-md:px-[12px] max-md:py-[10px] max-sm:px-[10px] max-sm:py-[8px] ' +
  'max-[480px]:px-[8px] max-[480px]:py-[6px]';

/** `.trend-modal-close` @9683 plus its breakpoint sizes. */
const CLOSE =
  'grid h-[40px] w-[40px] shrink-0 cursor-pointer place-items-center rounded-full border-none bg-[rgba(255,0,80,0.2)] ' +
  'text-[24px] text-white transition-all duration-200 hover:scale-110 hover:bg-[rgba(255,0,80,0.5)] ' +
  'max-md:h-[36px] max-md:w-[36px] max-md:text-[20px] max-sm:h-[32px] max-sm:w-[32px] max-sm:text-[18px] ' +
  'max-[480px]:h-[30px] max-[480px]:w-[30px] max-[480px]:text-[16px]';

/** `.trend-modal-content` @9703 + the @9945/@9981/@10040/@10093 paddings. */
const CONTENT = 'flex h-full flex-1 flex-col p-[16px] max-md:p-[12px] max-sm:p-[10px] max-[480px]:p-[8px]';

/** `.trend-container` @9559. */
const CONTAINER = 'flex w-full max-w-full flex-1 flex-col';

/** `.trend-banners-container` @10134 + breakpoint paddings. */
const RAILS_WRAP =
  'mb-[16px] flex flex-col gap-[14px] border-b-2 border-[rgba(255,0,80,0.2)] bg-[linear-gradient(135deg,rgba(76,29,149,0.08),rgba(255,0,80,0.05))] ' +
  'p-[16px] max-md:gap-[12px] max-md:p-[14px] max-sm:gap-[10px] max-sm:p-[12px] max-[480px]:gap-[8px] max-[480px]:p-[10px]';

/** `.trend-banner-header` @10171. */
const RAIL_HEADER = 'mb-[10px] flex items-center gap-[8px] px-[4px] text-[14px] font-bold text-white max-md:text-[13px] max-sm:text-[12px]';

/** `.trend-badge` @10182. */
const RAIL_BADGE =
  'ml-auto inline-flex items-center gap-[6px] rounded-[20px] border px-[10px] py-[5px] text-[11px] font-bold uppercase tracking-[0.5px]';

/** `.trend-banner` @10146 — a horizontal rail with a 4px scrollbar. */
const RAIL =
  'flex gap-[12px] overflow-x-auto [scrollbar-color:rgba(255,0,80,0.3)_rgba(255,255,255,0.05)] [scrollbar-width:thin] ' +
  '[&::-webkit-scrollbar]:h-[4px] [&::-webkit-scrollbar-thumb]:rounded-[10px] [&::-webkit-scrollbar-thumb]:bg-[rgba(255,0,80,0.3)] ' +
  '[&::-webkit-scrollbar-track]:rounded-[10px] [&::-webkit-scrollbar-track]:bg-white/5';

/** `.trend-banner-video` @10225, sized by the @10319/@10352 breakpoint rules. */
const RAIL_TILE =
  'relative flex w-[100px] shrink-0 cursor-pointer flex-col overflow-hidden rounded-[8px] border border-white/10 ' +
  'bg-white/5 transition-all duration-300 hover:scale-[1.08] hover:-translate-y-[4px] hover:border-[rgba(255,0,80,0.5)] ' +
  'hover:bg-[rgba(255,0,80,0.1)] hover:shadow-[0_10px_30px_rgba(255,0,80,0.2)] max-md:w-[90px] max-sm:w-[80px] max-[480px]:w-[70px]';

/** `.trend-banner-video-thumbnail` @10246. */
const RAIL_MEDIA =
  'flex h-[130px] w-full items-center justify-center bg-[linear-gradient(135deg,rgba(0,0,0,0.4),rgba(0,0,0,0.2))] ' +
  'object-cover max-md:h-[120px] max-sm:h-[110px] max-[480px]:h-[100px]';

/** `.trend-date-section` @10442 + the @10545/@10579/@10615/@10652 breakpoints. */
const DAY_SECTION = 'mb-[36px] flex w-full flex-col px-[20px] max-md:mb-[32px] max-md:px-[16px] max-sm:mb-[28px] max-sm:px-[12px] max-[480px]:mb-[24px] max-[480px]:px-[10px]';

/** `.trend-date-header` @10450 — sticky, so it needs an opaque backdrop. */
const DAY_HEADER =
  'sticky top-0 z-[10] mb-[16px] border-b-[3px] border-[rgba(255,0,80,0.4)] bg-black/[0.98] py-[14px] text-[16px] font-bold text-pose-accent ' +
  'max-md:mb-[14px] max-md:py-[12px] max-md:text-[14px] max-sm:mb-[12px] max-sm:py-[10px] max-sm:text-[13px] ' +
  'max-[480px]:mb-[10px] max-[480px]:py-[8px] max-[480px]:text-[12px]';

/** `.trend-videos-grid` @10463. */
const DAY_GRID =
  'grid w-full grid-cols-[repeat(auto-fill,minmax(130px,1fr))] gap-[14px] pb-[20px] max-md:grid-cols-[repeat(auto-fill,minmax(120px,1fr))] max-md:gap-[12px] ' +
  'max-sm:grid-cols-[repeat(auto-fill,minmax(110px,1fr))] max-sm:gap-[10px] max-[480px]:grid-cols-[repeat(auto-fill,minmax(100px,1fr))] max-[480px]:gap-[8px]';

/** `.trend-video-thumbnail` @10471. */
const TILE =
  'relative min-h-[260px] cursor-pointer overflow-hidden rounded-[10px] border-[1.5px] border-white/15 bg-white/5 ' +
  'transition-all duration-300 hover:scale-[1.06] hover:border-[rgba(255,0,80,0.6)] hover:bg-[rgba(255,0,80,0.12)] ' +
  'hover:shadow-[0_12px_30px_rgba(255,0,80,0.25)] max-md:min-h-[240px] max-sm:min-h-[220px] max-[480px]:min-h-[200px]';

const TILE_MEDIA = 'h-full w-full bg-[linear-gradient(135deg,rgba(0,0,0,0.4),rgba(0,0,0,0.2))] object-cover';

/** `.trend-thumbnail-gradient` @9758. */
const TILE_GRADIENT =
  'pointer-events-none absolute inset-0 z-[1] bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,0,0,0.3)_50%,rgba(0,0,0,0.7)_100%)]';

/** `.trend-hot-badge` @9903. */
const TILE_HOT =
  'absolute left-[8px] top-[8px] z-[3] rounded-[4px] border border-white/30 bg-[linear-gradient(135deg,#ff0050,#ff4081)] ' +
  'px-[8px] py-[4px] text-[9px] font-extrabold uppercase tracking-[0.5px] text-white shadow-[0_4px_10px_rgba(255,0,80,0.3)]';

/** `.trend-creator-info` @9835 and its children. */
const CREATOR_INFO = 'mb-[4px] flex items-center gap-[6px]';
const CREATOR_AVATAR =
  'grid h-7 w-7 shrink-0 place-items-center rounded-full border-[1.5px] border-white/80 bg-[linear-gradient(135deg,#ff0050,#ff4081)] ' +
  'bg-cover bg-center text-[11px] font-bold text-white';
const CREATOR_NAME =
  'flex-1 truncate text-[12px] font-bold text-white [text-shadow:0_2px_4px_rgba(0,0,0,0.6)]';
const VERIFIED = 'shrink-0 text-[9px] text-[#60a5fa]';
const STATS = 'flex gap-[8px] text-[10px] text-white/90 [text-shadow:0_1px_3px_rgba(0,0,0,0.6)]';
const STAT_ITEM = 'flex items-center gap-[2px]';

/** `.trend-video-stats` @9823. */
const TILE_STATS = 'absolute inset-x-0 bottom-0 z-[2] flex flex-col gap-[8px] p-[12px]';

const SPINNER =
  'h-[50px] w-[50px] animate-pose-spin rounded-full border-4 border-[rgba(255,0,80,0.3)] border-t-pose-accent';

/** `#trendFullscreenModal` @82423 — sits above the trend overlay itself. */
const PLAYER = 'fixed inset-0 z-[10000] flex flex-col overflow-hidden bg-app-black';
const PLAYER_CLOSE =
  'absolute right-[12px] top-[12px] z-[10003] grid h-[40px] w-[40px] cursor-pointer place-items-center ' +
  'rounded-full border-none bg-black/60 text-[18px] text-white transition-colors hover:bg-black/85';

function TileMedia({ row, tall }: { row: TrendRow; tall?: boolean }) {
  const { video } = row;
  const poster = video.thumbnailURL || video.thumbnailUrl || video.thumbnail || video.coverImage || video.userProfilePic;
  if (poster) {
    return (
      <img
        src={poster}
        alt=""
        loading="lazy"
        decoding="async"
        className={cx(tall ? RAIL_MEDIA : TILE_MEDIA, 'h-full w-full')}
      />
    );
  }
  if (video.videoUrl) {
    return (
      <video
        src={video.videoUrl}
        preload="metadata"
        muted
        playsInline
        className={cx(tall ? RAIL_MEDIA : TILE_MEDIA, 'h-full w-full')}
      />
    );
  }
  return <i className={cx(tall ? 'text-[24px] text-[#aaa]' : 'text-[32px] text-[#aaa]', 'fas fa-film')} />;
}

function count(row: TrendRow): string {
  return row.likeCount.toLocaleString();
}

function LikeChip({ row, className }: { row: TrendRow; className: string }) {
  return (
    <div className={className}>
      <i className="fa-solid fa-heart" />
      {count(row)}
    </div>
  );
}

export function TrendModal({
  open,
  onClose,
  uid,
  displayName,
  email,
  onToast,
  onOpenCreator,
}: Props) {
  const [feed, setFeed] = useState<TrendFeed | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'failed'>('loading');
  const [played, setPlayed] = useState<PoseVideo | null>(null);
  const [playedFollowing, setPlayedFollowing] = useState(false);
  const [playedFollowers, setPlayedFollowers] = useState<number | null>(null);

  const load = useCallback(async () => {
    try {
      setFeed(await fetchTrendFeed());
      setState('ready');
    } catch (error) {
      console.error('❌ loading the trend modal:', error);
      setState('failed');
    }
  }, []);

  // The grid holds its own scroll position and the player is a layer above it, so
  // closing the modal has to drop both. `open` never unmounts this component, hence
  // the explicit reset rather than relying on fresh state.
  const close = useCallback(() => {
    setPlayed(null);
    onClose();
  }, [onClose]);

  const retry = useCallback(() => {
    setState('loading');
    void load();
  }, [load]);

  // `openTrendVideoPlayer` @79066 renders the tapped item with the For You post
  // template, which needs the creator's follow state. The grid does not carry it,
  // so the player resolves it for the one video on screen.
  const playedOwner = played?.userId ?? '';
  useEffect(() => {
    let cancelled = false;
    const request: Promise<[Record<string, boolean>, Record<string, number>]> = playedOwner
      ? Promise.all([
          uid ? fetchFollowingMap(uid) : Promise.resolve<Record<string, boolean>>({}),
          fetchFollowerCounts([playedOwner]),
        ])
      : Promise.resolve<[Record<string, boolean>, Record<string, number>]>([{}, {}]);
    void request.then(([map, counts]) => {
      if (cancelled) return;
      setPlayedFollowing(Boolean(map[playedOwner]));
      setPlayedFollowers(playedOwner ? (counts[playedOwner] ?? 0) : null);
    });
    return () => {
      cancelled = true;
    };
  }, [playedOwner, uid]);

  // One read per mount: the panel stays mounted while `open` toggles, so the grid
  // is fetched on the first open and reused afterwards. The ref is what keeps the
  // effect out of the `state`/`feed` it writes.
  const startedRef = useRef(false);
  useEffect(() => {
    if (!open || startedRef.current) return;
    startedRef.current = true;
    void load();
  }, [open, load]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        // The player is the top layer, so Escape closes it before the grid.
        if (played) setPlayed(null);
        else close();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, close, played]);

  if (!open) return null;

  // A rail with no videos in its window is dropped rather than filled with
  // arbitrary older posts the way legacy's `slice(0, 8)` fallback did, and the
  // whole strip goes with it so its padding cannot leave an empty band.
  const rails = feed
    ? RAILS.map((rail) => ({ rail, rows: trendWindow(feed.sample, rail.hours) })).filter(
        (entry) => entry.rows.length > 0,
      )
    : [];

  return (
    <div className={OVERLAY} role="dialog" aria-modal="true" aria-label="Trending now">
      <div className={HEADER}>
        <h2 className="m-0 flex-1 text-[20px] font-bold text-white max-lg:text-[18px] max-md:text-[16px] max-sm:text-[14px] max-[480px]:text-[13px]">
          <i className="fa-solid fa-chart-line mr-[8px] text-[#2ecc71]" />
          Trending Now
        </h2>
        <button type="button" className={CLOSE} onClick={close} aria-label="Close trending">
          <i className="fa-solid fa-xmark" />
        </button>
      </div>

      <div className={CONTENT}>
        <div className={CONTAINER}>
          {state === 'loading' && (
            <div className="flex min-h-[60vh] flex-col items-center justify-center gap-[20px]">
              <div className={SPINNER} />
              <p className="text-[14px] text-app-muted">Loading trending videos...</p>
            </div>
          )}

          {state === 'failed' && (
            <div className="flex min-h-[60vh] flex-col items-center justify-center gap-[16px] px-[24px] text-center">
              <i className="fa-solid fa-circle-exclamation text-[40px] text-[#ff6b6b]" />
              <p className="text-[16px] font-semibold text-[#ff6b6b]">Error Loading Trends</p>
              <p className="max-w-[300px] text-[14px] text-app-muted">
                Something went wrong while loading. Please check your connection and try again.
              </p>
              <button
                type="button"
                className="mt-[10px] cursor-pointer rounded-[8px] border-none bg-[linear-gradient(45deg,#ff0050,#ff4478)] px-[30px] py-[12px] text-[14px] font-semibold text-white transition-transform duration-300 hover:scale-105"
                onClick={retry}
              >
                <i className="fa-solid fa-arrows-rotate mr-[6px]" />
                Retry Loading
              </button>
            </div>
          )}

          {state === 'ready' && feed && feed.sample.length === 0 && (
            <p className="px-[20px] py-[40px] text-center text-[14px] text-app-muted">No trending videos yet</p>
          )}

          {state === 'ready' && feed && feed.sample.length > 0 && (
            <>
              {rails.length > 0 && (
                <div className={RAILS_WRAP}>
                  {rails.map(({ rail, rows }) => (
                    <div key={rail.key}>
                      <div className={RAIL_HEADER}>
                        <span className="flex items-center gap-[8px]">
                          <i className={rail.icon} />
                          {rail.title}
                        </span>
                        <span className={cx(RAIL_BADGE, rail.badge)}>
                          <i className={rail.badgeIcon} />
                          {rail.key === 'today' ? 'HOT' : rail.key === 'week' ? 'RISING' : 'TOP'}
                        </span>
                      </div>
                      <div className={RAIL}>
                        {rows.map((row) => (
                          <div
                            key={`${rail.key}-${row.video.id}`}
                            className={RAIL_TILE}
                            onClick={() => setPlayed(row.video)}
                          >
                            <TileMedia row={row} tall />
                            <div className={TILE_GRADIENT} />
                            {row.likeCount > 100 && (
                              <div className={TILE_HOT}>
                                <i className="fa-solid fa-fire mr-[4px] text-[#ff4500]" />
                                TRENDING
                              </div>
                            )}
                            <LikeChip
                              row={row}
                              className="absolute bottom-[6px] right-[6px] flex items-center gap-[4px] rounded-[6px] bg-black/80 px-[8px] py-[4px] text-[11px] font-bold text-white"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex flex-1 flex-col px-[20px] pt-[24px]">
                <div className="mb-[24px] flex items-center gap-[8px] border-b-[3px] border-[rgba(255,0,80,0.3)] pb-[16px] text-[16px] font-bold text-white">
                  <i className="fa-solid fa-tv mr-[4px] text-[#3498db]" />
                  All Videos by Date
                </div>
                {feed.days.map((day) => (
                  <div key={day.label} className={DAY_SECTION}>
                    <div className={DAY_HEADER}>{day.label}</div>
                    <div className={DAY_GRID}>
                      {day.rows.map((row) => {
                        const owner = row.video.userName || row.video.creatorName || row.video.author || 'Creator';
                        return (
                          <div
                            key={row.video.id}
                            className={TILE}
                            onClick={() => setPlayed(row.video)}
                          >
                            <TileMedia row={row} />
                            <div className={TILE_GRADIENT} />
                            {row.likeCount > 100 && (
                              <div className={TILE_HOT}>
                                <i className="fa-solid fa-fire mr-[4px] text-[#ff4500]" />
                                TRENDING
                              </div>
                            )}
                            <div className={TILE_STATS}>
                              <div className={CREATOR_INFO}>
                                <div
                                  className={CREATOR_AVATAR}
                                  style={
                                    row.video.userProfilePic
                                      ? { backgroundImage: `url('${row.video.userProfilePic}')`, backgroundSize: 'cover', backgroundPosition: 'center' }
                                      : undefined
                                  }
                                >
                                  {!row.video.userProfilePic &&
                                    owner
                                      .split(' ')
                                      .map((part) => part.charAt(0))
                                      .join('')
                                      .toUpperCase()
                                      .slice(0, 2)}
                                </div>
                                <div className={CREATOR_NAME}>
                                  {owner.length > 18 ? `${owner.slice(0, 15)}...` : owner}
                                </div>
                                {row.video.verified && (
                                  <div className={VERIFIED}>
                                    <i className="fa-solid fa-circle-check" />
                                  </div>
                                )}
                              </div>
                              <div className={STATS}>
                                <div className={STAT_ITEM}>
                                  <i className="fa-solid fa-heart" />
                                  {count(row)}
                                </div>
                                <div className={STAT_ITEM}>
                                  <i className="fa-solid fa-comment" />
                                  {(row.video.comments ?? row.video.commentCount ?? 0).toLocaleString()}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {played && (
        <div className={PLAYER}>
          <ForYouCard
            video={played}
            uid={uid}
            active
            following={playedFollowing}
            followers={playedFollowers}
            displayName={displayName}
            email={email}
            onToast={onToast}
            onHide={() => setPlayed(null)}
            onOpenProfile={
              onOpenCreator
                ? (targetUserId) => {
                    setPlayed(null);
                    onOpenCreator(targetUserId);
                  }
                : undefined
            }
            onToggleLike={(video, liked, nextCount) => {
              setPlayed((previous) =>
                previous
                  ? { ...previous, likeCount: nextCount, likes: withVote(previous.likes, uid, liked) }
                  : previous,
              );
              if (uid) void setVideoLike(video.id, uid, liked, nextCount);
            }}
            onToggleRepost={(video, reposted, nextCount) => {
              setPlayed((previous) =>
                previous
                  ? {
                      ...previous,
                      repostCount: nextCount,
                      reposts: withVote(previous.reposts, uid, reposted),
                    }
                  : previous,
              );
              if (uid) void setVideoRepost(video.id, uid, reposted, nextCount);
            }}
            onToggleFollow={(targetUserId) => {
              if (!uid || !targetUserId) return;
              const next = !playedFollowing;
              setPlayedFollowing(next);
              setPlayedFollowers((previous) =>
                previous === null ? previous : Math.max(0, previous + (next ? 1 : -1)),
              );
              void setFollow(targetUserId, uid, next);
            }}
          />
          <button
            type="button"
            className={PLAYER_CLOSE}
            onClick={() => setPlayed(null)}
            aria-label="Close video"
          >
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
      )}
    </div>
  );
}
