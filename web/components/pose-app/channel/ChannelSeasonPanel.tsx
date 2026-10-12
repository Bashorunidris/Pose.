'use client';

import { useEffect, useState } from 'react';

import { fetchSeasonEpisodes, isComingSoon } from '@/lib/pose-app/channel-page';
import type { PoseTabSeason } from '@/lib/pose-app/pose-tab';
import type { PoseEpisode } from '@/lib/pose-app/types';

type Props = {
  season: PoseTabSeason | null;
  onClose: () => void;
  onPlay: (episode: PoseEpisode) => void;
};

/**
 * `#fycSeasonPanel` @90486 with `fycOpenSeason()` @68585 and `fycCloseSeason()`
 * @68639 — the episode list that slides over the channel page.
 */
export function ChannelSeasonPanel({ season, onClose, onPlay }: Props) {
  const [episodes, setEpisodes] = useState<PoseEpisode[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!season) return;
    let cancelled = false;
    void Promise.resolve().then(() => {
      setEpisodes(null);
      setFailed(false);
    });
    void fetchSeasonEpisodes(season.channelId, season.id)
      .then((list) => {
        if (!cancelled) setEpisodes(list);
      })
      .catch((error) => {
        console.error('❌ fycOpenSeason error:', error);
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [season]);

  if (!season) return null;

  const title = season.title ?? `Season ${season.seasonNumber ?? ''}`;

  return (
    <div className={`fyc-season-panel${season ? ' active' : ''}`}>
      <div className="fyc-season-header">
        <button type="button" className="fyc-back" onClick={onClose} aria-label="Back">
          <i className="fas fa-arrow-left" />
        </button>
        <div className="fyc-season-titles">
          <div className="fyc-season-name">{title}</div>
          <div className="fyc-season-sub">{season.description ?? ''}</div>
        </div>
      </div>
      <div className="fyc-ep-list">
        {failed ? (
          <div className="fyc-empty">
            <p>Failed to load episodes.</p>
          </div>
        ) : episodes === null ? (
          <div className="fyc-loading">
            <div className="fyc-spinner" />
          </div>
        ) : episodes.length === 0 ? (
          <div className="fyc-empty">
            <i className="fas fa-list" />
            <p>No episodes in this season yet.</p>
          </div>
        ) : (
          episodes.map((episode) => {
            const thumb = episode.thumbnailURL ?? episode.thumbnailUrl ?? episode.thumbnail ?? '';
            const upcoming = isComingSoon(episode);
            return (
              <div
                className="fyc-ep"
                key={episode.id}
                onClick={() => {
                  if (!upcoming) onPlay(episode);
                }}
              >
                <div className="fyc-ep-thumb">
                  {thumb ? <img src={thumb} alt="" loading="lazy" /> : null}
                  <span className="fyc-ep-play">
                    <i className="fas fa-play-circle" />
                  </span>
                  <span className="fyc-ep-num">E{episode.episodeNumber ?? '?'}</span>
                </div>
                <div className="fyc-ep-info">
                  <div className="fyc-ep-title">
                    {episode.title ?? `Episode ${episode.episodeNumber ?? ''}`}
                  </div>
                  <div className="fyc-ep-desc">{episode.description ?? ''}</div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
