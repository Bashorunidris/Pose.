'use client';

import { DEFAULT_PLAYER_COVER, PREVIEW_LIMIT_SECONDS, formatDuration } from '@/lib/pose-music/data';
import { TR } from './styles';

type Props = {
  coverUrl: string;
  title: string;
  artist: string;
  playing: boolean;
  liked: boolean;
  currentTime: number;
  volume: number;
  onTogglePlay: () => void;
  onToggleLike: () => void;
  onSeek: (seconds: number) => void;
  onVolume: (value: number) => void;
  onOpenEffects: () => void;
};

const PLAYER_BUTTON =
  `bg-transparent border-none text-music-ink-soft cursor-pointer py-[5px] px-[9px] rounded-full text-[16px] ${TR} hover:text-music-ink hover:bg-white/[.07]`;

export function PlayerBar({
  coverUrl,
  title,
  artist,
  playing,
  liked,
  currentTime,
  volume,
  onTogglePlay,
  onToggleLike,
  onSeek,
  onVolume,
  onOpenEffects,
}: Props) {
  return (
    <div className="bg-music-elevated border-t border-music-hair grid grid-cols-[1fr_auto_1fr] items-center px-[22px] gap-[14px] z-10 max-[600px]:grid-cols-[1fr_auto] max-[600px]:px-[14px]">
      <div className="flex items-center gap-[11px] min-w-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={coverUrl || DEFAULT_PLAYER_COVER}
          alt=""
          className="w-[50px] h-[50px] rounded-[6px] object-cover shrink-0 bg-music-surface"
        />
        <div className="min-w-0">
          <div className="text-[12.5px] font-semibold whitespace-nowrap overflow-hidden text-ellipsis">
            {title}
          </div>
          <div className="text-[11px] text-music-ink-soft">{artist}</div>
        </div>
        <button
          type="button"
          onClick={onToggleLike}
          aria-label="Like this sound"
          className={`bg-transparent border-none cursor-pointer p-[5px] text-[13.5px] shrink-0 ${TR} hover:text-music-green hover:scale-[1.15] ${
            liked ? 'text-music-green' : 'text-music-ink-muted'
          }`}
        >
          <i className="hgi hgi-stroke hgi-favourite" />
        </button>
      </div>

      <div className="flex flex-col items-center gap-[7px]">
        <div className="flex items-center gap-[4px]">
          <button type="button" className={PLAYER_BUTTON} aria-hidden="true" tabIndex={-1}>
            <i className="hgi hgi-stroke hgi-information-circle" />
          </button>
          <button type="button" className={PLAYER_BUTTON} aria-hidden="true" tabIndex={-1}>
            <i className="hgi hgi-stroke hgi-information-circle" />
          </button>
          <button
            type="button"
            onClick={onTogglePlay}
            aria-label={playing ? 'Pause' : 'Play'}
            className={`${PLAYER_BUTTON} !text-[20px] text-music-ink py-[7px]`}
          >
            <i className={`hgi hgi-stroke hgi-${playing ? 'pause' : 'play'}`} />
          </button>
          <button type="button" className={PLAYER_BUTTON} aria-hidden="true" tabIndex={-1}>
            <i className="hgi hgi-stroke hgi-information-circle" />
          </button>
          <button type="button" className={PLAYER_BUTTON} aria-hidden="true" tabIndex={-1}>
            <i className="hgi hgi-stroke hgi-reload" />
          </button>
        </div>
        <div className="flex items-center gap-[7px] w-full max-w-[380px]">
          <span className="text-[10px] text-music-ink-muted w-[28px] text-center shrink-0">
            {formatDuration(currentTime)}
          </span>
          <input
            type="range"
            className="music-range"
            min={0}
            max={PREVIEW_LIMIT_SECONDS}
            step={0.1}
            value={currentTime}
            aria-label="Seek"
            onChange={(event) => onSeek(Number(event.target.value))}
          />
          <span className="text-[10px] text-music-ink-muted w-[28px] text-center shrink-0">
            0:30
          </span>
        </div>
      </div>

      <div className="flex items-center justify-end gap-[7px] max-[600px]:hidden">
        <button
          type="button"
          onClick={onOpenEffects}
          className={`inline-flex items-center gap-[5px] bg-[rgba(29,185,84,.1)] border border-[rgba(29,185,84,.22)] text-music-green py-[6px] px-[13px] rounded-[20px] text-[11.5px] font-semibold cursor-pointer font-body ${TR} hover:bg-[rgba(29,185,84,.2)]`}
        >
          <i className="hgi hgi-stroke hgi-sliders-horizontal" /> Effects
        </button>
        <i className="hgi hgi-stroke hgi-volume-high text-music-ink-muted text-[13px]" />
        <input
          type="range"
          className="music-range w-[75px]"
          min={0}
          max={1}
          step={0.01}
          value={volume}
          aria-label="Volume"
          onChange={(event) => onVolume(Number(event.target.value))}
        />
      </div>
    </div>
  );
}
