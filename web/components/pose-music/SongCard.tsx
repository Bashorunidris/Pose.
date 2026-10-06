'use client';

import type { Song } from '@/lib/pose-music/types';
import {
  FALLBACK_SONG_COVER,
  PREVIEW_LIMIT_SECONDS,
  formatDuration,
  formatNumber,
} from '@/lib/pose-music/data';
import { BTN, META_TAG } from './styles';

const COVER_FALLBACK = FALLBACK_SONG_COVER;

type Props = {
  song: Song;
  playing: boolean;
  /** Position within the current page of the grid, used for the staggered entrance. */
  delayIndex: number;
  progressSeconds: number;
  showProgress: boolean;
  onTogglePlay: (song: Song) => void;
  onOpenEffects: (song: Song) => void;
};

export function SongCard({
  song,
  playing,
  delayIndex,
  progressSeconds,
  showProgress,
  onTogglePlay,
  onOpenEffects,
}: Props) {
  const progressWidth = Math.min((progressSeconds / PREVIEW_LIMIT_SECONDS) * 100, 100);

  return (
    <div
      className="group relative bg-music-card rounded-music p-[15px] cursor-pointer border border-transparent overflow-hidden animate-fade-up transition-all duration-[220ms] hover:bg-music-hover hover:border-music-hair-bright hover:-translate-y-[2px] hover:shadow-[0_8px_28px_rgba(0,0,0,.5)]"
      style={{ animationDelay: `${delayIndex * 0.04}s` }}
    >
      <div className="relative mb-[13px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={song.coverUrl}
          alt={song.title}
          className="w-full aspect-square object-cover rounded-music-sm block"
          onError={(event) => {
            event.currentTarget.src = COVER_FALLBACK;
          }}
        />
        <div className="absolute inset-0 bg-black/[.42] rounded-music-sm grid place-items-center opacity-0 transition-all duration-[220ms] group-hover:opacity-100">
          <button
            type="button"
            aria-label={playing ? 'Pause' : 'Play'}
            onClick={() => onTogglePlay(song)}
            className="w-[42px] h-[42px] bg-music-green rounded-full grid place-items-center text-black text-[15px] border-none cursor-pointer scale-[.85] translate-y-[6px] shadow-[0_4px_18px_rgba(29,185,84,.5)] transition-all duration-[220ms] group-hover:scale-100 group-hover:translate-y-0 hover:!scale-[1.08]"
          >
            <i className={`fas fa-${playing ? 'pause' : 'play'}`} />
          </button>
        </div>
      </div>

      <div>
        <h3 className="text-[13px] font-semibold mb-[2px] whitespace-nowrap overflow-hidden text-ellipsis">
          {song.title}
        </h3>
        <p className="text-[11.5px] text-music-ink-soft whitespace-nowrap overflow-hidden text-ellipsis">
          {song.artist}
        </p>
        <div className="flex gap-[4px] mt-[6px] flex-wrap">
          <span className={META_TAG}>{song.genre}</span>
          <span className={META_TAG}>{song.country}</span>
          <span className={META_TAG}>
            <i className="fas fa-clock" /> {formatDuration(song.duration)}
          </span>
        </div>
      </div>

      <div className="flex justify-between mt-[9px] text-[11px] text-music-ink-muted">
        <span className="inline-flex items-center gap-[3px]">
          <i className="fas fa-play-circle" /> {formatNumber(song.streamCount)}
        </span>
        <span className="inline-flex items-center gap-[3px]">
          <i className="fas fa-film" /> {formatNumber(song.useCount)}
        </span>
      </div>

      <div className="flex gap-[7px] mt-[11px]">
        <button
          type="button"
          onClick={() => onTogglePlay(song)}
          className={`${BTN} flex-1 py-[8px] px-[10px] text-[11.5px] ${
            playing
              ? 'bg-[rgba(29,185,84,.15)] border border-music-green text-music-green'
              : 'bg-music-surface text-music-ink border border-music-hair hover:bg-music-hover hover:border-music-hair-bright'
          }`}
        >
          <i className={`fas fa-${playing ? 'pause' : 'play'}`} />
          {' '}
          {playing ? 'Pause' : 'Preview'}
        </button>
        <button
          type="button"
          onClick={() => onOpenEffects(song)}
          className={`${BTN} flex-1 py-[8px] px-[10px] text-[11.5px] bg-music-green text-black hover:bg-music-green-bright hover:scale-[1.03]`}
        >
          <i className="fas fa-sliders-h" /> Use
        </button>
      </div>

      {showProgress ? (
        <div>
          <div className="w-full h-[3px] bg-[rgba(255,255,255,.09)] rounded-[2px] mt-[9px] overflow-hidden">
            <div
              className="h-full bg-music-green transition-[width] duration-100 ease-linear"
              style={{ width: `${progressWidth}%` }}
            />
          </div>
          <p className="text-center text-[10px] text-music-ink-muted mt-[3px]">
            {Math.floor(progressSeconds)}s / {PREVIEW_LIMIT_SECONDS}s preview
          </p>
        </div>
      ) : null}
    </div>
  );
}
