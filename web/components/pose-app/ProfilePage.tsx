'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import {
  formatCount,
  isVerified,
  loadProfile,
  profileDisplayName,
  profileInitial,
  profileLinks,
  profilePic,
  profileUsername,
  PROFILE_BATCH_SIZE,
  type ProfileStats,
} from '@/lib/pose-app/profile';
import type { PoseUser, PoseVideo } from '@/lib/pose-app/types';

import { ProfileSettingsModal } from './profile/ProfileSettingsModal';

type Props = {
  uid: string;
  /** The edit form shows this read-only, and the report forms fall back to it. */
  email: string;
  onClose: () => void;
  onOpenChannel: () => void;
  /** Drafts and Wallet are still legacy-only screens. */
  onToast: (message: string) => void;
  /** A sign-out drops the whole profile overlay, like the legacy reload did. */
  onSignedOut: () => void;
};

const STAT_LABELS: { key: keyof ProfileStats; label: string }[] = [
  { key: 'followers', label: 'Followers' },
  { key: 'following', label: 'Following' },
  { key: 'likes', label: 'Likes' },
  { key: 'views', label: 'Views' },
];

const ICON_BUTTON =
  'flex h-[36px] w-[36px] items-center justify-center rounded-full border-none bg-white/20 text-white backdrop-blur-[5px] transition-all duration-[300ms] hover:scale-[1.08] hover:bg-white/30';

const TAB =
  'relative flex-1 cursor-pointer bg-transparent py-[15px] text-center text-[14px] text-[#a1a1aa]';

/**
 * `#profilePage` — `openProfile()`, `updateProfileStats()` and the body of
 * `loadProfileFeed()`.
 *
 * Only the Feed tab is ported: the legacy page also ran Exclusive, Photos, Buzz,
 * Liked, Stories and Gifts loaders, and each of those reads a different
 * collection with its own card builder. Rendering the tab row with five tabs
 * that do nothing would be worse than shipping the one that works, so the tab
 * strip carries the tabs that exist until those loaders are ported.
 */
export function ProfilePage({ uid, email, onClose, onOpenChannel, onToast, onSignedOut }: Props) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [user, setUser] = useState<PoseUser | null>(null);
  const [videos, setVideos] = useState<PoseVideo[]>([]);
  const [stats, setStats] = useState<ProfileStats>({ followers: 0, following: 0, likes: 0, views: 0 });
  const [state, setState] = useState<'loading' | 'ready' | 'failed'>('loading');
  const [visible, setVisible] = useState(PROFILE_BATCH_SIZE);
  const [playing, setPlaying] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await loadProfile(uid);
      setUser(data.user);
      setVideos(data.videos);
      setStats(data.stats);
      setState('ready');
    } catch (error) {
      console.error('❌ loading the profile:', error);
      setState('failed');
    }
  }, [uid]);

  // `openProfile()` reset the grid and re-ran the tab loaders on every open. The
  // overlay only mounts while it is open, so a fresh mount is that reset and the
  // effect is left with nothing but the load.
  useEffect(() => {
    // Deferred a microtask so the first paint matches the server render and the
    // load's setState calls land outside the effect body.
    void Promise.resolve().then(() => load());
  }, [load]);

  // `setupFeedScrollListener()` — the grid appended the next batch near the end.
  useEffect(() => {
    const node = scrollerRef.current;
    if (!node) return;
    const onScroll = () => {
      if (node.scrollTop + node.clientHeight >= node.scrollHeight - 600) {
        setVisible((count) => Math.min(count + PROFILE_BATCH_SIZE, videos.length));
      }
    };
    node.addEventListener('scroll', onScroll, { passive: true });
    return () => node.removeEventListener('scroll', onScroll);
  }, [videos.length]);

  const shown = videos.slice(0, visible);
  const picture = profilePic(user);
  const links = profileLinks(user);

  return (
    <div className="fixed inset-0 z-[2000] overflow-y-auto bg-[#09090b]" ref={scrollerRef}>
      <div
        className="fixed inset-x-0 top-0 z-[2001] flex h-[60px] items-center px-[15px] shadow-[0_4px_20px_rgba(0,0,0,0.3)]"
        style={{ background: 'linear-gradient(135deg,#a855f7 0%,#6d28d9 100%)' }}
      >
        <button type="button" className={ICON_BUTTON} onClick={onClose} aria-label="Back">
          <i className="fas fa-arrow-left" />
        </button>
        <span className="flex-1" />
        <div className="flex items-center gap-[8px]">
          <button type="button" className={ICON_BUTTON} onClick={() => setSettingsOpen(true)} aria-label="Settings">
            <i className="fas fa-cog" />
          </button>
          <button
            type="button"
            className="flex h-[36px] items-center gap-[8px] rounded-[20px] border-[1.5px] border-white/35 bg-white/15 px-[14px] text-white transition-all duration-[300ms] hover:scale-[1.05] hover:bg-white/28"
            onClick={() => onToast('Drafts is the next screen to be ported')}
          >
            <i className="fas fa-bookmark text-[12px] opacity-90" /> Drafts
          </button>
        </div>
      </div>

      <div className="flex flex-col px-[20px] pb-[20px] pt-[80px]">
        <div className="flex items-center gap-[20px]">
          <div className="relative shrink-0">
            <div className="h-[100px] w-[100px] overflow-hidden rounded-[32px] bg-[#222]">
              {picture ? (
                <span className="block h-full w-full bg-cover bg-center" style={{ backgroundImage: `url('${picture}')` }} />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-[40px] font-bold text-white">
                  {profileInitial(profileDisplayName(user))}
                </span>
              )}
            </div>
            {isVerified(user) ? (
              <span className="absolute -bottom-[7px] -right-[7px] flex h-[32px] w-[32px] items-center justify-center rounded-full border-[2.5px] border-[#09090b] text-[1.1rem] font-black text-[#e9d5ff]" style={{ background: 'linear-gradient(135deg,#3b0764,#6d28d9)' }}>
                ∞
              </span>
            ) : null}
          </div>

          <div className="flex min-w-0 flex-1 flex-col">
            <div className="text-[1.5rem] font-extrabold leading-tight text-white">{profileDisplayName(user)}</div>
            <div className="text-[0.95rem] font-bold text-[#a855f7]">{profileUsername(user)}</div>
            {user?.bio ? (
              <p className="mt-[5px] line-clamp-2 text-[0.9rem] leading-[1.4] text-[#a1a1aa]">{user.bio}</p>
            ) : null}
            {links.length ? (
              <div className="mt-[8px] flex flex-row flex-wrap gap-[8px]">
                {links.map((link) => (
                  <a
                    key={`${link.title}-${link.url}`}
                    href={link.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="flex items-center gap-[5px] rounded-[12px] border border-white/10 bg-white/5 px-[10px] py-[4px] text-[0.75rem] font-semibold text-[#c4b5fd] no-underline"
                  >
                    <i className="fas fa-link text-[10px]" />{link.title}
                  </a>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        <div
          className="mt-[20px] grid w-full grid-cols-4 rounded-[18px] border border-white/[0.08] px-[5px] py-[15px] backdrop-blur-[10px]"
          style={{ background: 'rgba(24,24,27,0.7)' }}
        >
          {STAT_LABELS.map((entry, index) => (
            <div
              key={entry.key}
              className={`flex flex-col items-center gap-[2px] text-center${index < STAT_LABELS.length - 1 ? ' border-r border-white/[0.08]' : ''}`}
            >
              <div className="text-[1.1rem] font-extrabold text-white">{formatCount(stats[entry.key])}</div>
              <div className="text-[0.65rem] font-bold uppercase tracking-[0.5px] text-[#a1a1aa]">{entry.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-center gap-[12px] px-[20px] pb-[10px]">
        <button
          type="button"
          className="flex h-[48px] flex-1 items-center justify-center gap-[10px] rounded-[14px] text-[0.95rem] font-extrabold text-white"
          style={{ background: 'linear-gradient(135deg,#ff6b6b 0%,#ff8787 100%)' }}
          onClick={onOpenChannel}
        >
          <i className="fas fa-clapperboard" /> My Channel
        </button>
        <button
          type="button"
          className="flex h-[48px] w-[48px] items-center justify-center rounded-[14px] border border-white/[0.08] text-[1.1rem] text-white"
          style={{ background: 'rgba(24,24,27,0.7)' }}
          onClick={() => onToast('Wallet is the next screen to be ported')}
          aria-label="Wallet"
        >
          <i className="fas fa-wallet" />
        </button>
      </div>

      <div className="sticky top-[60px] z-[10] flex justify-around border-b border-white/[0.08] bg-[#09090b]">
        <div className={`${TAB} text-white`}>
          <i className="fas fa-play-circle" /> Feed
          <span className="absolute bottom-0 left-1/4 h-[3px] w-1/2 rounded-[3px]" style={{ background: 'linear-gradient(135deg,#a855f7 0%,#ec4899 100%)' }} />
        </div>
      </div>

      <div className="pb-[40px]">
        {state === 'loading' ? (
          <div className="grid w-full grid-cols-3 gap-[2px]">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="aspect-[9/16] animate-pulse rounded-[8px] bg-[#1a1a1a]" />
            ))}
          </div>
        ) : state === 'failed' ? (
          <div className="flex flex-col items-center gap-[12px] px-[20px] py-[40px] text-center text-[13px] text-[#bbb]">
            <i className="fas fa-circle-exclamation text-[32px] opacity-40" />
            <p>Could not load your profile right now.</p>
            <button
              type="button"
              className="rounded-[10px] bg-[#a855f7] px-[18px] py-[8px] text-[13px] font-bold text-white"
              onClick={() => void load()}
            >
              Retry
            </button>
          </div>
        ) : videos.length === 0 ? (
          <div className="px-[20px] py-[40px] text-center text-[13px] text-[#a1a1aa]">No videos yet</div>
        ) : (
          <div className="grid w-full grid-cols-3 gap-[2px]">
            {shown.map((video) => (
              <ProfileGridItem
                key={video.id}
                video={video}
                playing={playing === video.id}
                onTogglePlay={() => setPlaying((current) => (current === video.id ? null : video.id))}
              />
            ))}
          </div>
        )}
      </div>

      {settingsOpen ? (
        <ProfileSettingsModal
          uid={uid}
          email={email}
          onClose={() => setSettingsOpen(false)}
          onToast={onToast}
          onProfileChanged={() => void load()}
          onSignedOut={() => {
            setSettingsOpen(false);
            onSignedOut();
          }}
        />
      ) : null}
    </div>
  );
}

/**
 * `createFeedVideoItem()` — the grid tile: the clip itself, a pin button, a
 * centre play overlay and the views/likes/comments strip along the bottom.
 */
function ProfileGridItem({ video, playing, onTogglePlay }: {
  video: PoseVideo;
  playing: boolean;
  onTogglePlay: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const url = video.videoUrl ?? '';
  const views = Number(video.views ?? video.viewCount) || 0;
  const likes = video.likes && typeof video.likes === 'object'
    ? Object.keys(video.likes).length
    : Number(video.likeCount) || 0;
  const comments = Number(video.comments ?? video.commentCount) || 0;

  useEffect(() => {
    const node = videoRef.current;
    if (!node) return;
    if (playing) void node.play().catch(() => undefined);
    else node.pause();
  }, [playing]);

  return (
    <div className="relative aspect-[9/16] overflow-hidden bg-[#1a1a1a]">
      <video
        ref={videoRef}
        className="h-full w-full bg-black object-cover"
        src={url}
        preload="metadata"
        playsInline
        muted
        loop
      />

      <button
        type="button"
        className="absolute right-[8px] top-[8px] z-10 flex h-[32px] w-[32px] items-center justify-center rounded-full border-none text-[16px] text-white backdrop-blur-[4px] transition-all duration-[300ms]"
        style={{ background: 'rgba(0,0,0,0.6)' }}
        onClick={() => onTogglePlay()}
        aria-label="Pin"
      >
        <i className="fas fa-thumbtack" />
      </button>

      <div
        className="absolute inset-0 flex cursor-pointer items-center justify-center transition-all duration-[300ms]"
        style={{ background: 'rgba(0,0,0,0.2)' }}
        onClick={onTogglePlay}
      >
        <div
          className="flex h-[60px] w-[60px] items-center justify-center rounded-full text-[40px] text-white"
          style={{ background: 'rgba(0,0,0,0.5)', textShadow: '0 3px 10px rgba(0,0,0,0.8)', transform: playing ? 'scale(0.8)' : 'scale(1)' }}
        >
          <i className={playing ? 'fas fa-pause text-[24px]' : 'fas fa-play text-[24px]'} />
        </div>
      </div>

      <div
        className="absolute inset-x-0 bottom-0 z-[5] flex flex-col gap-[8px] px-[10px] pb-[8px] pt-[12px]"
        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0.4), transparent)' }}
      >
        <div className="truncate text-[11px] text-[#ddd]">{video.caption || 'Untitled'}</div>
        <div className="flex items-center gap-[16px] text-[12px] text-white">
          <span className="flex items-center gap-[4px]"><i className="fas fa-eye" /> {formatCount(views)}</span>
          <span className="flex items-center gap-[4px]"><i className="fas fa-heart text-[#ff0050]" /> {formatCount(likes)}</span>
          <span className="flex items-center gap-[4px]"><i className="fas fa-comments" /> {formatCount(comments)}</span>
        </div>
      </div>
    </div>
  );
}
