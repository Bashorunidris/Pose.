'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { BuzzCard } from '../BuzzCard';
import { FeedLoader } from '../FeedLoader';
import { cx } from '../styles';
import { BuzzPeopleRows, BuzzPostRows, BuzzTagRows, BuzzTrendingSection } from './BuzzSearchResults';
import { Empty, HashtagsSection, RecentSearches, SectionHeader, UsersSection } from './SearchResults';
import * as UI from './search-ui';
import { fetchFollowingMap } from '@/lib/pose-app/feed';
import {
  setBuzzHit,
  setBuzzLike,
  setBuzzPass,
  setBuzzRepost,
  setFollow,
} from '@/lib/pose-app/interactions';
import { formatCount } from '@/lib/pose-app/profile';
import {
  BUZZ_HISTORY_TAB,
  buildBuzzHashtagData,
  buildBuzzPeople,
  buildBuzzTrendingData,
  filterBuzzPosts,
  getBuzzRecommendedSearches,
  loadBuzzPostsForSearch,
  queryUsers,
  SearchHistory,
  type BuzzPerson,
  type BuzzTagCount,
  type BuzzTrendingData,
  type HashtagCard,
  type RecommendedSearch,
  type SearchUser,
} from '@/lib/pose-app/search';
import type { BuzzPost } from '@/lib/pose-app/types';

type Tab = 'recent' | 'all' | 'trending' | 'posts' | 'people' | 'hashtags';

/** `#buzzSearchTabs` @82467 — note `All`, not `Recent`, is the landing tab. */
const TAB_DEFS: { key: Tab; label: string }[] = [
  { key: 'recent', label: 'Recent' },
  { key: 'all', label: 'All' },
  { key: 'trending', label: 'Trending' },
  { key: 'posts', label: 'Posts' },
  { key: 'people', label: 'Users' },
  { key: 'hashtags', label: 'Hashtags' },
];

type Results =
  | { kind: 'recent'; history: string[]; recommended: RecommendedSearch[] }
  | { kind: 'trending'; data: BuzzTrendingData }
  | {
      kind: 'all';
      query: string;
      history: string[];
      trending: BuzzTrendingData;
      people: BuzzPerson[];
      tags: BuzzTagCount[];
      posts: BuzzPost[];
    }
  | { kind: 'posts'; posts: BuzzPost[] }
  | { kind: 'people'; users: SearchUser[] }
  | { kind: 'hashtags'; hashtags: HashtagCard[] };

type Props = {
  uid: string | null;
  onClose: () => void;
  onToast: (message: string) => void;
  /** `openProfileFromSearch(uid, info, 'buzzs')` @79600 — lands on the creator's Buzz tab. */
  onOpenCreator: (userId: string, landingTab?: 'buzzs') => void;
  /** `openBuzzPostFromSearch()` @80498 — the shell shows the post in the Buzz feed. */
  onOpenBuzzPost: (post: BuzzPost) => void;
};

/**
 * The Buzz search overlay — `#buzzSearchOverlay` @82457, opened by
 * `openBuzzSearch()` @80067.
 *
 * Results refresh on every keystroke, exactly like `renderBuzzSearch()`. The
 * only difference from the For You overlay is the subject: this one searches the
 * `postedtweetdata` daily buckets (see `loadBuzzPostsForSearch()` for why it
 * reads a year of them) rather than the `videos` collection, so posts, people
 * and hashtags all come out of the buzz text itself.
 */
export function BuzzSearchOverlay({ uid, onClose, onToast, onOpenCreator, onOpenBuzzPost }: Props) {
  const [tab, setTab] = useState<Tab>('all');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Results | null>(null);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState<Record<string, boolean>>({});
  const [reloadKey, setReloadKey] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const requestRef = useRef(0);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  /** `renderBuzzSearch()` @80315 — the query and tab decide which slice is built. */
  const buildResults = useCallback(async (activeTab: Tab, activeQuery: string): Promise<Results> => {
    const q = activeQuery.trim().toLowerCase();
    const buzzs = await loadBuzzPostsForSearch();

    // Recent and Trending show their static content only while the box is empty;
    // typing on either falls through to real results, same as For You.
    if (!q && activeTab === 'recent') {
      return {
        kind: 'recent',
        history: SearchHistory.get(BUZZ_HISTORY_TAB),
        recommended: getBuzzRecommendedSearches(buzzs),
      };
    }
    if (!q && activeTab === 'trending') {
      return { kind: 'trending', data: buildBuzzTrendingData(buzzs) };
    }
    if (!q && activeTab === 'all') {
      // The All tab's default landing is Recent + Trending stacked.
      return {
        kind: 'all',
        query: '',
        history: SearchHistory.get(BUZZ_HISTORY_TAB),
        trending: buildBuzzTrendingData(buzzs),
        people: [],
        tags: [],
        posts: [],
      };
    }

    const posts = filterBuzzPosts(buzzs, activeQuery);

    if (activeTab === 'posts') return { kind: 'posts', posts };

    if (activeTab === 'people') {
      // The Users tab reads real profiles from the `users` collection, the same
      // read the For You overlay does, rather than the thin stubs the All tab
      // derives from buzz authors.
      const users = await queryUsers();
      const filtered = q
        ? users.filter((user) => `${user.username} ${user.name} ${user.bio}`.toLowerCase().includes(q))
        : users;
      return { kind: 'people', users: [...filtered].sort((a, b) => b.followers - a.followers) };
    }

    if (activeTab === 'hashtags') {
      const tags = buildBuzzHashtagData(buzzs, activeQuery);
      return {
        kind: 'hashtags',
        // `formatCount` matches the For You hashtag card, which renders the same
        // markup — the legacy Buzz tab showed a raw tally here and "1.2K" there.
        hashtags: tags.slice(0, 24).map(({ tag, count }) => ({
          tag: `#${tag.replace(/^#/, '')}`,
          posts: formatCount(count),
          featured: count > 20,
        })),
      };
    }

    return {
      kind: 'all',
      query: activeQuery.trim(),
      history: [],
      trending: { people: [], posts: [], hashtags: [] },
      people: buildBuzzPeople(buzzs).filter((person) => !q || person.name.toLowerCase().includes(q)),
      tags: buildBuzzHashtagData(buzzs, activeQuery),
      posts,
    };
  }, []);

  // One loader per (tab, query); the request token drops late answers.
  useEffect(() => {
    const token = requestRef.current + 1;
    requestRef.current = token;
    void Promise.resolve().then(async () => {
      setLoading(true);
      try {
        const built = await buildResults(tab, query);
        if (requestRef.current !== token) return;
        setResults(built);
      } catch (error) {
        console.error('❌ loading buzz search results:', error);
        if (requestRef.current === token) setResults(null);
      } finally {
        if (requestRef.current === token) setLoading(false);
      }
    });
  }, [tab, query, reloadKey, buildResults]);

  // `openBuzzSearch()` left the Follow button on a user card as a literal no-op
  // (`onclick="event.stopPropagation();"` @80281); wiring it up here is a
  // deliberate change, matching the For You overlay.
  useEffect(() => {
    if (!uid) return;
    void Promise.resolve().then(async () => {
      try {
        setFollowing(await fetchFollowingMap(uid));
      } catch (error) {
        console.warn('⚠️ could not read the following map:', error);
      }
    });
  }, [uid]);

  const commit = (value: string) => {
    setQuery(value);
    SearchHistory.add(BUZZ_HISTORY_TAB, value);
    inputRef.current?.blur();
  };

  const clearHistoryEntry = (entry: string) => {
    SearchHistory.remove(BUZZ_HISTORY_TAB, entry);
    setReloadKey((value) => value + 1);
  };

  const openPerson = (userId: string) => {
    onClose();
    onOpenCreator(userId, 'buzzs');
  };

  const openPost = (post: BuzzPost) => {
    onClose();
    onOpenBuzzPost(post);
  };

  const toggleFollow = (user: SearchUser) => {
    if (!uid) {
      onToast('Please log in to follow');
      return;
    }
    const next = !following[user.id];
    setFollowing((current) => ({ ...current, [user.id]: next }));
    void setFollow(user.id, uid, next);
  };

  /** The Posts tab's cards are live, so votes patch the built result in place. */
  const patchPost = (post: BuzzPost, changes: Partial<BuzzPost>) => {
    setResults((current) =>
      current?.kind === 'posts'
        ? {
            ...current,
            posts: current.posts.map((item) => (item.id === post.id ? { ...item, ...changes } : item)),
          }
        : current,
    );
  };

  const handleLike = (post: BuzzPost, next: boolean, count: number) => {
    if (!uid || !post.date) return;
    patchPost(post, { likes: count, likedBy: { ...(post.likedBy ?? {}), [uid]: next } });
    void setBuzzLike(post.id, post.date, uid, next, count);
  };

  const handleRepost = (post: BuzzPost, next: boolean, count: number) => {
    if (!uid || !post.date) return;
    patchPost(post, { reposts: count, repostedBy: { ...(post.repostedBy ?? {}), [uid]: next } });
    void setBuzzRepost(post.id, post.date, uid, next, count);
  };

  const handleVote = (post: BuzzPost, vote: 'hit' | 'pass', next: boolean) => {
    if (!uid || !post.date) return;
    const key = vote === 'hit' ? 'buzzhitBy' : 'buzzpassBy';
    const otherKey = vote === 'hit' ? 'buzzpassBy' : 'buzzhitBy';
    patchPost(post, {
      [key]: { ...(post[key] ?? {}), [uid]: next },
      [otherKey]: Object.fromEntries(
        Object.entries({ ...(post[otherKey] ?? {}), [uid]: undefined }).filter(
          ([id, value]) => id !== uid && value !== undefined,
        ),
      ),
    });
    const write = vote === 'hit' ? setBuzzHit : setBuzzPass;
    void write(post.id, post.date, uid, next).then((counts) => {
      if (counts) patchPost(post, counts);
    });
  };

  const allTotal =
    results?.kind === 'all'
      ? results.posts.length + results.people.length + results.tags.length
      : 0;

  return (
    <div className={UI.OVERLAY}>
      <div className={UI.CONTAINER}>
        <div className={UI.HEADER}>
          <button type="button" className={UI.BACK_BTN} onClick={onClose} aria-label="Close search">
            <i className="fas fa-arrow-left" />
          </button>
          <div className={UI.INPUT_WRAP}>
            <input
              ref={inputRef}
              type="text"
              className={UI.INPUT}
              placeholder="Search buzzs, people, #tags..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') commit(query);
              }}
            />
            {query && (
              <button type="button" className={UI.CLEAR_BTN} onClick={() => setQuery('')} aria-label="Clear">
                <i className="fas fa-times" />
              </button>
            )}
          </div>
        </div>

        <div className={UI.TABS}>
          {TAB_DEFS.map((entry) => (
            <button
              key={entry.key}
              type="button"
              className={cx(UI.TAB, tab === entry.key && UI.TAB_ACTIVE)}
              onClick={() => setTab(entry.key)}
            >
              {entry.label}
            </button>
          ))}
        </div>

        <div className={UI.CONTENT}>
          {loading ? (
            <FeedLoader />
          ) : !results ? (
            <div className={UI.TAB_ERROR}>
              <i className="fas fa-circle-exclamation text-[26px] opacity-40" />
              <p>Error loading content</p>
              <button type="button" className={UI.RETRY_BTN} onClick={() => setReloadKey((value) => value + 1)}>
                Retry
              </button>
            </div>
          ) : results.kind === 'recent' ? (
            <>
              <RecentSearches
                history={results.history}
                onSelect={setQuery}
                onClear={() => {
                  SearchHistory.clear(BUZZ_HISTORY_TAB);
                  setReloadKey((value) => value + 1);
                }}
                onRemove={clearHistoryEntry}
              />
              {results.recommended.length > 0 && (
                <div className={UI.SECTION}>
                  <SectionHeader>
                    <i className="fas fa-wand-magic-sparkles mr-[6px]" />
                    Recommended For You
                  </SectionHeader>
                  <div className={UI.TRENDING_LIST}>
                    {results.recommended.map((item) => (
                      <div key={item.tag} className={UI.TRENDING_ITEM} onClick={() => setQuery(item.tag)}>
                        <span className={UI.TRENDING_ICON} style={{ color: '#8b5cf6' }}>
                          #
                        </span>
                        <div>
                          <div className={UI.TRENDING_NAME}>{item.tag}</div>
                          <div className={UI.TRENDING_COUNT}>{item.posts} posts</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {results.history.length === 0 && results.recommended.length === 0 && (
                <div className={UI.RECENT_EMPTY}>
                  <i className="fas fa-clock mb-[12px] block text-[40px] opacity-40" />
                  <div className="text-[14px]">Your recent searches will show up here</div>
                </div>
              )}
            </>
          ) : results.kind === 'trending' ? (
            <BuzzTrendingSection
              data={results.data}
              onOpenPerson={(person) => openPerson(person.uid)}
              onOpenPost={openPost}
              onSelectTag={setQuery}
            />
          ) : results.kind === 'all' ? (
            !results.query ? (
              <>
                <RecentSearches
                  history={results.history}
                  onSelect={setQuery}
                  onClear={() => {
                    SearchHistory.clear(BUZZ_HISTORY_TAB);
                    setReloadKey((value) => value + 1);
                  }}
                  onRemove={clearHistoryEntry}
                />
                <BuzzTrendingSection
                  data={results.trending}
                  onOpenPerson={(person) => openPerson(person.uid)}
                  onOpenPost={openPost}
                  onSelectTag={setQuery}
                />
              </>
            ) : allTotal === 0 ? (
              <Empty>No results found</Empty>
            ) : (
              <>
                <BuzzPeopleRows people={results.people} onOpen={(person) => openPerson(person.uid)} />
                <BuzzTagRows tags={results.tags} onSelect={setQuery} />
                <BuzzPostRows posts={results.posts} onOpen={openPost} />
              </>
            )
          ) : results.kind === 'posts' ? (
            results.posts.length === 0 ? (
              <Empty>No results found</Empty>
            ) : (
              <div className={UI.SECTION}>
                <SectionHeader>Posts ({results.posts.length})</SectionHeader>
                <div className={UI.BUZZ_POSTS_GRID}>
                  {results.posts.slice(0, 30).map((post) => {
                    const authorId = post.userId;
                    return (
                    <div
                      key={post.id}
                      className={UI.BUZZ_GRID_CARD}
                      onClick={(event) => {
                        // The card's own controls are real buttons; a press on one
                        // must not also count as "open this post".
                        if ((event.target as HTMLElement).closest('button, video, audio, a')) return;
                        openPost(post);
                      }}
                    >
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
                        onOpenAuthor={authorId ? () => openPerson(authorId) : undefined}
                      />
                    </div>
                    );
                  })}
                </div>
              </div>
            )
          ) : results.kind === 'people' ? (
            <UsersSection
              users={results.users}
              following={following}
              onOpen={(user) => openPerson(user.id)}
              onFollow={toggleFollow}
            />
          ) : (
            <HashtagsSection hashtags={results.hashtags} onSelect={setQuery} />
          )}
        </div>
      </div>
    </div>
  );
}
