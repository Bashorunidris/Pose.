'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import type { CaptureSettings, RecorderToastKind } from '@/lib/pose-app/recorder';
import {
  addVideoStory,
  publishVideoPost,
  saveVideoDraft,
  type PostFields,
  type VideoEdit,
} from '@/lib/pose-app/publish';
import { cx } from '../styles';
import { CaptureSetup } from './CaptureSetup';
import { EditStage } from './EditStage';
import { PostSettings } from './PostSettings';
import { PublishOverlay, type PublishState } from './PublishOverlay';
import { RecordStage, type CaptureClip } from './RecordStage';

type Props = {
  uid: string | null;
  onClose: () => void;
  /** The legacy reloaded the For You feed once the post was written. */
  onPublished: () => void;
};

type Stage = 'setup' | 'record' | 'edit' | 'post';

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
 * `openRecordingUI()` @58472 — the Create button's overlay and the three screens
 * a recording passes through: `#screen1` @24849, the recorder `#v2RecordScreen`
 * @73603, the editor `#v2EditScreen` @73758 and the post settings `#screen4`
 * @25583. `closeRecordingUI()` @50842 only hid the overlay and left the screen-1
 * camera running; unmounting this closes it instead.
 *
 * The layout, duration, timer and filter the recorder runs with live here and
 * nowhere else, because the legacy kept them on the shared `recordingState`
 * @47021 object where a later screen could quietly overwrite them.
 *
 * The toast is the recorder's own, not the shell's: `#recordingToast` @24841 sat
 * at `z-index: 2001` while `#v2RecordScreen` covers the screen at `z-index:
 * 99999`, so the shell's toast cannot be seen while the recorder is up.
 */
export function RecorderSheet({ uid, onClose, onPublished }: Props) {
  const [stage, setStage] = useState<Stage>('setup');
  const [settings, setSettings] = useState<CaptureSettings>(INITIAL_SETTINGS);
  const [clip, setClip] = useState<CaptureClip | null>(null);
  const [edit, setEdit] = useState<VideoEdit>(INITIAL_EDIT);
  const [progress, setProgress] = useState<PublishState>({ kind: 'idle' });
  /** Bumped per take; the key on `RecordStage` is what gives a retake a fresh camera and clock. */
  const [take, setTake] = useState(0);
  const [toast, setToast] = useState<{ message: string; kind: RecorderToastKind } | null>(null);

  const patchSettings = useCallback((patch: Partial<CaptureSettings>) => {
    setSettings((current) => ({ ...current, ...patch }));
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
        publishVideoPost({ uid: uid ?? '', blob: clip.blob, fields, edit, onProgress }),
      );
    },
    [clip, edit, upload, uid],
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

  return (
    <div className="recorder-shell">
      {stage === 'setup' ? (
        <div className="recording-ui-overlay active">
          <CaptureSetup
            settings={settings}
            onChange={patchSettings}
            onStart={() => setStage('record')}
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

      <PublishOverlay
        state={progress}
        onDismiss={() => {
          const failed = progress.kind === 'error';
          setProgress({ kind: 'idle' });
          if (!failed) onClose();
        }}
      />

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
