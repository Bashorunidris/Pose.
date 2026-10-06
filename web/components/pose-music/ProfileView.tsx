'use client';

import { useState } from 'react';
import {
  CREATOR_TYPES,
  REVENUE_PER_USE_USD,
  SIGNUP_COUNTRIES,
  formatCurrency,
  formatNumber,
  initialsOf,
} from '@/lib/pose-music/data';
import { CARD, FORM_FIELD, SUBMIT_BTN, TR } from './styles';
import type { Artist, Song } from '@/lib/pose-music/types';

const GRADIENT = 'linear-gradient(135deg,var(--color-music-green),var(--color-music-green-deep))';
const LABEL = 'text-[11.5px] font-semibold text-music-ink-soft tracking-[.4px]';

export type ProfileEdits = {
  name: string;
  type: string;
  country: string;
  spotifyUrl: string;
  appleMusicUrl: string;
  monthlyStreams: number;
  bio: string;
};

type Props = {
  artist: Artist;
  songs: Song[];
  onSave: (edits: ProfileEdits) => Promise<void>;
  onSignOut: () => void;
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-[5px]">
      <span className={LABEL}>{label}</span>
      {children}
    </label>
  );
}

export function ProfileView({ artist, songs, onSave, onSignOut }: Props) {
  const [name, setName] = useState(artist.name || '');
  const [type, setType] = useState(artist.type || 'Musician');
  const [country, setCountry] = useState(artist.country || '');
  const [spotifyUrl, setSpotifyUrl] = useState(artist.spotifyUrl || '');
  const [appleMusicUrl, setAppleMusicUrl] = useState(artist.appleMusicUrl || '');
  const [monthlyStreams, setMonthlyStreams] = useState(`${artist.monthlyStreams ?? ''}`);
  const [bio, setBio] = useState(artist.bio || '');
  const [busy, setBusy] = useState(false);

  const uses = songs.reduce((total, song) => total + (song.useCount || 0), 0);
  const streams = songs.reduce((total, song) => total + (song.streamCount || 0), 0);

  async function save() {
    setBusy(true);
    try {
      await onSave({
        name: name.trim(),
        type,
        country,
        spotifyUrl: spotifyUrl.trim(),
        appleMusicUrl: appleMusicUrl.trim(),
        monthlyStreams: parseInt(monthlyStreams, 10) || 0,
        bio: bio.trim(),
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-[560px] mx-auto">
      <div className="flex items-baseline justify-between mb-[22px]">
        <h2 className="font-display text-[21px] font-bold max-[600px]:text-[17px]">
          <i className="hgi hgi-stroke hgi-user text-music-green mr-[9px]" />
          Edit Profile
        </h2>
      </div>

      <div className={`${CARD} mb-[14px]`}>
        <div className="flex items-center gap-[16px] mb-[22px]">
          <div
            className="w-[72px] h-[72px] rounded-full grid place-items-center text-[28px] font-display font-extrabold text-black shrink-0"
            style={{ background: GRADIENT }}
          >
            {artist.name ? initialsOf(artist.name) : ''}
          </div>
          <div>
            <div className="font-display text-[20px] font-extrabold">{artist.name || '—'}</div>
            <div className="text-[12.5px] text-music-ink-soft mt-[2px]">
              {`${artist.type || '—'} · ${artist.country || ''}` || '—'}
            </div>
            <span className="inline-block bg-[rgba(29,185,84,.12)] border border-[rgba(29,185,84,.25)] text-music-green py-[2px] px-[10px] rounded-[20px] text-[10.5px] font-bold mt-[6px]">
              ✓ Verified Creator
            </span>
          </div>
        </div>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-[11px] mb-0">
          <div className={`bg-music-surface rounded-music p-[16px] ${TR} hover:bg-music-hover hover:-translate-y-[2px]`}>
            <h4 className="text-music-ink-muted text-[10.5px] uppercase tracking-[.7px] mb-[7px] flex justify-between items-center">
              Tracks <i className="hgi hgi-stroke hgi-music-note-01 text-music-green" />
            </h4>
            <p className="text-[26px] font-bold font-display">{songs.length}</p>
          </div>
          <div className={`bg-music-surface rounded-music p-[16px] ${TR} hover:bg-music-hover hover:-translate-y-[2px]`}>
            <h4 className="text-music-ink-muted text-[10.5px] uppercase tracking-[.7px] mb-[7px] flex justify-between items-center">
              Uses <i className="hgi hgi-stroke hgi-film-01 text-music-green" />
            </h4>
            <p className="text-[26px] font-bold font-display">{formatNumber(uses)}</p>
          </div>
          <div className={`bg-music-surface rounded-music p-[16px] ${TR} hover:bg-music-hover hover:-translate-y-[2px]`}>
            <h4 className="text-music-ink-muted text-[10.5px] uppercase tracking-[.7px] mb-[7px] flex justify-between items-center">
              Revenue <i className="hgi hgi-stroke hgi-information-circle text-music-green" />
            </h4>
            <p className="text-[26px] font-bold font-display">{formatCurrency(uses * REVENUE_PER_USE_USD, artist.country)}</p>
          </div>
          <div className={`bg-music-surface rounded-music p-[16px] ${TR} hover:bg-music-hover hover:-translate-y-[2px]`}>
            <h4 className="text-music-ink-muted text-[10.5px] uppercase tracking-[.7px] mb-[7px] flex justify-between items-center">
              Streams <i className="hgi hgi-stroke hgi-chart-histogram text-music-green" />
            </h4>
            <p className="text-[26px] font-bold font-display">{formatNumber(artist.monthlyStreams || streams)}</p>
          </div>
        </div>
      </div>

      <div className={`${CARD} mb-[14px]`}>
        <h3 className="font-display text-[15px] font-bold mb-[18px] flex items-center gap-[8px]">
          <i className="hgi hgi-stroke hgi-pencil-edit-01 text-music-green" /> Artist Information
        </h3>

        <div className="grid grid-cols-2 gap-[14px] max-[600px]:grid-cols-1">
          <label className="flex flex-col gap-[5px] [grid-column:1/-1]">
            <span className={LABEL}>Artist / Stage Name</span>
            <input type="text" value={name} onChange={(event) => setName(event.target.value)} placeholder="Your artist name" className={FORM_FIELD} />
          </label>

          <Field label="Creator Type">
            <select value={type} onChange={(event) => setType(event.target.value)} className={`${FORM_FIELD} cursor-pointer`}>
              {CREATOR_TYPES.map((option) => (
                <option key={option} value={option} className="music-select-option">{option}</option>
              ))}
            </select>
          </Field>

          <Field label="Country">
            <select value={country} onChange={(event) => setCountry(event.target.value)} className={`${FORM_FIELD} cursor-pointer`}>
              <option value="" className="music-select-option">Select country…</option>
              {SIGNUP_COUNTRIES.map((option) => (
                <option key={option} value={option} className="music-select-option">{option}</option>
              ))}
            </select>
          </Field>

          <Field label="Spotify URL">
            <input type="url" value={spotifyUrl} onChange={(event) => setSpotifyUrl(event.target.value)} placeholder="https://open.spotify.com/artist/…" className={FORM_FIELD} />
          </Field>

          <Field label="Apple Music URL">
            <input type="url" value={appleMusicUrl} onChange={(event) => setAppleMusicUrl(event.target.value)} placeholder="https://music.apple.com/…" className={FORM_FIELD} />
          </Field>

          <Field label="Monthly Streams (approx.)">
            <input type="number" min={0} value={monthlyStreams} onChange={(event) => setMonthlyStreams(event.target.value)} placeholder="e.g. 50000" className={FORM_FIELD} />
          </Field>

          <label className="flex flex-col gap-[5px] [grid-column:1/-1]">
            <span className={LABEL}>Bio</span>
            <input type="text" value={bio} onChange={(event) => setBio(event.target.value)} placeholder="Tell creators about your sound…" className={FORM_FIELD} />
          </label>
        </div>

        <button
          type="button"
          disabled={busy}
          onClick={save}
          className={`${SUBMIT_BTN} w-full py-[13px] mt-[6px]`}
        >
          {busy ? (
            <>
              <i className="hgi hgi-stroke hgi-loading-03 animate-hgi-spin" /> Saving…
            </>
          ) : (
            <>
              <i className="hgi hgi-stroke hgi-floppy-disk" /> Save Changes
            </>
          )}
        </button>
      </div>

      <div className={CARD}>
        <h3 className="font-display text-[15px] font-bold mb-[14px] flex items-center gap-[8px]">
          <i className="hgi hgi-stroke hgi-shield-01 text-music-red" /> Account
        </h3>
        <p className="text-[12.5px] text-music-ink-soft mb-[16px] flex items-center gap-[7px]">
          <i className="hgi hgi-stroke hgi-mail-01 text-music-ink-muted" />
          <span>{artist.email || '—'}</span>
        </p>
        <button
          type="button"
          onClick={onSignOut}
          className={`inline-flex items-center gap-[8px] py-[9px] px-[18px] bg-[rgba(232,65,75,.08)] border border-[rgba(232,65,75,.18)] text-music-red cursor-pointer rounded-music-sm font-body text-[13px] font-semibold ${TR} hover:bg-[rgba(232,65,75,.18)]`}
        >
          <i className="hgi hgi-stroke hgi-logout-01" /> Sign Out
        </button>
      </div>
    </div>
  );
}
