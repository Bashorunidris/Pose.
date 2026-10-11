'use client';

import { useState } from 'react';

import {
  CAPTION_LIMIT,
  POST_CATEGORIES,
  POST_PRIVACY,
  POST_TOGGLES,
  type PostFields,
  type PostPrivacy,
  type VideoEdit,
} from '@/lib/pose-app/publish';
import { cx } from '../styles';
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
        <div className="rec-post-section">
          <div className="mb-[10px] flex items-center justify-between">
            <div className="rec-section-header m-0">Caption</div>
            <span className="text-[12px] text-[#999]">
              {fields.caption.length}/{CAPTION_LIMIT}
            </span>
          </div>
          <textarea
            className="rec-caption-input"
            placeholder="Add a caption..."
            maxLength={CAPTION_LIMIT}
            value={fields.caption}
            onChange={(event) => patch({ caption: event.target.value })}
          />
        </div>

        <div className="rec-post-section">
          <div className="rec-section-header">
            <i className="fas fa-tag" /> Category
          </div>
          <input
            type="text"
            className="rec-input-field"
            list="screen4CategoryList"
            placeholder="Select or type a category (e.g. Football, Cooking)"
            autoComplete="off"
            maxLength={40}
            value={fields.category}
            onChange={(event) => patch({ category: event.target.value })}
          />
          <datalist id="screen4CategoryList">
            {POST_CATEGORIES.map((category) => (
              <option key={category} value={category} />
            ))}
          </datalist>
        </div>

        <div className="rec-post-section">
          <div className="rec-section-header"># Hashtags</div>
          <input
            type="text"
            className="rec-input-field"
            placeholder="Add hashtags"
            value={fields.hashtags}
            onChange={(event) => patch({ hashtags: event.target.value })}
          />
        </div>

        <div className="rec-post-section">
          <div className="rec-section-header">@ Tags</div>
          <input
            type="text"
            className="rec-input-field"
            placeholder="Tag people"
            value={fields.tags}
            onChange={(event) => patch({ tags: event.target.value })}
          />
        </div>

        <div className="rec-post-section">
          <div className="rec-section-header">
            <i className="fas fa-eye" /> Privacy
          </div>
          <select
            className="rec-input-field"
            value={fields.privacy}
            onChange={(event) => patch({ privacy: event.target.value as PostPrivacy })}
          >
            {POST_PRIVACY.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </div>

        {POST_TOGGLES.map((toggle) => (
          <div className="rec-post-section toggle-section" key={toggle.field}>
            <div className="rec-section-header">
              <i className={`fas ${toggle.icon}`} /> {toggle.label}
            </div>
            <label className="rec-toggle-switch">
              <input
                type="checkbox"
                checked={fields.toggles[toggle.field] ?? false}
                onChange={(event) =>
                  patch({ toggles: { ...fields.toggles, [toggle.field]: event.target.checked } })
                }
              />
              <span className="rec-toggle-slider" />
            </label>
          </div>
        ))}
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
