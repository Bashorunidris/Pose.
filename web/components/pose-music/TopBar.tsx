'use client';

import { TR } from './styles';
import { initialsOf } from '@/lib/pose-music/data';
import type { Artist } from '@/lib/pose-music/types';

type Props = {
  query: string;
  artist: Artist | null;
  onQueryChange: (value: string) => void;
  onOpenDrawer: () => void;
  onLogoClick: () => void;
  onBack: () => void;
};

const AVATAR_GRADIENT = 'linear-gradient(135deg,var(--color-music-green),var(--color-music-green-deep))';

export function TopBar({ query, artist, onQueryChange, onOpenDrawer, onLogoClick, onBack }: Props) {
  const initials = artist?.name ? initialsOf(artist.name) : '';

  return (
    <header className="sticky top-0 z-20 bg-music-base/[.88] backdrop-blur-[20px] py-[14px] px-[28px] flex items-center gap-[14px] border-b border-music-hair max-[900px]:py-[11px] max-[900px]:px-[14px] max-[600px]:py-[10px] max-[600px]:px-[12px]">
      <button
        type="button"
        title="Back"
        onClick={onBack}
        className={`bg-transparent border-none text-music-ink-soft cursor-pointer py-[5px] px-[9px] rounded-full text-[14px] ${TR} hover:text-music-ink hover:bg-white/[.07]`}
      >
        <i className="fas fa-chevron-left" />
      </button>

      <div
        onClick={onLogoClick}
        className="flex items-center gap-[8px] cursor-pointer select-none"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="Pose" width={30} height={30} className="w-[30px] h-[30px] rounded-[8px] object-cover shrink-0 block" />
        <span className="font-display font-extrabold text-[17px] tracking-[-.3px]">Pose</span>
      </div>

      <div className="flex-1 relative max-w-[340px]">
        <i className="fas fa-search absolute left-[13px] top-1/2 -translate-y-1/2 text-music-ink-muted text-[13px] pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Search sounds, artists…"
          className="w-full bg-music-surface border border-music-hair-bright rounded-[40px] py-[9px] pr-[14px] pl-[38px] text-music-ink font-body text-[13.5px] outline-none placeholder:text-music-ink-muted transition-all duration-[220ms] focus:border-music-green focus:bg-music-card focus:shadow-[0_0_0_3px_rgba(29,185,84,.18)]"
        />
      </div>

      <div className="relative">
        <button
          type="button"
          onClick={onOpenDrawer}
          className={`inline-flex items-center gap-[7px] bg-music-surface border border-music-hair-bright text-music-ink py-[7px] px-[13px] rounded-[40px] cursor-pointer font-body text-[13px] font-semibold ${TR} hover:bg-music-hover`}
        >
          <span
            className="w-[24px] h-[24px] rounded-full grid place-items-center text-[10px] shrink-0 font-display font-extrabold transition-all duration-[220ms]"
            style={
              artist
                ? { background: AVATAR_GRADIENT, color: '#000' }
                : { background: 'var(--color-music-hover)', color: 'var(--color-music-ink-muted)' }
            }
          >
            {artist ? initials : <i className="fas fa-user text-[10px]" />}
          </span>
          <span>{artist ? artist.name.split(' ')[0] : 'Menu'}</span>
          <i className="fas fa-bars text-[12px] text-music-ink-muted" />
        </button>
      </div>
    </header>
  );
}
