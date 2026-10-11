'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { VideoActionSheets } from '../VideoActionSheets';
import {
  fetchPlayerChannel,
  fetchPlayerRelated,
  fetchRatings,
  fetchUserRating,
  playerAgeRating,
  isUpcoming,
  playerDate,
  playerDescription,
  playerEpisodes,
  playerPriceTag,
  playerReleased,
  playerScheduled,
  playerSeason,
  playerStats,
  playerTitle,
  playerTrailer,
  playerVideoUrl,
  ratingStars,
  submitRating,
  type PosePlayerVideo,
  type PoseRating,
} from '@/lib/pose-app/pose-player';
import { poseThumb, type PoseTabSeason, type PoseTabVideo } from '@/lib/pose-app/pose-tab';
import { setFollow, setVideoLike } from '@/lib/pose-app/interactions';
import { markWatchLaterWatched } from '@/lib/pose-app/watch-later';
import type { PoseChannel, PoseEpisode } from '@/lib/pose-app/types';

const PREVIEW_SECONDS = 15;
const CONTROLS_HIDE_MS = 3500;
const BRAND_SWAP_MS = 15000;

type Props = {
  open: boolean;
  video: PosePlayerVideo | null;
  uid: string | null;
  email: string | null;
  displayName: string;
  onClose: () => void;
  onToast: (message: string) => void;
  onOpenChannel: (channelId: string, channel: PoseChannel | null) => void;
  /** `tnpPlayEpisode()` @89835 re-enters the player with the episode's data. */
  onOpenVideo: (video: PosePlayerVideo) => void;
};

/**
 * `#tnPlayerPage` @27130 with `tnpBuild()` @87859 and `tnpInitControls()` @88120.
 * Opens on a muted auto-preview (the trailer, or the first 15 seconds of the
 * video when there is no trailer) and hands over to full playback on Play.
 *
 * Not carried over from the legacy player: the brightness slider and the
 * rotation-lock persistence (cosmetic extras), and the paid-unlock sheet
 * (`#tnpPayModal`), which belongs with the wallet purchase flow that has not
 * been ported yet.
 */
export function PosePlayer({
  open,
  video,
  uid,
  email,
  displayName,
  onClose,
  onToast,
  onOpenChannel,
  onOpenVideo,
}: Props) {
  const preloadRef = useRef<HTMLVideoElement | null>(null);
  const hideTimer = useRef<number | null>(null);
  /**
   * The `<video>` node. Kept in a ref that is never cleared, because the pause
   * effect below has to reach the element after React has detached it — a
   * detached `<video>` keeps playing audio until something calls `pause()`.
   */
  const node = useRef<HTMLVideoElement | null>(null);
  const attachVideo = useCallback((element: HTMLVideoElement | null) => {
    if (element) node.current = element;
  }, []);

  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(false);
  const [locked, setLocked] = useState(false);
  const [portrait, setPortrait] = useState(false);
  const [posterHidden, setPosterHidden] = useState(false);
  const [progress, setProgress] = useState(0);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [brandImage, setBrandImage] = useState(false);
  const [channel, setChannel] = useState<(PoseChannel & { subscriberCount?: number; videoCount?: number }) | null>(null);
  const [following, setFollowing] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [rating, setRating] = useState<PoseRating>({ average: 0, count: 0 });
  const [myRating, setMyRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [ratingMessage, setRatingMessage] = useState('');
  const [related, setRelated] = useState<PoseTabVideo[]>([]);
  const [season, setSeason] = useState<PoseTabSeason | null>(null);
  const [episode, setEpisode] = useState<PosePlayerVideo | null>(null);
  const [sheet, setSheet] = useState<'share' | 'report' | null>(null);
  const [countdown, setCountdown] = useState('');

  const active = episode ?? video;
  const scheduled = active ? playerScheduled(active) : null;

  useEffect(() => {
    void Promise.resolve().then(() => setPortalTarget(document.body));
  }, []);

  const resetControlsTimer = useCallback(() => {
    if (hideTimer.current) window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => setControlsVisible(false), CONTROLS_HIDE_MS);
  }, []);

  // `openTnPlayer()` @87774 — reset the page state and start the preview.
  useEffect(() => {
    if (!open || !video) return;
    const element = node.current;
    const scheduledAt = playerScheduled(video);
    const preview = playerTrailer(video) || playerVideoUrl(video);
    const full = playerVideoUrl(video);

    // The resets go through a microtask: an effect must not setState synchronously.
    void Promise.resolve().then(() => {
      setPlaying(false);
      setControlsVisible(false);
      setLocked(false);
      setPortrait(false);
      setPosterHidden(false);
      setProgress(0);
      setCurrent(0);
      setDuration(0);
      setEpisode(null);
      setBrandImage(false);
      setMyRating(0);
      setSeason(playerSeason(video));
      setLikeCount(Number(video.likeCount ?? video.likes) || 0);
    });

    // Brand: the wordmark slides in, then crossfades to the logo.
    const brandTimer = window.setTimeout(() => setBrandImage(true), BRAND_SWAP_MS);

    if (!element || scheduledAt || !preview) return () => window.clearTimeout(brandTimer);

    element.loop = true;
    element.muted = true;
    element.src = preview;
    void element.play().catch(() => {});
    setPosterHidden(true);

    // Warm the HTTP cache for the full file while the preview plays — free
    // content only, so a paid video is not fetched before it is bought.
    if (full && full !== preview) {
      if (!preloadRef.current) {
        const warm = document.createElement('video');
        warm.muted = true;
        warm.preload = 'auto';
        warm.style.cssText = 'position:absolute;width:0;height:0;opacity:0;pointer-events:none;';
        preloadRef.current = warm;
        document.body.appendChild(warm);
      }
      preloadRef.current.src = full;
      preloadRef.current.load();
    }

    return () => window.clearTimeout(brandTimer);
  }, [open, video]);

  // `setTimeout` brand swap needs to restart when the timer above resets.
  useEffect(() => {
    if (!open) return;
    void Promise.resolve().then(() => setBrandImage(false));
  }, [open, video?.id]);

  // `tnpStopAll()` @87833 — nothing keeps playing after the page closes.
  useEffect(() => {
    if (open) return;
    const el = node.current;
    if (!el) return;
    el.pause();
    el.removeAttribute('src');
    el.load();
    if (preloadRef.current) {
      preloadRef.current.removeAttribute('src');
      preloadRef.current.load();
    }
    if (hideTimer.current) window.clearTimeout(hideTimer.current);
  }, [open]);

  // Scheduled premiere countdown (`tnpStartCountdown()` @88579).
  useEffect(() => {
    if (!scheduled) return;
    const tick = () => {
      const remaining = Math.max(0, scheduled.getTime() - Date.now());
      const days = Math.floor(remaining / 86400000);
      const hours = Math.floor((remaining % 86400000) / 3600000);
      const minutes = Math.floor((remaining % 3600000) / 60000);
      const seconds = Math.floor((remaining % 60000) / 1000);
      setCountdown(
        `${String(days).padStart(2, '0')}:${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`,
      );
    };
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [scheduled]);

  // Channel block + like state + ratings + related (`tnpBuild()`'s tail @88040).
  useEffect(() => {
    if (!open || !video) return;
    let cancelled = false;
    const channelId = video.channelId || video.channel?.id || '';
    void fetchPlayerChannel(channelId).then((doc) => {
      if (!cancelled) setChannel(doc);
    });
    void fetchRatings(channelId, video.id).then((value) => {
      if (!cancelled) setRating(value);
    });
    void fetchPlayerRelated(channelId, video.id).then((items) => {
      if (!cancelled) setRelated(items);
    });
    if (uid) {
      void fetchUserRating(channelId, video.id, uid).then((value) => {
        if (!cancelled && value) setMyRating(value);
      });
    }
    return () => {
      cancelled = true;
    };
  }, [open, video, uid]);

  const startPlayback = useCallback(
    (target: PosePlayerVideo) => {
      const el = node.current;
      if (!el) return;
      const full = playerVideoUrl(target);
      const trailer = playerTrailer(target);
      const source = full || trailer;
      if (!source) return;

      if (el.src === source) {
        el.muted = false;
        el.currentTime = 0;
        void el.play().catch(() => {});
      } else {
        el.loop = false;
        el.src = source;
        el.muted = false;
        el.load();
        void el.play().catch(() => {});
      }
      setPosterHidden(true);
      setPlaying(true);
      setControlsVisible(true);
      resetControlsTimer();
    },
    [resetControlsTimer],
  );

  const playTrailer = () => {
    if (!video) return;
    const trailer = playerTrailer(video);
    if (!trailer) return;
    startPlayback({ ...video, videoUrl: trailer });
  };

  const togglePlayback = () => {
    const el = node.current;
    if (!el) return;
    if (el.paused) {
      void el.play().catch(() => {});
      setPlaying(true);
    } else {
      el.pause();
      setPlaying(false);
    }
    resetControlsTimer();
  };

  // `tnpSeek()` @88535 with the ±5 / ±10 buttons.
  const seekBy = (seconds: number) => {
    const el = node.current;
    if (!el) return;
    el.currentTime = Math.max(0, Math.min(el.duration || 0, el.currentTime + seconds));
    resetControlsTimer();
  };

  const onTimeUpdate = () => {
    const el = node.current;
    if (!el) return;
    // No trailer → the preview loops the first 15 seconds (`tnpPreview15()`).
    if (el.loop && !playerTrailer(active ?? ({} as PosePlayerVideo)) && el.currentTime >= PREVIEW_SECONDS) {
      el.currentTime = 0;
    }
    setCurrent(el.currentTime);
    setProgress(el.duration ? (el.currentTime / el.duration) * 100 : 0);
  };

  const onEnded = () => {
    setPlaying(false);
    const watchLaterId = active?._watchLaterId;
    if (watchLaterId) void markWatchLaterWatched(uid, watchLaterId);
  };

  /** `tnpTogglePlay()` @88329 — the play/pause button is only needed for the full file. */
  const onProgressInput = (value: number) => {
    const el = node.current;
    if (!el || !el.duration) return;
    el.currentTime = (value / 100) * el.duration;
    resetControlsTimer();
  };

  const rate = async (value: number) => {
    if (!uid || !video) {
      setRatingMessage('Sign in to rate.');
      return;
    }
    setMyRating(value);
    setRatingMessage('Saving...');
    try {
      const channelId = video.channelId || video.channel?.id || '';
      setRating(await submitRating(channelId, video.id, uid, value));
      setRatingMessage(`You rated this ${value} star${value !== 1 ? 's' : ''} ✓`);
    } catch {
      setRatingMessage('Could not save rating.');
    }
  };

  const toggleLike = async () => {
    if (!uid || !active) return;
    const next = !liked;
    setLiked(next);
    setLikeCount((count) => count + (next ? 1 : -1));
    await setVideoLike(active.id, uid, next, likeCount + (next ? 1 : -1));
  };

  const toggleFollow = async () => {
    if (!uid || !channel?.userId) {
      onToast(uid ? 'This channel cannot be followed yet' : 'Sign in to follow');
      return;
    }
    const next = !following;
    setFollowing(next);
    await setFollow(channel.userId, uid, next);
  };

  const playEpisode = (item: PosePlayerVideo) => {
    setEpisode(item);
    startPlayback(item);
  };

  if (!open || !video || !active) return null;

  const thumb = poseThumb(active);
  const priceTag = playerPriceTag(active);
  const seasons = active.seasons ?? (active.isSeason ? [active as PoseTabSeason] : []);
  const episodeSeason = season ?? playerSeason(active);
  const episodes = episodeSeason?.episodes ?? playerEpisodes(active);

  const content = (
    <div className="pose-player-shell">
      <div
        className={`${portrait ? 'portrait-active' : ''}${locked ? ' tnp-locked' : ''}${playing ? ' tnp-playing' : ''}`}
        id="tnPlayerPage"
      >
        <div className="tnp-brand" id="tnpBrand">
          <div className="tnp-brand-inner">
            <div className={`tnp-brand-logo${brandImage ? ' show-img' : ''}`} id="tnpBrandLogo">
              <img className="tnp-brand-img" src="/logo.png" alt="Pose" />
              <span className="tnp-brand-text">POSE</span>
            </div>
            <div className="tnp-brand-divider" />
            <span className="tnp-brand-age" id="tnpAgeRating">
              {playerAgeRating(active)}
            </span>
          </div>
        </div>

        <button type="button" className="tnp-back-btn" id="tnpBackBtnFixed" title="Back" onClick={onClose}>
          <i className="fas fa-arrow-left" />
        </button>

        <div className="tnp-video-wrap" id="tnpVideoWrap">
          <video
            id="tnpVideo"
            ref={attachVideo}
            playsInline
            style={{ display: scheduled ? 'none' : 'block' }}
            onTimeUpdate={onTimeUpdate}
            onLoadedMetadata={(event) => setDuration(event.currentTarget.duration || 0)}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onEnded={onEnded}
          />
          <img
            id="tnpPoster"
            className={`tnp-poster${posterHidden ? ' tnp-hide' : ''}`}
            src={thumb}
            alt=""
            style={{ display: thumb ? 'block' : 'none' }}
          />
          <div className="tnp-video-grad" />
          <div
            className="tnp-tap-zone"
            id="tnpTapZone"
            onClick={() => {
              if (locked) return;
              setControlsVisible((value) => !value);
              if (!controlsVisible) resetControlsTimer();
            }}
          />

          {scheduled ? (
            <div className="tnp-scheduled-overlay" id="tnpScheduledOverlay" style={{ display: 'flex' }}>
              <div className="tnp-sched-icon">
                <i className="fas fa-clock" />
              </div>
              <div className="tnp-sched-label">Available in</div>
              <div className="tnp-sched-countdown" id="tnpCountdown">
                {countdown}
              </div>
              <div className="tnp-sched-date" id="tnpSchedDate">
                {scheduled.toLocaleDateString('en-GB', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </div>
            </div>
          ) : null}

          <div className={`tnp-controls-overlay${controlsVisible ? ' visible' : ''}${locked ? ' locked' : ''}`} id="tnpControlsOverlay">
            <div className="tnp-ctrl-top">
              <div style={{ width: 38, flexShrink: 0 }} />
              <div className="tnp-ctrl-title-mini" id="tnpCtrlTitle">
                {playerTitle(active)}
              </div>
              <div className="tnp-ctrl-top-right">
                <button
                  type="button"
                  className="tnp-ctrl-icon-btn"
                  id="tnpLockBtn"
                  title="Lock rotation"
                  onClick={() => setLocked((value) => !value)}
                >
                  <i className={`fas ${locked ? 'fa-lock' : 'fa-lock-open'}`} />
                </button>
                <button
                  type="button"
                  className="tnp-ctrl-icon-btn"
                  id="tnpBrightnessBtn"
                  title="Portrait"
                  onClick={() => setPortrait((value) => !value)}
                >
                  <i className="fas fa-mobile-screen" />
                </button>
              </div>
            </div>

            <div className="tnp-ctrl-centre">
              <button type="button" className="tnp-seek-btn" title="Back 10s" onClick={() => seekBy(-10)}>
                <i className="fas fa-undo" />
                <span>10</span>
              </button>
              <button type="button" className="tnp-seek-btn" title="Back 5s" onClick={() => seekBy(-5)}>
                <i className="fas fa-undo" />
                <span>5</span>
              </button>
              <button type="button" className="tnp-play-pause-btn" id="tnpPlayPauseBtn" onClick={togglePlayback}>
                <i className={`fas ${playing ? 'fa-pause' : 'fa-play'}`} id="tnpPlayPauseIcon" />
              </button>
              <button type="button" className="tnp-seek-btn" title="Forward 5s" onClick={() => seekBy(5)}>
                <i className="fas fa-redo" />
                <span>5</span>
              </button>
              <button type="button" className="tnp-seek-btn" title="Forward 10s" onClick={() => seekBy(10)}>
                <i className="fas fa-redo" />
                <span>10</span>
              </button>
            </div>

            <div className="tnp-ctrl-bottom">
              <span className="tnp-time" id="tnpTimeCurrent">
                {formatTime(current)}
              </span>
              <div className="tnp-progress-wrap">
                <input
                  type="range"
                  className="tnp-progress"
                  id="tnpProgress"
                  min={0}
                  max={100}
                  step={0.1}
                  value={progress}
                  onChange={(event) => onProgressInput(Number(event.target.value))}
                />
              </div>
              <span className="tnp-time" id="tnpTimeDuration">
                {formatTime(duration)}
              </span>
            </div>
          </div>
        </div>

        <div className="tnp-panel" id="tnpPanel">
          <div
            className="tnp-channel-block"
            id="tnpChannelBlock"
            role="button"
            tabIndex={0}
            onClick={() => onOpenChannel(active.channelId || channel?.id || '', channel)}
            onKeyDown={() => onOpenChannel(active.channelId || channel?.id || '', channel)}
          >
            <img className="tnp-ch-avatar" id="tnpChAvatar" src={channel?.profileURL ?? channel?.profilePic ?? thumb} alt="" />
            <div className="tnp-ch-info">
              <div className="tnp-ch-name" id="tnpChName">
                {channel?.name ?? active.channel?.name ?? active.channelName ?? 'Channel'}
              </div>
              <div className="tnp-ch-sub" id="tnpChSub">
                {channel?.subscriberCount ? `${channel.subscriberCount} fans` : 'Pose Channel'}
              </div>
            </div>
            <button
              type="button"
              className={`tnp-ch-follow-btn${following ? ' following' : ''}`}
              id="tnpFollowBtn"
              onClick={(event) => {
                event.stopPropagation();
                void toggleFollow();
              }}
            >
              {following ? 'Following' : 'Become a Fan'}
            </button>
          </div>

          <div className="tnp-title-row">
            <div>
              <h1 className="tnp-title" id="tnpTitle">
                {playerTitle(active)}
              </h1>
              <div className="tnp-meta-row" id="tnpMetaRow">
                {playerReleased(active.createdAt) ? <span>{playerReleased(active.createdAt)}</span> : null}
                {active.duration ? (
                  <span>
                    <i className="fas fa-clock" style={{ fontSize: 10, marginRight: 3 }} />
                    {active.duration}
                  </span>
                ) : null}
                {active.category ? <span className="tnp-meta-tag">{active.category}</span> : null}
                <span
                  className="tnp-meta-tag"
                  style={priceTag === 'FREE' ? { borderColor: '#46d369', color: '#46d369' } : { borderColor: '#f5c518', color: '#f5c518' }}
                >
                  {priceTag === 'FREE' ? 'FREE' : <><i className="fas fa-coins" /> {priceTag}</>}
                </span>
              </div>
            </div>
            <div className="tnp-match-score" id="tnpMatch">
              {matchScore(active.id)}% Match
            </div>
          </div>

          <div className="tnp-actions" id="tnpActions">
            {episodeSeason && episodes.length > 0 ? null : (
              <button type="button" className="tnp-btn-primary" id="tnpPlayBtn" onClick={() => startPlayback(active)}>
                <i className="fas fa-play" /> Play
              </button>
            )}
            {playerTrailer(active) ? (
              <button type="button" className="tnp-btn-secondary" id="tnpTrailerBtn" onClick={playTrailer}>
                <i className="fas fa-film" /> Trailer
              </button>
            ) : null}
            <button
              type="button"
              className={`tnp-btn-icon${liked ? ' active' : ''}`}
              id="tnpLikeBtn"
              title="Like"
              onClick={() => void toggleLike()}
            >
              <i className="fas fa-heart" />
            </button>
            <button type="button" className="tnp-btn-icon" id="tnpShareBtn" title="Share" onClick={() => setSheet('share')}>
              <i className="fas fa-share-alt" />
            </button>
            <button type="button" className="tnp-btn-icon" id="tnpReportBtn" title="Report" onClick={() => setSheet('report')}>
              <i className="fas fa-flag" />
            </button>
          </div>

          <div className="tnp-stats-bar" id="tnpStatsBar">
            {playerStats(active).map((stat) => (
              <div key={stat.label} className="tnp-stat">
                <b>{stat.value}</b>
                {stat.label}
              </div>
            ))}
          </div>

          <p className="tnp-desc" id="tnpDesc">
            {playerDescription(active)}
          </p>

          <div className="tnp-rating-block">
            <div className="tnp-rating-label">Rate this</div>
            <div className="tnp-stars-input" id="tnpStarsInput" onMouseLeave={() => setHoverRating(0)}>
              {[1, 2, 3, 4, 5].map((value) => (
                <i
                  key={value}
                  className={`fas fa-star${(hoverRating || myRating) >= value ? ' selected' : ''}`}
                  data-val={value}
                  onMouseEnter={() => setHoverRating(value)}
                  onClick={() => void rate(value)}
                />
              ))}
            </div>
            <div className="tnp-rating-summary" id="tnpRatingSummary">
              {rating.count === 0 ? (
                'No ratings yet. Be first!'
              ) : (
                <>
                  <span style={{ color: '#f5c518' }}>{ratingStars(rating.average)}</span>&nbsp;
                  <b style={{ color: '#fff' }}>{rating.average.toFixed(1)}</b>/5&nbsp;
                  <span style={{ color: '#555' }}>
                    ({rating.count} rating{rating.count !== 1 ? 's' : ''})
                  </span>
                </>
              )}
            </div>
            <div className="tnp-rating-msg" id="tnpRatingMsg">
              {ratingMessage}
            </div>
          </div>

          {seasons.length > 0 ? (
            <div className="tnp-seasons-block" id="tnpSeasonsBlock" style={{ display: 'block' }}>
              <div className="tnp-section-head">
                <h3 className="tnp-section-title">Series</h3>
                <span className="tnp-ep-count" id="tnpSeasonCount">
                  {seasons.length} season{seasons.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="tnp-season-tabs" id="tnpSeasonTabs">
                {seasons.map((item, position) => (
                  <div
                    key={item.id}
                    className={`tnp-season-tab${item.id === episodeSeason?.id ? ' active' : ''}`}
                    onClick={() => setSeason(item)}
                  >
                    Season {item.seasonNumber ?? position + 1}
                  </div>
                ))}
              </div>
              <div className="tnp-section-head" style={{ marginTop: 14, marginBottom: 6 }}>
                <h3 className="tnp-section-title" style={{ fontSize: 14, color: '#aaa', fontWeight: 600, letterSpacing: 0.3 }}>
                  Episodes
                </h3>
              </div>
              <div className="tnp-episodes-list" id="tnpSeasonEpList">
                <EpisodeList episodes={episodes} onPlay={playEpisode} />
              </div>
            </div>
          ) : null}

          {related.length > 0 ? (
            <div className="tnp-related-block" id="tnpRelatedBlock" style={{ display: 'block' }}>
              <div className="tnp-section-head">
                <h3 className="tnp-section-title">More Like This</h3>
              </div>
              <div className="tnp-row-scroll" id="tnpRelatedScroll">
                {related.map((item) => (
                  <div key={item.id} className="tnp-h-card" onClick={() => onOpenVideo(item)}>
                    {poseThumb(item) ? (
                      <img src={poseThumb(item)} alt={playerTitle(item)} loading="lazy" />
                    ) : (
                      <div style={{ width: '100%', height: 105, background: '#1c1c1c' }} />
                    )}
                    <span className={`tnp-h-card-price ${playerPriceTag(item) === 'FREE' ? 'free' : 'paid'}`}>
                      {playerPriceTag(item) === 'FREE' ? 'FREE' : <><i className="fas fa-coins" /> {playerPriceTag(item)}</>}
                    </span>
                    <div className="tnp-h-card-info">
                      <div className="tnp-h-card-title">{playerTitle(item)}</div>
                      <div className="tnp-h-card-meta">
                        {item.duration ? `· ${item.duration}` : ''}
                        {playerReleased(item.createdAt) ? ` · ${playerReleased(item.createdAt)}` : ''}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {seasons.length === 0 && episodes.length > 0 ? (
            <div className="tnp-episodes-block" id="tnpEpisodesBlock" style={{ display: 'block' }}>
              <div className="tnp-section-head">
                <h3 className="tnp-section-title" id="tnpEpisodesTitle">
                  Episodes
                </h3>
                <span className="tnp-ep-count" id="tnpEpCount">
                  {episodes.length} episode{episodes.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="tnp-episodes-list" id="tnpEpisodesList">
                <EpisodeList episodes={episodes} onPlay={playEpisode} />
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <VideoActionSheets
        open={sheet !== null}
        initialSheet={sheet ?? 'share'}
        video={active as unknown as import('@/lib/pose-app/types').PoseVideo}
        uid={uid}
        email={email}
        displayName={displayName}
        rate={1}
        onRateChange={() => undefined}
        onClose={() => setSheet(null)}
        onToast={onToast}
        onHide={onClose}
      />
    </div>
  );

  return portalTarget ? createPortal(content, portalTarget) : null;
}

/**
 * `tnpRenderEpisodeList()` @89701 — the numbered episode rows, including the
 * lock badge and the "UPCOMING" flag on a scheduled episode.
 */
function EpisodeList({
  episodes,
  onPlay,
}: {
  episodes: PoseEpisode[];
  onPlay: (episode: PosePlayerVideo) => void;
}) {
  return (
    <>
      {episodes.map((item, position) => {
        const number = item.episodeNumber ?? position + 1;
        const scheduledAt = item.scheduledDate ? playerDate(item.scheduledDate) : null;
        const upcoming = isUpcoming(item.scheduledDate);
        const thumb = item.thumbnail ?? '';
        return (
          <div
            key={item.id}
            className={`tnp-ep-item${upcoming ? ' tnp-ep-locked' : ''}`}
            onClick={() => {
              if (upcoming) return;
              onPlay({
                id: item.id,
                channelId: '',
                channel: null,
                title: item.title,
                videoUrl: item.videoUrl,
                thumbnailURL: thumb,
                _autoPlay: true,
              } as PosePlayerVideo);
            }}
          >
            <div className="tnp-ep-num">{number}</div>
            {thumb ? (
              <img className="tnp-ep-thumb" src={thumb} alt="" loading="lazy" />
            ) : (
              <div className="tnp-ep-thumb" style={{ background: '#1a1a1a' }} />
            )}
            <div className="tnp-ep-info">
              <div className="tnp-ep-title">{item.title ?? `Episode ${number}`}</div>
              <div className="tnp-ep-meta">
                {scheduledAt ? `· ${scheduledAt.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}` : ''}
              </div>
            </div>
            {upcoming ? <div className="tnp-ep-sched-badge">UPCOMING</div> : null}
          </div>
        );
      })}
    </>
  );
}

/** `tnpFmtTime()` @88568. */
function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return '0:00';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  if (hours > 0) return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  return `${minutes}:${String(secs).padStart(2, '0')}`;
}

/**
 * `tnpBuild()` @87904 picks a "N% Match" at random on every open, which made the
 * figure jump around. Deriving it from the video id keeps it stable per title.
 */
function matchScore(id: string): number {
  let hash = 0;
  for (let index = 0; index < id.length; index += 1) hash = (hash * 31 + id.charCodeAt(index)) >>> 0;
  return 70 + (hash % 29);
}
