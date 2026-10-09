'use client';

import { useState, type RefObject } from 'react';

import { cx } from '../styles';
import * as UI from './search-ui';
import { initials } from '@/lib/pose-app/format';
import { RECENT_SEARCHES_VISIBLE } from '@/lib/pose-app/search';
import type {
  DateRange,
  HashtagCard,
  RecommendedSearch,
  SearchPhoto,
  SearchSound,
  SearchUser,
  SearchVideo,
  TrendCard,
  TrendHash,
  TrendingData,
} from '@/lib/pose-app/search';

export function SectionHeader({ children }: { children: React.ReactNode }) {
  return <h3 className={UI.SECTION_HEADER}>{children}</h3>;
}

export function Empty({ children }: { children: React.ReactNode }) {
  return <p className={UI.EMPTY}>{children}</p>;
}

/** `renderTrendingSection()` @80916 / the Recommended block @80825. */
export function TrendingList({
  items,
  onSelect,
}: {
  items: (TrendHash | RecommendedSearch)[];
  onSelect: (tag: string) => void;
}) {
  return (
    <div className={UI.TRENDING_LIST}>
      {items.map((item) => {
        const isStar = (item as TrendHash).type === 'star';
        return (
          <div key={item.tag} className={UI.TRENDING_ITEM} onClick={() => onSelect(item.tag)}>
            <span
              className={UI.TRENDING_ICON}
              style={{ color: isStar ? '#8b5cf6' : '#999' }}
            >
              {isStar ? <i className="fas fa-star" /> : '#'}
            </span>
            <div>
              <div className={UI.TRENDING_NAME}>{item.tag}</div>
              <div className={UI.TRENDING_COUNT}>{item.posts} posts</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

const RANGES: DateRange[] = ['today', 'week', 'month', 'year'];

/** `renderTrendsSection()` @80945 — the filter bar plus the drifting card row. */
export function TrendsSection({
  data,
  range,
  filtersVisible,
  onToggleFilters,
  onRange,
  onSelect,
  scrollerRef,
}: {
  data: TrendingData;
  range: DateRange;
  filtersVisible: boolean;
  onToggleFilters: () => void;
  onRange: (range: DateRange) => void;
  onSelect: (tag: string) => void;
  scrollerRef: RefObject<HTMLDivElement | null>;
}) {
  const trends: TrendCard[] = data.trendingByDate[range] ?? [];
  return (
    <>
      <div className={UI.FILTER_BAR}>
        <button type="button" className={UI.FILTER_TOGGLE} onClick={onToggleFilters}>
          <i className="fas fa-calendar-days mr-[6px]" />
          Filters
        </button>
        {filtersVisible && (
          <div className={UI.FILTER_OPTIONS}>
            {RANGES.map((entry) => (
              <button
                key={entry}
                type="button"
                className={cx(UI.FILTER_BTN, range === entry && UI.FILTER_BTN_ACTIVE)}
                onClick={() => onRange(entry)}
              >
                {entry.charAt(0).toUpperCase() + entry.slice(1)}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className={UI.TREND_CARDS} ref={scrollerRef}>
        {trends.length === 0 ? (
          <Empty>No trending content for this period</Empty>
        ) : (
          trends.map((trend) => (
            <div key={trend.tag} className={UI.TREND_CARD} onClick={() => onSelect(trend.tag)}>
              <div
                className={UI.TREND_BADGE}
                style={{ background: 'linear-gradient(135deg,#8b5cf6,#a78bfa)' }}
              >
                {trend.rank}
              </div>
              <div
                className={UI.TREND_ICON}
                style={{ color: trend.type === 'star' ? '#8b5cf6' : '#999' }}
              >
                {trend.type === 'star' ? <i className="fas fa-star" /> : '#'}
              </div>
              <div className={UI.TREND_INFO}>
                <div className={UI.TREND_NAME}>{trend.tag}</div>
                <div className={UI.TREND_POSTS}>{trend.posts} posts</div>
              </div>
              <div
                className={UI.TREND_CHANGE}
                style={{ background: trend.change === 'up' ? '#10b981' : '#ef4444' }}
              >
                <i className={cx('fas', trend.change === 'up' ? 'fa-arrow-up' : 'fa-arrow-down')} />{' '}
                {trend.changePercent}
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}

/**
 * The "Recent Searches" block — `loadRecentTab()` @80825 for For You and
 * `buildBuzzRecentTabHtml()` @80157 for Buzz. Both rendered the same markup with
 * only the storage key and the click handler differing, so it lives here once.
 */
export function RecentSearches({
  history,
  onSelect,
  onClear,
  onRemove,
}: {
  history: string[];
  onSelect: (value: string) => void;
  onClear: () => void;
  onRemove: (value: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  if (!history.length) return null;
  const shown = expanded ? history : history.slice(0, RECENT_SEARCHES_VISIBLE);

  return (
    <div className={UI.SECTION}>
      <div className="flex items-center justify-between">
        {/* The legacy header carried `margin:0` because it sits in a flex row
            with "Clear all". */}
        <h3 className={cx(UI.SECTION_HEADER, '!mb-0')}>
          <i className="fas fa-clock mr-[6px]" />
          Recent Searches
        </h3>
        <button
          type="button"
          className="cursor-pointer border-none bg-transparent text-[12px] text-[#8b5cf6]"
          onClick={onClear}
        >
          Clear all
        </button>
      </div>
      <div className={UI.TRENDING_LIST}>
        {shown.map((entry) => (
          <div key={entry} className={UI.TRENDING_ITEM} onClick={() => onSelect(entry)}>
            <span className={UI.TRENDING_ICON} style={{ color: '#666' }}>
              <i className="fas fa-clock" />
            </span>
            <div className="flex-1">
              <div className={UI.TRENDING_NAME}>{entry}</div>
            </div>
            <span
              className="cursor-pointer p-[4px] px-[8px] text-[#666]"
              onClick={(event) => {
                event.stopPropagation();
                onRemove(entry);
              }}
            >
              <i className="fas fa-times" />
            </span>
          </div>
        ))}
      </div>
      {history.length > RECENT_SEARCHES_VISIBLE && (
        <div className={UI.SEE_MORE} onClick={() => setExpanded((value) => !value)}>
          {expanded ? 'See less' : `See more (${history.length - RECENT_SEARCHES_VISIBLE})`}
        </div>
      )}
    </div>
  );
}

/**
 * `_extractBuzzHashtags()`-driven tag rows — the Trending Hashtags block @80240
 * and the All tab's Hashtags block @80472 share this shape.
 */
export function TagRows({ tags, onSelect }: { tags: { tag: string; count: number }[]; onSelect: (tag: string) => void }) {
  return (
    <div className={UI.TRENDING_LIST}>
      {tags.map((entry) => (
        <div key={entry.tag} className={UI.TRENDING_ITEM} onClick={() => onSelect(entry.tag)}>
          <span className={UI.TRENDING_ICON} style={{ color: '#8b5cf6' }}>
            #
          </span>
          <div>
            <div className={UI.TRENDING_NAME}>{entry.tag}</div>
            <div className={UI.TRENDING_COUNT}>{entry.count} posts</div>
          </div>
        </div>
      ))}
    </div>
  );
}

/** `renderUsersSection()` @80945. */
export function UsersSection({
  users,
  following,
  onOpen,
  onFollow,
}: {
  users: SearchUser[];
  following: Record<string, boolean>;
  onOpen: (user: SearchUser) => void;
  onFollow: (user: SearchUser) => void;
}) {
  return (
    <div className={UI.SECTION}>
      <SectionHeader>
        <i className="fas fa-users mr-[6px]" />
        Users
      </SectionHeader>
      <div className={UI.USERS_LIST}>
        {users.length === 0 ? (
          <Empty>No users found</Empty>
        ) : (
          users.map((user) => (
            <div key={user.id} className={UI.USER_CARD} onClick={() => onOpen(user)}>
              <div className={UI.USER_AVATAR}>
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt=""
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  initials(user.name)
                )}
              </div>
              <div className={UI.USER_INFO}>
                <div className={UI.USER_NAME}>
                  {user.name}
                  {user.verified && <i className="fas fa-circle-check ml-[5px] text-[11px] text-[#60a5fa]" />}
                </div>
                <div className={UI.USER_HANDLE}>@{user.username}</div>
                <div className={UI.USER_BIO}>
                  {user.followers} followers • {user.bio}
                </div>
              </div>
              <button
                type="button"
                className={UI.FOLLOW_BTN}
                onClick={(event) => {
                  event.stopPropagation();
                  onFollow(user);
                }}
              >
                {following[user.id] ? 'Following' : 'Follow'}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/** `renderVideosSection()` @81002, including the cycled masonry heights. */
export function VideosSection({
  videos,
  onOpen,
}: {
  videos: SearchVideo[];
  onOpen: (video: SearchVideo) => void;
}) {
  return (
    <div className={UI.SECTION}>
      <SectionHeader>
        <i className="fas fa-film mr-[6px]" />
        Videos
      </SectionHeader>
      <div className={UI.GRID_2}>
        {videos.length === 0 ? (
          <Empty>No videos found</Empty>
        ) : (
          videos.map((video, index) => (
            <div key={video.id} className={UI.MEDIA_CARD} onClick={() => onOpen(video)}>
              <div
                className={cx(UI.MEDIA_THUMB, UI.thumbHeight(index))}
                style={video.thumbnail ? { backgroundImage: `url('${video.thumbnail}')` } : undefined}
              >
                <div className={UI.PLAY_CENTER}>
                  <i className="fas fa-play" />
                </div>
                {video.duration && <div className={UI.DURATION_TAG}>{video.duration}</div>}
                <div className={UI.MEDIA_OVERLAY}>
                  <div className={UI.VIEWS_ROW}>
                    <i className="fas fa-play text-[9px]" /> {video.views}
                  </div>
                  <div className={UI.MEDIA_TITLE}>{video.title}</div>
                  <div className={UI.MEDIA_USER_ROW}>
                    <div
                      className={UI.MEDIA_AVATAR}
                      style={video.avatar ? { backgroundImage: `url('${video.avatar}')` } : undefined}
                    />
                    <div className={UI.MEDIA_USERNAME}>{video.username}</div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/** `renderPhotosSection()` @81037. */
export function PhotosSection({
  photos,
  onOpen,
}: {
  photos: SearchPhoto[];
  onOpen: (photo: SearchPhoto) => void;
}) {
  return (
    <div className={UI.SECTION}>
      <SectionHeader>
        <i className="fas fa-images mr-[6px]" />
        Photos
      </SectionHeader>
      <div className={UI.GRID_2}>
        {photos.length === 0 ? (
          <Empty>No photos found</Empty>
        ) : (
          photos.map((photo, index) => (
            <div key={photo.id} className={UI.MEDIA_CARD} onClick={() => onOpen(photo)}>
              <div
                className={cx(UI.MEDIA_THUMB, UI.thumbHeight(index))}
                style={photo.image ? { backgroundImage: `url('${photo.image}')` } : undefined}
              >
                {photo.photoCount > 1 && (
                  <div className={UI.CAROUSEL_BADGE}>
                    <i className="fas fa-clone text-[9px]" /> 1/{photo.photoCount}
                  </div>
                )}
                <div className={UI.MEDIA_OVERLAY}>
                  <div className={UI.VIEWS_ROW}>
                    <i className="fas fa-heart text-[9px]" /> {photo.likes}
                  </div>
                  <div className={UI.MEDIA_TITLE}>{photo.caption}</div>
                  <div className={UI.MEDIA_USER_ROW}>
                    <div
                      className={UI.MEDIA_AVATAR}
                      style={photo.avatar ? { backgroundImage: `url('${photo.avatar}')` } : undefined}
                    />
                    <div className={UI.MEDIA_USERNAME}>{photo.username}</div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/** `renderSoundsSection()` @81274. */
export function SoundsSection({ sounds }: { sounds: SearchSound[] }) {
  return (
    <div className={UI.SECTION}>
      <SectionHeader>
        <i className="fas fa-music mr-[6px]" />
        Sounds
      </SectionHeader>
      <div className={UI.SOUNDS_LIST}>
        {sounds.length === 0 ? (
          <Empty>No sounds found</Empty>
        ) : (
          sounds.map((sound) => (
            <div key={sound.id} className={UI.SOUND_ITEM}>
              <div
                className={UI.SOUND_THUMB}
                style={sound.thumbnail ? { backgroundImage: `url('${sound.thumbnail}')` } : undefined}
              >
                {!sound.thumbnail && (
                  <span className="flex h-full w-full items-center justify-center text-[20px] text-[#8b5cf6]">
                    <i className="fas fa-music" />
                  </span>
                )}
                <div className={UI.SOUND_PLAY}>
                  <i className="fas fa-play" />
                </div>
              </div>
              <div className={UI.SOUND_INFO}>
                <div className={UI.SOUND_TITLE}>{sound.title}</div>
                <div className={UI.SOUND_ARTIST}>{sound.artist}</div>
                <div className={UI.SOUND_META}>
                  <i className="fas fa-music mr-[4px]" />
                  Used in {sound.usedIn} videos • {sound.duration}
                </div>
              </div>
              <div className={UI.SOUND_ACTIONS}>
                <button type="button" className={UI.USE_BTN}>
                  Use Sound
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/** `renderHashtagsSection()` @81295. */
export function HashtagsSection({
  hashtags,
  onSelect,
}: {
  hashtags: HashtagCard[];
  onSelect: (tag: string) => void;
}) {
  return (
    <div className={UI.SECTION}>
      <SectionHeader>
        <i className="fas fa-hashtag mr-[6px]" />
        Hashtags
      </SectionHeader>
      <div className={UI.GRID_4}>
        {hashtags.length === 0 ? (
          <p className={cx(UI.EMPTY, 'col-span-2')}>No hashtags found</p>
        ) : (
          hashtags.map((tag) => (
            <div key={tag.tag} className={UI.HASHTAG_CARD} onClick={() => onSelect(tag.tag)}>
              <div
                className={UI.HASHTAG_ICON}
                style={
                  tag.featured
                    ? { background: 'linear-gradient(135deg,#8b5cf6,#a78bfa)', color: '#fff' }
                    : { background: '#1a1a1a', color: '#8b5cf6' }
                }
              >
                #
              </div>
              <div className={UI.HASHTAG_NAME}>{tag.tag}</div>
              <div className={UI.HASHTAG_POSTS}>{tag.posts} posts</div>
              {tag.featured && <div className={UI.FEATURED_BADGE}>Featured</div>}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
