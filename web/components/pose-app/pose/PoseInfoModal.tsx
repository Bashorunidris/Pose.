'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import { poseYtCount } from '@/lib/pose-app/pose-tab';
import {
  playerDescription,
  playerPriceTag,
  playerTitle,
  playerTrailer,
  ratingStars,
  type PosePlayerVideo,
} from '@/lib/pose-app/pose-player';

type Props = {
  video: PosePlayerVideo | null;
  onClose: () => void;
  onPlay: (video: PosePlayerVideo) => void;
};

/**
 * `#tnModal` @27104 with `tnOpenModal()` @87644 — the Netflix-style info dialog
 * the hero's "More Info" button opens. It previews the trailer over the still and
 * summarises the title before handing over to the player.
 */
export function PoseInfoModal({ video, onClose, onPlay }: Props) {
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    void Promise.resolve().then(() => setPortalTarget(document.body));
  }, []);

  if (!portalTarget || !video) return null;

  const trailer = playerTrailer(video);
  const priceTag = playerPriceTag(video);
  const rating = Number(video.rating ?? video.stars ?? 0);
  const views = Number(video.views ?? video.viewCount) || 0;
  const likes = Number(video.likeCount ?? video.likes) || 0;

  return createPortal(
    <div className="pose-player-shell">
      <div className="tn-modal-bg" id="tnModalBg" style={{ display: 'flex' }} onClick={(event) => event.target === event.currentTarget && onClose()}>
        <div className="tn-modal" id="tnModal">
          <button type="button" className="tn-modal-x" onClick={onClose}>
            <i className="fas fa-xmark" />
          </button>
          <div className="tn-modal-hero">
            {trailer ? <video id="tnModalVideo" className="tn-loaded" src={trailer} autoPlay muted loop playsInline /> : null}
            <img id="tnModalThumb" src={video.thumbnail ?? video.thumbnailURL ?? video.thumbnailUrl ?? video.coverImage ?? ''} alt="" />
            <div className="tn-modal-hero-grad" />
            <div className="tn-modal-hero-title">
              <h2 id="tnModalTitle">{playerTitle(video)}</h2>
              <div id="tnModalMeta" className="tn-modal-meta-line">
                {[video.channel?.name ?? video.channelName ?? '', video.category ?? '', String(video.duration ?? '')]
                  .filter(Boolean)
                  .join(' · ')}
              </div>
            </div>
          </div>
          <div className="tn-modal-body">
            <div className="tn-modal-actions">
              <button type="button" className="tn-btn-play" id="tnModalPlayBtn" onClick={() => onPlay(video)}>
                <i className="fas fa-play" /> Play
              </button>
              <span className="tn-modal-stars" id="tnModalStars">
                {rating ? ratingStars(rating) : ''}
              </span>
              <span className={`tn-modal-price ${priceTag === 'FREE' ? 'free' : 'paid'}`} id="tnModalPrice">
                {priceTag === 'FREE' ? 'FREE' : <><i className="fas fa-coins" /> {priceTag}</>}
              </span>
            </div>
            <p className="tn-modal-desc" id="tnModalDesc">
              {playerDescription(video) || 'No description available.'}
            </p>
            <div className="tn-modal-stats" id="tnModalStats">
              {views ? (
                <span className="tn-stat-item">
                  <b>{poseYtCount(views)}</b> views
                </span>
              ) : null}
              {likes ? (
                <span className="tn-stat-item">
                  <b>{poseYtCount(likes)}</b> likes
                </span>
              ) : null}
              {video.channel?.subscriberCount ? (
                <span className="tn-stat-item">
                  <b>{poseYtCount(Number(video.channel.subscriberCount))}</b> subscribers
                </span>
              ) : null}
              {rating ? (
                <span className="tn-stat-item">
                  <b>{rating.toFixed(1)}/5</b> rating
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>,
    portalTarget,
  );
}
