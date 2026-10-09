'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

import { BuzzCard } from '../BuzzCard';
import { ForYouCard } from '../ForYouCard';
import { cx } from '../styles';
import { CreatorGrid } from './CreatorGrid';
import { ProfileDetailsModal } from './ProfileDetailsModal';
import {
  ACTIONS,
  AVATAR_IMAGE,
  AVATAR_SQUIRCLE,
  BACK_BTN,
  BIO,
  BIO_WRAP,
  BTN_CHANNEL,
  BTN_FOLLOW,
  BTN_ICON_SQUARE,
  DETAILS,
  EMPTY,
  HEADER,
  INFO_SECTION,
  LINK_CHIP,
  LINK_MORE,
  LINKS,
  NAME,
  PAGE,
  RETRY_BTN,
  SEE_MORE,
  SKEL_TEXT,
  STAT,
  STAT_LABEL,
  STAT_VALUE,
  STATS,
  TAB,
  TAB_ACTIVE,
  TAB_ERROR,
  TAB_UNDERLINE,
  TABS,
  TOP_ROW,
  USERNAME,
  VERIFIED_BADGE,
} from './creator-profile-ui';
import {
  creatorFeedVideos,
  creatorTotals,
  headerGradient,
  loadCreatorBuzzs,
  loadCreatorLiked,
  loadCreatorPhotos,
  loadCreatorProfile,
  loadCreatorStories,
  loadCreatorVideos,
  loadViewerFollowState,
  setCreatorFollow,
  type CreatorProfile,
} from '@/lib/pose-app/creator-profile';
import { withVote } from '@/lib/pose-app/format';
import {
  setBuzzHit,
  setBuzzLike,
  setBuzzPass,
  setBuzzRepost,
  setVideoLike,
  setVideoRepost,
} from '@/lib/pose-app/interactions';
import { formatCount } from '@/lib/pose-app/profile';
import type { BuzzPost, PoseVideo } from '@/lib/pose-app/types';

export type TabKey = 'feed' | 'photos' | 'buzzs' | 'liked' | 'stories';

type Loaded<T> = { state: 'idle' | 'loading' | 'ready' | 'failed'; items: T[] };

function idle<T>(): Loaded<T> {
  return { state: 'idle', items: [] };
}

const TAB_DEFS: { key: TabKey; label: string; icon: string }[] = [
  { key: 'feed', label: 'Feed', icon: 'fas fa-play-circle' },
  { key: 'photos', label: 'Photos', icon: 'fas fa-images' },
  { key: 'buzzs', label: 'Buzz', icon: 'fas fa-comments' },
  { key: 'liked', label: 'Liked', icon: 'fas fa-heart' },
  { key: 'stories', label: 'Stories', icon: 'fas fa-book' },
];

const FOLLOW_GRADIENT = 'linear-gradient(135deg, #8a2be2 0%, #bb86fc 100%)';
const FOLLOW_GRADIENT_ON = 'linear-gradient(135deg, #4a4a4a 0%, #6c6c6c 100%)';
const CHANNEL_GRADIENT = 'linear-gradient(135deg, #ff6b6b 0%, #ff8787 100%)';

type Props = {
  uid: string;
  viewerUid: string | null;
  /** Attached to reports filed from the played video. */
  email?: string;
  /** The signed-in name, used as the sender on a share to a friend. */
  displayName?: string;
  /** The shell's toast. Without it the page renders its own. */
  onToast?: (message: string) => void;
  /** Present when the page is an overlay; otherwise the header goes back. */
  onClose?: () => void;
  /**
   * The tab to open on. `openProfileFromSearch(uid, info, 'buzzs')` @79600 handed
   * a landing tab to `switchForYouProfileTab()` right after the profile opened,
   * which is how a user picked out of Buzz search landed on their Buzz tab.
   */
  landingTab?: TabKey;
};

/**
 * `#forYouProfilePageModal` @90307 — another creator's profile, opened by
 * `openForYouProfilePage()` @66391.
 *
 * This is the page the Trend modal, the Buzz feed and the For You cards all
 * point at. The legacy version was one overlay driven by a dozen module-level
 * globals (`currentForYouCreatorData`, `isFollowingForYouCreator`,
 * `isMutualFollow`); here the same state is the component's.
 */
export function CreatorProfilePage({
  uid,
  viewerUid,
  email = '',
  displayName = '',
  onToast,
  onClose,
  landingTab,
}: Props) {
  const router = useRouter();
  const initialTab = landingTab ?? 'feed';

  const [profile, setProfile] = useState<CreatorProfile | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'hidden' | 'failed'>('loading');
  const [tab, setTab] = useState<TabKey>(initialTab);

  const [feed, setFeed] = useState<Loaded<PoseVideo>>(idle);
  const [photos, setPhotos] = useState<Loaded<PoseVideo>>(idle);
  const [buzzs, setBuzzs] = useState<Loaded<BuzzPost>>(idle);
  const [liked, setLiked] = useState<Loaded<PoseVideo>>(idle);
  const [stories, setStories] = useState<Loaded<PoseVideo>>(idle);

  const [following, setFollowing] = useState(false);
  const [mutual, setMutual] = useState(false);
  const [followers, setFollowers] = useState(0);
  const [played, setPlayed] = useState<PoseVideo | null>(null);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [bioTruncated, setBioTruncated] = useState(false);
  const [toast, setToast] = useState('');
  /** Every document `loadCreatorVideos()` returned, for the Likes/Views totals. */
  const [allVideos, setAllVideos] = useState<PoseVideo[]>([]);

  const bioRef = useRef<HTMLParagraphElement>(null);
  // `switchForYouProfileTab()` @36385 re-ran its loader on every tap. Re-running
  // the Buzz tab means another 365 day-reads, so each tab loads once per visit.
  const loadedTabs = useRef<Set<TabKey>>(new Set<TabKey>([initialTab]));

  const notify = useCallback(
    (message: string) => {
      if (onToast) {
        onToast(message);
        return;
      }
      setToast(message);
      setTimeout(() => setToast(''), 2500);
    },
    [onToast],
  );

  const load = useCallback(async () => {
    try {
      const data = await loadCreatorProfile(uid, viewerUid);
      setProfile(data);
      setFollowers(data.followers);

      if (!data.visible) {
        // Legacy closed the overlay and toasted `hiddenReason`. A route has to
        // leave something on screen, so the header plus the reason is the page.
        setState('hidden');
        return;
      }
      setState('ready');

      // `_fypPopulateUI()` @66553 filled the header, then the same tick kicked
      // off the Feed tab and the follow check together.
      const [videos, followState] = await Promise.all([
        loadCreatorVideos(uid, data.username),
        viewerUid && viewerUid !== uid
          ? loadViewerFollowState(viewerUid, uid)
          : Promise.resolve({ following: false, mutual: false }),
      ]);

      setAllVideos(videos);
      setFeed({ state: 'ready', items: creatorFeedVideos(videos) });
      setFollowing(followState.following);
      setMutual(followState.mutual);
    } catch (error) {
      console.error('❌ loading the creator profile:', error);
      setState('failed');
    }
  }, [uid, viewerUid]);

  useEffect(() => {
    // Deferred a microtask so the load's setState calls land outside the effect
    // body, the same shape the other ported screens use.
    void Promise.resolve().then(() => load());
  }, [load]);

  // `checkProfileBioTruncation()` @90660, which unhid the See more button when
  // the bio measured past two lines. A clamped box reports its full content in
  // `scrollHeight`, so the comparison is exact instead of the legacy 48px guess.
  useEffect(() => {
    const node = bioRef.current;
    if (!node) return;
    void Promise.resolve().then(() => setBioTruncated(node.scrollHeight > node.clientHeight + 1));
  }, [profile, state]);

  const openTab = useCallback(
    async (key: TabKey) => {
      loadedTabs.current.add(key);
      const username = profile?.username ?? '';
      try {
        if (key === 'feed') {
          setFeed({ state: 'loading', items: [] });
          setFeed({ state: 'ready', items: creatorFeedVideos(await loadCreatorVideos(uid, username)) });
        } else if (key === 'photos') {
          setPhotos({ state: 'loading', items: [] });
          setPhotos({ state: 'ready', items: await loadCreatorPhotos(uid, username) });
        } else if (key === 'buzzs') {
          setBuzzs({ state: 'loading', items: [] });
          setBuzzs({ state: 'ready', items: await loadCreatorBuzzs(uid, username) });
        } else if (key === 'liked') {
          setLiked({ state: 'loading', items: [] });
          setLiked({ state: 'ready', items: await loadCreatorLiked(uid) });
        } else if (key === 'stories') {
          setStories({ state: 'loading', items: [] });
          setStories({ state: 'ready', items: await loadCreatorStories(uid, username) });
        }
      } catch (error) {
        console.error(`❌ loading the ${key} tab:`, error);
        if (key === 'feed') setFeed({ state: 'failed', items: [] });
        else if (key === 'photos') setPhotos({ state: 'failed', items: [] });
        else if (key === 'buzzs') setBuzzs({ state: 'failed', items: [] });
        else if (key === 'liked') setLiked({ state: 'failed', items: [] });
        else if (key === 'stories') setStories({ state: 'failed', items: [] });
      }
    },
    [profile?.username, uid],
  );

  const selectTab = useCallback(
    (key: TabKey) => {
      setTab(key);
      if (!loadedTabs.current.has(key)) void openTab(key);
    },
    [openTab],
  );

  const retryTab = useCallback(
    (key: TabKey) => {
      loadedTabs.current.delete(key);
      void openTab(key);
    },
    [openTab],
  );

  // The landing tab `openProfileFromSearch()` @79600 asked for. The profile has
  // to be ready first: `openTab` reads the username off it, and on a cold load
  // the header has not been filled in yet.
  useEffect(() => {
    if (state !== 'ready' || initialTab === 'feed' || loadedTabs.current.has(initialTab)) return;
    void Promise.resolve().then(() => openTab(initialTab));
  }, [state, initialTab, openTab]);

  // `toggleForYouProfileFollow()` @68754 — optimistic count, then both writes.
  const toggleFollow = useCallback(
    async (targetUid?: string) => {
      const creatorId = targetUid ?? uid;
      if (!viewerUid || creatorId !== uid) return;
      const next = !following;
      setFollowing(next);
      setFollowers((count) => Math.max(0, count + (next ? 1 : -1)));
      if (!next) setMutual(false);
      try {
        await setCreatorFollow(viewerUid, creatorId, next);
      } catch (error) {
        console.error('❌ toggling the follow:', error);
      }
    },
    [following, uid, viewerUid],
  );

  const patchBuzz = (post: BuzzPost, changes: Partial<BuzzPost>) => {
    setBuzzs((current) => ({
      ...current,
      items: current.items.map((item) =>
        item.id === post.id && item.date === post.date ? { ...item, ...changes } : item,
      ),
    }));
  };

  const handleBuzzLike = (post: BuzzPost, next: boolean, count: number) => {
    if (!viewerUid || !post.date) return;
    patchBuzz(post, { likes: count, likedBy: { ...(post.likedBy ?? {}), [viewerUid]: next } });
    void setBuzzLike(post.id, post.date, viewerUid, next, count);
  };

  const handleBuzzRepost = (post: BuzzPost, next: boolean, count: number) => {
    if (!viewerUid || !post.date) return;
    patchBuzz(post, { reposts: count, repostedBy: { ...(post.repostedBy ?? {}), [viewerUid]: next } });
    void setBuzzRepost(post.id, post.date, viewerUid, next, count);
  };

  const handleBuzzVote = (post: BuzzPost, vote: 'hit' | 'pass', next: boolean) => {
    if (!viewerUid || !post.date) return;
    const key = vote === 'hit' ? 'buzzhitBy' : 'buzzpassBy';
    const otherKey = vote === 'hit' ? 'buzzpassBy' : 'buzzhitBy';
    patchBuzz(post, {
      [key]: { ...(post[key] ?? {}), [viewerUid]: next },
      [otherKey]: Object.fromEntries(
        Object.entries({ ...(post[otherKey] ?? {}), [viewerUid]: undefined }).filter(
          ([id, value]) => id !== viewerUid && value !== undefined,
        ),
      ),
    });
    const write = vote === 'hit' ? setBuzzHit : setBuzzPass;
    void write(post.id, post.date, viewerUid, next).then((counts) => {
      if (counts) patchBuzz(post, counts);
    });
  };

  const openCreatorChannel = () =>
    notify('The creator channel page is the next screen to be ported');

  /**
   * `openDirectMessage()` @68896 kept both of its guards before it opened the
   * chat room, and the room itself is still legacy-only.
   */
  const openMessage = () => {
    if (!viewerUid) {
      notify('Please log in to message');
      return;
    }
    if (!mutual) {
      notify('You both need to follow each other to chat');
      return;
    }
    notify('Messages is the next screen to be ported');
  };

  const picture = profile?.profilePic ?? '';
  const initial = (profile?.displayName || 'C').charAt(0).toUpperCase();
  const totals = creatorTotals(allVideos);
  const hasChannel = Boolean(profile?.hasChannel);
  const isOwner = Boolean(viewerUid && viewerUid === uid);
  const links = profile?.links ?? [];

  const stats = [
    { label: 'Followers', value: formatCount(followers) },
    { label: 'Following', value: formatCount(profile?.following ?? 0) },
    { label: 'Likes', value: formatCount(totals.totalLikes) },
    { label: 'Views', value: formatCount(totals.totalViews) },
  ];
  // `_fypApplySkeleton()` @66526 put an em dash in all four cells and only
  // `_fypPopulateUI()` replaced them, which happened after both reads landed.
  const statsReady = state === 'ready' && feed.state === 'ready';

  return (
    <div className={PAGE}>
      <div className={HEADER} style={{ background: headerGradient(uid) }}>
        <button
          type="button"
          className={BACK_BTN}
          onClick={() => (onClose ? onClose() : router.back())}
          aria-label="Back"
        >
          <i className="fas fa-arrow-left" />
        </button>
      </div>

      <div className={INFO_SECTION}>
        <div className={TOP_ROW}>
          <div className="relative shrink-0">
            <div className={AVATAR_SQUIRCLE} style={{ background: FOLLOW_GRADIENT }}>
              <div
                className={AVATAR_IMAGE}
                style={picture ? { backgroundImage: `url('${picture}')` } : undefined}
              >
                {picture ? '' : initial}
              </div>
            </div>
            {profile?.verified && <div className={VERIFIED_BADGE}>∞</div>}
          </div>

          <div className={DETAILS}>
            {profile ? (
              <>
                <div className={NAME}>{profile.displayName}</div>
                <div className={USERNAME}>@{profile.username}</div>
              </>
            ) : (
              <>
                <div className={NAME}>
                  <span className={SKEL_TEXT} />
                </div>
                <div className={USERNAME}>
                  <span className={SKEL_TEXT} />
                </div>
              </>
            )}

            <div className={BIO_WRAP}>
              <p ref={bioRef} className={BIO}>
                {profile?.bio ?? ''}
              </p>
              {bioTruncated && (
                <button type="button" className={SEE_MORE} onClick={() => setAboutOpen(true)}>
                  See more
                </button>
              )}
            </div>

            {links.length > 0 && (
              <div className={LINKS}>
                {links.slice(0, 3).map((link) => (
                  <a
                    key={`${link.title}-${link.url}`}
                    href={link.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className={LINK_CHIP}
                  >
                    <i className="fas fa-link text-[10px]" />
                    <span>{link.title}</span>
                  </a>
                ))}
                {links.length > 3 && (
                  <button type="button" className={LINK_MORE} onClick={() => setAboutOpen(true)}>
                    +{links.length - 3} More
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        <div className={STATS}>
          {stats.map((stat, index) => (
            <div key={stat.label} className={cx(STAT, index === stats.length - 1 && 'border-r-0')}>
              <div className={STAT_VALUE}>{statsReady ? stat.value : '—'}</div>
              <div className={STAT_LABEL}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className={ACTIONS}>
        {!isOwner && (
          <button
            type="button"
            className={BTN_FOLLOW}
            style={{
              background: following ? FOLLOW_GRADIENT_ON : FOLLOW_GRADIENT,
              boxShadow: following
                ? '0 4px 12px rgba(74,74,74,0.3)'
                : '0 4px 12px rgba(138,43,226,0.3)',
            }}
            onClick={() => void toggleFollow()}
          >
            <i
              className={cx('fas', following ? 'fa-user-minus' : 'fa-user-plus', 'mr-[6px]')}
            />
            {following ? 'Unfollow' : 'Follow'}
          </button>
        )}
        <button type="button" className={BTN_ICON_SQUARE} onClick={openMessage} aria-label="Message">
          <i className="fas fa-envelope" />
        </button>
        {hasChannel && (
          <button
            type="button"
            className={BTN_CHANNEL}
            style={{ background: CHANNEL_GRADIENT }}
            onClick={openCreatorChannel}
          >
            <i className="fas fa-clapperboard" />
            Channel
          </button>
        )}
        <button
          type="button"
          className={BTN_ICON_SQUARE}
          onClick={() => notify('Creator settings coming soon')}
          aria-label="More"
        >
          <i className="fas fa-ellipsis-h" />
        </button>
      </div>

      <div className={TABS}>
        {TAB_DEFS.map((entry) => (
          <div
            key={entry.key}
            className={cx(TAB, tab === entry.key && TAB_ACTIVE)}
            onClick={() => selectTab(entry.key)}
          >
            <i className={entry.icon} /> {entry.label}
            {tab === entry.key && (
              <span
                className={TAB_UNDERLINE}
                style={{ background: 'linear-gradient(135deg,#a855f7 0%,#ec4899 100%)' }}
              />
            )}
          </div>
        ))}
      </div>

      {tab === 'feed' && (
        <TabPanel loaded={feed} onRetry={() => retryTab('feed')} onOpen={setPlayed} />
      )}
      {tab === 'photos' && (
        <TabPanel loaded={photos} onRetry={() => retryTab('photos')} onOpen={setPlayed} />
      )}
      {tab === 'liked' && (
        <TabPanel loaded={liked} onRetry={() => retryTab('liked')} onOpen={setPlayed} />
      )}
      {tab === 'stories' && (
        <TabPanel
          loaded={stories}
          onRetry={() => retryTab('stories')}
          variant="stories"
          onOpen={setPlayed}
        />
      )}
      {tab === 'buzzs' && (
        <div className="flex h-full max-w-full flex-col">
          <div className="flex-1">
            {buzzs.state === 'failed' ? (
              <TabError onRetry={() => retryTab('buzzs')} />
            ) : buzzs.state === 'ready' && buzzs.items.length === 0 ? (
              <p className={EMPTY}>No buzzes yet</p>
            ) : (
              buzzs.items.map((post) => (
                <BuzzCard
                  key={`${post.date}/${post.id}`}
                  post={post}
                  liked={Boolean(viewerUid && post.likedBy?.[viewerUid])}
                  reposted={Boolean(viewerUid && post.repostedBy?.[viewerUid])}
                  hit={Boolean(viewerUid && post.buzzhitBy?.[viewerUid])}
                  passed={Boolean(viewerUid && post.buzzpassBy?.[viewerUid])}
                  onToggleLike={handleBuzzLike}
                  onToggleRepost={handleBuzzRepost}
                  onToggleHit={(item, next) => handleBuzzVote(item, 'hit', next)}
                  onTogglePass={(item, next) => handleBuzzVote(item, 'pass', next)}
                />
              ))
            )}
          </div>
        </div>
      )}

      {aboutOpen && (
        <ProfileDetailsModal
          bio={profile?.bio ?? ''}
          links={links}
          onClose={() => setAboutOpen(false)}
        />
      )}

      {played && (
        <div className="fixed inset-0 z-[4000] bg-black/90">
          <ForYouCard
            video={played}
            uid={viewerUid}
            active
            following={following}
            followers={followers}
            displayName={displayName}
            email={email}
            onToast={notify}
            onHide={() => setPlayed(null)}
            onToggleLike={(video, likedNow, nextCount) => {
              setPlayed((previous) =>
                previous
                  ? { ...previous, likeCount: nextCount, likes: withVote(previous.likes, viewerUid, likedNow) }
                  : previous,
              );
              if (viewerUid) void setVideoLike(video.id, viewerUid, likedNow, nextCount);
            }}
            onToggleRepost={(video, repostedNow, nextCount) => {
              setPlayed((previous) =>
                previous
                  ? {
                      ...previous,
                      repostCount: nextCount,
                      reposts: withVote(previous.reposts, viewerUid, repostedNow),
                    }
                  : previous,
              );
              if (viewerUid) void setVideoRepost(video.id, viewerUid, repostedNow, nextCount);
            }}
            onToggleFollow={(targetUserId) => void toggleFollow(targetUserId)}
          />
          <button
            type="button"
            className="absolute right-[16px] top-[16px] z-[10] flex h-[36px] w-[36px] items-center justify-center rounded-full border-none bg-white/20 text-white"
            onClick={() => setPlayed(null)}
            aria-label="Close video"
          >
            <i className="fas fa-times" />
          </button>
        </div>
      )}

      <div
        className="pointer-events-none fixed bottom-[100px] left-1/2 z-[9999] -translate-x-1/2 rounded-[30px] bg-[#8a2be2] px-[22px] py-[10px] text-[13px] font-medium whitespace-nowrap text-white transition-all duration-[300ms]"
        style={{ opacity: toast ? 1 : 0 }}
        role="status"
      >
        {toast}
      </div>
    </div>
  );
}

/**
 * One tab's body. `active` is the legacy `.profile-tab-content` panel and the
 * six-tile skeleton is `loadForYouPhotos()` @36813 and friends, which all opened
 * with the same placeholder row.
 */
function TabPanel({
  loaded,
  onRetry,
  onOpen,
  variant = 'grid',
}: {
  loaded: Loaded<PoseVideo>;
  onRetry: () => void;
  onOpen: (video: PoseVideo) => void;
  variant?: 'grid' | 'stories';
}) {
  if (loaded.state === 'failed') return <TabError onRetry={onRetry} />;
  if (loaded.state === 'idle' || loaded.state === 'loading') {
    return (
      <div className={cx(variant === 'stories' ? 'grid grid-cols-2 gap-[3px] p-[4px]' : 'grid grid-cols-3 gap-[2px] p-[2px]')}>
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="aspect-[9/16] animate-pulse rounded-[4px] bg-[#1a1a1a]" />
        ))}
      </div>
    );
  }
  if (loaded.items.length === 0) {
    return <p className={EMPTY}>{variant === 'stories' ? 'No stories' : 'Nothing here yet'}</p>;
  }
  return <CreatorGrid videos={loaded.items} variant={variant} onOpen={onOpen} />;
}

function TabError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className={TAB_ERROR}>
      <i className="fas fa-circle-exclamation text-[26px] opacity-40" />
      <p>Couldn&apos;t load right now.</p>
      <button type="button" className={RETRY_BTN} onClick={onRetry}>
        Retry
      </button>
    </div>
  );
}
