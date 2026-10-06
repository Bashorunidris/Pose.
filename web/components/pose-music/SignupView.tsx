'use client';

import { useState } from 'react';
import { CREATOR_TYPES, SIGNUP_COUNTRIES } from '@/lib/pose-music/data';
import { FORM_FIELD, SUBMIT_BTN } from './styles';

const BENEFITS = [
  { value: '3–5×', label: 'Higher Revenue' },
  { value: '100%', label: 'Your Rights' },
  { value: 'Live', label: 'Analytics' },
];

export type Draft = {
  name: string;
  type: string;
  country: string;
  spotifyUrl: string;
  appleMusicUrl: string;
  monthlyStreams: number;
};

type Props = {
  onSubmit: (draft: Draft) => Promise<void>;
};

export function SignupView({ onSubmit }: Props) {
  const [name, setName] = useState('');
  const [type, setType] = useState(CREATOR_TYPES[0]);
  const [country, setCountry] = useState('');
  const [spotifyUrl, setSpotifyUrl] = useState('');
  const [appleMusicUrl, setAppleMusicUrl] = useState('');
  const [monthlyStreams, setMonthlyStreams] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit() {
    setBusy(true);
    try {
      await onSubmit({
        name: name.trim(),
        type,
        country,
        spotifyUrl: spotifyUrl.trim(),
        appleMusicUrl: appleMusicUrl.trim(),
        monthlyStreams: parseInt(monthlyStreams, 10) || 0,
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-[540px] mx-auto">
      <div className="text-center mb-[28px]">
        <div className="text-[48px] mb-[10px]"><i className="fas fa-microphone" /></div>
        <h2 className="font-display text-[32px] font-extrabold mb-[7px]">Become a Creator</h2>
        <p className="text-music-ink-soft text-[14px]">Set up your artist profile to start uploading and earning</p>
      </div>

      <div className="grid grid-cols-3 gap-[9px] mb-[22px]">
        {BENEFITS.map((benefit) => (
          <div key={benefit.label} className="bg-music-surface border border-music-hair rounded-music p-[13px] text-center">
            <div className="font-display text-[22px] font-extrabold text-music-green">{benefit.value}</div>
            <div className="text-[10.5px] text-music-ink-muted mt-[2px]">{benefit.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-music-card border border-music-hair rounded-music-lg p-[32px]">
        <div className="grid grid-cols-2 gap-[14px] max-[600px]:grid-cols-1">
          <label className="flex flex-col gap-[5px] [grid-column:1/-1]">
            <span className="text-[11.5px] font-semibold text-music-ink-soft tracking-[.4px]">Artist / Stage Name *</span>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. DJ Sunset"
              className={FORM_FIELD}
            />
          </label>

          <label className="flex flex-col gap-[5px]">
            <span className="text-[11.5px] font-semibold text-music-ink-soft tracking-[.4px]">Creator Type</span>
            <select value={type} onChange={(event) => setType(event.target.value)} className={`${FORM_FIELD} cursor-pointer`}>
              {CREATOR_TYPES.map((option) => (
                <option key={option} value={option} className="music-select-option">{option}</option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-[5px]">
            <span className="text-[11.5px] font-semibold text-music-ink-soft tracking-[.4px]">Country *</span>
            <select value={country} onChange={(event) => setCountry(event.target.value)} className={`${FORM_FIELD} cursor-pointer`}>
              <option value="" className="music-select-option">Select country…</option>
              {SIGNUP_COUNTRIES.map((option) => (
                <option key={option} value={option} className="music-select-option">{option}</option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-[5px]">
            <span className="text-[11.5px] font-semibold text-music-ink-soft tracking-[.4px]">Spotify URL</span>
            <input
              type="url"
              value={spotifyUrl}
              onChange={(event) => setSpotifyUrl(event.target.value)}
              placeholder="https://open.spotify.com/artist/…"
              className={FORM_FIELD}
            />
          </label>

          <label className="flex flex-col gap-[5px]">
            <span className="text-[11.5px] font-semibold text-music-ink-soft tracking-[.4px]">Apple Music URL</span>
            <input
              type="url"
              value={appleMusicUrl}
              onChange={(event) => setAppleMusicUrl(event.target.value)}
              placeholder="https://music.apple.com/…"
              className={FORM_FIELD}
            />
          </label>

          <label className="flex flex-col gap-[5px] [grid-column:1/-1]">
            <span className="text-[11.5px] font-semibold text-music-ink-soft tracking-[.4px]">Monthly Streams (approx.)</span>
            <input
              type="number"
              value={monthlyStreams}
              onChange={(event) => setMonthlyStreams(event.target.value)}
              placeholder="e.g. 50000"
              min={0}
              className={FORM_FIELD}
            />
          </label>
        </div>

        <button
          type="button"
          disabled={busy}
          onClick={submit}
          className={`${SUBMIT_BTN} w-full py-[13px] mt-[18px]`}
        >
          {busy ? (
            <>
              <i className="fas fa-spinner fa-spin" /> Setting up…
            </>
          ) : (
            <>
              <i className="fas fa-rocket" /> Become a Creator
            </>
          )}
        </button>
      </div>
    </div>
  );
}
