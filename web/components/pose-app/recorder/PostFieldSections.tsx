'use client';

import {
  CAPTION_LIMIT,
  POST_CATEGORIES,
  POST_PRIVACY,
  POST_TOGGLES,
  type PostFields,
  type PostPrivacy,
} from '@/lib/pose-app/publish';

type Props = {
  fields: PostFields;
  onChange: (patch: Partial<PostFields>) => void;
  /** `#screen4` @25583 offers the category picker; `#screen7` @25332 (photos) does not. */
  showCategory?: boolean;
};

/**
 * The caption, hashtags, tags, privacy select and the seven permission switches
 * that `#screen4` @25583 and `#screen7` @25332 both carry. The legacy kept two
 * copies of this markup and read the switches back positionally in both; the port
 * has one copy that writes each switch to the field it belongs to.
 */
export function PostFieldSections({ fields, onChange, showCategory }: Props) {
  return (
    <>
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
          onChange={(event) => onChange({ caption: event.target.value })}
        />
      </div>

      {showCategory ? (
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
            onChange={(event) => onChange({ category: event.target.value })}
          />
          <datalist id="screen4CategoryList">
            {POST_CATEGORIES.map((category) => (
              <option key={category} value={category} />
            ))}
          </datalist>
        </div>
      ) : null}

      <div className="rec-post-section">
        <div className="rec-section-header"># Hashtags</div>
        <input
          type="text"
          className="rec-input-field"
          placeholder="Add hashtags"
          value={fields.hashtags}
          onChange={(event) => onChange({ hashtags: event.target.value })}
        />
      </div>

      <div className="rec-post-section">
        <div className="rec-section-header">@ Tags</div>
        <input
          type="text"
          className="rec-input-field"
          placeholder="Tag people"
          value={fields.tags}
          onChange={(event) => onChange({ tags: event.target.value })}
        />
      </div>

      <div className="rec-post-section">
        <div className="rec-section-header">
          <i className="fas fa-eye" /> Privacy
        </div>
        <select
          className="rec-input-field"
          value={fields.privacy}
          onChange={(event) => onChange({ privacy: event.target.value as PostPrivacy })}
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
                onChange({ toggles: { ...fields.toggles, [toggle.field]: event.target.checked } })
              }
            />
            <span className="rec-toggle-slider" />
          </label>
        </div>
      ))}
    </>
  );
}
