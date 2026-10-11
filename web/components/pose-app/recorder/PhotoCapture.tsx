'use client';

import { useState } from 'react';

import {
  PHOTO_RATIOS,
  PHOTO_TIMERS,
  capturePhotoFrame,
  ratioGuideBox,
  runPhotoCountdown,
  type PhotoSettings,
} from '@/lib/pose-app/photo-capture';
import {
  CAPTURE_FILTERS,
  filterCss,
  usePoseCamera,
  type RecorderToastKind,
} from '@/lib/pose-app/recorder';
import { cx } from '../styles';

type Props = {
  settings: PhotoSettings;
  onChange: (patch: Partial<PhotoSettings>) => void;
  /** The finished frame, mirrored and filtered the way `capturePhoto()` @54180 baked it. */
  onCaptured: (blob: Blob) => void;
  /** `openPhotoGallery()` @54454 — a hidden multi-select `<input type="file">`, owned by the sheet. */
  onOpenGallery: () => void;
  /** `backToScreen1()` @50849 — the video screen, not the shell. */
  onBack: () => void;
  onMode: (mode: 'video' | 'photo' | 'buzz') => void;
  onToast: (message: string, kind?: RecorderToastKind) => void;
};

/**
 * `#screen5` @25117 — photo mode's viewfinder, opened by the Photo tab
 * (`switchRecMode('photo')` @51004) or the Photo row in screen 1's left menu
 * (`switchRecordingMode('photo')` @51193).
 *
 * The composition frame is `updateRatioGuide()` @51792, the shutter is
 * `capturePhoto()` @54180 with `showPhotoCountdown()` @54012 in front of it, and
 * the timer/filter/ratio rows are the three the legacy's left menu carried. The
 * legacy also shipped `togglePhotoFlash()` @51661 and `togglePhotoGrid()` @53818
 * with no button anywhere to reach either, so the port leaves them out rather
 * than inventing the controls that would make them reachable.
 */
export function PhotoCapture({
  settings,
  onChange,
  onCaptured,
  onOpenGallery,
  onBack,
  onMode,
  onToast,
}: Props) {
  const { facing, ratio, timer, filter } = settings;
  const [menuOpen, setMenuOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [bottomOpen, setBottomOpen] = useState(false);
  const [frame, setFrame] = useState<{ width: number; height: number } | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [busy, setBusy] = useState(false);

  const { videoRef, stream, error, restart } = usePoseCamera(facing);
  const guide = frame ? ratioGuideBox(frame.width, frame.height, ratio) : null;

  const closePanels = () => {
    setMenuOpen(false);
    setFiltersOpen(false);
  };

  /** `togglePhotoTimer()` @51841 walked the fixed list and wrapped. */
  const cycleTimer = () => {
    const next = PHOTO_TIMERS[(PHOTO_TIMERS.indexOf(timer) + 1) % PHOTO_TIMERS.length];
    onChange({ timer: next });
    closePanels();
    onToast(next === 0 ? 'Timer off' : `Timer ${next}s`);
  };

  /** `togglePhotoRatio()` @53834 was the same four-step cycle. */
  const cycleRatio = () => {
    const next = PHOTO_RATIOS[(PHOTO_RATIOS.findIndex((entry) => entry.id === ratio) + 1) % PHOTO_RATIOS.length];
    onChange({ ratio: next.id });
    closePanels();
    onToast(`Aspect ${next.id}`);
  };

  /**
   * `capturePhoto()` @54180, in its order: refuse if the camera is not up, run
   * the timer if one is set, then crop, filter and mirror the frame onto a
   * canvas. The legacy alerted and re-initialised the camera when the stream was
   * missing; the port says so and leaves the retry button to the placeholder.
   */
  const shoot = async () => {
    const video = videoRef.current;
    if (!video || !stream) {
      onToast('The camera is not ready yet', 'error');
      return;
    }
    if (busy) return;

    setBusy(true);
    try {
      if (timer > 0) await runPhotoCountdown(timer, setCountdown);
      const blob = await capturePhotoFrame(video, settings);
      onCaptured(blob);
    } catch (cause) {
      console.error('Could not capture the photo:', cause);
      onToast('That shot could not be captured', 'error');
    } finally {
      setCountdown(0);
      setBusy(false);
    }
  };

  return (
    <div className="recording-screen active">
      <div className="photo-preview-wrapper">
        <video
          ref={videoRef}
          playsInline
          autoPlay
          muted
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: facing === 'user' ? 'scaleX(-1)' : undefined,
            filter: filterCss(filter),
          }}
          onLoadedMetadata={(event) =>
            setFrame({
              width: event.currentTarget.videoWidth,
              height: event.currentTarget.videoHeight,
            })
          }
        />

        {guide ? (
          <div
            className="ratio-guide-frame"
            id="ratioGuide"
            style={{ width: guide.width, height: guide.height }}
          />
        ) : null}

        {error || !stream ? (
          <div className="v2-camera-placeholder">
            <i className={error ? 'fas fa-ban' : 'fas fa-camera'} />
            <p>{error ?? 'Starting the camera…'}</p>
            {error ? (
              <button type="button" className="rec-menu-item" onClick={restart}>
                <i className="fas fa-rotate" /> Try again
              </button>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="rec-top-bar">
        <button type="button" className="rec-icon-btn" onClick={onBack} title="Back">
          <i className="fa-solid fa-arrow-left" />
        </button>
        <button
          type="button"
          className="rec-icon-btn"
          onClick={() => {
            const next = !menuOpen;
            closePanels();
            setMenuOpen(next);
          }}
          title="More options"
        >
          <i className="fa-solid fa-bars" />
        </button>
        <button
          type="button"
          className="rec-icon-btn"
          onClick={() => onChange({ facing: facing === 'user' ? 'environment' : 'user' })}
          title="Switch camera"
        >
          <i className="fa-solid fa-sync" />
        </button>
      </div>

      <div className={cx('rec-left-menu', menuOpen && 'show')}>
        <div className="rec-menu-item" onClick={cycleTimer}>
          <i className="fa-solid fa-stopwatch" /> {timer === 0 ? 'Timer' : `${timer}s`}
        </div>
        <div
          className="rec-menu-item"
          onClick={() => {
            const next = !filtersOpen;
            closePanels();
            setFiltersOpen(next);
          }}
        >
          <i className="fa-solid fa-palette" /> Filters
        </div>
        <div className="rec-menu-item" onClick={cycleRatio}>
          <i className="fa-solid fa-ruler-combined" /> {ratio}
        </div>
      </div>

      <div className="rec-effects-bar">
        <div className={cx('photo-filters-panel', filtersOpen && 'show')} id="photoFiltersPanel">
          <div className="photo-filters-scroll" id="photoFiltersScroll">
            {CAPTURE_FILTERS.map((entry) => (
              <button
                key={entry.id}
                type="button"
                className={cx('photo-filter-btn', filter === entry.id && 'active')}
                onClick={() => onChange({ filter: entry.id })}
                title={entry.title}
              >
                <div className={`photo-filter-preview ${entry.id}`} />
                <span>{entry.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="rec-bottom-controls photo-controls">
        <div className="photo-control-row">
          <button type="button" className="photo-control-btn" onClick={onOpenGallery}>
            <div className="rec-control-icon">
              <i className="fas fa-image" />
            </div>
            <div className="rec-control-label">Gallery</div>
          </button>
          <button type="button" className="photo-control-btn" onClick={cycleTimer}>
            <div className="rec-control-icon">
              <i className="fas fa-stopwatch" />
            </div>
            <div className="rec-control-label">{timer === 0 ? 'Timer' : `${timer}s`}</div>
          </button>
          <button
            type="button"
            className="photo-control-btn"
            onClick={() => {
              const next = !filtersOpen;
              closePanels();
              setFiltersOpen(next);
            }}
          >
            <div className="rec-control-icon">
              <i className="fas fa-palette" />
            </div>
            <div className="rec-control-label">
              {filter === 'none' ? 'Filters' : CAPTURE_FILTERS.find((entry) => entry.id === filter)?.label}
            </div>
          </button>
        </div>

        <div className="photo-record-btn-wrapper">
          <button type="button" className="photo-record-btn" onClick={() => void shoot()} title="Take a photo" />
        </div>

        <div className="rec-mode-tabs">
          <button type="button" className="rec-mode-tab" onClick={() => onMode('video')}>
            Video
          </button>
          <button type="button" className="rec-mode-tab active" onClick={() => onMode('photo')}>
            Photo
          </button>
          <button type="button" className="rec-mode-tab" onClick={() => onMode('buzz')}>
            Buzz
          </button>
        </div>

        <div className={cx('photo-filters-bottom-panel', bottomOpen && 'open')} id="photoFiltersBottomPanel">
          <div className="photo-filters-toggle-header" onClick={() => setBottomOpen((value) => !value)}>
            <span className="toggle-arrow">
              <i className={bottomOpen ? 'fas fa-chevron-up' : 'fas fa-chevron-down'} />
            </span>
            <span>
              <i className="fas fa-palette" /> Filters
            </span>
          </div>
          <div className="photo-filters-bottom-content">
            <div className="photo-filters-grid">
              {CAPTURE_FILTERS.map((entry) => (
                <button
                  key={entry.id}
                  type="button"
                  className={cx('photo-filter-btn-bottom', filter === entry.id && 'active')}
                  onClick={() => onChange({ filter: entry.id })}
                  title={entry.title}
                >
                  <div className={`photo-filter-preview ${entry.id}`} />
                  <span>{entry.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {countdown > 0 ? (
        <div className="fixed inset-0 z-[2147483647] flex items-center justify-center bg-black/70">
          <div className="animate-countdown-pulse text-[120px] font-bold text-[#FFD700] [text-shadow:0_0_30px_rgba(255,215,0,0.8)]">
            {countdown}
          </div>
        </div>
      ) : null}
    </div>
  );
}
