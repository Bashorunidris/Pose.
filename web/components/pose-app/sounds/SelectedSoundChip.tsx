'use client';

import { useEffect, useRef, useState } from 'react';

import type { PoseSound } from '@/lib/pose-app/sounds';

type Props = {
  sound: PoseSound;
  onRemove: () => void;
};

/**
 * The sound a take is about to be recorded or posted with, pinned over the
 * recorder. The legacy drew one of these per screen — `#recSoundDisplay` @24960
 * on screen 1, `displayScreen6SoundInfo()` @60040 on screen 6, and a display on
 * the editor — each with its own copy of the markup and its own play toggle. One
 * chip at the sheet's level follows the take through every stage instead.
 */
export function SelectedSoundChip({ sound, onRemove }: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => () => audioRef.current?.pause(), []);

  const togglePreview = () => {
    if (!sound.audioUrl) return;
    if (playing) {
      audioRef.current?.pause();
      if (audioRef.current) audioRef.current.currentTime = 0;
      setPlaying(false);
      return;
    }
    const audio = new Audio(sound.audioUrl);
    audio.onended = () => setPlaying(false);
    void audio
      .play()
      .then(() => setPlaying(true))
      .catch(() => setPlaying(false));
    audioRef.current = audio;
  };

  return (
    <div className="fixed bottom-[110px] left-1/2 z-[100000] flex max-w-[calc(100%-40px)] -translate-x-1/2 items-center gap-[12px] rounded-[12px] border border-[rgba(255,0,80,0.4)] bg-[rgba(255,0,80,0.18)] px-[16px] py-[12px] backdrop-blur-[15px]">
      <div className="flex h-[44px] w-[44px] flex-shrink-0 items-center justify-center overflow-hidden rounded-[12px] bg-[linear-gradient(135deg,#ff0050_0%,#ff4081_100%)] text-[18px] text-white">
        {sound.thumbnail ? (
          <img src={sound.thumbnail} alt={sound.title} className="h-full w-full object-cover" />
        ) : (
          <i className="fas fa-music" />
        )}
      </div>
      <div className="flex min-w-0 flex-col gap-[2px]">
        <span className="truncate text-[14px] font-semibold text-white">{sound.title}</span>
        <span className="truncate text-[12px] text-[#aaa]">{sound.artist || 'Unknown Artist'}</span>
      </div>
      <div className="ml-auto flex flex-shrink-0 gap-[8px]">
        <button
          type="button"
          className="flex h-[34px] w-[34px] items-center justify-center rounded-full border-none bg-[#ff0050] text-[13px] text-white"
          onClick={togglePreview}
          title={playing ? 'Pause preview' : 'Play preview'}
        >
          <i className={playing ? 'fas fa-pause' : 'fas fa-play'} />
        </button>
        <button
          type="button"
          className="flex h-[34px] w-[34px] items-center justify-center rounded-full border-none bg-[rgba(255,255,255,0.12)] text-[13px] text-white"
          onClick={onRemove}
          title="Remove sound"
        >
          <i className="fas fa-xmark" />
        </button>
      </div>
    </div>
  );
}
