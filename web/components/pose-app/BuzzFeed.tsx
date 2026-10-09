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
import { buzzCommentsKey } from '@/lib/pose-app/comments';
import { setBuzzHit, setBuzzLike, setBuzzPass, setBuzzRepost } from '@/lib/pose-app/interactions';
import type { BuzzPost } from '@/lib/pose-app/types';

type Props = {
  uid: string | null;
  active: boolean;
  /** Opens another creator's profile from a post's author block. */
  onOpenCreator?: (userId: string) => void;
  /**
   * A post picked out of Buzz search. `openBuzzPostFromSearch()` @80498 scrolled
   * the feed to the post, and prepended it when it fell outside the live window
   * (search reaches a year back, the feed only three days).
   */
  jumpTo?: BuzzPost | null;
  /** Clears `jumpTo` once the post has been revealed. */
  onJumpHandled?: () => void;
  /** The shell's comment tallies, keyed by `buzzCommentsKey()`. */
  commentCounts?: Record<string, number>;
  /** `openBuzzComments()` @33961 — the shell hosts the sheet. */
  onOpenComments?: (post: BuzzPost) => void;
};

/** `startBuzzBackgroundLoader` polls the daily buckets every 12 seconds. */
const POLL_MS = 12_000;

export function BuzzFeed({
  uid,
  active,
  onOpenCreator,
  jumpTo,
  onJumpHandled,
  commentCounts,
  onOpenComments,
}: Props) {
  const loadedOnce = useRef(false);
  const listRef = useRef<HTMLDivElement>(null);
  /** The post the next render should scroll to and flash, as `date/id`. */
  const pendingKey = useRef<string | null>(null);
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

  // `openBuzzPostFromSearch` awaited `loadBuzzTabFeed()` before injecting, so the
  // injection could not be overwritten by the page that was already in flight.
  useEffect(() => {
    if (!jumpTo || state !== 'ready') return;
    pendingKey.current = `${jumpTo.date}/${jumpTo.id}`;
    void Promise.resolve().then(() => {
      setPosts((previous) =>
        previous.some((item) => item.id === jumpTo.id && item.date === jumpTo.date)
          ? previous
          : [jumpTo, ...previous],
      );
      onJumpHandled?.();
    });
  }, [jumpTo, state, onJumpHandled]);

  // The legacy highlight: scroll to the post, ring it for a beat, move on.
  useEffect(() => {
    const key = pendingKey.current;
    if (!key) return;
    const node = listRef.current?.querySelector<HTMLElement>(`[data-buzz-key="${key}"]`);
    if (!node) return;
    pendingKey.current = null;
    node.scrollIntoView({ behavior: 'smooth', block: 'center' });
    node.style.transition = 'box-shadow 0.3s';
    node.style.boxShadow = '0 0 0 3px #8b5cf6';
    setTimeout(() => {
      node.style.boxShadow = '';
    }, 1800);
  }, [posts]);

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
      <div className="p-0" ref={listRef}>
        {posts.map((post) => (
          <div key={`${post.date}/${post.id}`} data-buzz-key={`${post.date}/${post.id}`}>
            <BuzzCard
              post={post}
              liked={Boolean(uid && post.likedBy?.[uid])}
              reposted={Boolean(uid && post.repostedBy?.[uid])}
              hit={Boolean(uid && post.buzzhitBy?.[uid])}
              passed={Boolean(uid && post.buzzpassBy?.[uid])}
              onToggleLike={handleLike}
              onToggleRepost={handleRepost}
              onToggleHit={(item, next) => handleVote(item, 'hit', next)}
              onTogglePass={(item, next) => handleVote(item, 'pass', next)}
              onOpenAuthor={
                onOpenCreator && post.userId ? () => onOpenCreator(post.userId ?? '') : undefined
              }
              commentCount={commentCounts?.[buzzCommentsKey(post)]}
              onOpenComments={onOpenComments}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
