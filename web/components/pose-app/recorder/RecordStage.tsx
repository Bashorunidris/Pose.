'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import {
  captureAspect,
  formatClock,
  recorderOptions,
  usePoseCamera,
  type CaptureFacing,
  type CaptureSettings,
  type RecorderToastKind,
} from '@/lib/pose-app/recorder';
import { cx } from '../styles';
import { RecorderConfirm } from './RecorderConfirm';

export type CaptureClip = { url: string; blob: Blob; seconds: number };

type Props = {
  settings: CaptureSettings;
  /** `v2CloseRecordScreen()` @74666 / `v2ConfirmCloseRecording()` @74689 — both land back on screen 1. */
  onBack: () => void;
  onRecorded: (clip: CaptureClip) => void;
  onToast: (message: string, kind?: RecorderToastKind) => void;
};

/**
 * `#v2RecordScreen` @73603 with `openV2RecordScreen()`'s auto-start @74037
 * folded in: the port opens the camera on mount and starts recording as soon as
 * the stream is live, which is what the legacy did after a `loadeddata` listener
 * and a 300ms delay.
 *
 * Recording runs straight off the camera stream. The legacy composited it onto a
 * canvas first (`v2SetupCanvasRecording()` @74282) so a filter could be burned in
 * frame by frame; that compositing lands with the editor slice, which is also
 * where the legacy's recorded blob went.
 */
export function RecordStage({ settings, onBack, onRecorded, onToast }: Props) {
  const [facing, setFacing] = useState<CaptureFacing>(settings.facing);
  const [recording, setRecording] = useState(false);
  const [paused, setPaused] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [countdown, setCountdown] = useState(settings.timer);
  const [confirming, setConfirming] = useState(false);

  // See CaptureSetup: keeping this object whole would make every render-time read
  // of it look like a ref read.
  const { videoRef, stream, error, restart } = usePoseCamera(facing);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const intervalRef = useRef<number | null>(null);
  const elapsedRef = useRef(0);
  const startedRef = useRef(false);
  /** `window.v2CancelPendingEdit` @74692 — a discarded take must not be handed on. */
  const cancelledRef = useRef(false);

  const clearTimer = useCallback(() => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const stopRecording = useCallback(() => {
    clearTimer();
    const recorder = recorderRef.current;
    if (!recorder || recorder.state === 'inactive') return;
    setPaused(false);
    recorder.stop();
  }, [clearTimer]);

  const startTimer = useCallback(() => {
    clearTimer();
    intervalRef.current = window.setInterval(() => {
      elapsedRef.current += 1;
      setElapsed(elapsedRef.current);
      if (elapsedRef.current >= settings.duration) stopRecording();
    }, 1000);
  }, [clearTimer, settings.duration, stopRecording]);

  const startRecorder = useCallback(() => {
    const live = stream;
    if (!live || recorderRef.current) return;

    const combined = new MediaStream([...live.getVideoTracks(), ...live.getAudioTracks()]);
    const recorder = new MediaRecorder(combined, recorderOptions());
    recorderRef.current = recorder;
    chunksRef.current = [];

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunksRef.current.push(event.data);
    };

    recorder.onstop = () => {
      clearTimer();
      if (cancelledRef.current) return;
      const chunks = chunksRef.current;
      chunksRef.current = [];
      const blob = new Blob(chunks, { type: 'video/webm' });
      onRecorded({ url: URL.createObjectURL(blob), blob, seconds: elapsedRef.current });
    };

    recorder.start();
    elapsedRef.current = 0;
    setElapsed(0);
    setRecording(true);
    setPaused(false);
    startTimer();
    onToast(`Recording started (${settings.duration}s limit)`, 'success');
  }, [stream, clearTimer, onRecorded, onToast, settings.duration, startTimer]);

  // `openV2RecordScreen()` waited for the camera and then auto-started; the
  // countdown below is `showRecordingCountdown()` @53544.
  useEffect(() => {
    if (!stream || countdown > 0 || startedRef.current) return;
    startedRef.current = true;
    startRecorder();
  }, [stream, countdown, startRecorder]);

  useEffect(() => {
    if (countdown <= 0) return;
    const timeout = window.setTimeout(() => setCountdown((value) => value - 1), 1000);
    return () => window.clearTimeout(timeout);
  }, [countdown]);

  // The legacy had to call `v2TurnOffCamera()` by hand on every exit path; here
  // the camera hook does it on unmount. A recorder still running at that point is
  // stopped so the file it holds is dropped rather than handed to the editor.
  useEffect(
    () => () => {
      cancelledRef.current = true;
      clearTimer();
      const recorder = recorderRef.current;
      if (recorder && recorder.state !== 'inactive') recorder.stop();
    },
    [clearTimer],
  );

  /** `v2ToggleRecordingPause()` @74867 — the clock stops with the recorder. */
  const togglePause = () => {
    const recorder = recorderRef.current;
    if (!recorder || recorder.state === 'inactive') return;

    if (!paused) {
      if (recorder.state === 'recording') recorder.pause();
      clearTimer();
      setPaused(true);
      onToast('Recording paused');
      return;
    }

    if (recorder.state === 'paused') recorder.resume();
    startTimer();
    setPaused(false);
    onToast('Recording resumed');
  };

  /** `v2SwitchCamera()` @75060 refused to flip mid-take. */
  const switchCamera = () => {
    if (recording) {
      onToast('Cannot switch camera while recording', 'error');
      return;
    }
    setFacing((value) => (value === 'user' ? 'environment' : 'user'));
  };

  /** `v2CloseRecordScreen()` @74666 — mid-take, or with chunks in hand, it asks first. */
  const requestBack = () => {
    if (recording || elapsedRef.current > 0) {
      setConfirming(true);
      return;
    }
    onBack();
  };

  const discard = () => {
    setConfirming(false);
    cancelledRef.current = true;
    clearTimer();
    const recorder = recorderRef.current;
    if (recorder && recorder.state !== 'inactive') recorder.stop();
    onBack();
  };

  return (
    <div className={cx('v2-screen', 'v2-record-screen')}>
      <div className="v2-record-video-wrapper" style={{ aspectRatio: captureAspect(settings.layout) }}>
        <button type="button" className="v2-record-back-btn" onClick={requestBack} title="Back">
          <i className="fas fa-chevron-left" />
        </button>

        <button type="button" className="v2-record-close-btn" onClick={requestBack} title="Close">
          <i className="fas fa-times" />
        </button>

        {/*
          No filter on this preview: a CSS filter is not part of the recorded
          stream, so showing one here would promise a burn-in the file does not
          carry. `v2SetupCanvasRecording()` @74282 paints it into the canvas that
          gets recorded instead, and that lands with the editor slice.
        */}
        <video
          ref={videoRef}
          playsInline
          autoPlay
          muted
          style={{ transform: facing === 'user' ? 'scaleX(-1)' : undefined }}
        />

        {error || !stream ? (
          <div className="v2-camera-placeholder">
            <i className={error ? 'fas fa-ban' : 'fas fa-video'} />
            <p>{error ?? 'Starting the camera…'}</p>
            {error ? (
              <button type="button" className="rec-menu-item" onClick={restart}>
                <i className="fas fa-rotate" /> Try again
              </button>
            ) : null}
          </div>
        ) : null}

        <div className={cx('v2-record-status-bar', recording && 'active')}>
          <div className="v2-record-dot" />
          <div className={cx('v2-record-timer', recording && 'show')}>{formatClock(elapsed)}</div>
        </div>

        <div className="v2-record-controls">
          <button
            type="button"
            className="v2-record-action-btn"
            onClick={switchCamera}
            disabled={recording}
            title="Switch Camera"
          >
            <i className="fas fa-sync" />
          </button>

          <button
            type="button"
            className={cx('v2-record-btn', recording && 'recording')}
            onClick={() => (recording ? stopRecording() : startRecorder())}
            title={recording ? 'Stop recording' : 'Click to start recording'}
          >
            <div className="v2-record-inner" />
          </button>

          <button
            type="button"
            className="v2-record-action-btn"
            onClick={togglePause}
            style={{ display: recording ? 'flex' : 'none' }}
            title={paused ? 'Resume Recording' : 'Pause/Resume'}
          >
            <i className={paused ? 'fas fa-play' : 'fas fa-pause'} />
          </button>
        </div>

        {countdown > 0 ? (
          <div className="fixed inset-0 z-[2147483647] flex items-center justify-center bg-black/70">
            <div className="animate-countdown-pulse text-[120px] font-bold text-[#FFD700] [text-shadow:0_0_30px_rgba(255,215,0,0.8)]">
              {countdown}
            </div>
          </div>
        ) : null}
      </div>

      <RecorderConfirm
        open={confirming}
        title="Close Recording?"
        message="Are you sure you want to close? Any unsaved recording will be lost."
        confirmLabel="Close"
        onConfirm={discard}
        onCancel={() => setConfirming(false)}
      />
    </div>
  );
}
