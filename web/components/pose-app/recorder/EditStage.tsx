'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { captureAspect, formatClock, type CaptureSettings } from '@/lib/pose-app/recorder';
import {
  VIDEO_EFFECTS,
  effectFilter,
  type VideoEdit,
  type VideoEffectName,
} from '@/lib/pose-app/publish';
import { cx } from '../styles';
import { RecorderConfirm } from './RecorderConfirm';

type Props = {
  clipUrl: string;
  seconds: number;
  settings: CaptureSettings;
  onBackToRecord: () => void;
  onNext: (edit: VideoEdit) => void;
  onToast: (message: string, kind?: 'info' | 'success' | 'error') => void;
};

type Tool = 'trim' | 'effects';

/**
 * `#v2EditScreen` @73758. The legacy kept the edit as a set of fields on
 * `window.v2EditedVideoState` — a trim range, a filter, a volume — that only the
 * publish step ever read, and it repainted the preview through the DOM on every
 * change. Here the same fields are React state and the preview is a function of
 * them.
 *
 * Deliberate fix: the legacy mirrored the recorded clip here and in the post
 * preview (`editVideo.style.transform = 'scaleX(-1)'`) but uploaded the
 * un-mirrored file, so every selfie flipped the moment it was posted. The port
 * mirrors the preview and hands the mirror to the bake at publish time.
 */
export function EditStage({
  clipUrl,
  seconds,
  settings,
  onBackToRecord,
  onNext,
  onToast,
}: Props) {
  const previewRef = useRef<HTMLVideoElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(seconds);
  const [tool, setTool] = useState<Tool | null>(null);
  const [effect, setEffect] = useState<VideoEffectName>('Normal');
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(0);
  /** What the preview is constrained to; the tool edits `trimStart`/`trimEnd` first. */
  const [applied, setApplied] = useState<{ start: number; end: number } | null>(null);
  const [confirmBack, setConfirmBack] = useState(false);

  useEffect(() => {
    const preview = previewRef.current;
    return () => preview?.pause();
  }, []);

  const play = useCallback(() => {
    const preview = previewRef.current;
    if (!preview) return;
    if (preview.paused) {
      // The clip carries its own audio; the editor is where you hear it.
      preview.muted = false;
      void preview.play().catch(() => undefined);
    } else {
      preview.pause();
    }
  }, []);

  /**
   * `trimVideoBlob()` @76154 promised to re-cut the recording and only managed to
   * pin playback inside the window, which is exactly what this does — the bake at
   * publish is where the cut is real.
   */
  const handleTimeUpdate = () => {
    const preview = previewRef.current;
    if (!preview) return;
    if (applied && preview.currentTime >= applied.end - 0.05) {
      preview.currentTime = applied.start;
    }
    setCurrentTime(preview.currentTime);
  };

  const applyTrim = () => {
    const start = Math.min(trimStart, trimEnd - 0.2);
    if (start >= trimEnd) {
      onToast('That trim range is empty', 'error');
      return;
    }
    setApplied({ start, end: trimEnd });
    setTool(null);
    const preview = previewRef.current;
    if (preview) preview.currentTime = start;
    onToast(`Trimmed to ${formatClock(trimEnd - start)}`);
  };

  const resetTrim = () => {
    setTrimStart(0);
    setTrimEnd(duration);
    setApplied(null);
    onToast('Trim reset');
  };

  const cancelTrim = () => {
    setTrimStart(applied?.start ?? 0);
    setTrimEnd(applied?.end ?? duration);
    setTool(null);
  };

  const dragHandle = (which: 'start' | 'end') => (event: React.PointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    const track = event.currentTarget.parentElement;
    if (!track) return;
    const bounds = track.getBoundingClientRect();
    const move = (clientX: number) => {
      const ratio = Math.min(1, Math.max(0, (clientX - bounds.left) / bounds.width));
      const value = ratio * duration;
      if (which === 'start') setTrimStart(Math.min(value, trimEnd - 0.2));
      else setTrimEnd(Math.max(value, trimStart + 0.2));
    };
    const onMove = (moveEvent: PointerEvent) => move(moveEvent.clientX);
    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  const startPercent = duration ? (trimStart / duration) * 100 : 0;
  const endPercent = duration ? (trimEnd / duration) * 100 : 100;

  return (
    <div className="v2-screen v2-edit-screen">
      <div className="v2-edit-video-wrapper" style={{ aspectRatio: captureAspect(settings.layout) }}>
        <div className="v2-edit-top-bar">
          <button
            type="button"
            className="v2-top-back-btn"
            onClick={() => setConfirmBack(true)}
            title="Back to recording"
          >
            <i className="fas fa-chevron-left" />
          </button>
          <div className="v2-top-title">Edit Video</div>
          <button
            type="button"
            className="v2-top-next-btn"
            onClick={() =>
              onNext({
                effect,
                trimStart: applied?.start ?? 0,
                trimEnd: applied?.end ?? 0,
                mirrored: true,
              })
            }
            title="Next"
          >
            <i className="fas fa-check" />
          </button>
        </div>

        {/*
          `toggleV2EditPlay()` @73988. The legacy's centre play button was a
          `.play-btn` with no rule behind it, so the only affordance was a tap on
          the video itself; the port draws the circle.
        */}
        <div className="video-container" onClick={play} style={{ width: '100%', height: '100%' }}>
          <video
            ref={previewRef}
            src={clipUrl}
            playsInline
            preload="auto"
            style={{
              width: '100%',
              height: '100%',
              background: '#000',
              objectFit: 'cover',
              transform: 'scaleX(-1)',
              filter: effectFilter(effect),
            }}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={(event) => {
              const length = event.currentTarget.duration;
              setDuration(length || seconds);
              setTrimEnd(length || seconds);
            }}
          />
          <div className={cx('video-overlay', !playing && 'visible')}>
            <span className="grid h-[70px] w-[70px] place-items-center rounded-full bg-white/85 text-[26px] text-black">
              <i className="fas fa-play" />
            </span>
          </div>
          <button
            type="button"
            className={cx('pause-btn', playing && 'visible')}
            onClick={(event) => {
              event.stopPropagation();
              play();
            }}
            title="Pause"
          >
            <i className="fas fa-pause" />
          </button>
        </div>

        <div className="v2-time-indicator">{formatClock(currentTime)}</div>

        <div className="v2-edit-right-panel">
          <button
            type="button"
            className={cx('v2-edit-side-btn', tool === 'trim' && 'active')}
            onClick={() => setTool((value) => (value === 'trim' ? null : 'trim'))}
            title="Trim"
          >
            <i className="fas fa-cut" />
          </button>
          <button
            type="button"
            className={cx('v2-edit-side-btn', tool === 'effects' && 'active')}
            onClick={() => setTool((value) => (value === 'effects' ? null : 'effects'))}
            title="Effects"
          >
            <i className="fas fa-palette" />
          </button>
          <button
            type="button"
            className="v2-edit-side-btn"
            onClick={() => onToast('The sound library lands in the next slice')}
            title="Add Sound"
          >
            <i className="fas fa-music" />
          </button>
        </div>
      </div>

      <div className={cx('v2-edit-bottom-sheet', tool && 'show')}>
        <div className="v2-sheet-handle" onClick={() => setTool(null)} />

        {tool === 'trim' ? (
          <div className="v2-edit-tool-section">
            <div className="v2-tool-section-title">
              <i className="fas fa-cut" /> Trim Video
            </div>
            <div className="v2-trim-section">
              <label className="mb-[12px] block text-[13px] font-semibold text-[#ccc]">
                <i className="fas fa-sliders-h" /> Drag Left/Right to Trim
              </label>
              <div className="mb-[20px] rounded-[8px] border border-[#333] bg-[#0a0a0a] p-[15px]">
                <div className="relative h-[54px] overflow-hidden rounded-[6px] bg-black">
                  {/* Everything outside the handles is what gets cut. */}
                  <div className="absolute inset-y-0 left-0 bg-black/70" style={{ width: `${startPercent}%` }} />
                  <div
                    className="absolute inset-y-0 right-0 bg-black/70"
                    style={{ width: `${100 - endPercent}%` }}
                  />
                  <div
                    className="absolute inset-y-0 border-y-2 border-[#FF0050] bg-[#FF0050]/15"
                    style={{ left: `${startPercent}%`, right: `${100 - endPercent}%` }}
                  />
                  <div
                    className="absolute inset-y-0 w-[30px] cursor-col-resize bg-[linear-gradient(90deg,#FF0050_0%,rgba(255,0,80,0.5)_100%)]"
                    style={{ left: `calc(${startPercent}% - 15px)` }}
                    onPointerDown={dragHandle('start')}
                  />
                  <div
                    className="absolute inset-y-0 w-[30px] cursor-col-resize bg-[linear-gradient(270deg,#FF0050_0%,rgba(255,0,80,0.5)_100%)]"
                    style={{ right: `calc(${100 - endPercent}% - 15px)` }}
                    onPointerDown={dragHandle('end')}
                  />
                </div>
              </div>

              <div className="mb-[20px] flex justify-between gap-[10px] rounded-[8px] border border-[#333] bg-[#0a0a0a] p-[15px]">
                <div className="flex-1 text-center">
                  <span className="mb-[6px] block text-[11px] text-[#888]">START</span>
                  <div className="text-[18px] font-bold text-[#6366f1]">{formatClock(trimStart)}</div>
                </div>
                <div className="flex-1 text-center">
                  <span className="mb-[6px] block text-[11px] text-[#888]">DURATION</span>
                  <div className="text-[18px] font-bold text-[#FF0050]">
                    {formatClock(Math.max(0, trimEnd - trimStart))}
                  </div>
                </div>
                <div className="flex-1 text-center">
                  <span className="mb-[6px] block text-[11px] text-[#888]">END</span>
                  <div className="text-[18px] font-bold text-[#6366f1]">{formatClock(trimEnd)}</div>
                </div>
              </div>

              <div className="flex gap-[10px]">
                <button type="button" className="v2-action-btn v2-action-btn-save flex-1" onClick={applyTrim}>
                  <i className="fas fa-check" /> Apply Trim
                </button>
                <button
                  type="button"
                  className="flex-1 rounded-[8px] border border-[#6496ff] bg-[rgba(100,150,255,0.3)] p-[10px] font-semibold text-[#96b8ff]"
                  onClick={resetTrim}
                >
                  <i className="fas fa-redo" /> Reset
                </button>
                <button
                  type="button"
                  className="flex-1 rounded-[8px] border border-[#ff6464] bg-[rgba(255,100,100,0.3)] p-[10px] font-semibold text-[#ff9696]"
                  onClick={cancelTrim}
                >
                  <i className="fas fa-times" /> Cancel
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {tool === 'effects' ? (
          <div className="v2-edit-tool-section">
            <div className="v2-tool-section-title">
              <i className="fas fa-palette" /> Effects
            </div>
            <div className="v2-effects-scroll">
              {VIDEO_EFFECTS.map((entry) => (
                <button
                  key={entry.name}
                  type="button"
                  className={cx('v2-effect-btn', effect === entry.name && 'active')}
                  onClick={() => {
                    setEffect(entry.name);
                    onToast(`${entry.name} effect applied`);
                  }}
                >
                  {/*
                    The legacy showed an emoji swatch (⭘ 🟤 ⬜ 🔵 🔴 📽️) that named
                    nothing; this one is a colour wheel wearing the effect, so the
                    chip shows what it will do.
                  */}
                  <span
                    className="h-[22px] w-[22px] rounded-full bg-[conic-gradient(from_180deg,#ff0050,#ffd700,#4ade80,#22d3ee,#8a2be2,#ff0050)]"
                    style={{ filter: entry.filter }}
                  />
                  <span>{entry.name === 'Vintage' ? 'Retro' : entry.name}</span>
                </button>
              ))}
            </div>
            <div className="mt-[15px] flex gap-[10px]">
              <button
                type="button"
                className="v2-action-btn v2-action-btn-save flex-1"
                onClick={() => {
                  setTool(null);
                  onToast(`${effect} effect applied`);
                }}
              >
                <i className="fas fa-check" /> Apply Effects
              </button>
              <button
                type="button"
                className="flex-1 rounded-[8px] border border-[#6496ff] bg-[rgba(100,150,255,0.3)] p-[10px] font-semibold text-[#96b8ff]"
                onClick={() => {
                  setEffect('Normal');
                  onToast('Effects reset to Normal');
                }}
              >
                <i className="fas fa-redo" /> Reset
              </button>
              <button
                type="button"
                className="flex-1 rounded-[8px] border border-[#ff6464] bg-[rgba(255,100,100,0.3)] p-[10px] font-semibold text-[#ff9696]"
                onClick={() => {
                  setEffect('Normal');
                  setTool(null);
                  onToast('Effects cancelled');
                }}
              >
                <i className="fas fa-times" /> Cancel
              </button>
            </div>
          </div>
        ) : null}
      </div>

      <RecorderConfirm
        open={confirmBack}
        title="Go Back to Recording?"
        message="Are you sure you want to go back? Your edits will be lost."
        confirmLabel="Go Back"
        onConfirm={() => {
          setConfirmBack(false);
          onBackToRecord();
        }}
        onCancel={() => setConfirmBack(false)}
      />
    </div>
  );
}
