'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { BuzzCard } from './BuzzCard';
import { BUZZ_PAGE, cx } from './styles';
import {
  cacheBuzzPosts,
  clearBuzzFeedCache,
  fetchBuzzPosts,
  getCachedBuzzPosts,
} from '@/lib/pose-app/feed';
import { setBuzzHit, setBuzzLike, setBuzzPass, setBuzzRepost } from '@/lib/pose-app/interactions';
import type { BuzzPost } from '@/lib/pose-app/types';

type Props = {
  uid: string | null;
  active: boolean;
};

/** `startBuzzBackgroundLoader` polls the daily buckets every 12 seconds. */
const POLL_MS = 12_000;

export function BuzzFeed({ uid, active }: Props) {
  const loadedOnce = useRef(false);
  const [posts, setPosts] = useState<BuzzPost[]>([]);
  const [state, setState] = useState<'idle' | 'loading' | 'ready' | 'failed'>('idle');

  const refresh = useCallback(async (force: boolean) => {
    if (!force) {
      const cached = getCachedBuzzPosts();
      if (cached?.length) {
        setPosts(cached);
        setState('ready');
        return;
      }
    }
    try {
      const fresh = await fetchBuzzPosts();
      setPosts(fresh);
      setState('ready');
      // The legacy loader only caches a non-empty page: caching an empty array
      // would pin "No Buzz Yet" on screen for the whole 5 minute TTL.
      if (fresh.length > 0) cacheBuzzPosts(fresh);
      else clearBuzzFeedCache();
    } catch (error) {
      console.error('❌ loading buzz:', error);
      setState((previous) => (previous === 'ready' ? previous : 'failed'));
    }
  }, []);

  useEffect(() => {
    if (!active || loadedOnce.current) return;
    loadedOnce.current = true;
    setState('loading');
    void refresh(false);
  }, [active, refresh]);

  useEffect(() => {
    if (!active) return;
    const timer = setInterval(() => void refresh(true), POLL_MS);
    return () => clearInterval(timer);
  }, [active, refresh]);

  const patch = (post: BuzzPost, changes: Partial<BuzzPost>) => {
    setPosts((previous) =>
      previous.map((item) => (item.id === post.id && item.date === post.date ? { ...item, ...changes } : item)),
    );
  };

  const handleLike = (post: BuzzPost, next: boolean, count: number) => {
    if (!uid || !post.date) return;
    patch(post, { likes: count, likedBy: { ...(post.likedBy ?? {}), [uid]: next } });
    void setBuzzLike(post.id, post.date, uid, next, count);
  };

  const handleRepost = (post: BuzzPost, next: boolean, count: number) => {
    if (!uid || !post.date) return;
    patch(post, { reposts: count, repostedBy: { ...(post.repostedBy ?? {}), [uid]: next } });
    void setBuzzRepost(post.id, post.date, uid, next, count);
  };

  const handleVote = (post: BuzzPost, vote: 'hit' | 'pass', next: boolean) => {
    if (!uid || !post.date) return;
    const key = vote === 'hit' ? 'buzzhitBy' : 'buzzpassBy';
    const otherKey = vote === 'hit' ? 'buzzpassBy' : 'buzzhitBy';
    patch(post, {
      [key]: { ...(post[key] ?? {}), [uid]: next },
      [otherKey]: Object.fromEntries(
        Object.entries({ ...(post[otherKey] ?? {}), [uid]: undefined }).filter(
          ([id, value]) => id !== uid && value !== undefined,
        ),
      ),
    });
    const write = vote === 'hit' ? setBuzzHit : setBuzzPass;
    void write(post.id, post.date, uid, next).then((counts) => {
      if (counts) patch(post, counts);
    });
  };

  if (state === 'failed') {
    return (
      <div className={cx(BUZZ_PAGE, 'flex items-center justify-center text-[14px] text-app-muted')}>
        <div className="text-center">
          <p className="mb-[12px]">Could not load Buzz.</p>
          <button
            type="button"
            className="rounded-[6px] bg-app-interact px-[16px] py-[8px] text-[13px] font-semibold text-white"
            onClick={() => void refresh(true)}
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className={cx(BUZZ_PAGE, 'flex items-center justify-center')}>
        <div className="text-center text-app-muted">
          <i className="fas fa-comment-dots mb-[14px] block text-[42px] opacity-40" />
          <p className="text-[15px] font-semibold text-white">No Buzz Yet</p>
          <p className="mt-[6px] text-[13px]">
            {state === 'loading' ? 'Loading the last three days…' : 'Be the first to post something.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={BUZZ_PAGE}>
      <div className="p-0">
        {posts.map((post) => (
          <BuzzCard
            key={`${post.date}/${post.id}`}
            post={post}
            liked={Boolean(uid && post.likedBy?.[uid])}
            reposted={Boolean(uid && post.repostedBy?.[uid])}
            hit={Boolean(uid && post.buzzhitBy?.[uid])}
            passed={Boolean(uid && post.buzzpassBy?.[uid])}
            onToggleLike={handleLike}
            onToggleRepost={handleRepost}
            onToggleHit={(item, next) => handleVote(item, 'hit', next)}
            onTogglePass={(item, next) => handleVote(item, 'pass', next)}
          />
        ))}
      </div>
    </div>
  );
}
