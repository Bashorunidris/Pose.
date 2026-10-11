'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import {
  INITIAL_PHOTO_SETTINGS,
  type CapturedPhoto,
  type PhotoSettings,
} from '@/lib/pose-app/photo-capture';
import { addPhotoStory, publishPhotoPost, savePhotoDraft } from '@/lib/pose-app/photo-publish';
import {
  addVideoStory,
  publishVideoPost,
  saveVideoDraft,
  type PostFields,
  type VideoEdit,
} from '@/lib/pose-app/publish';
import type { CaptureFilter, CaptureSettings, RecorderToastKind } from '@/lib/pose-app/recorder';
import type { PoseSound } from '@/lib/pose-app/sounds';
import { SelectedSoundChip } from '../sounds/SelectedSoundChip';
import { SoundLibrarySheet } from '../sounds/SoundLibrarySheet';
import { cx } from '../styles';
import { CaptureSetup } from './CaptureSetup';
import { EditStage } from './EditStage';
import { PhotoCapture } from './PhotoCapture';
import { PhotoEdit } from './PhotoEdit';
import { PhotoPostSettings } from './PhotoPostSettings';
import { PostSettings } from './PostSettings';
import { PublishOverlay, type PublishState } from './PublishOverlay';
import { RecordStage, type CaptureClip } from './RecordStage';

type Props = {
  uid: string | null;
  onClose: () => void;
  /** The legacy reloaded the For You feed once the post was written. */
  onPublished: () => void;
  /**
   * `postDraft()` @45807 — a draft opened from the drafts sheet arrives as a
   * finished clip, so the sheet comes up on the editor with the recorder skipped.
   */
  initialClip?: CaptureClip | null;
};

type Stage = 'setup' | 'record' | 'edit' | 'post' | 'photo' | 'photo-edit' | 'photo-post';

type Mode = 'video' | 'photo' | 'buzz';

const INITIAL_SETTINGS: CaptureSettings = {
  layout: 'full',
  duration: 30,
  timer: 0,
  filter: 'none',
  facing: 'user',
};

const INITIAL_EDIT: VideoEdit = { effect: 'Normal', trimStart: 0, trimEnd: 0, mirrored: true };

const TOAST_ICONS: Record<RecorderToastKind, string> = {
  info: 'fa-solid fa-circle-info',
  success: 'fa-solid fa-check',
  error: 'fa-solid fa-triangle-exclamation',
};

/**
 * `openRecordingUI()` @58472 — the Create button's overlay and every screen a
 * post passes through: `#screen1` @24849, the recorder `#v2RecordScreen` @73603,
 * the editor `#v2EditScreen` @73758, the post settings `#screen4` @25583, and
 * photo mode's `#screen5` @25117, `#screen6` @25258 and `#screen7` @25332.
 * `closeRecordingUI()` @50842 only hid the overlay and left the screen-1 camera
 * running; unmounting this closes it instead.
 *
 * The layout, duration, timer and filter the recorder runs with live here and
 * nowhere else, because the legacy kept them on the shared `recordingState`
 * @47021 object where a later screen could quietly overwrite them. Photo mode's
 * own settings and its captured shots live here for the same reason — the legacy
 * kept them on `photoState` @49350, which survived the sheet being closed.
 *
 * The toast is the recorder's own, not the shell's: `#recordingToast` @24841 sat
 * at `z-index: 2001` while `#v2RecordScreen` covers the screen at `z-index:
 * 99999`, so the shell's toast cannot be seen while the recorder is up.
 */
export function RecorderSheet({ uid, onClose, onPublished, initialClip }: Props) {
  const [stage, setStage] = useState<Stage>(initialClip ? 'edit' : 'setup');
  const [settings, setSettings] = useState<CaptureSettings>(INITIAL_SETTINGS);
  const [clip, setClip] = useState<CaptureClip | null>(initialClip ?? null);
  const [edit, setEdit] = useState<VideoEdit>(INITIAL_EDIT);
  const [progress, setProgress] = useState<PublishState>({ kind: 'idle' });
  /** Bumped per take; the key on `RecordStage` is what gives a retake a fresh camera and clock. */
  const [take, setTake] = useState(0);
  const [toast, setToast] = useState<{ message: string; kind: RecorderToastKind } | null>(null);

  const [photoSettings, setPhotoSettings] = useState<PhotoSettings>(INITIAL_PHOTO_SETTINGS);
  const [photos, setPhotos] = useState<CapturedPhoto[]>([]);
  const [photoIndex, setPhotoIndex] = useState(0);
  /** `soundLibraryState.selectedSound` @58621 and `window.v2EditedVideoState.soundData`. */
  const [sound, setSound] = useState<PoseSound | null>(null);
  const [soundSheetOpen, setSoundSheetOpen] = useState(false);

  const patchSettings = useCallback((patch: Partial<CaptureSettings>) => {
    setSettings((current) => ({ ...current, ...patch }));
  }, []);

  const patchPhotoSettings = useCallback((patch: Partial<PhotoSettings>) => {
    setPhotoSettings((current) => ({ ...current, ...patch }));
  }, []);

  const toastTimer = useRef<number | null>(null);
  const notify = useCallback((message: string, kind: RecorderToastKind = 'info') => {
    setToast({ message, kind });
    if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2500);
  }, []);

  useEffect(
    () => () => {
      if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
    },
    [],
  );

  const clearClip = useCallback(() => {
    setClip((current) => {
      if (current) URL.revokeObjectURL(current.url);
      return null;
    });
  }, []);

  /** `openSoundLibrary()` @59012, raised from the Add Sound button on any stage. */
  const openSoundLibrary = useCallback(() => setSoundSheetOpen(true), []);

  const handleRecorded = useCallback((recorded: CaptureClip) => {
    setClip(recorded);
    setEdit(INITIAL_EDIT);
    setStage('edit');
  }, []);

  /** `v2CloseRecordScreen()`'s cleanup @74666 dropped the take it discarded. */
  const backToSetup = useCallback(() => {
    clearClip();
    setStage('setup');
  }, [clearClip]);

  /** `v2ConfirmBackToRecord()` @75444 — back to the recorder, not to screen 1. */
  const backToRecord = useCallback(() => {
    clearClip();
    setTake((value) => value + 1);
    setStage('record');
  }, [clearClip]);

  /**
   * The three exits from the post sheet. Each waits for the upload, reports its
   * own stage label, and only reports success once Firestore has the document —
   * the legacy showed "Publishing..." straight away and could be dismissed
   * before the write had even been attempted.
   */
  const upload = useCallback(
    async (
      label: string,
      done: string,
      run: (onProgress: (percent: number) => void) => Promise<unknown>,
    ) => {
      if (!uid) {
        notify('Sign in to publish your video', 'error');
        return;
      }
      setProgress({ kind: 'working', label, percent: 0 });
      try {
        await run((percent) => setProgress({ kind: 'working', label, percent }));
        setProgress({ kind: 'done', label: done });
        onPublished();
      } catch (error) {
        console.error('Could not finish the upload:', error);
        setProgress({ kind: 'error', label: 'The upload failed. Please try again.' });
      }
    },
    [notify, onPublished, uid],
  );

  const publish = useCallback(
    (fields: PostFields) => {
      if (!clip) return;
      void upload('Publishing your video…', 'Your video is posted', (onProgress) =>
        publishVideoPost({ uid: uid ?? '', blob: clip.blob, fields, edit, sound, onProgress }),
      );
    },
    [clip, edit, sound, upload, uid],
  );

  const saveDraft = useCallback(
    (fields: PostFields) => {
      if (!clip) return;
      void upload('Saving your draft…', 'Draft saved', (onProgress) =>
        saveVideoDraft({ uid: uid ?? '', blob: clip.blob, fields, edit, onProgress }),
      );
    },
    [clip, edit, upload, uid],
  );

  const shareStory = useCallback(
    (caption: string) => {
      if (!clip) return;
      void upload('Adding to your story…', 'Added to your story', (onProgress) =>
        addVideoStory({ uid: uid ?? '', blob: clip.blob, caption, edit, onProgress }),
      );
    },
    [clip, edit, upload, uid],
  );

  /**
   * `photoState.capturedPhotos` with its index, kept in a ref as well so the
   * gallery handler and the publish handlers read the same list the render sees
   * without re-creating themselves on every capture.
   */
  const photosRef = useRef<CapturedPhoto[]>([]);
  const commitPhotos = useCallback((next: CapturedPhoto[]) => {
    photosRef.current = next;
    setPhotos(next);
  }, []);

  const galleryRef = useRef<HTMLInputElement | null>(null);

  /** `openPhotoGallery()` @54454 — the legacy built the input on the fly; this one lives in the sheet. */
  const openGallery = useCallback(() => galleryRef.current?.click(), []);

  const handleGalleryFiles = useCallback(
    (files: FileList) => {
      const added: CapturedPhoto[] = Array.from(files).map((file) => ({
        url: URL.createObjectURL(file),
        blob: file,
        filter: 'none' as CaptureFilter,
        timestamp: Date.now(),
        fromGallery: true,
      }));
      if (!added.length) return;

      const next = [...photosRef.current, ...added];
      commitPhotos(next);
      setPhotoIndex(next.length - added.length);
      notify(
        added.length === 1 ? 'Photo added from the gallery' : `${added.length} photos added`,
        'success',
      );
      setStage('photo-edit');
    },
    [commitPhotos, notify],
  );

  const handleCaptured = useCallback(
    (blob: Blob) => {
      const photo: CapturedPhoto = {
        url: URL.createObjectURL(blob),
        blob,
        filter: photoSettings.filter,
        timestamp: Date.now(),
        fromGallery: false,
      };
      const next = [...photosRef.current, photo];
      commitPhotos(next);
      setPhotoIndex(next.length - 1);
      setStage('photo-edit');
      notify('Photo captured', 'success');
    },
    [commitPhotos, notify, photoSettings.filter],
  );

  /** `confirmDiscardPhoto()` @54538 dropped the previewed shot and reopened the camera. */
  const discardPhoto = useCallback(() => {
    const current = photosRef.current[photoIndex];
    if (current) URL.revokeObjectURL(current.url);
    commitPhotos(photosRef.current.filter((_, position) => position !== photoIndex));
    setPhotoIndex(Math.max(0, photoIndex - 1));
    setStage('photo');
  }, [commitPhotos, photoIndex]);

  /**
   * `switchRecMode()` @51004 — and the one part of it worth keeping: the legacy
   * stopped screen 1's camera by hand before requesting the photo one, because
   * `showScreen('screen5')` released it only *after* `initializePhotoMode()` had
   * already asked for the hardware. The port's screens own their streams, so
   * changing stage is what hands the camera over.
   */
  const switchMode = useCallback(
    (mode: Mode) => {
      if (mode === 'video') {
        setStage('setup');
        return;
      }
      if (mode === 'photo') {
        setStage('photo');
        return;
      }
      notify('Buzz posting lands in a later slice');
    },
    [notify],
  );

  const publishPhoto = useCallback(
    (fields: PostFields) => {
      if (!photosRef.current.length) return;
      void upload('Publishing your photo…', 'Your photo is posted', (onProgress) =>
        publishPhotoPost({
          uid: uid ?? '',
          photos: photosRef.current.map((photo) => photo.blob),
          fields,
          sound,
          onProgress,
        }),
      );
    },
    [sound, upload, uid],
  );

  const draftPhoto = useCallback(
    (fields: PostFields) => {
      const current = photosRef.current[photoIndex];
      if (!current) return;
      void upload('Saving your draft…', 'Draft saved', (onProgress) =>
        savePhotoDraft({ uid: uid ?? '', photo: current.blob, fields, sound, onProgress }),
      );
    },
    [photoIndex, sound, upload, uid],
  );

  const storyPhoto = useCallback(
    (fields: PostFields) => {
      const current = photosRef.current[photoIndex];
      if (!current) return;
      void upload('Adding to your story…', 'Added to your story', (onProgress) =>
        addPhotoStory({
          uid: uid ?? '',
          photo: current.blob,
          caption: fields.caption,
          fields,
          sound,
          onProgress,
        }),
      );
    },
    [photoIndex, sound, upload, uid],
  );

  return (
    <div className="recorder-shell">
      {stage === 'setup' ? (
        <div className="recording-ui-overlay active">
          <CaptureSetup
            settings={settings}
            onChange={patchSettings}
            onStart={() => setStage('record')}
            onMode={switchMode}
            onAddSound={openSoundLibrary}
            onClose={onClose}
            onToast={notify}
          />
        </div>
      ) : null}

      {stage === 'record' ? (
        <RecordStage
          key={`take-${take}`}
          settings={settings}
          onBack={backToSetup}
          onRecorded={handleRecorded}
          onToast={notify}
        />
      ) : null}

      {stage === 'edit' && clip ? (
        <EditStage
          clipUrl={clip.url}
          seconds={clip.seconds}
          settings={settings}
          onBackToRecord={backToRecord}
          onNext={(next) => {
            setEdit(next);
            setStage('post');
          }}
          onAddSound={openSoundLibrary}
          onToast={notify}
        />
      ) : null}

      {stage === 'post' && clip ? (
        <PostSettings
          clipUrl={clip.url}
          seconds={clip.seconds}
          edit={edit}
          busy={progress.kind === 'working'}
          onBack={() => setStage('edit')}
          onPublish={publish}
          onDraft={saveDraft}
          onStory={shareStory}
        />
      ) : null}

      {stage === 'photo' ? (
        <PhotoCapture
          settings={photoSettings}
          onChange={patchPhotoSettings}
          onCaptured={handleCaptured}
          onOpenGallery={openGallery}
          onBack={() => setStage('setup')}
          onMode={switchMode}
          onToast={notify}
        />
      ) : null}

      {stage === 'photo-edit' && photos.length > 0 ? (
        <PhotoEdit
          photos={photos}
          index={photoIndex}
          onSelect={setPhotoIndex}
          onAddPhotos={openGallery}
          onDiscard={discardPhoto}
          onNext={() => setStage('photo-post')}
          onAddSound={openSoundLibrary}
          onToast={notify}
        />
      ) : null}

      {stage === 'photo-post' && photos.length > 0 ? (
        <PhotoPostSettings
          photoUrl={photos[photoIndex]?.url ?? photos[0].url}
          count={photos.length}
          busy={progress.kind === 'working'}
          onBack={() => setStage('photo-edit')}
          onPublish={publishPhoto}
          onDraft={draftPhoto}
          onStory={storyPhoto}
          onAddSound={openSoundLibrary}
        />
      ) : null}

      <input
        ref={galleryRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(event) => {
          const files = event.target.files;
          if (files) handleGalleryFiles(files);
          // Let the same files be picked again after a discard.
          event.target.value = '';
        }}
      />

      <PublishOverlay
        state={progress}
        onDismiss={() => {
          const failed = progress.kind === 'error';
          setProgress({ kind: 'idle' });
          if (!failed) onClose();
        }}
      />

      {sound && !soundSheetOpen ? (
        <SelectedSoundChip sound={sound} onRemove={() => setSound(null)} />
      ) : null}

      {soundSheetOpen ? (
        <SoundLibrarySheet
          uid={uid}
          onClose={() => setSoundSheetOpen(false)}
          onToast={notify}
          onSelect={(chosen) => {
            setSound(chosen);
            setSoundSheetOpen(false);
            notify(`"${chosen.title}" added to your post`, 'success');
          }}
        />
      ) : null}

      <div
        className={cx('recording-toast', toast?.kind, toast && 'show')}
        // Above `.v2-screen` @73603, which the legacy toast sat behind.
        style={{ zIndex: 2147483647 }}
        role="status"
      >
        <span className="recording-toast-icon">
          <i className={TOAST_ICONS[toast?.kind ?? 'info']} />
        </span>
        <span>{toast?.message ?? ''}</span>
      </div>
    </div>
  );
}
