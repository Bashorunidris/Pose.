'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { FeedLoader } from '../FeedLoader';
import { ForYouCard } from '../ForYouCard';
import { cx } from '../styles';
import {
  Empty,
  HashtagsSection,
  PhotosSection,
  RecentSearches,
  SectionHeader,
  SoundsSection,
  TrendingList,
  TrendsSection,
  UsersSection,
  VideosSection,
} from './SearchResults';
import * as UI from './search-ui';
import { fetchFollowingMap } from '@/lib/pose-app/feed';
import { withVote } from '@/lib/pose-app/format';
import { setFollow, setVideoLike, setVideoRepost } from '@/lib/pose-app/interactions';
import { formatCount } from '@/lib/pose-app/profile';
import {
  buildHashtagData,
  buildSearchSuggestions,
  buildTrendingData,
  engagementOf,
  getRecommendedSearches,
  queryAllPosts,
  queryPosts,
  queryTopSounds,
  queryUsers,
  SearchHistory,
  type DateRange,
  type HashtagCard,
  type RecommendedSearch,
  type SearchPhoto,
  type SearchPost,
  type SearchSound,
  type SearchSuggestion,
  type SearchUser,
  type SearchVideo,
  type TrendingData,
} from '@/lib/pose-app/search';
import type { PoseVideo } from '@/lib/pose-app/types';

type Tab = 'recent' | 'trends' | 'top' | 'users' | 'videos' | 'photos' | 'sounds' | 'hashtags';

/** `#searchInterfaceOverlay`'s tab strip @82500. */
const TAB_DEFS: { key: Tab; label: string }[] = [
  { key: 'recent', label: 'Recent' },
  { key: 'trends', label: 'Trends' },
  { key: 'top', label: 'Top' },
  { key: 'users', label: 'Users' },
  { key: 'videos', label: 'Videos' },
  { key: 'photos', label: 'Photos' },
  { key: 'sounds', label: 'Sounds' },
  { key: 'hashtags', label: 'Hashtags' },
];

/** The tab key the history is stored under — `SearchHistory.add('forYou', …)` @80766. */
const HISTORY_TAB = 'forYou';

type Results =
  | { kind: 'recent'; history: string[]; recommended: RecommendedSearch[] }
  | { kind: 'trending'; data: TrendingData }
  | { kind: 'trends'; data: TrendingData }
  | {
      kind: 'top';
      users: SearchUser[];
      videos: SearchVideo[];
      photos: SearchPhoto[];
      sounds: SearchSound[];
      hashtags: HashtagCard[];
    }
  | { kind: 'users'; users: SearchUser[] }
  | { kind: 'videos'; videos: SearchVideo[] }
  | { kind: 'photos'; photos: SearchPhoto[] }
  | { kind: 'sounds'; sounds: SearchSound[] }
  | { kind: 'hashtags'; hashtags: HashtagCard[] };

type Props = {
  uid: string | null;
  displayName: string;
  email: string;
  onClose: () => void;
  onToast: (message: string) => void;
  /** `openProfileFromSearch()` @79600 hands the user card off to the profile route. */
  onOpenCreator: (userId: string) => void;
  /** The shell hosts the comment sheet, so a played result can open it. */
  onOpenComments?: (video: PoseVideo) => void;
};

/**
 * The For You search overlay — `#searchInterfaceOverlay` @82481.
 *
 * Results refresh on every keystroke, exactly like `updateSearchQuery()` @80619,
 * so the only debounce is the 1.2s history write.
 */
export function SearchOverlay({
  uid,
  displayName,
  email,
  onClose,
  onToast,
  onOpenCreator,
  onOpenComments,
}: Props) {
  const [tab, setTab] = useState<Tab>('recent');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Results | null>(null);
  const [loading, setLoading] = useState(true);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [range, setRange] = useState<DateRange>('today');
  const [filtersVisible, setFiltersVisible] = useState(true);
  const [following, setFollowing] = useState<Record<string, boolean>>({});
  const [played, setPlayed] = useState<PoseVideo | null>(null);
  const [playedFollowing, setPlayedFollowing] = useState(false);
  const [playedFollowers, setPlayedFollowers] = useState<number | null>(null);
  /** Bumped by the error state's Retry to re-run the current loader. */
  const [reloadKey, setReloadKey] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const trendScrollerRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef(0);
  const suggestionRef = useRef(0);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // `fetchFollowingMap` is the same read `hydrateForYouFollowState()` used, so the
  // Follow buttons on user cards reflect reality. The legacy card's button was a
  // no-op (`onclick="event.stopPropagation();"` @80973); wiring it up is a
  // deliberate change, not an oversight.
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

  /** `renderSearchContent()` @80787 — the query and tab decide which loader runs. */
  const buildResults = useCallback(
    async (activeTab: Tab, activeQuery: string): Promise<Results> => {
      const q = activeQuery.trim().toLowerCase();

      if (!q) {
        if (activeTab === 'recent') {
          const posts = await queryAllPosts().catch(() => [] as SearchPost[]);
          return {
            kind: 'recent',
            history: SearchHistory.get(HISTORY_TAB),
            recommended: getRecommendedSearches(HISTORY_TAB, posts),
          };
        }
        if (activeTab !== 'trends') {
          return { kind: 'trending', data: buildTrendingData(await queryAllPosts()) };
        }
      }

      if (activeTab === 'trends') {
        const posts = await queryAllPosts();
        const filtered = q
          ? posts.filter((post) => {
              const content = String(post['caption'] ?? post['title'] ?? '').toLowerCase();
              const tags = (Array.isArray(post['hashtags']) ? post['hashtags'] : [String(post['hashtags'] ?? '')])
                .join(' ')
                .toLowerCase();
              return content.includes(q) || tags.includes(q);
            })
          : posts;
        return { kind: 'trends', data: buildTrendingData(filtered) };
      }

      if (activeTab === 'users') {
        const users = await queryUsers();
        return { kind: 'users', users: q ? users.filter((user) => matchesUser(user, q)) : users };
      }

      if (activeTab === 'videos') {
        const videos = await queryPosts('video');
        return {
          kind: 'videos',
          videos: q
            ? videos.filter((video) => {
                const raw = video.raw;
                return [video.title, video.username, raw['description'], raw['hashtags'], raw['tags']]
                  .map((value) => String(value ?? '').toLowerCase())
                  .some((value) => value.includes(q));
              })
            : videos,
        };
      }

      if (activeTab === 'photos') {
        const photos = await queryPosts('photo');
        return {
          kind: 'photos',
          photos: q
            ? photos.filter((photo) => {
                const raw = photo.raw;
                return [photo.caption, photo.username, raw['description'], raw['hashtags'], raw['tags']]
                  .map((value) => String(value ?? '').toLowerCase())
                  .some((value) => value.includes(q));
              })
            : photos,
        };
      }

      if (activeTab === 'sounds') {
        const sounds = await queryTopSounds();
        return {
          kind: 'sounds',
          sounds: q
            ? sounds.filter((sound) => `${sound.title} ${sound.artist}`.toLowerCase().includes(q))
            : sounds,
        };
      }

      if (activeTab === 'hashtags') {
        return { kind: 'hashtags', hashtags: buildHashtagData(await queryAllPosts()) };
      }

      // `top` — a curated cross-category reel, capped per type.
      const allPosts = await queryAllPosts();
      const users = await queryUsers();
      const sounds = await queryTopSounds();
      const posts = q
        ? allPosts.filter((post) =>
            [post['caption'], post['title'], post['hashtags'], post['tags'], post['username'], post['userName']]
              .map((value) => String(value ?? '').toLowerCase())
              .some((value) => value.includes(q)),
          )
        : allPosts;

      const isPhoto = (post: SearchPost) => post['type'] === 'photo' || post['isPhoto'] === true;
      const videos = posts.filter((post) => !isPhoto(post)).sort((a, b) => engagementOf(b) - engagementOf(a));
      const photos = posts.filter(isPhoto).sort((a, b) => engagementOf(b) - engagementOf(a));
      const toVideo = (post: SearchPost): SearchVideo => ({
        id: post.id,
        username: String(post['username'] ?? post['userName'] ?? 'Unknown'),
        title: String(post['title'] ?? post['caption'] ?? 'Untitled'),
        thumbnail: String(post['thumbnailUrl'] ?? post['thumbnailURL'] ?? post['thumbnail'] ?? post['videoUrl'] ?? ''),
        avatar: String(post['userProfilePic'] ?? ''),
        views: formatCount(post['views'] ?? post['viewCount'] ?? 0),
        duration: '',
        likes: formatCount(post['likeCount'] ?? 0),
        comments: formatCount(post['comments'] ?? 0),
        raw: post,
      });
      const toPhoto = (post: SearchPost): SearchPhoto => {
        const images = Array.isArray(post['images']) ? (post['images'] as unknown[]) : [];
        return {
          id: post.id,
          username: String(post['username'] ?? post['userName'] ?? 'Unknown'),
          caption: String(post['caption'] ?? post['title'] ?? 'Photo'),
          image: String(
            post['thumbnailUrl'] ?? post['thumbnailURL'] ?? post['thumbnail'] ?? post['coverImage'] ??
              post['photoUrl'] ?? post['imageUrl'] ?? images[0] ?? '',
          ),
          avatar: String(post['userProfilePic'] ?? ''),
          views: formatCount(post['views'] ?? post['viewCount'] ?? 0),
          photoCount: images.length,
          likes: formatCount(post['likeCount'] ?? 0),
          raw: post,
        };
      };

      return {
        kind: 'top',
        users: (q ? users.filter((user) => matchesUser(user, q)) : users)
          .sort((a, b) => b.followers - a.followers)
          .slice(0, 6),
        videos: videos.slice(0, 10).map(toVideo),
        photos: photos.slice(0, 10).map(toPhoto),
        sounds: (q
          ? sounds.filter((sound) => `${sound.title} ${sound.artist}`.toLowerCase().includes(q))
          : sounds
        ).slice(0, 5),
        hashtags: buildHashtagData(posts),
      };
    },
    [],
  );

  // One loader per (tab, query). The request token drops late answers, the same
  // job the legacy stale guard did for suggestions. The Trends date filter is
  // deliberately absent from the deps: `buildTrendingData()` always computes all
  // four ranges at once, so `updateDateRange()` @80767 only ever re-picked from
  // data it already had.
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
        console.error('❌ loading search results:', error);
        if (requestRef.current === token) setResults(null);
      } finally {
        if (requestRef.current === token) setLoading(false);
      }
    });
  }, [tab, query, reloadKey, buildResults]);

  // `renderSearchSuggestions()` @80682, including its "bail if the input moved on"
  // guard while the one-per-session index loads.
  useEffect(() => {
    const token = suggestionRef.current + 1;
    suggestionRef.current = token;
    void Promise.resolve().then(async () => {
      try {
        const rows = await buildSearchSuggestions(query, SearchHistory.get(HISTORY_TAB));
        if (suggestionRef.current !== token) return;
        setSuggestions(rows);
        setSuggestionsOpen(rows.length > 0);
      } catch (error) {
        console.warn('Search suggestions failed to load:', error);
        if (suggestionRef.current === token) {
          setSuggestions([]);
          setSuggestionsOpen(false);
        }
      }
    });
  }, [query]);

  // `_searchHistorySaveTimer` @80614 — a saved query only, never a keystroke.
  useEffect(() => {
    const value = query.trim();
    if (value.length < 2) return;
    const timer = setTimeout(() => SearchHistory.add(HISTORY_TAB, value), 1200);
    return () => clearTimeout(timer);
  }, [query]);

  // `startAutoScroll()` @81326 — the trends row drifts on its own, reverses at
  // each end, and yields while the pointer is over it.
  useEffect(() => {
    if (tab !== 'trends' || loading) return;
    const node = trendScrollerRef.current;
    if (!node) return;

    let direction = 1;
    let pausedUntil = 0;
    let hovered = false;
    const step = () => {
      if (hovered || Date.now() < pausedUntil) return;
      node.scrollLeft += direction;
      const max = node.scrollWidth - node.clientWidth;
      if (node.scrollLeft >= max) {
        direction = -1;
        pausedUntil = Date.now() + 2000;
      } else if (node.scrollLeft <= 0) {
        direction = 1;
        pausedUntil = Date.now() + 2000;
      }
    };
    const enter = () => {
      hovered = true;
    };
    const leave = () => {
      hovered = false;
    };
    node.addEventListener('mouseenter', enter);
    node.addEventListener('mouseleave', leave);
    const timer = setInterval(step, 30);
    return () => {
      clearInterval(timer);
      node.removeEventListener('mouseenter', enter);
      node.removeEventListener('mouseleave', leave);
    };
  }, [tab, loading, results]);

  const commit = (value: string) => {
    setQuery(value);
    SearchHistory.add(HISTORY_TAB, value);
    setSuggestionsOpen(false);
    inputRef.current?.blur();
  };

  const openUser = (user: SearchUser) => {
    // `openProfileFromSearch()` closed the overlay before opening the profile.
    onClose();
    onOpenCreator(user.id);
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

  /**
   * `openSearchVideoFullscreen()` @81134 fed the results into the For You feed so
   * the viewer could scroll to the next match. That feed cannot be injected with
   * foreign posts in the port, so a result plays in the ported card in place —
   * the same player the Trend modal uses — and scrolling to the next result is
   * still to come.
   */
  const openResult = (raw: SearchPost) => {
    setPlayed({ ...(raw as unknown as PoseVideo), id: raw.id });
    setPlayedFollowing(false);
    setPlayedFollowers(null);
  };

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
              placeholder="Search videos, photos, *startags..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') commit(query);
              }}
              onFocus={() => setSuggestionsOpen(suggestions.length > 0)}
              onBlur={() => setTimeout(() => setSuggestionsOpen(false), 150)}
            />
            {query && (
              <button type="button" className={UI.CLEAR_BTN} onClick={() => setQuery('')} aria-label="Clear">
                <i className="fas fa-times" />
              </button>
            )}
            {suggestionsOpen && suggestions.length > 0 && (
              <div className={UI.SUGGESTIONS}>
                {suggestions.map((suggestion, index) => (
                  <div
                    key={`${suggestion.label}-${index}`}
                    className={UI.SUGGESTION_ITEM}
                    onMouseDown={(event) => {
                      event.preventDefault();
                      commit(suggestion.label);
                    }}
                  >
                    <span className={UI.SUGGESTION_ICON}>
                      <i
                        className={cx(
                          'fas',
                          suggestion.kind === 'recent'
                            ? 'fa-clock'
                            : suggestion.kind === 'tag'
                              ? 'fa-hashtag'
                              : 'fa-magnifying-glass',
                        )}
                      />
                    </span>
                    <span className={UI.SUGGESTION_TEXT}>{highlight(suggestion, query)}</span>
                    <span className={UI.SUGGESTION_META}>{suggestion.meta}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className={UI.TABS}>
          {TAB_DEFS.map((entry) => (
            <button
              key={entry.key}
              type="button"
              className={cx(UI.TAB, tab === entry.key && UI.TAB_ACTIVE)}
              onClick={() => {
                setTab(entry.key);
                setSuggestionsOpen(false);
              }}
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
              <button
                type="button"
                className={UI.RETRY_BTN}
                onClick={() => setReloadKey((value) => value + 1)}
              >
                Retry
              </button>
            </div>
          ) : results.kind === 'recent' ? (
            <RecentSearches
              history={results.history}
              onSelect={setQuery}
              onClear={() => {
                SearchHistory.clear(HISTORY_TAB);
                setResults({ ...results, history: [] });
              }}
              onRemove={(entry) => {
                SearchHistory.remove(HISTORY_TAB, entry);
                setResults({ ...results, history: SearchHistory.get(HISTORY_TAB) });
              }}
            />
          ) : results.kind === 'trending' ? (
            <div className={UI.SECTION}>
              <SectionHeader>
                <i className="fas fa-fire mr-[6px]" />
                Trending Now
              </SectionHeader>
              {results.data.trending.length === 0 ? (
                <Empty>No trending content yet</Empty>
              ) : (
                <TrendingList items={results.data.trending} onSelect={setQuery} />
              )}
            </div>
          ) : results.kind === 'trends' ? (
            <TrendsSection
              data={results.data}
              range={range}
              filtersVisible={filtersVisible}
              onToggleFilters={() => setFiltersVisible((value) => !value)}
              onRange={setRange}
              onSelect={setQuery}
              scrollerRef={trendScrollerRef}
            />
          ) : results.kind === 'top' ? (
            <>
              <UsersSection users={results.users} following={following} onOpen={openUser} onFollow={toggleFollow} />
              <VideosSection videos={results.videos} onOpen={(video) => openResult(video.raw)} />
              <PhotosSection photos={results.photos} onOpen={(photo) => openResult(photo.raw)} />
              <SoundsSection sounds={results.sounds} />
              <HashtagsSection hashtags={results.hashtags} onSelect={setQuery} />
            </>
          ) : results.kind === 'users' ? (
            <UsersSection users={results.users} following={following} onOpen={openUser} onFollow={toggleFollow} />
          ) : results.kind === 'videos' ? (
            <VideosSection videos={results.videos} onOpen={(video) => openResult(video.raw)} />
          ) : results.kind === 'photos' ? (
            <PhotosSection photos={results.photos} onOpen={(photo) => openResult(photo.raw)} />
          ) : results.kind === 'sounds' ? (
            <SoundsSection sounds={results.sounds} />
          ) : (
            <HashtagsSection hashtags={results.hashtags} onSelect={setQuery} />
          )}
        </div>
      </div>

      {played && (
        <div className="fixed inset-0 z-[4000] bg-black">
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
            onOpenComments={onOpenComments}
            onOpenProfile={(targetUserId) => {
              setPlayed(null);
              onClose();
              onOpenCreator(targetUserId);
            }}
            onToggleLike={(video, liked, nextCount) => {
              setPlayed((previous) =>
                previous ? { ...previous, likeCount: nextCount, likes: withVote(previous.likes, uid, liked) } : previous,
              );
              if (uid) void setVideoLike(video.id, uid, liked, nextCount);
            }}
            onToggleRepost={(video, reposted, nextCount) => {
              setPlayed((previous) =>
                previous
                  ? { ...previous, repostCount: nextCount, reposts: withVote(previous.reposts, uid, reposted) }
                  : previous,
              );
              if (uid) void setVideoRepost(video.id, uid, reposted, nextCount);
            }}
            onToggleFollow={(targetUserId) => {
              if (!uid || !targetUserId) return;
              const next = !playedFollowing;
              setPlayedFollowing(next);
              setPlayedFollowers((previous) => (previous === null ? previous : Math.max(0, previous + (next ? 1 : -1))));
              void setFollow(targetUserId, uid, next);
            }}
          />
          <button
            type="button"
            className="absolute top-[16px] right-[16px] z-[10] flex h-[36px] w-[36px] items-center justify-center rounded-full border-none bg-white/20 text-white"
            onClick={() => setPlayed(null)}
            aria-label="Close video"
          >
            <i className="fas fa-times" />
          </button>
        </div>
      )}

    </div>
  );
}

function matchesUser(user: SearchUser, q: string): boolean {
  return `${user.username} ${user.name} ${user.bio}`.toLowerCase().includes(q);
}

/** The bolded match `renderSearchSuggestions()` produced with an inline `<b>`. */
function highlight(suggestion: SearchSuggestion, rawQuery: string) {
  const q = rawQuery.trim();
  const { label, matchIndex, kind } = suggestion;
  if (kind === 'recent' || matchIndex < 0 || !q) return label;
  const end = matchIndex + q.length;
  return (
    <>
      {label.slice(0, matchIndex)}
      <span className={UI.SUGGESTION_MATCH}>{label.slice(matchIndex, end)}</span>
      {label.slice(end)}
    </>
  );
}
