'use client';

import { useEffect, useRef } from 'react';
import { DEFAULT_PLAYER_COVER } from '@/lib/pose-music/data';
import type { AudioEngine, ToggleName } from '@/lib/pose-music/use-audio-engine';
import type { Song } from '@/lib/pose-music/types';
import { TR } from './styles';

const BAR_COUNT = 12;

type Props = {
  open: boolean;
  song: Song | null;
  playing: boolean;
  engine: AudioEngine;
  onClose: () => void;
  onUse: () => void;
  onReset: () => void;
};

const GROUP_LABEL =
  'block text-[10px] font-bold tracking-[1px] uppercase text-music-ink-muted mb-[10px]';
const SLIDER_LABEL = 'text-[12px] text-music-ink-soft w-[75px] shrink-0';
const SLIDER_VALUE = 'text-[11.5px] font-semibold text-music-green w-[34px] text-right shrink-0';

function EqBars({ playing }: { playing: boolean }) {
  const barsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    let frameId = 0;
    const tick = () => {
      barsRef.current.forEach((bar) => {
        if (!bar) return;
        const height = playing ? 20 + Math.random() * 72 : 3 + Math.random() * 10;
        bar.style.height = `${height}%`;
      });
      frameId = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(frameId);
  }, [playing]);

  useEffect(() => {
    if (!playing) barsRef.current.forEach((bar) => { if (bar) bar.style.height = '4%'; });
  }, [playing]);

  return (
    <div className="flex items-end gap-[3px] h-[38px] py-[7px] px-[12px] bg-music-surface rounded-music-sm">
      {Array.from({ length: BAR_COUNT }, (_, index) => (
        <div
          key={index}
          ref={(node) => { barsRef.current[index] = node; }}
          className="flex-1 bg-music-green rounded-t-[2px] opacity-[.55] min-h-[3px] transition-[height] duration-100"
          style={{ height: '4%' }}
        />
      ))}
    </div>
  );
}

function ToggleRow({
  name,
  label,
  description,
  checked,
  onChange,
}: {
  name: ToggleName;
  label: string;
  description: string;
  checked: boolean;
  onChange: (name: ToggleName, on: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-[9px] px-[12px] bg-music-surface rounded-music-sm mb-[5px]">
      <div>
        <div className="text-[12.5px] font-medium">{label}</div>
        <div className="text-[10.5px] text-music-ink-muted">{description}</div>
      </div>
      <label className="relative w-[34px] h-[19px] shrink-0">
        <input
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(name, event.target.checked)}
          className="peer opacity-0 w-0 h-0 absolute"
          aria-label={label}
        />
        <span
          className={`absolute inset-0 rounded-[20px] cursor-pointer transition-all duration-[220ms] before:content-[''] before:absolute before:w-[13px] before:h-[13px] before:rounded-full before:left-[3px] before:top-[3px] before:bg-white before:transition-all peer-checked:before:translate-x-[15px] peer-checked:before:bg-black ${
            checked ? 'bg-music-green' : 'bg-music-hover'
          }`}
        />
      </label>
    </div>
  );
}

export function EffectsPanel({ open, song, playing, engine, onClose, onUse, onReset }: Props) {
  const { volume, pitch, bass, treble, activeSpeed, toggles, setSpeed, setVolume, setPitch, setBass, setTreble, toggle } = engine;

  return (
    <aside
      className={`fixed right-0 top-0 bottom-[90px] w-[310px] max-[600px]:w-full bg-black border-l border-music-hair z-[50] flex flex-col overflow-hidden transition-transform duration-[300ms] ease-[cubic-bezier(.4,0,.2,1)] ${
        open ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      <div className="pt-[22px] pb-[14px] px-[18px] border-b border-music-hair flex items-center justify-between">
        <h3 className="font-display text-[16px] font-bold">
          <i className="fas fa-sliders-h text-music-green mr-[7px]" />
          Sound Effects
        </h3>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close effects"
          className={`bg-transparent border-none text-music-ink-muted text-[17px] cursor-pointer p-[4px] ${TR} hover:text-music-ink`}
        >
          <i className="fas fa-times" />
        </button>
      </div>

      <div className="py-[12px] px-[18px] flex items-center gap-[11px] bg-music-surface border-b border-music-hair">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={song?.coverUrl || DEFAULT_PLAYER_COVER} alt="" className="w-[42px] h-[42px] rounded-[6px] object-cover" />
        <div>
          <div className="text-[12.5px] font-semibold">{song?.title ?? '—'}</div>
          <div className="text-[11px] text-music-ink-soft">{song?.artist ?? 'No sound selected'}</div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-[18px] flex flex-col gap-[18px]">
        <div>
          <span className={GROUP_LABEL}>Live EQ</span>
          <EqBars playing={playing} />
        </div>

        <div>
          <span className={GROUP_LABEL}>Playback Speed</span>
          <div className="flex gap-[5px] flex-wrap">
            {engine.effects.map((speed) => (
              <button
                key={speed}
                type="button"
                onClick={() => setSpeed(speed)}
                className={`py-[5px] px-[11px] rounded-[20px] font-body text-[11.5px] font-semibold cursor-pointer ${TR} ${
                  activeSpeed === speed
                    ? 'bg-music-green border border-music-green text-black'
                    : 'bg-music-surface border border-music-hair text-music-ink-soft hover:border-music-ink-muted hover:text-music-ink'
                }`}
              >
                {speed}×
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className={GROUP_LABEL}>Volume &amp; Gain</span>
          <div className="flex items-center gap-[10px] mb-[9px]">
            <label className={SLIDER_LABEL} htmlFor="fxVolume">Volume</label>
            <input
              id="fxVolume"
              type="range"
              className="music-range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={(event) => setVolume(Number(event.target.value))}
            />
            <span className={SLIDER_VALUE}>{Math.round(volume * 100)}%</span>
          </div>
        </div>

        <div>
          <span className={GROUP_LABEL}>Pitch &amp; Tone</span>
          <div className="flex items-center gap-[10px] mb-[9px]">
            <label className={SLIDER_LABEL} htmlFor="fxPitch">Pitch</label>
            <input
              id="fxPitch"
              type="range"
              className="music-range"
              min={-6}
              max={6}
              step={0.5}
              value={pitch}
              onChange={(event) => setPitch(Number(event.target.value))}
            />
            <span className={SLIDER_VALUE}>{pitch > 0 ? `+${pitch}` : pitch}</span>
          </div>
          <div className="flex items-center gap-[10px] mb-[9px]">
            <label className={SLIDER_LABEL} htmlFor="fxBass">Bass Boost</label>
            <input
              id="fxBass"
              type="range"
              className="music-range"
              min={0}
              max={20}
              step={1}
              value={bass}
              onChange={(event) => setBass(Number(event.target.value))}
            />
            <span className={SLIDER_VALUE}>{bass}</span>
          </div>
          <div className="flex items-center gap-[10px] mb-[9px]">
            <label className={SLIDER_LABEL} htmlFor="fxTreble">Treble</label>
            <input
              id="fxTreble"
              type="range"
              className="music-range"
              min={-10}
              max={10}
              step={1}
              value={treble}
              onChange={(event) => setTreble(Number(event.target.value))}
            />
            <span className={SLIDER_VALUE}>{treble}</span>
          </div>
        </div>

        <div>
          <span className={GROUP_LABEL}>Sound Effects</span>
          <ToggleRow name="reverb" label="Reverb" description="Add space & depth" checked={toggles.reverb} onChange={toggle} />
          <ToggleRow name="echo" label="Echo / Delay" description="Repeat with decay" checked={toggles.echo} onChange={toggle} />
          <ToggleRow name="lofi" label="Lo-Fi Filter" description="Vintage vinyl feel" checked={toggles.lofi} onChange={toggle} />
          <ToggleRow name="nightcore" label="Night Core" description="Faster + higher pitch" checked={toggles.nightcore} onChange={toggle} />
        </div>

        <button
          type="button"
          onClick={onReset}
          className={`bg-music-surface border border-music-hair text-music-ink-soft py-[8px] px-[14px] rounded-music-sm cursor-pointer font-body text-[12.5px] font-semibold inline-flex items-center justify-center gap-[5px] w-full ${TR} hover:text-white`}
        >
          <i className="fas fa-undo" /> Reset All Effects
        </button>
      </div>

      <button
        type="button"
        onClick={onUse}
        className={`mx-[18px] mb-[18px] p-[12px] bg-music-green text-black border-none rounded-music text-[13.5px] font-bold cursor-pointer font-body inline-flex items-center justify-center gap-[7px] ${TR} hover:bg-music-green-bright hover:scale-[1.02]`}
      >
        <i className="fas fa-film" /> Use in Video / Photo
      </button>
    </aside>
  );
}
