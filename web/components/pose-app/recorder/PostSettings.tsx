'use client';

import { useState } from 'react';

import { POST_TOGGLES, type PostFields, type VideoEdit } from '@/lib/pose-app/publish';
import { cx } from '../styles';
import { PostFieldSections } from './PostFieldSections';
import { RecorderConfirm } from './RecorderConfirm';

type Props = {
  clipUrl: string;
  seconds: number;
  edit: VideoEdit;
  busy: boolean;
  onBack: () => void;
  onPublish: (fields: PostFields) => void;
  onDraft: (fields: PostFields) => void;
  onStory: (caption: string) => void;
};

function initialFields(): PostFields {
  return {
    caption: '',
    category: '',
    hashtags: '',
    tags: '',
    privacy: 'Everyone',
    toggles: Object.fromEntries(POST_TOGGLES.map((toggle) => [toggle.field, toggle.enabledByDefault])),
  };
}

/** `M:SS`, the badge the legacy printed off the video's own duration. */
function formatLength(seconds: number): string {
  const safe = Math.max(0, Math.floor(seconds));
  return `${Math.floor(safe / 60)}:${String(safe % 60).padStart(2, '0')}`;
}

/**
 * `#screen4` @25583 — the post settings every recording passes through.
 *
 * The legacy read the switches back with `input[type="checkbox"]:nth-of-type(n)`
 * and the fields with a bare `document.querySelector('select')`, so reordering a
 * switch silently wrote the wrong permission. The port keeps them in one object
 * keyed by the field each one writes.
 */
export function PostSettings({ clipUrl, seconds, edit, busy, onBack, onPublish, onDraft, onStory }: Props) {
  const [fields, setFields] = useState<PostFields>(initialFields);
  const [playing, setPlaying] = useState(false);
  const [confirmBack, setConfirmBack] = useState(false);

  const patch = (next: Partial<PostFields>) => setFields((current) => ({ ...current, ...next }));

  return (
    <div className="recording-screen active">
      <div className="rec-post-header">
        <button type="button" className="rec-icon-btn" onClick={() => setConfirmBack(true)} title="Back">
          <i className="fas fa-arrow-left" />
        </button>
        <h2 className="m-0 text-white">Post</h2>
        <div />
      </div>

      {/*
        `loadPostPreview()` @57254 copied the edit screen's `<video>` src, its
        filter and its mirror onto this one; the port renders the same blob and
        the same effect twice instead.
      */}
      <div className="relative mb-[20px] h-[280px] w-full overflow-hidden rounded-[12px] bg-black">
        <video
          src={clipUrl}
          playsInline
          className="h-full w-full"
          style={{ objectFit: 'cover', transform: edit.mirrored ? 'scaleX(-1)' : undefined }}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
        />
        <div className={cx('video-overlay', !playing && 'visible')} onClick={() => setPlaying(true)}>
          <span className="grid h-[70px] w-[70px] place-items-center rounded-full bg-white/85 text-[26px] text-black">
            <i className="fas fa-play" />
          </span>
        </div>
        <button
          type="button"
          className={cx('pause-btn', playing && 'visible')}
          onClick={() => setPlaying(false)}
          title="Pause"
        >
          <i className="fas fa-pause" />
        </button>
        <div className="absolute right-[10px] top-[10px] rounded-[20px] bg-black/60 px-[12px] py-[6px] text-[12px] text-white">
          {formatLength(seconds)}
        </div>
      </div>

      <div className="rec-post-content">
        <PostFieldSections fields={fields} onChange={patch} showCategory />
      </div>

      <div className="rec-post-actions">
        <button type="button" className="rec-action-btn draft" disabled={busy} onClick={() => onDraft(fields)}>
          Draft
        </button>
        <button type="button" className="rec-action-btn story" disabled={busy} onClick={() => onStory(fields.caption)}>
          Your Story
        </button>
        <button type="button" className="rec-action-btn post" disabled={busy} onClick={() => onPublish(fields)}>
          Post
        </button>
      </div>

      <RecorderConfirm
        open={confirmBack}
        title="Close Recording?"
        message="Are you sure you want to go back? Any unsaved changes will be lost."
        confirmLabel="Close"
        onConfirm={() => {
          setConfirmBack(false);
          onBack();
        }}
        onCancel={() => setConfirmBack(false)}
      />
    </div>
  );
}
