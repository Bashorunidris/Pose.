/**
 * Photo mode's data layer: what `#screen5` @25117 needs to frame a shot, and
 * what `capturePhoto()` @54180 did to turn the preview into a file.
 *
 * The filter list is the video one: `applyPhotoFilter()` @53874 and
 * `applyRecordingFilter()` @53282 carried the same seven names with the same CSS,
 * so the port has one table rather than two.
 */
import { filterCss, type CaptureFacing, type CaptureFilter } from './recorder';

export type PhotoRatio = '1:1' | '3:4' | '9:16' | '16:9';

/** `togglePhotoRatio()` @53834 cycled these four, in this order. */
export const PHOTO_RATIOS: { id: PhotoRatio; value: number }[] = [
  { id: '1:1', value: 1 },
  { id: '3:4', value: 3 / 4 },
  { id: '9:16', value: 9 / 16 },
  { id: '16:9', value: 16 / 9 },
];

export function photoRatioValue(ratio: PhotoRatio): number {
  return PHOTO_RATIOS.find((entry) => entry.id === ratio)?.value ?? 1;
}

/** `togglePhotoTimer()` @51841 cycled the same list the video screen did. */
export const PHOTO_TIMERS = [0, 3, 5, 10];

export type PhotoSettings = {
  ratio: PhotoRatio;
  timer: number;
  filter: CaptureFilter;
  facing: CaptureFacing;
};

/**
 * `photoState.photoSettings`' defaults, except for `facing`: the legacy started
 * on `'environment'` and then overwrote it with whatever `getSettings()` reported,
 * falling back to `'user'` when the browser did not say — which is every
 * single-camera device. The port just starts where that landed.
 */
export const INITIAL_PHOTO_SETTINGS: PhotoSettings = {
  ratio: '1:1',
  timer: 0,
  filter: 'none',
  facing: 'user',
};

/**
 * `calculateCanvasSize()` @54077 — the centred crop that turns the camera's frame
 * into the ratio the user picked, as a source rectangle.
 */
export function cropRect(
  videoWidth: number,
  videoHeight: number,
  ratio: PhotoRatio,
): { width: number; height: number; x: number; y: number } {
  const target = photoRatioValue(ratio);
  const current = videoWidth / videoHeight;

  if (current > target) {
    const width = Math.floor(videoHeight * target);
    return { width, height: videoHeight, x: Math.floor((videoWidth - width) / 2), y: 0 };
  }

  const height = Math.floor(videoWidth / target);
  return { width: videoWidth, height, x: 0, y: Math.floor((videoHeight - height) / 2) };
}

/**
 * `updateRatioGuide()` @51792 — the composition frame's size, as a percentage of
 * the preview. The legacy only recomputed it when the Ratio menu was clicked, so
 * the guide sat at its 0x0 default (with a full-screen drop shadow) until then;
 * the port recomputes it as soon as the camera reports its dimensions.
 */
export function ratioGuideBox(
  videoWidth: number,
  videoHeight: number,
  ratio: PhotoRatio,
): { width: string; height: string } | null {
  if (!videoWidth || !videoHeight) return null;

  const target = photoRatioValue(ratio);
  const current = videoWidth / videoHeight;

  if (current > target) {
    return { width: `${((target * 100) / current).toFixed(2)}%`, height: '100%' };
  }
  return { width: '100%', height: `${((100 * current) / target).toFixed(2)}%` };
}

/**
 * `capturePhoto()` @54180's canvas pass: the chosen ratio's crop, the selected
 * filter painted by `ctx.filter`, and the front camera's mirror baked into the
 * pixels. The legacy did all three and wrote the result at 95% JPEG quality.
 *
 * `showPhotoCountdown()` @54012 is the caller's job — the shutter runs it before
 * this, exactly as `capturePhoto()` did.
 */
export async function capturePhotoFrame(
  video: HTMLVideoElement,
  settings: PhotoSettings,
): Promise<Blob> {
  const { width, height, x, y } = cropRect(video.videoWidth, video.videoHeight, settings.ratio);
  if (!width || !height) throw new Error('The camera has not reported a frame size yet');

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext('2d', { alpha: false });
  if (!context) throw new Error('Could not create the capture canvas');

  context.imageSmoothingEnabled = true;
  context.filter = filterCss(settings.filter);
  if (settings.facing === 'user') {
    context.translate(width, 0);
    context.scale(-1, 1);
  }
  context.drawImage(video, x, y, width, height, 0, 0, width, height);
  context.setTransform(1, 0, 0, 1, 0, 0);

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.95));
  if (!blob) throw new Error('The captured frame could not be encoded');
  return blob;
}

/**
 * `showPhotoCountdown()` @54012 — the full-screen number before the shutter, with
 * the same 1-2-3 pulse. It resolves once the last number has been on screen, so
 * the caller can capture straight after.
 */
export async function runPhotoCountdown(
  seconds: number,
  onTick: (remaining: number) => void,
): Promise<void> {
  for (let remaining = seconds; remaining > 0; remaining -= 1) {
    onTick(remaining);
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  onTick(0);
}

/**
 * One shot in the sheet's carousel. `photoState.capturedPhotos` held the same
 * four things: the preview URL, the bytes behind it, the filter it was framed
 * with, and whether it came from the camera or the gallery — `capturePhoto()`
 * stamped `isGalleryPhoto` on the ones `openPhotoGallery()` @54454 added.
 */
export type CapturedPhoto = {
  url: string;
  blob: Blob;
  filter: CaptureFilter;
  timestamp: number;
  fromGallery: boolean;
};
