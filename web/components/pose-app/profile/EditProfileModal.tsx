'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import {
  loadProfileForEdit,
  saveProfileChanges,
  type ProfileLinkInput,
} from '@/lib/pose-app/profile-settings';

import {
  FORM_GROUP,
  FORM_INPUT,
  FORM_LABEL,
  FORM_TEXTAREA,
  MODAL_BODY,
  MODAL_BUTTON,
  MODAL_CARD,
  MODAL_CLOSE,
  MODAL_HEADER,
  MODAL_OVERLAY,
  MODAL_TITLE,
  PRIMARY_BUTTON,
} from './settings-ui';

type Props = {
  uid: string;
  email: string;
  onClose: () => void;
  onToast: (message: string) => void;
  /** The profile page re-reads the user document, so it needs to know it moved. */
  onSaved: () => void;
};

const EMPTY_LINK: ProfileLinkInput = { title: '', url: '' };

/**
 * `#editProfileModalContainer` + `loadProfileDataForEdit()` @44566,
 * `previewEditProfilePic()` @44620 and `saveProfileChanges()` @44638.
 *
 * The legacy form only rendered the first three links and offered a "Show All N
 * Links" button for the rest; the inputs are controlled here, so the hidden ones
 * stay editable rather than being re-created on demand.
 */
export function EditProfileModal({ uid, email, onClose, onToast, onSaved }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [links, setLinks] = useState<ProfileLinkInput[]>([{ ...EMPTY_LINK }]);
  const [showAll, setShowAll] = useState(false);
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [state, setState] = useState<'loading' | 'ready'>('loading');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const values = await loadProfileForEdit(uid);
      setName(values.name);
      setUsername(values.username);
      setBio(values.bio);
      setLinks(values.links.length ? values.links : [{ ...EMPTY_LINK }]);
      setPreview('');
      setPhoto(null);
    } catch (error) {
      console.error('❌ loading the profile for edit:', error);
      onToast('Could not load your profile');
    } finally {
      setState('ready');
    }
  }, [uid, onToast]);

  useEffect(() => {
    // Deferred a microtask so the setState calls land outside the effect body.
    void Promise.resolve().then(() => load());
  }, [load]);

  /** `previewEditProfilePic()` — the legacy preview was the raw data URL. */
  const pickPhoto = (file: File | null) => {
    setPhoto(file);
    if (!file) {
      setPreview('');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => setPreview(String(event.target?.result ?? ''));
    reader.readAsDataURL(file);
  };

  const visible = showAll ? links : links.slice(0, 3);
  const hiddenCount = links.length - visible.length;

  const updateLink = (index: number, field: keyof ProfileLinkInput, value: string) => {
    setLinks((current) => current.map((link, position) => (position === index ? { ...link, [field]: value } : link)));
  };

  const removeLink = (index: number) => {
    setLinks((current) => current.filter((_, position) => position !== index));
  };

  const save = async () => {
    if (!name.trim() || !username.trim()) {
      onToast('Please fill in all fields');
      return;
    }

    setSaving(true);
    try {
      const { photoDataUrl } = await saveProfileChanges(uid, { name, username, bio, links }, photo);
      if (photoDataUrl) setPreview(photoDataUrl);
      if (fileRef.current) fileRef.current.value = '';
      onToast('Profile updated successfully');
      onSaved();
      onClose();
    } catch (error) {
      console.error('❌ updating the profile:', error);
      onToast('Error updating profile');
    } finally {
      setSaving(false);
    }
  };

  const initial = (name.trim().charAt(0) || 'U').toUpperCase();

  return (
    <div className={MODAL_OVERLAY}>
      <div className={MODAL_CARD}>
        <div className={MODAL_HEADER}>
          <h2 className={MODAL_TITLE}>Edit Profile</h2>
          <button type="button" className={MODAL_CLOSE} onClick={onClose} aria-label="Close">
            &times;
          </button>
        </div>

        <div className={MODAL_BODY}>
          <div className="flex flex-col gap-[20px]">
            <div className="mb-[20px] text-center">
              <div
                className="mx-auto mb-[15px] flex h-[100px] w-[100px] items-center justify-center overflow-hidden rounded-full bg-[#333] bg-cover bg-center text-[36px] text-white"
                style={preview ? { backgroundImage: `url('${preview}')` } : undefined}
              >
                {preview ? null : initial}
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => pickPhoto(event.target.files?.[0] ?? null)}
              />
              <button
                type="button"
                className={`${MODAL_BUTTON} bg-[#333] px-[16px] py-[8px] text-white`}
                onClick={() => fileRef.current?.click()}
              >
                <i className="fas fa-camera" /> Change Photo
              </button>
            </div>

            <div className={FORM_GROUP}>
              <label className={FORM_LABEL} htmlFor="editProfileName">Full Name</label>
              <input
                id="editProfileName"
                className={FORM_INPUT}
                type="text"
                placeholder="Enter your full name"
                value={name}
                disabled={state === 'loading'}
                onChange={(event) => setName(event.target.value)}
              />
            </div>

            <div className={FORM_GROUP}>
              <label className={FORM_LABEL} htmlFor="editProfileUsername">Username</label>
              <input
                id="editProfileUsername"
                className={FORM_INPUT}
                type="text"
                placeholder="@username"
                value={username}
                disabled={state === 'loading'}
                onChange={(event) => setUsername(event.target.value)}
              />
            </div>

            <div className={FORM_GROUP}>
              <label className={FORM_LABEL} htmlFor="editProfileBio">Bio</label>
              <textarea
                id="editProfileBio"
                className={FORM_TEXTAREA}
                placeholder="Tell us about yourself..."
                value={bio}
                disabled={state === 'loading'}
                onChange={(event) => setBio(event.target.value)}
              />
            </div>

            <div className={FORM_GROUP}>
              <label className={FORM_LABEL} htmlFor="editProfileEmail">Email</label>
              <input id="editProfileEmail" className={FORM_INPUT} type="email" value={email} readOnly />
            </div>

            <div className={FORM_GROUP}>
              <label className={FORM_LABEL}>Links</label>
              <div className="flex flex-col">
                {visible.map((link, index) => (
                  <div
                    key={index}
                    className="mb-[10px] rounded-[8px] border border-[#444] p-[10px]"
                  >
                    <input
                      type="text"
                      className={`${FORM_INPUT} mb-[8px] w-full`}
                      placeholder="Link Title"
                      value={link.title}
                      onChange={(event) => updateLink(index, 'title', event.target.value)}
                    />
                    <input
                      type="url"
                      className={`${FORM_INPUT} mb-[8px] w-full`}
                      placeholder="Link URL"
                      value={link.url}
                      onChange={(event) => updateLink(index, 'url', event.target.value)}
                    />
                    <button
                      type="button"
                      className={`${MODAL_BUTTON} w-auto bg-[#dc3545] px-[12px] py-[8px] text-[12px]`}
                      onClick={() => removeLink(index)}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              {hiddenCount > 0 ? (
                <div className="mt-[10px]">
                  <button
                    type="button"
                    className={`${MODAL_BUTTON} w-full bg-[#555]`}
                    onClick={() => setShowAll(true)}
                  >
                    Show All {links.length} Links
                  </button>
                </div>
              ) : null}

              <button
                type="button"
                className={`${MODAL_BUTTON} mb-[15px] mt-[10px] w-full bg-[#4C1D95]`}
                onClick={() => setLinks((current) => [...current, { ...EMPTY_LINK }])}
              >
                <i className="fas fa-plus" /> Add Another Link
              </button>
            </div>

            <button
              type="button"
              className={PRIMARY_BUTTON}
              disabled={saving || state === 'loading'}
              onClick={() => void save()}
            >
              {saving ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin" /> Saving…
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
