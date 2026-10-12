'use client';

import {
  poseEpisodeCount,
  poseIsPaid,
  posePrice,
  poseThumb,
  type PoseTabSeason,
  type PoseTabVideo,
} from '@/lib/pose-app/pose-tab';
import { formatCount } from '@/lib/pose-app/profile';
import { channelCategoryLabel } from '@/lib/pose-app/channel-page';

type VideoProps = {
  video: PoseTabVideo;
  onPlay: (video: PoseTabVideo) => void;
};

type SeasonProps = {
  season: PoseTabSeason;
  onOpen: (season: PoseTabSeason) => void;
};

/** `fycVideoCard()` @68203 — the rail tile with its FREE / coin badge. */
export function ChannelVideoCard({ video, onPlay }: VideoProps) {
  const thumb = poseThumb(video);
  const price = posePrice(video);
  const paid = poseIsPaid(video);
  const views = Number(video.viewCount ?? video.views) || 0;

  return (
    <div className="fyc-card" onClick={() => onPlay(video)}>
      <div className="fyc-card-thumb">
        {thumb ? (
          <img src={thumb} alt="" loading="lazy" />
        ) : (
          <div className="fyc-noimg">
            <i className="fas fa-film" />
          </div>
        )}
        {paid ? (
          <span className="fyc-badge paid">
            {price} <i className="fas fa-coins" />
          </span>
        ) : (
          <span className="fyc-badge free">FREE</span>
        )}
        <div className="fyc-card-play-overlay">
          <i className="fas fa-play" />
        </div>
        <div className="fyc-card-bottom">
          {views > 0 ? (
            <div className="fyc-card-views">
              <i className="fas fa-eye" /> {formatCount(views)}
            </div>
          ) : null}
        </div>
      </div>
      <div className="fyc-card-title">{video.title ?? video.name ?? 'Untitled'}</div>
    </div>
  );
}

/** `fycFeaturedCard()` @68228 — the wider card the newly-released row uses. */
export function ChannelFeaturedCard({ video, onPlay }: VideoProps) {
  const thumb = poseThumb(video);
  const category = video.category ? channelCategoryLabel(video.category) : '';

  return (
    <div className="fyc-featured-card" onClick={() => onPlay(video)}>
      {thumb ? (
        <img src={thumb} alt="" loading="lazy" />
      ) : (
        <div className="fyc-noimg">
          <i className="fas fa-film" />
        </div>
      )}
      <div className="fyc-featured-play">
        <i className="fas fa-play" />
      </div>
      <div className="fyc-featured-info">
        <div className="fyc-featured-title">{video.title ?? video.name ?? 'Untitled'}</div>
        {category ? <div className="fyc-featured-sub">{category}</div> : null}
      </div>
    </div>
  );
}

/**
 * `fycComingSoonCard()` @68245. The clock glyph was an emoji (`⏳`) in the
 * legacy; it is a Font Awesome clock here.
 */
export function ChannelComingSoonCard({ video, onNotify }: { video: PoseTabVideo; onNotify: (video: PoseTabVideo) => void }) {
  const thumb = poseThumb(video);

  return (
    <div className="fyc-soon-card">
      <div className="fyc-soon-thumb">
        {thumb ? <img src={thumb} alt="" loading="lazy" /> : null}
        <div className="fyc-soon-overlay">
          <div className="fyc-soon-clock">
            <i className="fas fa-clock" />
          </div>
          <div className="fyc-soon-label">Coming Soon</div>
        </div>
      </div>
      <div className="fyc-soon-info">
        <div className="fyc-soon-title">{video.title ?? video.name ?? 'Untitled'}</div>
        {video.releaseDate ? (
          <div className="fyc-soon-date">
            <i className="fas fa-calendar-days" />
            {video.releaseDate}
          </div>
        ) : null}
        {video.description ? <div className="fyc-soon-desc">{video.description}</div> : null}
        <button type="button" className="fyc-soon-notify" onClick={() => onNotify(video)}>
          <i className="fas fa-bell" /> Notify Me
        </button>
      </div>
    </div>
  );
}

/** `fycSeasonCard()` @68272. */
export function ChannelSeasonCard({ season, onOpen }: SeasonProps) {
  const thumb = season.thumbnailURL ?? season.thumbnailUrl ?? season.thumbnail ?? '';
  const count = poseEpisodeCount(season);

  return (
    <div className="fyc-card" onClick={() => onOpen(season)}>
      <div className="fyc-card-thumb">
        {thumb ? (
          <img src={thumb} alt="" loading="lazy" />
        ) : (
          <div className="fyc-noimg">
            <i className="fas fa-layer-group" />
          </div>
        )}
        <span className="fyc-badge series">SERIES</span>
        <div className="fyc-card-play-overlay">
          <i className="fas fa-play" />
        </div>
      </div>
      <div className="fyc-card-title">{season.title ?? `Season ${season.seasonNumber ?? ''}`}</div>
      <div className="fyc-card-sub">
        {count} episode{count === 1 ? '' : 's'}
      </div>
    </div>
  );
}
