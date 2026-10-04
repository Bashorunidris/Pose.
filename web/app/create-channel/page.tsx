'use client';

import { useCallback, useRef, useState } from 'react';
import { signInAnonymously } from 'firebase/auth';
import {
  addDoc,
  arrayUnion,
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore';
import { getPoseFirebase } from '@/lib/firebase';
import { uploadToR2 } from '@/lib/r2-upload';

const TOTAL_STEPS = 3;
const MAX_CHANNELS_PER_ACCOUNT = 5;

const COUNTRIES = [
  'Nigeria', 'Ghana', 'Kenya', 'South Africa', 'United States', 'United Kingdom',
  'Canada', 'Australia', 'India', 'Germany', 'France', 'Brazil', 'Indonesia',
  'Japan', 'South Korea', 'Mexico', 'Egypt', 'Ethiopia', 'Tanzania', 'Uganda',
  'Rwanda', 'Senegal', "Côte d'Ivoire", 'Cameroon', 'Other',
];

type ImageSlot = { file: File | null; previewUrl: string };

const EMPTY_SLOT: ImageSlot = { file: null, previewUrl: '' };

const inputClass =
  'w-full appearance-none rounded-[10px] border border-transparent bg-pose-input ' +
  'px-3.5 py-[11px] font-body text-[14px] text-pose-text outline-none ' +
  'transition-[border-color,box-shadow,background] duration-200 ' +
  'placeholder:text-pose-placeholder focus:border-pose-purple focus:bg-white ' +
  'focus:shadow-[0_0_0_3px_rgba(124,58,237,0.1)]';

function StepDots({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: TOTAL_STEPS }, (_, index) => {
        const step = index + 1;
        // Width and radius are set per-state: putting `rounded-full` on the base
        // would win over the active state's `rounded-[4px]`, since Tailwind's
        // generated order — not class order in the attribute — decides conflicts.
        const state =
          step === current ? 'w-[22px] rounded-[4px] bg-pose-purple'
          : step < current ? 'w-[7px] rounded-full bg-pose-purple-soft'
          : 'w-[7px] rounded-full bg-pose-dot';
        return (
          <div
            key={step}
            className={`h-[7px] transition-all duration-300 ${state}`}
          />
        );
      })}
    </div>
  );
}

function UploadDrop({
  label,
  heightClass,
  hint,
  slot,
  icon,
  onSelect,
}: {
  label: string;
  heightClass: string;
  hint: string;
  slot: ImageSlot;
  icon: React.ReactNode;
  onSelect: (file: File | null) => void;
}) {
  const hasPreview = slot.previewUrl !== '';

  return (
    <div>
      <p className="mb-1.5 text-[11px] font-medium uppercase tracking-[0.07em] text-pose-sub">
        {label}
      </p>
      <div
        className={`relative flex w-full cursor-pointer flex-col items-center justify-center gap-1.5 overflow-hidden rounded-[14px] border-[1.5px] bg-pose-input transition-[border-color,background] duration-200 hover:border-pose-purple hover:bg-pose-input-hover ${heightClass} ${
          hasPreview ? 'border-solid border-pose-purple' : 'border-dashed border-pose-purple/25'
        }`}
      >
        <input
          type="file"
          accept="image/*"
          className="absolute inset-0 z-[2] cursor-pointer opacity-0"
          onChange={(event) => onSelect(event.target.files?.[0] ?? null)}
        />
        {hasPreview ? (
          <img
            src={slot.previewUrl}
            alt=""
            className="absolute inset-0 z-[1] h-full w-full rounded-[13px] object-cover"
          />
        ) : null}
        <div
          className={`flex h-[34px] w-[34px] items-center justify-center rounded-[9px] bg-pose-purple-light transition-opacity ${
            hasPreview ? 'opacity-0' : ''
          }`}
        >
          {icon}
        </div>
        <span className={`text-[13px] font-medium text-pose-purple ${hasPreview ? 'opacity-0' : ''}`}>
          {label === 'Profile image' ? 'Upload photo' : 'Upload banner'}
        </span>
        <span className={`text-[11px] text-[#aaa] ${hasPreview ? 'opacity-0' : ''}`}>{hint}</span>
      </div>
    </div>
  );
}

export default function CreateChannelPage() {
  const [step, setStep] = useState(1);
  const [channelName, setChannelName] = useState('');
  const [channelDesc, setChannelDesc] = useState('');
  const [country, setCountry] = useState('');
  const [profile, setProfile] = useState<ImageSlot>(EMPTY_SLOT);
  const [banner, setBanner] = useState<ImageSlot>(EMPTY_SLOT);
  const [busy, setBusy] = useState(false);
  const [busyMessage, setBusyMessage] = useState('Creating your channel…');
  const objectUrlRef = useRef<string>('');

  const selectImage = useCallback(
    (setter: (slot: ImageSlot) => void) => (file: File | null) => {
      if (!file) {
        setter(EMPTY_SLOT);
        return;
      }
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
      const previewUrl = URL.createObjectURL(file);
      objectUrlRef.current = previewUrl;
      setter({ file, previewUrl });
    },
    [],
  );

  function validateStepTwo(): boolean {
    if (!channelName.trim()) {
      window.alert('Please enter a channel name.');
      return false;
    }
    if (!country) {
      window.alert('Please select your country.');
      return false;
    }
    return true;
  }

  function goNext() {
    if (step === 2 && !validateStepTwo()) return;
    if (step < TOTAL_STEPS) setStep(step + 1);
  }

  function goBack() {
    if (step > 1) setStep(step - 1);
  }

  async function uploadImage(file: File | null, folder: string): Promise<string> {
    if (!file) return '';
    return uploadToR2(file, {
      filename: file.name || 'upload.jpg',
      contentType: file.type || 'image/jpeg',
      folder,
    });
  }

  async function createChannel() {
    if (!validateStepTwo()) return;

    const { auth, db } = getPoseFirebase();
    let user = auth.currentUser;
    if (!user) {
      try {
        user = (await signInAnonymously(auth)).user;
      } catch {
        window.alert('You must be logged in to create a channel.');
        return;
      }
    }

    setBusy(true);
    try {
      setBusyMessage('Uploading profile photo…');
      const profileURL = await uploadImage(profile.file, 'channel-profiles');

      setBusyMessage('Uploading banner…');
      const bannerURL = await uploadImage(banner.file, 'channel-banners');

      setBusyMessage('Saving your channel…');
      const owned = await getDocs(
        query(collection(db, 'channels'), where('ownerUid', '==', user.uid)),
      );
      if (owned.size >= MAX_CHANNELS_PER_ACCOUNT) {
        window.alert(`You can only create up to ${MAX_CHANNELS_PER_ACCOUNT} channels under one account.`);
        return;
      }

      const channelId = await addDoc(collection(db, 'channels'), {
        ownerUid: user.uid,
        email: user.email ?? new URLSearchParams(window.location.search).get('email') ?? '',
        name: channelName.trim(),
        description: channelDesc.trim(),
        country,
        profileURL,
        bannerURL,
        fans: 0,
        totalViews: 0,
        totalLikes: 0,
        subscribers: 0,
        createdAt: serverTimestamp(),
      }).then((ref) => ref.id);

      await setDoc(
        doc(db, 'users', user.uid),
        { channelId, lastChannelId: channelId, channelIds: arrayUnion(channelId) },
        { merge: true },
      );

      setBusyMessage('All done! Redirecting…');
      window.setTimeout(() => {
        window.location.href = `/channeldashboard.html?uid=${channelId}`;
      }, 800);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      window.alert(`Something went wrong: ${message}`);
      setBusy(false);
    }
  }

  return (
    <>
      {busy ? (
        <div className="fixed inset-0 z-[999] flex flex-col items-center justify-center gap-4 bg-white/85 backdrop-blur-[6px]">
          <div className="h-10 w-10 animate-pose-spin rounded-full border-[3px] border-pose-purple-light border-t-pose-purple" />
          <p className="text-[14px] font-medium text-pose-sub">{busyMessage}</p>
        </div>
      ) : null}

      <main className="flex min-h-screen flex-col items-center gap-7 px-6 pb-[100px] pt-[72px]">
        {step === 1 ? (
          <>
            <img
              src="/logo.png"
              alt="Pose"
              width={64}
              height={64}
              className="mx-auto mb-[18px] block h-16 w-16 rounded-[16px] object-cover"
            />
            <img
              src="https://i.ibb.co/jktdyyTj/Chat-GPT-Image-Apr-15-2026-12-33-30-PM.png"
              alt="Channel creation illustration"
              className="h-[220px] w-[220px] rounded-[24px] border border-black/8 object-cover"
            />
            <div className="text-center">
              <h1 className="mb-2 font-display text-[24px] font-extrabold tracking-[-0.02em] text-pose-text">
                Create your <span className="text-pose-purple">channel</span>
              </h1>
              <p className="mx-auto max-w-[290px] text-[14px] leading-[1.65] text-pose-sub">
                Set up your space to share content, connect with your audience, and grow your community.
              </p>
            </div>
            <StepDots current={1} />
          </>
        ) : null}

        {step === 2 ? (
          <>
            <div className="text-center">
              <h1 className="mb-2 font-display text-[24px] font-extrabold tracking-[-0.02em] text-pose-text">
                About your <span className="text-pose-purple">channel</span>
              </h1>
              <p className="mx-auto max-w-[290px] text-[14px] leading-[1.65] text-pose-sub">
                Tell people what your channel is about so they know what to expect.
              </p>
            </div>

            <div className="flex w-full max-w-[480px] flex-col gap-[18px]">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-medium uppercase tracking-[0.07em] text-pose-sub">
                  Channel name
                </label>
                <input
                  className={inputClass}
                  type="text"
                  maxLength={60}
                  placeholder="e.g. TechWithTunde"
                  value={channelName}
                  onChange={(event) => setChannelName(event.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-medium uppercase tracking-[0.07em] text-pose-sub">
                  Description
                </label>
                <textarea
                  className={`${inputClass} min-h-[88px] resize-y leading-[1.6]`}
                  placeholder="Tell viewers what your channel is all about…"
                  value={channelDesc}
                  onChange={(event) => setChannelDesc(event.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-medium uppercase tracking-[0.07em] text-pose-sub">
                  Country
                </label>
                <div className="relative">
                  <select
                    className={`${inputClass} cursor-pointer pr-9`}
                    value={country}
                    onChange={(event) => setCountry(event.target.value)}
                  >
                    <option value="" disabled>
                      Select your country
                    </option>
                    {COUNTRIES.map((name) => (
                      <option key={name}>{name}</option>
                    ))}
                  </select>
                  <svg
                    viewBox="0 0 10 6"
                    aria-hidden
                    className="pointer-events-none absolute right-[13px] top-1/2 h-1.5 w-2.5 -translate-y-1/2 text-pose-purple-soft"
                  >
                    <path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                </div>
              </div>
            </div>
            <StepDots current={2} />
          </>
        ) : null}

        {step === 3 ? (
          <>
            <div className="text-center">
              <h1 className="mb-2 font-display text-[24px] font-extrabold tracking-[-0.02em] text-pose-text">
                Add your <span className="text-pose-purple">visuals</span>
              </h1>
              <p className="mx-auto max-w-[290px] text-[14px] leading-[1.65] text-pose-sub">
                A great profile photo and banner help your channel make a strong first impression.
              </p>
            </div>

            <div className="flex w-full max-w-[480px] flex-col gap-4">
              <UploadDrop
                label="Profile image"
                heightClass="h-32"
                hint="PNG or JPG · max 5 MB"
                slot={profile}
                onSelect={selectImage(setProfile)}
                icon={
                  <svg viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-[17px] w-[17px]">
                    <circle cx="12" cy="8" r="4" />
                    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                  </svg>
                }
              />
              <UploadDrop
                label="Channel banner"
                heightClass="h-24"
                hint="Best size: 1280 × 320 px"
                slot={banner}
                onSelect={selectImage(setBanner)}
                icon={
                  <svg viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-[17px] w-[17px]">
                    <rect x="3" y="5" width="18" height="14" rx="2" />
                    <path d="M3 10h18" />
                  </svg>
                }
              />
            </div>
            <StepDots current={3} />
          </>
        ) : null}
      </main>

      <div className="fixed inset-x-0 bottom-0 z-[100] flex items-center justify-between border-t border-black/8 bg-pose-bg/92 px-6 py-3.5 backdrop-blur-[10px]">
        <button
          type="button"
          onClick={goBack}
          className={`group flex items-center gap-1.5 rounded-full border border-black/8 bg-transparent py-[9px] pl-[13px] pr-[18px] font-body text-[14px] text-pose-sub transition-all duration-200 hover:border-pose-purple hover:bg-pose-purple-light hover:text-pose-purple ${
            step > 1 ? 'visible' : 'invisible'
          }`}
        >
          <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-x-0.5">
            <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back
        </button>

        {step < TOTAL_STEPS ? (
          <button
            type="button"
            onClick={goNext}
            className="group flex items-center gap-2 rounded-full border-none bg-pose-purple px-[22px] py-2.5 font-body text-[14px] font-medium text-white transition-[background,transform] duration-200 hover:-translate-y-px hover:bg-pose-purple-deep"
          >
            Next
            <svg viewBox="0 0 16 16" fill="none" className="h-[15px] w-[15px] transition-transform duration-200 group-hover:translate-x-[3px]">
              <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        ) : (
          <button
            type="button"
            onClick={createChannel}
            className="flex items-center gap-2 rounded-full border-none bg-pose-purple px-[22px] py-2.5 font-body text-[14px] font-medium text-white transition-[background,transform] duration-200 hover:-translate-y-px hover:bg-pose-purple-deep"
          >
            Create channel
            <svg viewBox="0 0 16 16" fill="none" className="h-[15px] w-[15px]">
              <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>
    </>
  );
}
