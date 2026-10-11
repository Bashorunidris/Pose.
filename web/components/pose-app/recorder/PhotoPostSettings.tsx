'use client';

import { useState } from 'react';

import { POST_TOGGLES, type PostFields } from '@/lib/pose-app/publish';
import { PostFieldSections } from './PostFieldSections';

type Props = {
  photoUrl: string;
  /** How many photos the post will carry; `publishPhotoPost()` @56336 sends them all. */
  count: number;
  busy: boolean;
  onBack: () => void;
  onPublish: (fields: PostFields) => void;
  onDraft: (fields: PostFields) => void;
  onStory: (fields: PostFields) => void;
  onAddSound: () => void;
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

/**
 * `#screen7` @25332 — the photo post sheet. It is `#screen4` @25583 with the
 * category picker removed and a sound row added, which is why the two share
 * `PostFieldSections`.
 *
 * The legacy also printed an "Applied edits" panel (`#photoPostEditsInfo`) listing
 * a crop and an effect that came from an `html2canvas` pass in
 * `goToPhotoPostSettings()` @56875. The port has nothing to list: the crop and the
 * filter are already in the pixels by the time this sheet opens.
 */
export function PhotoPostSettings({
  photoUrl,
  count,
  busy,
  onBack,
  onPublish,
  onDraft,
  onStory,
  onAddSound,
}: Props) {
  const [fields, setFields] = useState<PostFields>(initialFields);

  const patch = (next: Partial<PostFields>) => setFields((current) => ({ ...current, ...next }));

  return (
    <div className="recording-screen active">
      <div className="rec-post-header">
        <button type="button" className="rec-icon-btn" onClick={onBack} title="Back">
          <i className="fas fa-arrow-left" />
        </button>
        <h2 className="m-0 text-white">Post Photo</h2>
        <div />
      </div>

      <div className="photo-post-preview-section">
        <div className="photo-post-preview-header">
          <span className="text-[12px] text-[#aaa]">
            {count > 1 ? `Preview of your ${count} photos:` : 'Preview of your photo:'}
          </span>
        </div>
        <div className="photo-post-preview-container">
          <img src={photoUrl} alt="Photo preview" className="photo-post-preview-img" />
        </div>
      </div>

      <div className="rec-post-content">
        <div className="rec-post-section">
          <div className="rec-section-header">
            <i className="fas fa-music" /> Sound
          </div>
          <button
            type="button"
            className="rec-action-btn w-full border border-[rgba(100,200,255,0.5)] bg-[rgba(100,200,255,0.3)] text-[#64c8ff]"
            onClick={onAddSound}
          >
            <i className="fas fa-music" /> Add Sound
          </button>
        </div>

        <PostFieldSections fields={fields} onChange={patch} />
      </div>

      <div className="rec-post-actions">
        <button type="button" className="rec-action-btn draft" disabled={busy} onClick={() => onDraft(fields)}>
          Draft
        </button>
        <button type="button" className="rec-action-btn story" disabled={busy} onClick={() => onStory(fields)}>
          Your Story
        </button>
        <button type="button" className="rec-action-btn post" disabled={busy} onClick={() => onPublish(fields)}>
          Post
        </button>
      </div>
    </div>
  );
}
