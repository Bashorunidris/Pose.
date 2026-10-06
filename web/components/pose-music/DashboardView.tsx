'use client';

import { REVENUE_PER_USE_USD, formatCurrency, formatNumber } from '@/lib/pose-music/data';
import { SPONSORED_BADGE, TR } from './styles';
import type { Artist, Song } from '@/lib/pose-music/types';

const GRADIENT = 'linear-gradient(135deg,var(--color-music-green),var(--color-music-green-deep))';

type Props = {
  artist: Artist;
  songs: Song[];
};

function StatCard({ label, icon, value }: { label: string; icon: string; value: string }) {
  return (
    <div className={`bg-music-surface rounded-music p-[16px] ${TR} hover:bg-music-hover hover:-translate-y-[2px]`}>
      <h4 className="text-music-ink-muted text-[10.5px] uppercase tracking-[.7px] mb-[7px] flex justify-between items-center">
        {label}
        <i className={`hgi hgi-stroke hgi-${icon} text-music-green`} />
      </h4>
      <p className="text-[26px] font-bold font-display">{value}</p>
    </div>
  );
}

export function DashboardView({ artist, songs }: Props) {
  const uses = songs.reduce((total, song) => total + (song.useCount || 0), 0);
  const links = [
    artist.spotifyUrl ? { href: artist.spotifyUrl, label: 'Spotify Profile', icon: 'spotify', apple: false } : null,
    artist.appleMusicUrl ? { href: artist.appleMusicUrl, label: 'Apple Music Profile', icon: 'apple', apple: true } : null,
  ].filter(Boolean) as { href: string; label: string; icon: string; apple: boolean }[];

  return (
    <>
      <div className="bg-gradient-to-br from-[#0d1f2e] to-[#0a1520] border border-[rgba(61,139,255,.18)] rounded-music-lg py-[18px] px-[22px] mb-[14px] flex justify-between items-center gap-[14px] flex-wrap">
        <div>
          <span className={SPONSORED_BADGE}>POSE BENEFITS</span>
          <h4 className="font-display text-[17px] mt-[7px] mb-[3px]">Maximize your music revenue on Pose</h4>
          <p className="text-[12.5px] text-music-ink-soft">Fair pay for creators — earn 3–5× more per stream</p>
        </div>
        <button
          type="button"
          className={`bg-music-blue text-white border-none py-[8px] px-[18px] rounded-[40px] font-bold text-[12px] cursor-pointer font-body ${TR} hover:bg-[#559bff]`}
        >
          See Earnings
        </button>
      </div>

      <div className="bg-music-card border border-music-hair rounded-music-lg p-[26px] mb-[14px]">
        <div className="flex items-center gap-[14px] mb-[26px]">
          <div
            className="w-[64px] h-[64px] rounded-full grid place-items-center text-[26px] text-black shrink-0"
            style={{ background: GRADIENT }}
          >
            <i className="hgi hgi-stroke hgi-user" />
          </div>
          <div>
            <h2 className="font-display text-[24px] font-extrabold mb-[2px]">{artist.name}</h2>
            <p className="text-[12.5px] text-music-ink-soft">{`${artist.type || 'Musician'} · ${artist.country}`}</p>
          </div>
        </div>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-[11px] mb-[26px]">
          <StatCard label="Monthly Streams" icon="chart-histogram" value={formatNumber(artist.monthlyStreams || 0)} />
          <StatCard label="Total Songs" icon="music-note-01" value={`${songs.length}`} />
          <StatCard label="Total Uses" icon="film-01" value={formatNumber(uses)} />
          <StatCard label="Est. Revenue" icon="information-circle" value={formatCurrency(uses * REVENUE_PER_USE_USD, artist.country)} />
        </div>

        <div className="mb-[22px]">
          <h3 className="text-[14.5px] font-semibold mb-[11px]">
            <i className="hgi hgi-stroke hgi-link-01 text-music-green mr-[7px]" />
            Platform Links
          </h3>
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noreferrer"
              className={`flex items-center gap-[9px] py-[9px] px-[13px] rounded-music-sm no-underline mb-[7px] border text-[13px] text-white ${TR} ${
                link.apple
                  ? 'bg-[rgba(232,65,75,.09)] border-[rgba(232,65,75,.13)] hover:bg-[rgba(232,65,75,.16)]'
                  : 'bg-[rgba(29,185,84,.09)] border-[rgba(29,185,84,.13)] hover:bg-[rgba(29,185,84,.16)]'
              } hover:translate-x-[4px]`}
            >
              <i className={`hgi hgi-stroke hgi-${link.icon}`} />
              {link.label}
            </a>
          ))}
        </div>

        <div>
          <h3 className="text-[14.5px] font-semibold mb-[11px]">
            <i className="hgi hgi-stroke hgi-menu-01 text-music-green mr-[7px]" />
            Your Songs
          </h3>
          {songs.length === 0 ? (
            <p className="text-music-ink-muted text-[13px]">No songs uploaded yet.</p>
          ) : (
            songs.map((song) => (
              <div
                key={song.id}
                className={`bg-[rgba(255,255,255,.03)] rounded-music-sm py-[11px] px-[13px] mb-[7px] flex items-center gap-[11px] ${TR} hover:bg-[rgba(255,255,255,.06)] hover:translate-x-[4px]`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={song.coverUrl} alt="" className="w-[42px] h-[42px] rounded-[6px]" />
                <div className="flex-1 min-w-0">
                  <h4 className="text-[13px] font-semibold">{song.title}</h4>
                  <p className="text-[11.5px] text-music-ink-soft">
                    {`${formatNumber(song.streamCount || 0)} streams · ${formatNumber(song.useCount || 0)} uses`}
                  </p>
                </div>
                <p className="font-bold text-music-green text-[13.5px]">
                  {formatCurrency((song.useCount || 0) * REVENUE_PER_USE_USD, artist.country)}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
