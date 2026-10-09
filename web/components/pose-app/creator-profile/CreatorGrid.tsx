'use client';

import { useState } from 'react';

import {
  GRID,
  PIN_BTN,
  PLAY_ICON,
  PLAY_OVERLAY,
  STORIES_GRID,
  TILE,
  TILE_CAPTION,
  TILE_COUNTS,
  TILE_COUNT,
  TILE_MEDIA,
  TILE_STATS,
} from './creator-profile-ui';
import { formatCount } from '@/lib/pose-app/profile';
import { interactionCount } from '@/lib/pose-app/format';
import type { PoseVideo } from '@/lib/pose-app/types';

type Props = {
  videos: PoseVideo[];
  /** Stories render into `.stories-grid` @7580, every other tab into `.feed-grid` @7564. */
  variant?: 'grid' | 'stories';
  onOpen: (video: PoseVideo) => void;
};

/**
 * `createFeedVideoItem()` @37341 and `createFeedPhotoItem()` @37638. The two
 * legacy builders produce the same `.feed-item` shell — an absolutely positioned
 * media layer under a gradient stats overlay (the `.feed-item .feed-stats`
 * override @7630) — so one tile covers both, switching the media element on
 * `type === 'photo'`.
 */
export function CreatorGrid({ videos, variant = 'grid', onOpen }: Props) {
  return (
    <div className={variant === 'stories' ? STORIES_GRID : GRID}>
      {videos.map((video) => (
        <CreatorTile key={video.id} video={video} onOpen={onOpen} />
      ))}
    </div>
  );
}

function CreatorTile({ video, onOpen }: { video: PoseVideo; onOpen: (video: PoseVideo) => void }) {
  // The legacy pin is decoration: `isPinned` toggled the button colour and
  // nothing else, and no field was ever written back. Kept as-is rather than
  // inventing persistence.
  const [pinned, setPinned] = useState(false);
  const photo = video.type === 'photo' || video.isPhoto;

  // Photos and videos disagree about which count they read; `interactionCount`
  // takes the legacy `likeCount || Object.keys(likes).length || 0` either way.
  const likes = interactionCount(video.likeCount, video.likes);
  const views = Number(video.views ?? video.viewCount ?? 0) || 0;
  const comments = Number(video.comments ?? video.commentCount ?? 0) || 0;

  return (
    <div className={TILE} onClick={() => onOpen(video)}>
      {photo ? (
        <img className={TILE_MEDIA} src={video.imageUrl ?? video.videoUrl ?? ''} alt={video.caption ?? 'Photo'} />
      ) : (
        <video className={TILE_MEDIA} src={video.videoUrl} preload="metadata" muted playsInline />
      )}

      <button
        type="button"
        className={PIN_BTN}
        style={{ background: pinned ? 'rgba(255,0,80,0.7)' : 'rgba(0,0,0,0.6)' }}
        onClick={(event) => {
          event.stopPropagation();
          setPinned((value) => !value);
        }}
        aria-label="Pin"
      >
        <i className="fas fa-thumbtack" />
      </button>

      {!photo && (
        <div className={PLAY_OVERLAY}>
          <div className={PLAY_ICON}>
            <i className="fas fa-play" />
          </div>
        </div>
      )}

      <div className={TILE_STATS}>
        <div className={TILE_CAPTION}>{video.caption || 'Untitled'}</div>
        <div className={TILE_COUNTS}>
          <span className={TILE_COUNT}>
            <i className="fas fa-eye" />
            {formatCount(views)}
          </span>
          <span className={TILE_COUNT}>
            <i className="fas fa-heart text-[#ff0050]" />
            {formatCount(likes)}
          </span>
          <span className={TILE_COUNT}>
            <i className="fas fa-comments" />
            {formatCount(comments)}
          </span>
        </div>
      </div>
    </div>
  );
}
