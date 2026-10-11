'use client';

import { formatPlayCount, type PoseSound } from '@/lib/pose-app/sounds';

type Props = {
  sound: PoseSound;
  playing: boolean;
  onPlay: (sound: PoseSound) => void;
  onFavourite: (sound: PoseSound) => void;
  onUse: (sound: PoseSound) => void;
  /** Only the Your Music tab carries a delete, as `createSoundItem()` @59340 had it. */
  onDelete?: (sound: PoseSound) => void;
};

/**
 * `createSoundItem()` @59340 — the thumbnail with its play overlay and trending
 * badge, the title/artist/meta column, and the heart plus Use buttons. The
 * legacy built this with `innerHTML` and then attached listeners by querying the
 * element back out of the document; this is the same markup as JSX.
 */
export function SoundRow({ sound, playing, onPlay, onFavourite, onUse, onDelete }: Props) {
  const showStats = Boolean(sound.uses || sound.plays);
  return (
    <div className={`sound-item${playing ? ' playing' : ''}`} data-sound-id={sound.id}>
      <div
        className="sound-thumbnail"
        onClick={() => onPlay(sound)}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') onPlay(sound);
        }}
        title={playing ? 'Pause' : 'Play'}
      >
        {sound.thumbnail ? <img src={sound.thumbnail} alt={sound.title} /> : <i className="fas fa-music" />}
        <div className="sound-play-icon">
          <i className={playing ? 'fas fa-pause' : 'fas fa-play'} />
        </div>
        {sound.trending ? (
          <div className="trending-badge">
            <span className="trending-text">
              <i className="fas fa-fire" /> Trending
            </span>
          </div>
        ) : null}
      </div>

      <div className="sound-info">
        <div className="sound-title">{sound.title}</div>
        <div className="sound-artist">{sound.artist || 'Unknown Artist'}</div>
        <div className="sound-meta">
          <span className="sound-duration" title={`Full duration: ${sound.duration}`}>
            <i className="fas fa-clock" /> {sound.duration}
          </span>
          {showStats ? (
            <span className="sound-stats">
              {sound.uses ? (
                <span className="sound-uses">
                  <i className="fas fa-users" /> {sound.uses} using
                </span>
              ) : null}
              {sound.uses && sound.plays ? <span className="text-[#999]">•</span> : null}
              {sound.plays ? (
                <span className="sound-plays">
                  <i className="fas fa-play" /> {formatPlayCount(sound.plays)}
                </span>
              ) : null}
            </span>
          ) : null}
        </div>
      </div>

      <div className="sound-actions">
        <button
          type="button"
          className={`sound-favorite-btn${sound.isFavorited ? ' active' : ''}`}
          onClick={() => onFavourite(sound)}
          title={sound.isFavorited ? 'Remove from favourites' : 'Add to favourites'}
        >
          <i className={sound.isFavorited ? 'fas fa-heart' : 'far fa-heart'} />
        </button>
        <button type="button" className="sound-action" onClick={() => onUse(sound)}>
          <i className="fas fa-check" /> Use
        </button>
        {onDelete ? (
          <button
            type="button"
            className="sound-action sound-delete-btn bg-[#dc2626]"
            onClick={() => onDelete(sound)}
            title="Delete track"
          >
            <i className="fas fa-trash" /> Delete
          </button>
        ) : null}
      </div>
    </div>
  );
}
