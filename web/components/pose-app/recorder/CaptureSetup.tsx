'use client';

import { useState } from 'react';

import {
  CAPTURE_DURATIONS,
  CAPTURE_FILTERS,
  CAPTURE_LAYOUTS,
  CAPTURE_MAX_DURATION,
  CAPTURE_MIN_DURATION,
  CAPTURE_TIMERS,
  durationLabel,
  filterCss,
  usePoseCamera,
  type CaptureSettings,
  type RecorderToastKind,
} from '@/lib/pose-app/recorder';
import { cx } from '../styles';

type Props = {
  /** Screen 1's live settings, owned by `RecorderSheet` so a retake keeps them. */
  settings: CaptureSettings;
  onChange: (patch: Partial<CaptureSettings>) => void;
  /** `#recMainBtn` — `openV2RecordScreen()` @74037 took these settings with it. */
  onStart: () => void;
  onClose: () => void;
  onToast: (message: string, kind?: RecorderToastKind) => void;
};

/**
 * `#screen1` @24849 — the video setup screen `openRecordingUI()` @58472 raises.
 * The record button hands off to the recorder rather than recording here, which
 * is what `#recMainBtn` did in the legacy; the status bar and the pause/stop
 * cluster that `recordVideo()` @47275 drove are gone with that dead path.
 */
export function CaptureSetup({ settings, onChange, onStart, onClose, onToast }: Props) {
  const { layout, duration, timer, filter, facing } = settings;
  const [customDuration, setCustomDuration] = useState(String(settings.duration));
  const [menuOpen, setMenuOpen] = useState(false);
  const [layoutOpen, setLayoutOpen] = useState(false);
  const [durationOpen, setDurationOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Destructured rather than kept as `camera.x`: `react-hooks/refs` treats an
  // object that is also spread onto a `ref` prop as ref-like, and then flags
  // every read of it during render.
  const { videoRef, error, restart } = usePoseCamera(facing);

  const closePanels = () => {
    setMenuOpen(false);
    setLayoutOpen(false);
    setDurationOpen(false);
    setFiltersOpen(false);
  };

  /** `toggleRecordingTimer()` @53509 walked the fixed list and wrapped. */
  const cycleTimer = () => {
    const next = CAPTURE_TIMERS[(CAPTURE_TIMERS.indexOf(timer) + 1) % CAPTURE_TIMERS.length];
    onChange({ timer: next });
    onToast(next === 0 ? 'Recording timer off' : `Recording timer ${next}s`);
  };

  /** `setCustomRecordingDuration()` @51372 accepted 1-600 seconds. */
  const applyCustomDuration = () => {
    const seconds = Number.parseInt(customDuration, 10);
    if (Number.isNaN(seconds) || seconds < CAPTURE_MIN_DURATION || seconds > CAPTURE_MAX_DURATION) {
      onToast(
        `Duration must be ${CAPTURE_MIN_DURATION}-${CAPTURE_MAX_DURATION} seconds`,
        'error',
      );
      return;
    }
    onChange({ duration: seconds });
    setDurationOpen(false);
    onToast(`Duration set to ${seconds} seconds`);
  };

  const pickDuration = (seconds: number) => {
    onChange({ duration: seconds });
    setCustomDuration(String(seconds));
    setDurationOpen(false);
    onToast(`Duration set to ${seconds} seconds`);
  };

  /** `setRecordingLayout()` @51216 — the label toast is the only feedback there was. */
  const pickLayout = (next: CaptureSettings['layout']) => {
    onChange({ layout: next });
    closePanels();
    onToast(`${CAPTURE_LAYOUTS.find((entry) => entry.id === next)?.label ?? 'Full'} layout selected`);
  };

  /** `toggleVideoCameraFacing()` @47224 stopped the stream, flipped and re-opened. */
  const flipCamera = () => {
    const next: CaptureSettings['facing'] = facing === 'user' ? 'environment' : 'user';
    onChange({ facing: next });
    onToast(`${next === 'user' ? 'Front' : 'Back'} camera`);
  };

  return (
    <div className="recording-screen active">
      <video
        ref={videoRef}
        className="camera-preview"
        playsInline
        autoPlay
        muted
        style={{
          transform: facing === 'user' ? 'scaleX(-1)' : undefined,
          filter: filterCss(filter),
        }}
      />

      {error ? (
        <div className="camera-error-overlay">
          <div style={{ textAlign: 'center', color: '#fff', padding: '0 24px' }}>
            <div style={{ fontSize: 48, marginBottom: 15 }}>
              <i className="fas fa-video" />
            </div>
            <div style={{ fontSize: 14, marginBottom: 10 }}>{error}</div>
            <div style={{ fontSize: 12, color: '#aaa', lineHeight: 1.6, marginBottom: 16 }}>
              Check that the browser has permission and that no other app is using the camera.
            </div>
            <button type="button" className="rec-menu-item" onClick={restart}>
              <i className="fas fa-rotate" /> Try again
            </button>
          </div>
        </div>
      ) : null}

      <div className="rec-top-bar">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button type="button" className="rec-icon-btn" onClick={onClose} title="Close">
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
            <i className="fa-solid fa-caret-down" />
          </button>
        </div>
        <button type="button" className="rec-icon-btn" onClick={flipCamera} title="Switch camera">
          <i className="fa-solid fa-rotate" />
        </button>
      </div>

      <div className={cx('rec-left-menu', menuOpen && 'show')}>
        <div
          className="rec-menu-item"
          onClick={() => {
            closePanels();
            onToast('Photo mode lands in the next slice');
          }}
        >
          <i className="fas fa-camera" /> Photo
        </div>
        <div
          className="rec-menu-item"
          onClick={() => {
            const next = !layoutOpen;
            closePanels();
            setLayoutOpen(next);
          }}
        >
          <i className="fas fa-table-cells" /> Layout
        </div>
        <div
          className="rec-menu-item"
          onClick={() => {
            closePanels();
            cycleTimer();
          }}
        >
          <i className="fas fa-stopwatch" /> Timer
        </div>
        <div
          className="rec-menu-item"
          onClick={() => {
            const next = !filtersOpen;
            closePanels();
            setFiltersOpen(next);
          }}
        >
          <i className="fas fa-palette" /> Filters
        </div>
      </div>

      <div className={cx('rec-options-panel', layoutOpen && 'show')}>
        <div className="rec-options-header">
          <span style={{ flex: 1, textAlign: 'center', color: 'white', fontWeight: 600 }}>
            Recording Layout
          </span>
          <button type="button" className="rec-options-close" onClick={() => setLayoutOpen(false)}>
            <i className="fas fa-xmark" />
          </button>
        </div>
        <div className="rec-options-grid">
          {CAPTURE_LAYOUTS.map((entry) => (
            <button
              key={entry.id}
              type="button"
              className={cx('rec-option-btn', layout === entry.id && 'active')}
              onClick={() => pickLayout(entry.id)}
              title={entry.label}
            >
              <div className="rec-option-icon">
                <i className={`fas ${entry.icon}`} />
              </div>
              <span>{entry.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className={cx('rec-options-panel', durationOpen && 'show')}>
        <div className="rec-options-header">
          <span style={{ flex: 1, textAlign: 'center', color: 'white', fontWeight: 600 }}>
            Recording Duration
          </span>
          <button type="button" className="rec-options-close" onClick={() => setDurationOpen(false)}>
            <i className="fas fa-xmark" />
          </button>
        </div>
        <div className="rec-options-grid">
          {CAPTURE_DURATIONS.map((seconds) => (
            <button
              key={seconds}
              type="button"
              className={cx('rec-option-btn', duration === seconds && 'active')}
              onClick={() => pickDuration(seconds)}
              title={`${seconds} seconds`}
            >
              <div className="rec-option-icon">
                <i className="fas fa-clock" />
              </div>
              <span>{seconds} sec</span>
            </button>
          ))}
        </div>
        <div style={{ padding: 15, borderTop: '1px solid #333' }}>
          <label
            htmlFor="customDurationInput"
            style={{ display: 'block', color: 'white', fontSize: 12, marginBottom: 8 }}
          >
            Custom Duration (seconds):
          </label>
          <div style={{ display: 'flex', gap: 10 }}>
            <input
              id="customDurationInput"
              type="number"
              min={CAPTURE_MIN_DURATION}
              max={CAPTURE_MAX_DURATION}
              value={customDuration}
              onChange={(event) => setCustomDuration(event.target.value)}
              style={{
                flex: 1,
                padding: 10,
                background: '#2a2a2a',
                border: '1px solid #444',
                borderRadius: 6,
                color: 'white',
                fontSize: 14,
              }}
            />
            <button
              type="button"
              onClick={applyCustomDuration}
              style={{
                padding: '10px 15px',
                background: 'linear-gradient(135deg, #4C1D95, #6D28D9)',
                border: 'none',
                borderRadius: 6,
                color: 'white',
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
            >
              Set
            </button>
          </div>
        </div>
      </div>

      <div className={cx('rec-filters-panel', filtersOpen && 'show')}>
        <div className="rec-filters-scroll">
          {CAPTURE_FILTERS.map((entry) => (
            <button
              key={entry.id}
              type="button"
              className={cx('rec-filter-btn', filter === entry.id && 'active')}
              onClick={() => onChange({ filter: entry.id })}
              title={entry.title}
            >
              <div className={`rec-filter-preview ${entry.id}`} />
              <span>{entry.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="rec-bottom-controls">
        <div className="rec-control-row">
          <button
            type="button"
            className="rec-control-btn"
            onClick={() => {
              closePanels();
              setDurationOpen(true);
            }}
          >
            <div className="rec-control-icon">
              <i className="fas fa-hourglass-half" />
            </div>
            <div className="rec-control-label">{durationLabel(duration)}</div>
          </button>
          <button
            type="button"
            className="rec-control-btn"
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
              {filter === 'none' ? 'Filters' : CAPTURE_FILTERS.find((entry) => entry.id === filter)?.title}
            </div>
          </button>
          <button type="button" className="rec-control-btn rec-timer-btn" onClick={cycleTimer}>
            <div className="rec-control-icon">
              <i className="fas fa-stopwatch" />
            </div>
            <div className="rec-control-label">{timer === 0 ? 'Off' : `${timer}s`}</div>
          </button>
        </div>

        <div className="rec-record-btn-wrapper">
          <div className="rec-btn-container">
            <button
              type="button"
              className="rec-side-btn"
              onClick={() => onToast('The sound library lands in the next slice')}
              title="Add Sound"
            >
              <i className="fas fa-music" />
            </button>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              <button
                type="button"
                className="rec-record-btn"
                title="Record video"
                onClick={onStart}
              >
                <div className="rec-btn-inner">
                  <div className="rec-btn-circle" />
                </div>
              </button>
              <div className="rec-btn-label">Start</div>
            </div>

            <button
              type="button"
              className="rec-side-btn"
              onClick={() => onToast('Uploading a clip lands with the editor')}
              title="Add Video"
            >
              <i className="fas fa-video" />
            </button>
          </div>

          {/*
            The legacy badge read "4K" above a 1280x720 capture constraint, so the
            port says what the camera is actually being asked for.
          */}
          <div className="rec-quality-badge">
            <span className="rec-quality-icon">
              <i className="fas fa-video" />
            </span>
            <span className="rec-quality-text">HD</span>
          </div>
        </div>

        <div className="rec-mode-tabs">
          <button type="button" className="rec-mode-tab active">
            Video
          </button>
          <button
            type="button"
            className="rec-mode-tab"
            onClick={() => onToast('Photo mode lands in the next slice')}
          >
            Photo
          </button>
          <button
            type="button"
            className="rec-mode-tab"
            onClick={() => onToast('Buzz posting lands in a later slice')}
          >
            Buzz
          </button>
        </div>
      </div>
    </div>
  );
}
