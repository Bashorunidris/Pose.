'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { cx } from './styles';
import { VideoActionSheets } from './VideoActionSheets';
import { toMillis } from '@/lib/pose-app/feed';
import {
  captionText,
  interactionCount,
  isPhotoPost,
  isVotedBy,
  splitCaptionTokens,
  truncateWords,
  videoCover,
  videoOwnerName,
} from '@/lib/pose-app/format';
import type { PoseVideo } from '@/lib/pose-app/types';

type Props = {
  video: PoseVideo;
  uid: string | null;
  /** False when another tab is showing: pauses the clip and blocks autoplay. */
  active: boolean;
  following: boolean;
  followers: number | null;
  onToggleLike: (video: PoseVideo, liked: boolean, nextCount: number) => void;
  onToggleRepost: (video: PoseVideo, reposted: boolean, nextCount: number) => void;
  onToggleFollow: (userId: string) => void;
  displayName: string;
  /** Attached to any report the creator files from the share menu. */
  email: string;
  onToast: (message: string) => void;
  /** Blocking or a "not interested" drops the post out of the feed. */
  onHide: () => void;
  /**
   * `.foryou-profile-clickable` — the avatar/name block opens the creator's
   * profile (`setupForYouProfileClickHandlers()` @40319).
   */
  onOpenProfile?: (userId: string) => void;
};

const POST = 'relative h-[100vh] w-full cursor-pointer snap-start overflow-hidden bg-app-post md:h-full';
const MEDIA = 'h-full w-full bg-black object-contain';
const OVERLAY =
  'pointer-events-none absolute inset-0 z-[5] flex h-full w-full flex-col text-white [&>*]:pointer-events-auto';
const PROFILE_SECTION =
  'absolute bottom-[280px] left-[10px] right-[80px] z-[10] flex items-center gap-[12px]';
const PROFILE_PIC = 'relative h-[50px] w-[50px] shrink-0 rounded-full bg-[#666] bg-cover bg-center';
const FOLLOW_BADGE =
  'flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full border-2 border-white ' +
  'text-[13px] text-white transition-all duration-200 hover:scale-[1.15]';
const FOLLOW_BADGE_IDLE =
  'bg-gradient-to-br from-pose-accent to-[#ff4081] shadow-[0_2px_8px_rgba(255,0,80,0.45)]';
const FOLLOW_BADGE_DONE = 'bg-white/15 shadow-none';
const VERIFIED_BADGE =
  'absolute -bottom-[5px] left-1/2 flex h-[19px] w-[19px] -translate-x-1/2 items-center justify-center ' +
  'rounded-full bg-gradient-to-br from-pose-purple-darker to-pose-purple-mid text-[10px] text-white';
const CAPTION = 'absolute bottom-[220px] left-[12px] right-[15px] z-[15]';
const CAPTION_TEXT =
  'mb-[6px] text-[12px] leading-[1.35] break-words text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.9)]';
const SEE_MORE =
  'inline-block rounded-[4px] border border-[rgba(255,0,80,0.4)] bg-gradient-to-br ' +
  'from-[rgba(255,0,80,0.2)] to-[rgba(255,64,129,0.2)] px-[10px] py-[5px] text-[11px] font-semibold ' +
  'text-white transition-all duration-200 hover:-translate-y-px hover:border-[rgba(255,0,80,0.6)] ' +
  'hover:from-[rgba(255,0,80,0.3)] hover:to-[rgba(255,64,129,0.3)] active:translate-y-0';
const TAG = 'text-[#1da1f2] hover:text-[#1a91da]';
const INTERACTIONS =
  'absolute bottom-[clamp(120px,18vh,170px)] right-[clamp(10px,3vw,20px)] z-[10] flex flex-col ' +
  'items-center gap-[clamp(6px,1.5vw,12px)]';
const INTERACTION_BTN =
  'flex flex-col items-center border-0 bg-transparent p-0 text-white transition-all duration-200';
// BTN_ICON carries no background or text colour: same-property utilities of equal
// specificity resolve by stylesheet order, so the idle pair is chosen exclusively
// against each active state rather than overridden by composition.
const BTN_ICON =
  'mb-[4px] flex h-[clamp(40px,10vw,52px)] w-[clamp(40px,10vw,52px)] items-center justify-center ' +
  'rounded-full text-[clamp(18px,4.5vw,24px)] transition-all duration-200 hover:scale-[1.1]';
const BTN_ICON_IDLE = 'bg-black/50 text-white hover:bg-black/70';
const BTN_ICON_LIKED = 'bg-[rgba(255,45,85,0.2)] text-[#ff2d55]';
const BTN_ICON_REPOSTED = 'bg-[rgba(34,197,94,0.2)] text-[#22c55e]';
const INTERACTION_COUNT = 'text-[clamp(12px,2.8vw,14px)] font-medium text-white';
const DISK =
  'absolute bottom-[80px] right-[10px] z-[10] h-[50px] w-[50px] shrink-0 rounded-full bg-cover ' +
  'bg-center max-md:right-[9px]';
const PLAY_OVERLAY =
  'absolute left-1/2 top-1/2 z-[100] flex h-[64px] w-[64px] -translate-x-1/2 ' +
  '-translate-y-1/2 items-center justify-center rounded-full transition-[opacity,transform] ' +
  'duration-[250ms] [filter:drop-shadow(0_2px_6px_rgba(0,0,0,0.55))]';
const PLAY_OVERLAY_IDLE = 'pointer-events-none scale-[0.85] opacity-0';
const PLAY_OVERLAY_PAUSED = 'pointer-events-auto scale-100 opacity-[0.55]';
const SEEK_BAR =
  'absolute bottom-[60px] left-0 right-0 box-border cursor-pointer touch-none select-none px-[12px]';
const SEEK_BAR_IDLE = 'z-[120] h-[28px] pt-[3px]';
const SEEK_BAR_ACTIVE = 'z-[130] h-[44px] pt-[22px]';
const SEEK_FILL = 'pointer-events-none absolute left-0 top-0 h-full rounded-[2px] bg-[#ff2d55]';
const SEEK_TIME =
  'pointer-events-none absolute bottom-[18px] right-[12px] whitespace-nowrap rounded-[4px] bg-black/85 ' +
  'px-[8px] py-[3px] font-mono text-[12px] text-white transition-opacity duration-150';
const SEEK_TIME_IDLE = 'opacity-0';
const SEEK_TIME_ON = 'opacity-100';
const SEEK_THUMB =
  'pointer-events-none absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white ' +
  'shadow-[0_1px_4px_rgba(0,0,0,0.5)] transition-transform duration-150';
const SEEK_THUMB_IDLE =
  'scale-0 h-[12px] w-[12px] hover:scale-100 max-md:scale-100 max-md:h-[14px] max-md:w-[14px]';
const SEEK_THUMB_ACTIVE = 'scale-100 h-[18px] w-[18px]';

function formatClock(seconds: number): string {
  const safe = Number.isFinite(seconds) && seconds > 0 ? seconds : 0;
  return `${Math.floor(safe / 60)}:${String(Math.floor(safe % 60)).padStart(2, '0')}`;
}

export function ForYouCard({
  video,
  uid,
  active,
  following,
  followers,
  onToggleLike,
  onToggleRepost,
  onToggleFollow,
  displayName,
  email,
  onToast,
  onHide,
  onOpenProfile,
}: Props) {
  const postRef = useRef<HTMLElement>(null);
  const mediaRef = useRef<HTMLVideoElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(true);
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [clock, setClock] = useState('0:00 / 0:00');
  const [expanded, setExpanded] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  // `setPlaybackSpeed()` @65695 wrote straight onto the element; the card keeps the
  // rate in state so a re-render or a source change cannot quietly reset it.
  const [rate, setRate] = useState(1);
  const photo = isPhotoPost(video);
  const photos = photo ? (video.images?.length ? video.images : [video.videoUrl ?? '']) : [];
  const owner = videoOwnerName(video);
  const caption = captionText(video) || 'Discover great content';
  const truncated = truncateWords(caption, 7);
  const mine = Boolean(uid && video.userId && uid === video.userId);

  // Both interaction values come from the document: a tap is optimistic, but the
  // patch lands on the `video` object in the parent list, so the card holds no
  // interaction state of its own.
  const liked = isVotedBy(video.likes, uid);
  const reposted = isVotedBy(video.reposts, uid);
  const likeCount = interactionCount(video.likeCount, video.likes);
  const repostCount = interactionCount(video.repostCount, video.reposts);

  useEffect(() => {
    const node = postRef.current;
    const media = mediaRef.current;
    if (photo || !node || !media) return;
    if (!active) {
      media.pause();
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting) {
        media.pause();
        return;
      }
      media.play().then(() => setPaused(false)).catch(() => setPaused(true));
    }, { threshold: 0.6 });
    observer.observe(node);
    return () => observer.disconnect();
  }, [active, photo]);

  useEffect(() => {
    const media = mediaRef.current;
    if (media) media.playbackRate = rate;
  }, [rate]);

  const syncClock = useCallback(() => {
    const media = mediaRef.current;
    if (!media) return;
    const duration = media.duration || 0;
    setProgress(duration > 0 ? Math.min(100, (media.currentTime / duration) * 100) : 0);
    setClock(`${formatClock(media.currentTime)} / ${formatClock(duration)}`);
  }, []);

  const scrubTo = useCallback((clientX: number) => {
    const media = mediaRef.current;
    const track = trackRef.current;
    if (!media || !track) return;
    const duration = media.duration || 0;
    if (duration <= 0) return;
    const rect = track.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    media.currentTime = ratio * duration;
    setProgress(ratio * 100);
    setClock(`${formatClock(ratio * duration)} / ${formatClock(duration)}`);
  }, []);

  const togglePlayback = () => {
    const media = mediaRef.current;
    if (!media || photo) return;
    if (media.paused) {
      media.play().then(() => setPaused(false)).catch(() => setPaused(true));
    } else {
      media.pause();
      setPaused(true);
    }
  };

  const postedAt = toMillis(video.createdAt);

  return (
    <article ref={postRef} className={POST} data-video-post-id={video.id}>
      {photo ? (
        photos.length > 1 ? (
          <div className="absolute inset-0 flex snap-x snap-mandatory overflow-x-auto overflow-y-hidden bg-black [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {photos.map((url, index) => (
              <img
                key={`${video.id}-${index}`}
                src={url ?? ''}
                alt={`Photo ${index + 1} of ${photos.length}`}
                loading={index === 0 ? 'eager' : 'lazy'}
                decoding="async"
                className={cx(MEDIA, 'flex-none snap-center')}
              />
            ))}
          </div>
        ) : (
          <img src={photos[0] ?? ''} alt="Photo" loading="lazy" decoding="async" className={MEDIA} />
        )
      ) : (
        <video
          ref={mediaRef}
          src={video.videoUrl ?? ''}
          className={cx(MEDIA, !video.isUploadedFile && '-scale-x-100')}
          preload="auto"
          loop
          playsInline
          aria-label={`${owner}'s video, posted ${postedAt ? new Date(postedAt).toLocaleDateString() : 'recently'}`}
          onTimeUpdate={syncClock}
          onLoadedMetadata={(event) => {
            // A new source resets `playbackRate`, so the chosen speed is re-applied.
            event.currentTarget.playbackRate = rate;
            syncClock();
          }}
          onPause={() => setPaused(true)}
          onPlay={() => setPaused(false)}
        />
      )}

      {!photo && (
        <div className={cx(PLAY_OVERLAY, paused ? PLAY_OVERLAY_PAUSED : PLAY_OVERLAY_IDLE)} aria-hidden>
          <i className={cx('fas text-[40px] text-white', paused ? 'fa-play' : 'fa-pause')} />
        </div>
      )}

      <div
        className={OVERLAY}
        onClick={(event) => {
          if (!(event.target as HTMLElement).closest('button')) togglePlayback();
        }}
      >
        <div
          className={cx(DISK, paused ? '' : 'animate-app-spin-disk')}
          style={{ backgroundImage: `url('${videoCover(video)}')` }}
        />

        <div className={CAPTION}>
          <div className={cx(CAPTION_TEXT, expanded ? 'overflow-visible' : 'line-clamp-1 max-h-[18px] overflow-hidden')}>
            <b>
              {expanded
                ? splitCaptionTokens(caption).map((token, index) =>
                    token.type === 'tag' ? (
                      <span key={`${token.value}-${index}`} className={TAG}>
                        {token.value}
                      </span>
                    ) : (
                      <span key={`text-${index}`}>{token.value}</span>
                    ),
                  )
                : truncated.text}
            </b>
          </div>
          {truncated.truncated && !expanded && (
            <button type="button" className={SEE_MORE} onClick={() => setExpanded(true)}>
              See more &gt;&gt;
            </button>
          )}
        </div>

        <div
          className={cx(PROFILE_SECTION, onOpenProfile && 'cursor-pointer')}
          onClick={
            onOpenProfile
              ? (event) => {
                  event.stopPropagation();
                  if (video.userId) onOpenProfile(video.userId);
                }
              : undefined
          }
        >
          <div
            className={PROFILE_PIC}
            style={{ backgroundImage: `url('${video.userProfilePic ?? ''}')` }}
          >
            {video.verified && <span className={VERIFIED_BADGE}>∞</span>}
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-[2px]">
            <div className="flex flex-1 items-center gap-[6px]">
              <span className="truncate text-[16px] font-bold">{owner}</span>
              {uid && video.userId && !mine && (
                <button
                  type="button"
                  aria-label={following ? 'Following' : 'Follow'}
                  className={cx(FOLLOW_BADGE, following ? FOLLOW_BADGE_DONE : FOLLOW_BADGE_IDLE)}
                  onClick={(event) => {
                    event.stopPropagation();
                    onToggleFollow(video.userId ?? '');
                  }}
                >
                  <i className={cx('fas', following ? 'fa-check' : 'fa-plus')} />
                </button>
              )}
            </div>
            {followers !== null && (
              <span className="text-[14px] text-white/80">
                {followers.toLocaleString()} {followers === 1 ? 'follower' : 'followers'}
              </span>
            )}
          </div>
        </div>

        <div className={INTERACTIONS}>
          <button
            type="button"
            className={INTERACTION_BTN}
            onClick={(event) => {
              event.stopPropagation();
              if (!uid) return;
              const next = liked ? Math.max(0, likeCount - 1) : likeCount + 1;
              onToggleLike(video, !liked, next);
            }}
          >
            <span className={cx(BTN_ICON, liked ? BTN_ICON_LIKED : BTN_ICON_IDLE)}>
              <i className="fas fa-heart" />
            </span>
            <span className={INTERACTION_COUNT}>{likeCount}</span>
          </button>

          <button
            type="button"
            className={INTERACTION_BTN}
            onClick={(event) => {
              event.stopPropagation();
              if (!uid) return;
              const next = reposted ? Math.max(0, repostCount - 1) : repostCount + 1;
              onToggleRepost(video, !reposted, next);
            }}
          >
            <span className={cx(BTN_ICON, reposted ? BTN_ICON_REPOSTED : BTN_ICON_IDLE)}>
              <i className="fas fa-retweet" />
            </span>
            <span className={INTERACTION_COUNT}>{repostCount}</span>
          </button>

          <button
            type="button"
            className={INTERACTION_BTN}
            onClick={(event) => {
              event.stopPropagation();
              setShareOpen(true);
            }}
          >
            <span className={cx(BTN_ICON, BTN_ICON_IDLE)}>
              <i className="fas fa-share-alt" />
            </span>
            <span className={INTERACTION_COUNT}>{interactionCount(video.shareCount)}</span>
          </button>
        </div>
      </div>

      {!photo && (
        <div
          className={cx(SEEK_BAR, paused || dragging ? SEEK_BAR_ACTIVE : SEEK_BAR_IDLE)}
          onClick={(event) => event.stopPropagation()}
          onPointerDown={(event) => {
            event.currentTarget.setPointerCapture(event.pointerId);
            setDragging(true);
            mediaRef.current?.pause();
            scrubTo(event.clientX);
          }}
          onPointerMove={(event) => {
            if (dragging) scrubTo(event.clientX);
          }}
          onPointerUp={() => {
            if (!dragging) return;
            setDragging(false);
            mediaRef.current?.play().then(() => setPaused(false)).catch(() => setPaused(true));
          }}
        >
          <div
            ref={trackRef}
            className={cx(
              'relative w-full rounded-[2px] bg-white/25 transition-[height] duration-150',
              paused || dragging ? 'h-[8px] bg-white/35' : 'h-[3px] hover:h-[6px] max-md:h-[5px]',
            )}
          >
            <div className={SEEK_FILL} style={{ width: `${progress}%` }} />
            <div
              className={cx(
                SEEK_THUMB,
                paused || dragging ? SEEK_THUMB_ACTIVE : SEEK_THUMB_IDLE,
              )}
              style={{ left: `${progress}%` }}
            />
            <div className={cx(SEEK_TIME, paused || dragging ? SEEK_TIME_ON : SEEK_TIME_IDLE)}>
              {clock}
            </div>
          </div>
        </div>
      )}

      <VideoActionSheets
        open={shareOpen}
        video={video}
        uid={uid}
        email={email || null}
        displayName={displayName}
        rate={rate}
        onRateChange={setRate}
        onClose={() => setShareOpen(false)}
        onToast={onToast}
        onHide={onHide}
      />
    </article>
  );
}
