'use client';

import { collection, getDocs, limit, orderBy, query } from 'firebase/firestore';

import { getPoseFirebase } from '@/lib/firebase';

import { getCachedBuzzPosts, toMillis } from './feed';
import { buzzAuthorName, interactionCount } from './format';
import { formatCount } from './profile';
import type { BuzzPost } from './types';

/**
 * The For You search overlay — `#searchInterfaceOverlay` @82481, opened by
 * `openSearchInterface()` @79753.
 *
 * Every tab reads the same `videos` collection the For You feed renders from
 * (`queryForYouSourcePosts()` @81682) rather than some parallel index, so a
 * result always corresponds to something the feed actually shows. The legacy
 * comment on that function is worth keeping in mind: an earlier version read the
 * unrelated `posevideosposted` collection and the results never matched the feed.
 */

/** One raw document from `videos`, plus its id. Field names are the legacy ones. */
export type SearchPost = Record<string, unknown> & { id: string };

export type SearchUser = {
  id: string;
  username: string;
  name: string;
  avatar: string;
  verified: boolean;
  followers: number;
  bio: string;
};

export type SearchVideo = {
  id: string;
  username: string;
  title: string;
  thumbnail: string;
  avatar: string;
  views: string;
  duration: string;
  likes: string;
  comments: string;
  raw: SearchPost;
};

export type SearchPhoto = {
  id: string;
  username: string;
  caption: string;
  image: string;
  avatar: string;
  views: string;
  photoCount: number;
  likes: string;
  raw: SearchPost;
};

export type SearchSound = {
  id: string;
  title: string;
  artist: string;
  thumbnail: string;
  usedIn: string;
  duration: string;
};

export type TrendHash = { tag: string; posts: string; type: 'hash' | 'star' };
export type TrendCard = {
  rank: number;
  tag: string;
  type: 'hash' | 'star';
  posts: string;
  change: 'up' | 'down';
  changePercent: string;
};
export type DateRange = 'today' | 'week' | 'month' | 'year';
export type TrendingData = { trending: TrendHash[]; trendingByDate: Record<DateRange, TrendCard[]> };
export type HashtagCard = { tag: string; posts: string; featured: boolean };

export type RecommendedSearch = { tag: string; posts: string };

/**
 * A suggestion row. The legacy version shipped an HTML string per row and
 * re-implemented the bolded match by hand; here the kind and the match offset
 * travel as data and the component does the markup.
 */
export type SearchSuggestion = {
  label: string;
  kind: 'tag' | 'text' | 'recent';
  /** Index of the query inside `label`, or -1 when it does not occur. */
  matchIndex: number;
  meta: string;
};

/* ── Recent searches ─────────────────────────────────────────── */

/** `RECENT_SEARCHES_VISIBLE` @79657 — the rest hide behind "See more". */
export const RECENT_SEARCHES_VISIBLE = 5;
const HISTORY_MAX = 10;

/**
 * The `SearchHistory` object @79623. Per-tab localStorage list, newest first,
 * case-insensitively de-duplicated.
 */
export const SearchHistory = {
  key(tab: string): string {
    return `recentSearch_${tab}`;
  },
  get(tab: string): string[] {
    try {
      const raw = localStorage.getItem(this.key(tab));
      const parsed = raw ? (JSON.parse(raw) as unknown) : [];
      return Array.isArray(parsed) ? (parsed as string[]) : [];
    } catch {
      return [];
    }
  },
  add(tab: string, value: string): void {
    const entry = (value || '').trim();
    if (!entry) return;
    try {
      const list = this.get(tab).filter((item) => item.toLowerCase() !== entry.toLowerCase());
      list.unshift(entry);
      localStorage.setItem(this.key(tab), JSON.stringify(list.slice(0, HISTORY_MAX)));
    } catch {
      /* storage full or blocked — the history is a convenience, not state */
    }
  },
  remove(tab: string, value: string): void {
    try {
      localStorage.setItem(
        this.key(tab),
        JSON.stringify(this.get(tab).filter((item) => item !== value)),
      );
    } catch {
      /* ignore */
    }
  },
  clear(tab: string): void {
    try {
      localStorage.removeItem(this.key(tab));
    } catch {
      /* ignore */
    }
  },
};

/* ── Queries ─────────────────────────────────────────────────── */

/**
 * `_extractHashtags()` @80723. Hashtags arrive either as a separated string
 * (most upload flows) or as an array (a couple of flows). The legacy version
 * called `.split()` unconditionally and threw on the array shape — and because
 * that call sat inside a bare `forEach`, one such post permanently broke
 * auto-suggest for the rest of the session.
 */
export function extractHashtags(post: unknown): string[] {
  try {
    const raw = (post as { hashtags?: unknown; tags?: unknown } | null)?.['hashtags'] ??
      (post as { tags?: unknown } | null)?.['tags'];
    const list = Array.isArray(raw) ? raw : typeof raw === 'string' ? raw.split(/[\s,#]+/) : [];
    return list.map((tag) => String(tag).trim()).filter(Boolean);
  } catch {
    return [];
  }
}

/** `_searchFormatDuration()` @81127. */
export function formatDuration(seconds: unknown): string {
  const total = Math.max(0, Math.floor(Number(seconds) || 0));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
}

function text(value: unknown, fallback = ''): string {
  return typeof value === 'string' && value ? value : fallback;
}

/**
 * `queryForYouSourcePosts()` @81682 — the newest 300 videos, minus stories and
 * buzzes and anything with no media. `orderBy` needs a composite index that the
 * project may not have, so the unordered read stays as the fallback.
 *
 * Results are held for `SOURCE_TTL_MS`. The legacy overlay re-ran the whole read
 * on **every keystroke** (`updateSearchQuery()` @80619 called
 * `renderSearchContent()`), so typing ten characters pulled 300 documents ten
 * times. The legacy code had the same instinct for suggestions — the one-shot
 * `_searchSuggestionsCache` @80669 — and this extends it to the shared source.
 */
const SOURCE_TTL_MS = 30_000;
let sourceCache: { posts: SearchPost[]; at: number } | null = null;

export async function queryForYouSourcePosts(): Promise<SearchPost[]> {
  const now = Date.now();
  if (sourceCache && now - sourceCache.at < SOURCE_TTL_MS) return sourceCache.posts;

  const { db } = getPoseFirebase();
  const ref = collection(db, 'videos');
  let docs;
  try {
    docs = await getDocs(query(ref, orderBy('createdAt', 'desc'), limit(300)));
  } catch (error) {
    console.warn('⚠️ videos orderBy needs an index, falling back to an unordered read:', error);
    docs = await getDocs(query(ref, limit(300)));
  }

  const posts: SearchPost[] = [];
  docs.forEach((entry) => {
    const data = entry.data() as Record<string, unknown>;
    if (data['type'] === 'story' || data['type'] === 'buzz' || !data['videoUrl']) return;
    posts.push({ ...data, id: entry.id });
  });
  sourceCache = { posts, at: now };
  return posts;
}

/** `queryAllPosts()` @81693 — Trending, Trends, Hashtags and Top all share this. */
export async function queryAllPosts(): Promise<SearchPost[]> {
  return queryForYouSourcePosts();
}

/**
 * `queryPosts(type)` @81697. The legacy thumbnail fallback was a grey data-URI
 * SVG; the card already paints `#14101f` behind an empty image, so an empty
 * string draws the same thing without a data URI in a style attribute.
 */
export async function queryPosts(type: 'video'): Promise<SearchVideo[]>;
export async function queryPosts(type: 'photo'): Promise<SearchPhoto[]>;
export async function queryPosts(type: 'video' | 'photo'): Promise<SearchVideo[] | SearchPhoto[]> {
  const all = await queryForYouSourcePosts();

  if (type === 'video') {
    return all
      .filter((post) => post['type'] !== 'photo' && post['isPhoto'] !== true)
      .map<SearchVideo>((post) => ({
        id: post.id,
        username: text(post['username'], text(post['userName'], 'Unknown')),
        title: text(post['title'], text(post['caption'], 'Untitled')),
        thumbnail: text(
          post['thumbnailUrl'],
          text(post['thumbnailURL'], text(post['thumbnail'], text(post['coverImage'], text(post['videoUrl'])))),
        ),
        avatar: text(post['userProfilePic']),
        views: formatCount(post['views'] ?? post['viewCount'] ?? 0),
        duration: post['duration'] ? formatDuration(post['duration']) : '',
        likes: formatCount(post['likeCount'] ?? 0),
        comments: formatCount(post['comments'] ?? 0),
        raw: post,
      }));
  }

  return all
    .filter((post) => post['type'] === 'photo' || post['isPhoto'] === true)
    .map<SearchPhoto>((post) => {
      const images = Array.isArray(post['images']) ? (post['images'] as unknown[]) : [];
      return {
        id: post.id,
        username: text(post['username'], text(post['userName'], 'Unknown')),
        caption: text(post['caption'], text(post['title'], 'Photo')),
        image: text(
          post['thumbnailUrl'],
          text(
            post['thumbnailURL'],
            text(
              post['thumbnail'],
              text(post['coverImage'], text(post['photoUrl'], text(post['imageUrl'], text(images[0])))),
            ),
          ),
        ),
        avatar: text(post['userProfilePic']),
        views: formatCount(post['views'] ?? post['viewCount'] ?? 0),
        photoCount: images.length,
        likes: formatCount(post['likeCount'] ?? 0),
        raw: post,
      };
    });
}

/** `queryUsers()` @81745 — the first 50 accounts, newest-agnostic. */
export async function queryUsers(): Promise<SearchUser[]> {
  const { db } = getPoseFirebase();
  const docs = await getDocs(query(collection(db, 'users'), limit(50)));
  const users: SearchUser[] = [];
  docs.forEach((entry) => {
    const data = entry.data() as Record<string, unknown>;
    const followersMap = data['followers'];
    const followers =
      followersMap && typeof followersMap === 'object'
        ? Object.keys(followersMap as Record<string, unknown>).length
        : parseInt(String(data['followersCount'] ?? data['followers'] ?? 0), 10) || 0;
    users.push({
      id: entry.id,
      username: text(data['username']),
      name: text(data['name'], text(data['displayName'], text(data['username'], 'User'))),
      avatar: text(data['profilePicUrl'], text(data['userProfilePic'], text(data['photoURL']))),
      verified: Boolean(data['verified']),
      followers,
      bio: text(data['bio']),
    });
  });
  return users;
}

/**
 * `queryTopSounds()` @81593. The legacy version preferred the in-memory Pose
 * Music library and only fell back to Firestore; that library lives in the
 * unported Pose tab, so the port reads `sounds` directly. A missing collection
 * is not an error — plenty of projects never create it.
 */
export async function queryTopSounds(): Promise<SearchSound[]> {
  const { db } = getPoseFirebase();
  try {
    const docs = await getDocs(query(collection(db, 'sounds'), limit(50)));
    const sounds: SearchSound[] = [];
    docs.forEach((entry) => {
      const sound = entry.data() as Record<string, unknown>;
      sounds.push({
        id: entry.id,
        title: text(sound['title'], 'Untitled'),
        artist: text(sound['artist'], 'Unknown'),
        thumbnail: text(sound['thumbnail']),
        usedIn: text(sound['usedIn'], '0'),
        duration: text(sound['duration'], '0:00'),
      });
    });
    return sounds;
  } catch {
    console.warn('Sounds collection not found');
    return [];
  }
}

/* ── Insights built from the loaded posts ────────────────────── */

function engagementOf(post: SearchPost): number {
  return (parseInt(String(post['views'] ?? post['viewCount'] ?? 0), 10) || 0) + (parseInt(String(post['likeCount'] ?? 0), 10) || 0);
}

/** `buildTrendingData()` @81772. */
export function buildTrendingData(posts: SearchPost[]): TrendingData {
  const hashtagMap: Record<string, number> = {};
  const engagementMap: Record<string, { count: number; engagement: number; createdAt: unknown }> = {};

  posts.forEach((post) => {
    extractHashtags(post).forEach((tag) => {
      if (!tag) return;
      hashtagMap[tag] = (hashtagMap[tag] ?? 0) + 1;
      if (!engagementMap[tag]) {
        engagementMap[tag] = { count: 0, engagement: 0, createdAt: post['createdAt'] };
      }
      engagementMap[tag].count += 1;
      // `likes` is a {uid: true} map, not a count — `likeCount` is the tally.
      engagementMap[tag].engagement +=
        (Number(post['likeCount']) || 0) + (Number(post['comments']) || 0) + (Number(post['shares']) || 0);
    });
  });

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const thresholds: Record<DateRange, Date> = {
    today,
    week: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000),
    month: new Date(today.getFullYear(), now.getMonth() - 1, now.getDate()),
    year: new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()),
  };

  const trendingByDate = { today: [], week: [], month: [], year: [] } as TrendingData['trendingByDate'];
  (['today', 'week', 'month', 'year'] as DateRange[]).forEach((period) => {
    trendingByDate[period] = Object.entries(engagementMap)
      .filter(([, stats]) => {
        const value = stats.createdAt as { toDate?: () => Date } | undefined;
        const postDate = value?.toDate ? value.toDate() : new Date(String(stats.createdAt));
        return postDate >= thresholds[period];
      })
      .sort((a, b) => b[1].engagement - a[1].engagement)
      .slice(0, 3)
      .map(([tag, stats], rank) => ({
        rank: rank + 1,
        tag,
        type: 'hash' as const,
        posts: formatCount(stats.count),
        change: 'up' as const,
        // The legacy change percentage was random, not measured. Kept as-is: the
        // numbers are decorative and there is no history to diff against.
        changePercent: `+${Math.floor(Math.random() * 30 + 5)}%`,
      }));
  });

  const trending = Object.entries(hashtagMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([tag, count]) => ({ tag, posts: formatCount(count), type: 'hash' as const }));

  return { trending, trendingByDate };
}

/** `buildHashtagData()` @81832. */
export function buildHashtagData(posts: SearchPost[]): HashtagCard[] {
  const hashtagMap: Record<string, number> = {};
  posts.forEach((post) => {
    extractHashtags(post).forEach((tag) => {
      if (tag) hashtagMap[tag] = (hashtagMap[tag] ?? 0) + 1;
    });
  });

  return Object.entries(hashtagMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([tag, count]) => ({
      tag: `#${tag}`,
      posts: formatCount(count),
      featured: count > 100,
    }));
}

/**
 * `getRecommendedSearches()` @81383. With no history it falls back to the most
 * frequent hashtags overall, so the Recent tab has something to offer on a first
 * visit instead of sitting empty.
 */
export function getRecommendedSearches(tab: string, posts: SearchPost[]): RecommendedSearch[] {
  if (!posts.length) return [];
  const history = SearchHistory.get(tab);

  if (!history.length) {
    const freq: Record<string, number> = {};
    posts.forEach((post) => {
      extractHashtags(post).forEach((tag) => {
        freq[tag] = (freq[tag] ?? 0) + 1;
      });
    });
    return Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([tag, count]) => ({ tag, posts: formatCount(count) }));
  }

  const searched = new Set(history.map((entry) => entry.toLowerCase()));
  const tagFreq: Record<string, number> = {};
  history.forEach((term) => {
    const lowered = term.toLowerCase();
    posts.forEach((post) => {
      const caption = String(post['caption'] ?? post['title'] ?? '').toLowerCase();
      const tags = extractHashtags(post);
      if (!caption.includes(lowered) && !tags.join(' ').toLowerCase().includes(lowered)) return;
      tags.forEach((tag) => {
        if (searched.has(tag.toLowerCase())) return;
        tagFreq[tag] = (tagFreq[tag] ?? 0) + 1;
      });
    });
  });

  return Object.entries(tagFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([tag, count]) => ({ tag, posts: formatCount(count) }));
}

/* ── Live suggestions ────────────────────────────────────────── */

let suggestionIndex: { tags: { tag: string; count: number }[]; posts: SearchPost[] } | null = null;

/** `_ensureSearchSuggestionsCache()` @80668 — one read per session. */
export async function ensureSuggestionIndex(): Promise<typeof suggestionIndex> {
  if (suggestionIndex) return suggestionIndex;
  const posts = await queryAllPosts();
  const freq: Record<string, number> = {};
  posts.forEach((post) => {
    extractHashtags(post).forEach((tag) => {
      freq[tag] = (freq[tag] ?? 0) + 1;
    });
  });
  suggestionIndex = {
    tags: Object.entries(freq)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count),
    posts,
  };
  return suggestionIndex;
}

/**
 * `renderSearchSuggestions()` @80682. An empty query offers the recent list;
 * otherwise hashtags first, then matching video titles — most people search by
 * what a video is about, and plenty of posts carry no hashtags at all.
 */
export async function buildSearchSuggestions(
  rawQuery: string,
  history: string[],
): Promise<SearchSuggestion[]> {
  const q = (rawQuery || '').trim().toLowerCase();

  if (!q) {
    return history.slice(0, 6).map((entry) => ({
      label: entry,
      kind: 'recent' as const,
      matchIndex: -1,
      meta: 'Recent',
    }));
  }

  const index = await ensureSuggestionIndex();
  if (!index) return [];

  const tagMatches: SearchSuggestion[] = index.tags
    .filter((entry) => entry.tag.toLowerCase().includes(q))
    .slice(0, 5)
    .map((entry) => ({
      label: entry.tag,
      kind: 'tag' as const,
      matchIndex: entry.tag.toLowerCase().indexOf(q),
      meta: `${formatCount(entry.count)} posts`,
    }));

  const seen = new Set(tagMatches.map((match) => match.label.toLowerCase()));
  const textMatches: SearchSuggestion[] = [];
  for (const post of index.posts) {
    if (textMatches.length >= 8 - tagMatches.length) break;
    const title = String(post['caption'] ?? post['title'] ?? '').trim();
    const key = title.toLowerCase();
    if (title && key.includes(q) && !seen.has(key)) {
      seen.add(key);
      textMatches.push({ label: title, kind: 'text' as const, matchIndex: key.indexOf(q), meta: 'Video' });
    }
  }

  return [...tagMatches, ...textMatches];
}

/* ── Buzz search ─────────────────────────────────────────────── */

/**
 * `loadBuzzPostsForSearch()` @79847. The live Buzz feed only reads the last
 * three days (`loadBuzzTabFeed()`); search has to be able to match a post from
 * any time, so this looks back a full year — every day fetched in parallel
 * rather than one after another, then sorted newest-first because a day bucket
 * only knows its own order.
 *
 * The result is memoised for the session, which is the job `_getBuzzCacheArray()`
 * @80051 did: a year of day-reads is far too expensive to repeat on a keystroke.
 */
const BUZZ_SEARCH_LOOKBACK_DAYS = 365;
const BUZZ_SEARCH_PER_DAY_LIMIT = 50;

let buzzSearchCache: BuzzPost[] | null = null;

/** `goToHome` drops every feed cache; the memoised search page goes with them. */
export function clearBuzzSearchCache(): void {
  buzzSearchCache = null;
}

export async function loadBuzzPostsForSearch(): Promise<BuzzPost[]> {
  if (buzzSearchCache) return buzzSearchCache;

  // The feed's own localStorage page first, exactly like `_getBuzzCacheArray()`.
  const cached = getCachedBuzzPosts();
  if (cached?.length) {
    buzzSearchCache = cached;
    return cached;
  }

  try {
    const { db } = getPoseFirebase();
    const today = new Date();
    const buckets: string[] = [];
    for (let back = 0; back < BUZZ_SEARCH_LOOKBACK_DAYS; back += 1) {
      const date = new Date(today);
      date.setDate(date.getDate() - back);
      buckets.push(
        [
          date.getFullYear(),
          String(date.getMonth() + 1).padStart(2, '0'),
          String(date.getDate()).padStart(2, '0'),
        ].join('-'),
      );
    }

    // Posts live under `postedtweetdata/{date}/posts`, not as flat documents on
    // `postedtweetdata` itself. A missing day bucket resolves empty, so a catch
    // per day keeps one bad read from taking the whole year down with it.
    const days = await Promise.all(
      buckets.map((key) =>
        getDocs(query(collection(db, 'postedtweetdata', key, 'posts'), limit(BUZZ_SEARCH_PER_DAY_LIMIT)))
          .then((snapshot) =>
            snapshot.docs
              .map((entry) => ({ id: entry.id, date: key, ...entry.data() }) as BuzzPost)
              .filter((post) => post.type === 'buzz' || post.type === 'tweet'),
          )
          .catch(() => [] as BuzzPost[]),
      ),
    );

    const posts = days.flat().sort((a, b) => toMillis(b.createdAt) - toMillis(a.createdAt));
    buzzSearchCache = posts;
    return posts;
  } catch (error) {
    console.warn('Could not load buzz posts:', error);
    return getCachedBuzzPosts() ?? [];
  }
}

/**
 * `_extractBuzzHashtags()` @80101. Buzz posts carry no `hashtags` array the way
 * For You posts do, so tags have to come from two places: typed inline in the
 * post text ("...check this out #fun"), and the composer's dedicated hashtags
 * field (`#buzzHashtags`, saved as a space/comma separated string). Missing the
 * second would hide a tag that is visibly rendered under the post.
 */
export function extractBuzzHashtags(post: BuzzPost): string[] {
  const text = post.text ?? '';
  const fromText = text.match(/#[\w]+/g) ?? [];
  const raw = post.hashtags;
  const field = Array.isArray(raw) ? raw.join(' ') : String(raw ?? '');
  const fromField = field
    .split(/[,\s]+/)
    .map((tag) => tag.trim())
    .filter(Boolean)
    .map((tag) => (tag.startsWith('#') ? tag : `#${tag}`));
  return [...new Set([...fromText, ...fromField])].map((tag) => tag.toLowerCase());
}

/**
 * `getBuzzRecommendedSearches()` @80126 — the Recent tab's fallback, built off
 * buzz free-text hashtags rather than a `hashtags` field.
 */
export function getBuzzRecommendedSearches(buzzs: BuzzPost[]): RecommendedSearch[] {
  if (!buzzs.length) return [];
  const history = SearchHistory.get(BUZZ_HISTORY_TAB);

  if (!history.length) {
    return topTags(buzzs).slice(0, 6).map(([tag, count]) => ({ tag, posts: formatCount(count) }));
  }

  const searched = new Set(history.map((entry) => entry.toLowerCase()));
  const tagFreq: Record<string, number> = {};
  history.forEach((term) => {
    const q = term.toLowerCase();
    buzzs.forEach((post) => {
      const text = (post.text ?? '').toLowerCase();
      const tags = extractBuzzHashtags(post);
      if (!text.includes(q) && !tags.join(' ').includes(q)) return;
      tags.forEach((tag) => {
        // Already searched — offering it back as a suggestion would be noise.
        if (searched.has(tag.replace('#', ''))) return;
        tagFreq[tag] = (tagFreq[tag] ?? 0) + 1;
      });
    });
  });

  return Object.entries(tagFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([tag, count]) => ({ tag, posts: formatCount(count) }));
}

/** The history key the Buzz overlay writes to — `SearchHistory.add('buzz', …)` @82467. */
export const BUZZ_HISTORY_TAB = 'buzz';

/** `formatCount` in the legacy code was a string tally; `posts` travels as one here. */
type TagTally = [tag: string, count: number];

function topTags(buzzs: BuzzPost[]): TagTally[] {
  const counts: Record<string, number> = {};
  buzzs.forEach((post) => {
    extractBuzzHashtags(post).forEach((tag) => {
      counts[tag] = (counts[tag] ?? 0) + 1;
    });
  });
  return Object.entries(counts).sort((a, b) => b[1] - a[1]);
}

export type BuzzPerson = { uid: string; name: string; avatar: string; bio: string };
export type BuzzTagCount = { tag: string; count: number };
export type BuzzTrendPerson = BuzzPerson & { score: number };
export type BuzzTrendPost = { post: BuzzPost; score: number };
export type BuzzTrendingData = {
  people: BuzzTrendPerson[];
  posts: BuzzTrendPost[];
  hashtags: BuzzTagCount[];
};

/**
 * `buildBuzzTrendingTabHtml()` @80184 — trending people, trending posts and
 * trending hashtags in one pass, since the Trending tab and the All tab's
 * landing view both want all three.
 *
 * Two deliberate departures from the legacy scoring. The legacy read
 * `parseInt(b.likes)` / `parseInt(b.comments)`, and `likes` on a live post is a
 * `{uid: true}` map rather than a tally — so that parse returned NaN and every
 * person scored 0. `interactionCount()` reads either shape. The avatar fallback
 * was a hot-linked placeholder image; the ported components all fall back to
 * initials, so these rows do too.
 */
export function buildBuzzTrendingData(buzzs: BuzzPost[]): BuzzTrendingData {
  const peopleMap: Record<string, BuzzTrendPerson> = {};
  buzzs.forEach((post) => {
    const uid = post.userId;
    if (!uid) return;
    if (!peopleMap[uid]) {
      peopleMap[uid] = {
        uid,
        name: buzzAuthorName(post),
        avatar: post.userProfilePic ?? '',
        bio: '',
        score: 0,
      };
    }
    peopleMap[uid].score +=
      interactionCount(post.likes, post.likedBy) + interactionCount(post.comments);
  });

  const scored = buzzs
    .map((post) => ({
      post,
      score:
        interactionCount(post.likes, post.likedBy) +
        interactionCount(post.comments) * 2 +
        interactionCount(post.reposts, post.repostedBy) * 3 +
        interactionCount(post.buzzhit) * 2 +
        (Number((post as { views?: unknown }).views) || 0) * 0.05,
    }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);

  return {
    people: Object.values(peopleMap)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8),
    posts: scored,
    hashtags: topTags(buzzs)
      .slice(0, 10)
      .map(([tag, count]) => ({ tag, count })),
  };
}

/** The people stubs the All tab derives from buzz authors — `peopleMap` @80345. */
export function buildBuzzPeople(buzzs: BuzzPost[]): BuzzPerson[] {
  const peopleMap: Record<string, BuzzPerson> = {};
  buzzs.forEach((post) => {
    const uid = post.userId;
    if (!uid || peopleMap[uid]) return;
    peopleMap[uid] = {
      uid,
      name: buzzAuthorName(post),
      avatar: post.userProfilePic ?? '',
      bio: '',
    };
  });
  return Object.values(peopleMap);
}

/**
 * `renderBuzzSearch()`'s post filter @80363 — the free text plus the author's
 * names and the composer's hashtags field, all lowercased.
 */
export function filterBuzzPosts(buzzs: BuzzPost[], query: string): BuzzPost[] {
  const q = query.trim().toLowerCase();
  if (!q) return buzzs;
  return buzzs.filter((post) =>
    `${post.text ?? ''} ${post.username ?? ''} ${post.userName ?? ''} ${post.name ?? ''} ${
      Array.isArray(post.hashtags) ? post.hashtags.join(' ') : (post.hashtags ?? '')
    }`
      .toLowerCase()
      .includes(q),
  );
}

/** The Hashtags tab + the All tab's hashtag block @80378 / @80435. */
export function buildBuzzHashtagData(buzzs: BuzzPost[], query = ''): BuzzTagCount[] {
  const q = query.trim().toLowerCase().replace(/^#/, '');
  const counts: Record<string, number> = {};
  buzzs.forEach((post) => {
    extractBuzzHashtags(post).forEach((tag) => {
      if (!q || tag.includes(q)) counts[tag] = (counts[tag] ?? 0) + 1;
    });
  });
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([tag, count]) => ({ tag, count }));
}

export { engagementOf };
