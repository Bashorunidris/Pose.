'use client';

import { useState } from 'react';

import type { CapturedPhoto } from '@/lib/pose-app/photo-capture';
import type { RecorderToastKind } from '@/lib/pose-app/recorder';
import { cx } from '../styles';
import { RecorderConfirm } from './RecorderConfirm';

type Props = {
  photos: CapturedPhoto[];
  index: number;
  onSelect: (index: number) => void;
  /** `openPhotoGallery()` @54454 again — "Add More" reopens the same picker. */
  onAddPhotos: () => void;
  onDiscard: () => void;
  onNext: () => void;
  onAddSound: () => void;
  onToast: (message: string, kind?: RecorderToastKind) => void;
};

/**
 * `#screen6` @25258 — the shot, its carousel, and the way out.
 *
 * The photo is shown exactly as it was captured: `capturePhoto()` @54180 bakes
 * the front camera's mirror into the pixels, so `displayCapturedPhoto()` @54318
 * stopped re-mirroring the `<img>` and the port never starts. The thumbnails are
 * `updatePhotoScrollGallery()` @54357, and the back button is the second
 * definition of `backToScreen5()` @55190, which asks before dropping the shot —
 * the "Add Text" editor `photoAddText()` @55216 built is not here because nothing
 * in the legacy ever called it.
 */
export function PhotoEdit({
  photos,
  index,
  onSelect,
  onAddPhotos,
  onDiscard,
  onNext,
  onAddSound,
  onToast,
}: Props) {
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const [downloadOpen, setDownloadOpen] = useState(false);
  const current = photos[index];

  /** `downloadPhotoOnly()` @54590 built the same `pose_photo_…` filename. */
  const downloadPicture = () => {
    if (!current) {
      onToast('There is no photo to download', 'error');
      return;
    }
    const stamp = new Date(current.timestamp).toISOString().slice(0, 19).replace(/:/g, '-');
    const link = document.createElement('a');
    link.href = current.url;
    link.download = `pose_photo_${stamp}_${current.filter}.jpg`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setDownloadOpen(false);
    onToast('Photo downloading', 'success');
  };

  return (
    <div className="recording-screen active">
      <div className="v2-record-video-wrapper">
        <button
          type="button"
          className="v2-record-back-btn"
          onClick={() => setConfirmDiscard(true)}
          title="Back"
        >
          <i className="fas fa-chevron-left" />
        </button>

        {current ? (
          <img
            src={current.url}
            alt="Captured"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              position: 'absolute',
              top: 0,
              left: 0,
            }}
          />
        ) : (
          <div className="v2-camera-placeholder">
            <i className="fas fa-image" />
            <p>Photo preview</p>
          </div>
        )}

        {photos.length > 1 ? (
          <div className="absolute left-1/2 flex w-[90%] max-w-[600px] -translate-x-1/2 items-center gap-[8px] overflow-x-auto rounded-[8px] bg-black/70 bottom-[220px] p-[8px]">
            {photos.map((photo, position) => (
              <button
                key={`${photo.timestamp}-${position}`}
                type="button"
                onClick={() => onSelect(position)}
                className={cx(
                  'h-[54px] w-[54px] shrink-0 overflow-hidden rounded-[6px] border-2 transition-all duration-200',
                  position === index ? 'border-[#ff0050]/80' : 'border-white/20',
                )}
                title={`Photo ${position + 1}`}
              >
                <img src={photo.url} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        ) : null}

        <div className="rec-edit-controls">
          <div className="mb-[10px] flex gap-[10px]">
            <button type="button" className="rec-add-sound-btn flex-1" onClick={onAddSound}>
              <i className="fas fa-music" /> Add Sound
            </button>
            <button
              type="button"
              className="rec-add-sound-btn flex-1 bg-[rgba(100,200,255,0.3)]"
              onClick={onAddPhotos}
            >
              <i className="fas fa-plus" /> Add More
            </button>
          </div>
          <div className="flex gap-[10px]">
            <button
              type="button"
              className="rec-action-btn flex-1 bg-white/10"
              onClick={() => setDownloadOpen(true)}
            >
              <i className="fas fa-download" /> Download
            </button>
            <button type="button" className="rec-action-btn post flex-1" onClick={onNext}>
              Continue <i className="fas fa-arrow-right" />
            </button>
          </div>
        </div>
      </div>

      {/*
        `#photoDownloadModal` @25304. The legacy disabled "Picture + Sound as
        Video" until a sound was picked and rendered the mixed file with
        `createVideoFromPhotoAndSound()` @54809; sounds arrive with the sound
        library slice, so the option stays disabled rather than dead.
      */}
      {downloadOpen ? (
        <div className="fixed inset-0 z-[2147483645] flex items-center justify-center bg-black/80 p-[20px]">
          <div className="animate-app-modal-rise w-full max-w-[400px] rounded-[12px] bg-[#121212] p-[26px] text-center">
            <h2 className="m-0 mb-[8px] text-[1.3rem] font-bold text-white">Download options</h2>
            <p className="m-0 mb-[20px] text-[13px] text-[#aaa]">What would you like to download?</p>
            <div className="flex flex-col gap-[10px]">
              <button
                type="button"
                className="w-full rounded-[8px] bg-gradient-to-r from-[#4C1D95] to-[#6D28D9] p-[12px] text-[15px] font-bold text-white"
                onClick={downloadPicture}
              >
                <i className="fas fa-image" /> Picture only
              </button>
              <button
                type="button"
                className="w-full cursor-not-allowed rounded-[8px] bg-gradient-to-r from-[#FF1493] to-[#FF69B4] p-[12px] text-[15px] font-bold text-white opacity-50"
                disabled
                title="Pick a sound first — sounds arrive with the sound library"
              >
                <i className="fas fa-video" /> Picture + sound as video
              </button>
              <button
                type="button"
                className="w-full rounded-[8px] border border-white/10 bg-white/10 p-[12px] text-[15px] font-bold text-white"
                onClick={() => setDownloadOpen(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <RecorderConfirm
        open={confirmDiscard}
        title="Discard photo?"
        message="Are you sure you want to discard this photo?"
        confirmLabel="Discard"
        onConfirm={() => {
          setConfirmDiscard(false);
          onDiscard();
        }}
        onCancel={() => setConfirmDiscard(false)}
      />
    </div>
  );
}
