'use client';

import { initialsOf } from '@/lib/pose-music/data';
import type { Artist, ViewName } from '@/lib/pose-music/types';
import { DRAWER_BUTTON, ICON_18, TR } from './styles';

type Props = {
  open: boolean;
  view: ViewName;
  artist: Artist | null;
  onNavigate: (view: ViewName) => void;
  onSignOut: () => void;
  onClose: () => void;
};

const GRADIENT = 'linear-gradient(135deg,var(--color-music-green),var(--color-music-green-deep))';
const GROUP_LABEL =
  'block text-[10px] font-bold tracking-[1px] uppercase text-music-ink-muted px-[10px] pt-[8px] pb-[4px]';

function drawerButton(active: boolean) {
  return `${DRAWER_BUTTON} ${active ? 'bg-music-surface text-music-ink' : ''}`;
}

export function MenuDrawer({ open, view, artist, onNavigate, onSignOut, onClose }: Props) {
  const initials = artist?.name ? initialsOf(artist.name) : '';

  const item = (name: ViewName, icon: string, label: string) => (
    <button
      type="button"
      onClick={() => onNavigate(name)}
      className={drawerButton(view === name)}
    >
      <i className={`hgi hgi-stroke hgi-${icon} text-music-green ${ICON_18}`} />
      {' '}
      {label}
    </button>
  );

  return (
    <>
      {open ? (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/[.6] z-[90] backdrop-blur-[4px]"
        />
      ) : null}

      <aside
        className="fixed top-0 right-0 bottom-0 w-[280px] bg-black border-l border-music-hair-bright z-[95] flex flex-col overflow-hidden transition-transform duration-[280ms] ease-[cubic-bezier(.4,0,.2,1)]"
        style={{ transform: open ? 'translateX(0)' : 'translateX(100%)' }}
      >
        <div className="py-[14px] px-[16px] pt-[18px] border-b border-music-hair flex items-center justify-between">
          <div className="flex items-center gap-[9px]">
            <span className="w-[30px] h-[30px] bg-music-green rounded-full grid place-items-center text-[13px] text-black">
              <i className="hgi hgi-stroke hgi-information-circle" />
            </span>
            <span className="font-display font-extrabold text-[16px]">Pose</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`w-[30px] h-[30px] bg-music-surface border border-music-hair text-music-ink-muted rounded-full grid place-items-center text-[14px] cursor-pointer ${TR} hover:text-white`}
          >
            <i className="hgi hgi-stroke hgi-cancel-01" />
          </button>
        </div>

        {artist ? (
          <div className="py-[14px] px-[16px] bg-music-surface border-b border-music-hair">
            <div className="flex items-center gap-[11px]">
              <span
                className="w-[44px] h-[44px] rounded-full grid place-items-center text-[18px] text-black shrink-0 font-display font-extrabold"
                style={{ background: GRADIENT }}
              >
                {initials}
              </span>
              <div className="min-w-0">
                <div className="text-[14px] font-bold whitespace-nowrap overflow-hidden text-ellipsis">
                  {artist.name}
                </div>
                <div className="text-[11px] text-music-ink-muted mt-[1px]">
                  {`${artist.type || 'Musician'} · ${artist.country || ''}`}
                </div>
                <span className="inline-block bg-[rgba(29,185,84,.12)] border border-[rgba(29,185,84,.25)] text-music-green py-[1px] px-[8px] rounded-[20px] text-[10px] font-bold mt-[4px]">
                  ✓ Creator
                </span>
              </div>
            </div>
          </div>
        ) : null}

        <div className="flex-1 overflow-y-auto px-[8px] py-[10px]">
          <span className={GROUP_LABEL}>Discover</span>
          {item('search', 'home-01', 'Browse Music')}

          <span className={`${GROUP_LABEL} pt-[14px]`}>Creator</span>
          {!artist ? (
            <button type="button" onClick={() => onNavigate('signup')} className={drawerButton(view === 'signup')}>
              <i className={`hgi hgi-stroke hgi-star text-music-amber ${ICON_18}`} />
              {' '}
              Become a Creator
            </button>
          ) : (
            <>
              {item('dashboard', 'chart-line-data-01', 'Dashboard')}
              {item('upload', 'upload-01', 'Upload Music')}
              {item('catalogue', 'folder-02', 'My Catalogue')}
              {item('profile', 'user', 'Edit Profile')}
            </>
          )}

          <div className="my-[8px] mx-[8px] mt-[16px] p-[14px] bg-gradient-to-br from-[#1a2e1e] to-[#0d1f12] border border-[rgba(29,185,84,.2)] rounded-music text-[12px] text-music-ink-soft">
            <strong className="block text-music-green mb-[3px]">🎙️ Earn More with Pose</strong>
            Artists earn 3–5× more per use.
            <button
              type="button"
              onClick={() => onNavigate('signup')}
              className={`inline-block mt-[9px] py-[6px] px-[13px] bg-music-green text-black rounded-[20px] text-[11px] font-bold cursor-pointer border-none font-body ${TR}`}
            >
              Get Started
            </button>
          </div>
        </div>

        {artist ? (
          <div className="py-[12px] px-[16px] border-t border-music-hair">
            <button
              type="button"
              onClick={onSignOut}
              className="w-full inline-flex items-center gap-[9px] py-[9px] px-[12px] bg-[rgba(232,65,75,.08)] border border-[rgba(232,65,75,.18)] text-music-red cursor-pointer rounded-music-sm font-body text-[13px] font-semibold transition-all duration-[220ms] hover:bg-[rgba(232,65,75,.18)]"
            >
              <i className="hgi hgi-stroke hgi-logout-01" /> Sign Out
            </button>
          </div>
        ) : null}
      </aside>
    </>
  );
}
