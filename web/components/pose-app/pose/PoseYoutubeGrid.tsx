'use client';

import { useMemo, useState } from 'react';

import {
  POSE_YT_FILTERS,
  poseEpisodeCount,
  poseTimeAgo,
  poseYtCount,
  poseYtFeed,
  type PoseTabSeason,
  type PoseTabVideo,
  type PoseYtFilter,
  type PoseYtItem,
} from '@/lib/pose-app/pose-tab';
import type { PoseChannel } from '@/lib/pose-app/types';

type Props = {
  videos: PoseTabVideo[];
  seasons: PoseTabSeason[];
  onOpenVideo: (video: PoseTabVideo) => void;
  onOpenSeason: (season: PoseTabSeason) => void;
  onOpenChannel: (channelId: string, channel: PoseChannel | null) => void;
};

const KIND_LABELS: Record<PoseYtItem['kind'], string> = {
  video: 'Video',
  music: 'Music',
  movie: 'Movie',
  season: 'Series',
};

/**
 * `#ptYtSection` @26038 with `ptRenderYouTubeGrid()` @31117 — a YouTube-shaped
 * mixed grid of videos, music videos, movies and series, filtered by the chip
 * row. The legacy wired the chips once at load; here the filter is component
 * state.
 */
export function PoseYoutubeGrid({ videos, seasons, onOpenVideo, onOpenSeason, onOpenChannel }: Props) {
  const [filter, setFilter] = useState<PoseYtFilter>('all');
  const feed = useMemo(() => poseYtFeed(videos, seasons, filter), [videos, seasons, filter]);

  return (
    <section className="pt-yt-section" id="ptYtSection">
      <div className="pt-yt-chips" id="ptYtChips">
        {POSE_YT_FILTERS.map((chip) => (
          <button
            key={chip.key}
            type="button"
            className={`pt-yt-chip${chip.key === filter ? ' active' : ''}`}
            data-yt-filter={chip.key}
            onClick={() => setFilter(chip.key)}
          >
            {chip.label}
          </button>
        ))}
      </div>
      <div className="pt-yt-grid" id="ptYtGrid">
        {feed.length === 0 ? (
          <div className="pt-yt-empty">No content available yet.</div>
        ) : (
          feed.map(({ item, kind }, position) => {
            const isSeason = kind === 'season';
            const season = item as PoseTabSeason;
            const video = item as PoseTabVideo;
            const thumb = isSeason
              ? season.thumbnailURL ?? season.thumbnailUrl ?? season.thumbnail ?? ''
              : video.thumbnail ?? video.thumbnailUrl ?? video.thumbnailURL ?? video.coverImage ?? '';
            const title = isSeason ? season.title ?? 'Untitled' : video.title ?? video.name ?? 'Untitled';
            const channel = isSeason ? season.channel?.name ?? 'Channel' : video.channel?.name ?? video.channelName ?? 'Channel';
            const channelPic = isSeason
              ? season.channel?.profileURL ?? season.channel?.profilePic ?? ''
              : video.channel?.profileURL ?? video.channel?.profilePic ?? video.userProfilePic ?? '';
            const views = video.views ?? video.viewCount ?? 0;
            const duration = isSeason ? '' : video.duration ?? video.length ?? '';
            const age = poseTimeAgo(item.createdAt);
            const episodes = isSeason ? poseEpisodeCount(season) : 0;
            const price = isSeason ? 0 : video.priceMode === 'free' ? 0 : Number(video.coinPrice) || Number(video.price) || 0;
            const stats = isSeason
              ? `${episodes} episode${episodes !== 1 ? 's' : ''}`
              : views
                ? `${poseYtCount(Number(views))} views`
                : 'New';
            const channelId = isSeason ? season.channelId : video.channelId || video.channel?.id || '';

            return (
              <div
                key={`${isSeason ? 'season' : 'video'}-${item.id}-${position}`}
                className="pt-yt-card"
                onClick={() => (isSeason ? onOpenSeason(season) : onOpenVideo(video))}
              >
                <div className="pt-yt-thumb-wrap">
                  {thumb ? (
                    <img className="pt-yt-thumb" src={thumb} alt="" loading="lazy" />
                  ) : (
                    <div className="pt-yt-thumb-fallback">
                      <i className="fas fa-play" />
                    </div>
                  )}
                  <span className={`pt-yt-typebadge ${kind}`}>{KIND_LABELS[kind]}</span>
                  {price > 0 ? (
                    <span className="pt-yt-price">
                      <i className="fas fa-coins" />
                      {price.toLocaleString()} Pose Coin
                    </span>
                  ) : null}
                  {duration ? <span className="pt-yt-duration">{duration}</span> : null}
                </div>
                <div className="pt-yt-info">
                  <div
                    className="pt-yt-avatar"
                    style={channelPic ? { backgroundImage: `url('${channelPic}')` } : undefined}
                    role="button"
                    tabIndex={0}
                    title={`View ${channel}'s channel`}
                    onClick={(event) => {
                      event.stopPropagation();
                      onOpenChannel(channelId, isSeason ? season.channel : video.channel ?? null);
                    }}
                    onKeyDown={(event) => {
                      event.stopPropagation();
                      onOpenChannel(channelId, isSeason ? season.channel : video.channel ?? null);
                    }}
                  />
                  <div className="pt-yt-meta">
                    <h3 className="pt-yt-title">{title}</h3>
                    <div
                      className="pt-yt-channel"
                      role="button"
                      tabIndex={0}
                      title={`View ${channel}'s channel`}
                      onClick={(event) => {
                        event.stopPropagation();
                        onOpenChannel(channelId, isSeason ? season.channel : video.channel ?? null);
                      }}
                      onKeyDown={(event) => {
                        event.stopPropagation();
                        onOpenChannel(channelId, isSeason ? season.channel : video.channel ?? null);
                      }}
                    >
                      {channel}
                    </div>
                    <div className="pt-yt-stats">
                      {stats}
                      {age ? (
                        <>
                          <span className="dot">•</span>
                          {age}
                        </>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
