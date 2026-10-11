'use client';

import {
  poseBadge,
  poseChannelName,
  poseChannelPic,
  poseEpisodeCount,
  poseGradient,
  posePreload,
  posePrice,
  poseStars,
  poseThumb,
  poseYear,
  type PoseTabSeason,
  type PoseTabVideo,
} from '@/lib/pose-app/pose-tab';

const SEASON_GRADIENTS = ['gs1', 'gs2', 'gs3', 'gs4', 'gs5'];

type CardProps = {
  video: PoseTabVideo;
  onOpen: (video: PoseTabVideo) => void;
  onOpenChannel: (channelId: string, channel: PoseTabVideo['channel']) => void;
};

/**
 * `createPoseGridItem()` @32010 — the rail card: thumbnail (or gradient), HOT /
 * PREM / FREE badge, the Pose Coin price tag when there is one, a star strip and
 * the channel row. The hidden `preload="metadata"` clip is what makes the player
 * open on a warm buffer.
 */
export function PoseCard({ video, onOpen, onOpenChannel }: CardProps) {
  const thumb = poseThumb(video);
  const channel = poseChannelName(video);
  const channelPic = poseChannelPic(video);
  const badge = poseBadge(video);
  const price = posePrice(video);
  const preload = posePreload(video);

  return (
    <div className="pt-card" onClick={() => onOpen(video)}>
      <div className="pt-card-wrap">
        {thumb ? (
          <img className="pt-card-img" src={thumb} alt="" loading="lazy" />
        ) : (
          <div className={`pt-card-img ${poseGradient(video.id)}`} />
        )}
        {preload ? (
          <video className="pt-card-preload hidden" src={preload} preload="metadata" muted playsInline aria-hidden />
        ) : null}
        <span className={`pt-card-badge ${badge.type}`}>{badge.label}</span>
        {price > 0 ? (
          <span className="pt-card-price">
            <i className="fas fa-coins" />
            {price.toLocaleString()} Pose Coin
          </span>
        ) : null}
        <span className="pt-card-stars">{poseStars(video)}</span>
      </div>
      <div className="pt-card-panel">
        <div className="pt-card-panel-title">{video.title ?? video.name ?? 'Untitled'}</div>
        <div
          className="pt-card-panel-sub pt-card-ch-row cursor-pointer flex items-center gap-[5px]"
          title={`View ${channel}'s channel`}
          onClick={(event) => {
            event.stopPropagation();
            onOpenChannel(video.channelId || video.channel?.id || '', video.channel);
          }}
        >
          {channelPic ? (
            <img className="pt-card-ch-pic h-[16px] w-[16px] shrink-0 rounded-full object-cover" src={channelPic} alt="" />
          ) : (
            <span className="flex h-[16px] w-[16px] shrink-0 items-center justify-center rounded-full bg-[#3a1d6e] text-[9px] text-[#bb86fc]">
              {(channel[0] ?? 'C').toUpperCase()}
            </span>
          )}
          <span className="pt-card-ch-name text-[11px] text-[#aaa]">{channel}</span>
          <span className="text-[#555]">·</span>
          <span className="text-[11px] text-[#666]">{poseYear(video)}</span>
        </div>
      </div>
    </div>
  );
}

type SeasonProps = {
  season: PoseTabSeason;
  onOpen: (season: PoseTabSeason) => void;
  onOpenChannel: (channelId: string, channel: PoseTabSeason['channel']) => void;
};

/** `createSeasonScrollItem()` @32065 — the same rail shape for a whole season. */
export function PoseSeasonCard({ season, onOpen, onOpenChannel }: SeasonProps) {
  const thumb = season.thumbnailURL ?? season.thumbnailUrl ?? season.thumbnail ?? '';
  const channel = season.channel?.name ?? 'Channel';
  const channelPic = season.channel?.profileURL ?? season.channel?.profilePic ?? season.channel?.photoURL ?? season.channel?.avatar ?? '';
  const episodes = poseEpisodeCount(season);
  const preload = season.trailerUrl ?? season.episodes?.[0]?.videoUrl ?? '';

  return (
    <div className="pt-season-card" onClick={() => onOpen(season)}>
      {thumb ? (
        <img className="pt-season-thumb" src={thumb} alt="" loading="lazy" />
      ) : (
        <div className={`pt-season-thumb ${poseGradient(season.id, SEASON_GRADIENTS)}`} />
      )}
      {preload ? (
        <video className="pt-card-preload hidden" src={preload} preload="metadata" muted playsInline aria-hidden />
      ) : null}
      <span className="pt-season-new">NEW S{season.seasonNumber ?? 1}</span>
      <div className="pt-season-info">
        <div className="pt-season-title">{season.title ?? channel}</div>
        <div
          className="pt-season-ep pt-season-ch-row flex cursor-pointer items-center gap-[5px]"
          title={`View ${channel}'s channel`}
          onClick={(event) => {
            event.stopPropagation();
            onOpenChannel(season.channelId || season.channel?.id || '', season.channel);
          }}
        >
          {channelPic ? (
            <img className="h-[14px] w-[14px] rounded-full object-cover" src={channelPic} alt="" />
          ) : (
            <span className="flex h-[14px] w-[14px] items-center justify-center rounded-full bg-[#3a1d6e] text-[8px] text-[#bb86fc]">
              {(channel[0] ?? 'C').toUpperCase()}
            </span>
          )}
          <span>{channel}</span>
          <span className="opacity-50">·</span>
          <span>{episodes} Ep</span>
        </div>
      </div>
    </div>
  );
}

type CatCardProps = {
  video: PoseTabVideo | PoseTabSeason;
  isSeason?: boolean;
  onOpen: (video: PoseTabVideo | PoseTabSeason, isSeason: boolean) => void;
};

/** `ptBuildCatCard()` @31894 — the taller card the category page lists. */
export function PoseCategoryCard({ video, isSeason = false, onOpen }: CatCardProps) {
  const thumb = isSeason
    ? ((video as PoseTabSeason).thumbnailURL ?? (video as PoseTabSeason).thumbnailUrl ?? (video as PoseTabSeason).thumbnail ?? '')
    : poseThumb(video as PoseTabVideo);
  const season = video as PoseTabSeason;
  const single = video as PoseTabVideo;
  const channel = isSeason ? season.channel?.name ?? '' : poseChannelName(single);
  const category = isSeason ? '' : single.category ?? single.channel?.category ?? '';
  const sub = isSeason
    ? `Season ${season.seasonNumber ?? 1} · ${poseEpisodeCount(season)} eps${channel ? ` · ${channel}` : ''}`
    : [channel, category].filter(Boolean).join(' · ');
  const price = isSeason ? 0 : posePrice(single);

  return (
    <div className="pt-catpage-card" onClick={() => onOpen(video, isSeason)}>
      {thumb ? (
        <img className="pt-catpage-thumb" src={thumb} alt="" loading="lazy" />
      ) : (
        <div className="pt-catpage-thumb bg-[linear-gradient(135deg,#1a3a5c,#2e6aa8)]" />
      )}
      <div className="pt-catpage-info">
        <div className="pt-catpage-title">{isSeason ? season.title ?? 'Untitled' : single.title ?? single.name ?? 'Untitled'}</div>
        <div className="pt-catpage-sub">{sub}</div>
        {price > 0 ? (
          <div className="pt-catpage-price">
            <i className="fas fa-coins" />
            {price.toLocaleString()} Pose Coin
          </div>
        ) : null}
      </div>
    </div>
  );
}
