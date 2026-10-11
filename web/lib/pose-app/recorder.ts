/**
 * The capture data layer: what `#recordingUIOverlay` @24847 and
 * `#v2RecordScreen` @73603 need before they become React. Everything a camera,
 * a `MediaRecorder` or the legacy `recordingState` @47021 object decided lives
 * here so the components stay presentational.
 *
 * Legacy functions this replaces: `initializeVideoCamera()` @47075,
 * `v2InitCamera()` @74196, `v2StartRecording()` @74392, `stopVideoCamera()`
 * @47214, `stopV2Camera()` @74949.
 */
import { useEffect, useRef, useState } from 'react';

export type CaptureFacing = 'user' | 'environment';
export type CaptureLayout = 'full' | '16:9' | '1:1';
export type CaptureMode = 'video' | 'photo' | 'buzz';
export type CaptureFilter = 'none' | 'bw' | 'sepia' | 'vintage' | 'vivid' | 'warm' | 'cool';

/** `setRecordingLayout()` @51216 / `switchRecMode()` @51004 — the two settings screens. */
export const CAPTURE_LAYOUTS: { id: CaptureLayout; label: string; icon: string }[] = [
  { id: 'full', label: 'Full', icon: 'fa-expand' },
  { id: '16:9', label: '16:9', icon: 'fa-film' },
  { id: '1:1', label: 'Square', icon: 'fa-square' },
];

/** `#recDurationPanel` @25004 — the presets, in the order the panel shows them. */
export const CAPTURE_DURATIONS = [5, 15, 30, 60];

/** `toggleRecordingTimer()` @53509 cycled a fixed list; 0 is off. */
export const CAPTURE_TIMERS = [0, 3, 5, 10];

/** The shortest custom duration the legacy accepted, and the longest. */
export const CAPTURE_MIN_DURATION = 1;
export const CAPTURE_MAX_DURATION = 600;

/**
 * `applyRecordingFilter()` @53282 — the filter names, their labels and the CSS
 * `filter` each one paints the preview with. `none` is what the legacy wrote for
 * Original, and it is a valid CSS filter value, so it passes straight through.
 */
export const CAPTURE_FILTERS: { id: CaptureFilter; label: string; title: string; css: string }[] = [
  { id: 'none', label: 'Original', title: 'Original', css: 'none' },
  { id: 'bw', label: 'B&W', title: 'Black & White', css: 'grayscale(100%)' },
  { id: 'sepia', label: 'Sepia', title: 'Sepia', css: 'sepia(100%)' },
  { id: 'vintage', label: 'Vintage', title: 'Vintage', css: 'sepia(50%) contrast(0.9) brightness(0.9)' },
  { id: 'vivid', label: 'Vivid', title: 'Vivid', css: 'saturate(1.5) contrast(1.1)' },
  { id: 'warm', label: 'Warm', title: 'Warm', css: 'brightness(1.1) saturate(1.3) hue-rotate(10deg)' },
  { id: 'cool', label: 'Cool', title: 'Cool', css: 'hue-rotate(-20deg) saturate(1.2) brightness(0.95)' },
];

/**
 * What screen 1 hands the recorder when `#recMainBtn` is pressed. The legacy
 * read these off the shared `recordingState` @47021 object in
 * `v2ApplyScreen1Settings()` @74162 instead.
 */
export type CaptureSettings = {
  layout: CaptureLayout;
  duration: number;
  timer: number;
  filter: CaptureFilter;
  facing: CaptureFacing;
};

/**
 * `showToastRecording()` @50914 colourways. The legacy set the class on
 * `#recordingToast` but never the `show` class the rule needs to fade it in, so
 * every recorder message in the legacy was painted at `opacity: 0`.
 */
export type RecorderToastKind = 'info' | 'success' | 'error';

export function filterCss(id: CaptureFilter): string {
  return CAPTURE_FILTERS.find((entry) => entry.id === id)?.css ?? 'none';
}

/**
 * `initializeVideoCamera()` @47075 and `v2InitCamera()` @74196 asked for the
 * same 1280x720@30 stream and the same noise-cancelled mono-ish mic, so the port
 * has one constraint set rather than two. The legacy screen-1 camera also picked
 * a `videoWidth`/`videoHeight` from the viewport and then never used either —
 * both constraint objects hard-coded 1280x720 anyway.
 */
export function captureConstraints(facingMode: CaptureFacing): MediaStreamConstraints {
  return {
    video: {
      facingMode,
      width: { ideal: 1280, max: 1280 },
      height: { ideal: 720, max: 720 },
      frameRate: { ideal: 30, max: 30 },
    },
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
      sampleRate: 48000,
      channelCount: 2,
    },
  };
}

/**
 * The `mimeType` fallback chain from `v2StartRecording()` @74392, and the same
 * 3500kbps / 128kbps the legacy asked for. When no listed codec is supported the
 * browser picks, which is the legacy's last resort.
 */
export const RECORDER_MIME_TYPES = [
  'video/webm;codecs=vp8,opus',
  'video/webm;codecs=vp8',
  'video/webm',
];

export const RECORDER_VIDEO_BITRATE = 3500000;
export const RECORDER_AUDIO_BITRATE = 128000;

export function recorderOptions(): MediaRecorderOptions {
  const mimeType =
    typeof MediaRecorder === 'undefined'
      ? undefined
      : RECORDER_MIME_TYPES.find((candidate) => MediaRecorder.isTypeSupported(candidate));
  return {
    ...(mimeType ? { mimeType } : {}),
    videoBitsPerSecond: RECORDER_VIDEO_BITRATE,
    audioBitsPerSecond: RECORDER_AUDIO_BITRATE,
  };
}

/** The `0:07` the legacy timer painted, minutes unpadded and seconds padded. */
export function formatClock(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  return `${Math.floor(safe / 60)}:${String(safe % 60).padStart(2, '0')}`;
}

/** `v2ApplyScreen1Settings()` @74162 applied the layout to the record wrapper. */
export function captureAspect(layout: CaptureLayout): string {
  if (layout === '16:9') return '16/9';
  if (layout === '1:1') return '1/1';
  return '9/16';
}

export function durationLabel(seconds: number): string {
  if (seconds >= 60 && seconds % 60 === 0) return `${seconds / 60}m`;
  return `${seconds}s`;
}

/** `initializeVideoCamera()`'s error branches, as copy instead of toast icons. */
export function cameraErrorMessage(cause: unknown): string {
  const name = (cause as { name?: string } | null)?.name ?? '';
  if (name === 'NotAllowedError' || name === 'SecurityError') {
    return 'Allow camera access to record';
  }
  if (name === 'NotFoundError' || name === 'OverconstrainedError') return 'No camera found';
  if (name === 'NotReadableError') return 'Camera is in use by another app';
  return 'Camera not available';
}

type Camera = {
  /** Attach this to the `<video>` the stream should be shown in. */
  videoRef: React.RefObject<HTMLVideoElement | null>;
  stream: MediaStream | null;
  error: string | null;
  /** Re-request the camera after a failure. */
  restart: () => void;
};

/**
 * Owns one camera stream for as long as its component is mounted, which is what
 * `stopV2Camera()` @74949 and `stopVideoCamera()` @47214 spent their time
 * undoing: the legacy left the screen-1 camera running when the overlay closed
 * (`closeRecordingUI()` @50842 only hid the box) and had to stop it by hand on
 * every screen change. Mounting the capture screen is now what opens the camera
 * and unmounting it, or a `facingMode` change, is what closes it.
 */
export function usePoseCamera(facingMode: CaptureFacing): Camera {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let opened: MediaStream | null = null;

    const open = async () => {
      try {
        const next = await navigator.mediaDevices.getUserMedia(captureConstraints(facingMode));
        if (cancelled) {
          next.getTracks().forEach((track) => track.stop());
          return;
        }
        opened = next;
        setStream(next);
        setError(null);
      } catch (cause) {
        if (cancelled) return;
        setError(cameraErrorMessage(cause));
      }
    };

    void Promise.resolve().then(open);

    return () => {
      cancelled = true;
      opened?.getTracks().forEach((track) => track.stop());
    };
  }, [facingMode, attempt]);

  useEffect(() => {
    const element = videoRef.current;
    if (!element) return;
    if (element.srcObject !== stream) element.srcObject = stream;
    if (stream) void element.play().catch(() => undefined);
  }, [stream]);

  return { videoRef, stream, error, restart: () => setAttempt((value) => value + 1) };
}
