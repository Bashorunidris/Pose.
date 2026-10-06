'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { ForYouCard } from './ForYouCard';
import { FeedLoader } from './FeedLoader';
import { VIDEO_FEED, cx } from './styles';
import {
  cacheForYouVideos,
  fetchFollowerCounts,
  fetchFollowingMap,
  fetchForYouPage,
  getCachedForYouVideos,
} from '@/lib/pose-app/feed';
import { setFollow, setVideoLike, setVideoRepost } from '@/lib/pose-app/interactions';
import { withVote } from '@/lib/pose-app/format';
import type { PoseVideo } from '@/lib/pose-app/types';
import type { QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';

type Props = {
  uid: string | null;
  active: boolean;
};

const NEAR_BOTTOM_PX = 900;

export function ForYouFeed({ uid, active }: Props) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<QueryDocumentSnapshot<DocumentData> | null>(null);
  const loadingRef = useRef(false);
  const [videos, setVideos] = useState<PoseVideo[]>([]);
  const [following, setFollowing] = useState<Record<string, boolean>>({});
  const [followers, setFollowers] = useState<Record<string, number>>({});
  const [state, setState] = useState<'loading' | 'ready' | 'failed'>('loading');

  const load = useCallback(async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    try {
      const page = await fetchForYouPage(cursorRef.current);
      cursorRef.current = page.lastDoc;
      setVideos((previous) => {
        const seen = new Set(previous.map((item) => item.id));
        const merged = [...previous, ...page.videos.filter((item) => !seen.has(item.id))];
        cacheForYouVideos(merged);
        return merged;
      });
      setState('ready');
    } catch (error) {
      console.error('❌ loading the For You feed:', error);
      setState((previous) => (previous === 'ready' ? previous : 'failed'));
    } finally {
      loadingRef.current = false;
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    // The cache read is deferred a microtask so the first paint matches the
    // server render (always the loader) and hydration cannot see two different
    // trees. `load()` only ever runs when there is nothing cached to show.
    void Promise.resolve(getCachedForYouVideos()).then((cached) => {
      if (cancelled) return;
      if (cached?.length) {
        setVideos(cached);
        setState('ready');
        return;
      }
      return load();
    });
    return () => {
      cancelled = true;
    };
  }, [load]);

  useEffect(() => {
    let cancelled = false;
    const request: Promise<Record<string, boolean>> = uid
      ? fetchFollowingMap(uid)
      : Promise.resolve<Record<string, boolean>>({});
    void request.then((map) => {
      if (!cancelled) setFollowing(map);
    });
    return () => {
      cancelled = true;
    };
  }, [uid]);

  useEffect(() => {
    const pending = [...new Set(videos.map((video) => video.userId ?? ''))]
      .filter((id) => id !== '' && uid !== id && !(id in followers));
    if (pending.length === 0) return;
    let cancelled = false;
    void fetchFollowerCounts(pending).then((counts) => {
      if (!cancelled) setFollowers((previous) => ({ ...previous, ...counts }));
    });
    return () => {
      cancelled = true;
    };
  }, [videos, followers, uid]);

  useEffect(() => {
    const node = scrollerRef.current;
    if (!node) return;
    const onScroll = () => {
      if (node.scrollTop + node.clientHeight >= node.scrollHeight - NEAR_BOTTOM_PX) void load();
    };
    node.addEventListener('scroll', onScroll, { passive: true });
    return () => node.removeEventListener('scroll', onScroll);
    // `state` is a dependency because the scroller only mounts once the feed is
    // on screen: while it shows the loader or the retry card this effect would
    // otherwise run against a null ref and infinite scroll would never attach.
  }, [load, state]);

  const patch = (videoId: string, changes: Partial<PoseVideo>) => {
    setVideos((previous) =>
      previous.map((item) => (item.id === videoId ? { ...item, ...changes } : item)),
    );
  };

  const handleLike = (video: PoseVideo, liked: boolean, nextCount: number) => {
    patch(video.id, { likeCount: nextCount, likes: withVote(video.likes, uid, liked) });
    if (uid) void setVideoLike(video.id, uid, liked, nextCount);
  };

  const handleRepost = (video: PoseVideo, reposted: boolean, nextCount: number) => {
    patch(video.id, { repostCount: nextCount, reposts: withVote(video.reposts, uid, reposted) });
    if (uid) void setVideoRepost(video.id, uid, reposted, nextCount);
  };

  const handleFollow = (targetUserId: string) => {
    if (!uid || !targetUserId) return;
    const next = !following[targetUserId];
    setFollowing((previous) => ({ ...previous, [targetUserId]: next }));
    setFollowers((previous) => {
      const count = previous[targetUserId];
      return count === undefined ? previous : { ...previous, [targetUserId]: Math.max(0, count + (next ? 1 : -1)) };
    });
    void setFollow(targetUserId, uid, next);
  };

  if (state === 'loading' && videos.length === 0) {
    return <FeedLoader />;
  }

  if (state === 'failed') {
    return (
      <div
        className={cx(
          VIDEO_FEED,
          'flex items-center justify-center bg-app-black text-[14px] text-app-muted',
        )}
      >
        <div className="text-center">
          <p className="mb-[12px]">Could not load the feed.</p>
          <button
            type="button"
            className="rounded-[6px] bg-app-interact px-[16px] py-[8px] text-[13px] font-semibold text-white"
            onClick={() => void load()}
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  // Legacy @39992 replaces the feed with a centred message when the read comes
  // back empty; without it the scroller is a blank black screen forever.
  if (videos.length === 0) {
    return (
      <div className={cx(VIDEO_FEED, 'bg-app-black')}>
        <div className="flex h-[100vh] flex-col items-center justify-center gap-[20px] text-[15px] text-[#aaa] md:h-full">
          <p>No videos available</p>
          <button
            type="button"
            className="rounded-[4px] bg-pose-purple-deep px-[20px] py-[10px] text-[14px] text-white"
            onClick={() => void load()}
          >
            Reload
          </button>
        </div>
      </div>
    );
  }

  return (
    <div ref={scrollerRef} className={VIDEO_FEED}>
      {videos.map((video) => (
        <ForYouCard
          key={video.id}
          video={video}
          uid={uid}
          active={active}
          following={Boolean(video.userId && following[video.userId])}
          followers={video.userId ? (followers[video.userId] ?? null) : null}
          onToggleLike={handleLike}
          onToggleRepost={handleRepost}
          onToggleFollow={handleFollow}
        />
      ))}
    </div>
  );
}
