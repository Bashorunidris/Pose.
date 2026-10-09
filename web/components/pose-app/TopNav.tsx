'use client';

import { NAVBAR, PROFILE_ICON, SEARCH_ICON, TAB, TAB_ACTIVE, TABS, cx } from './styles';
import type { PoseSession } from '@/lib/pose-app/session';

/** The two top-level feed tabs; Trend opens a modal instead of a panel. */
export type FeedTab = 'forYou' | 'buzz';

type Props = {
  /** `switchMainTab('trend')` returns before it moves `.active`, so the
   *  underline stays on the feed that is showing underneath the modal. */
  tab: FeedTab;
  onSelect: (tab: FeedTab) => void;
  onOpenTrend: () => void;
  /** `handleProfileClick` @29260 — signed in opens the profile, signed out opens auth. */
  user: PoseSession | null;
  onProfileClick: () => void;
  onOpenProfile: () => void;
  /** `openSearchForActiveTab()` @79729 — `#searchIconBtn` @24530. */
  onOpenSearch: () => void;
};

const BTN = 'appearance-none border-0 bg-transparent';

/** The default `.profile-icon` glyph from `index.html` @24509. */
function PersonGlyph() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="white" aria-hidden="true">
      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
    </svg>
  );
}

export function TopNav({
  tab,
  onSelect,
  onOpenTrend,
  user,
  onProfileClick,
  onOpenProfile,
  onOpenSearch,
}: Props) {
  // `updateProfileIcon` @44228: picture when there is one, otherwise the first letter.
  const pic = user?.photoURL?.trim() ?? '';
  const initial = user ? (user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U') : '';

  const avatar = pic ? (
    <span className="h-full w-full rounded-full bg-cover bg-center" style={{ backgroundImage: `url('${pic}')` }} />
  ) : initial ? (
    <span className="flex h-full w-full items-center justify-center text-[18px] font-bold text-white">{initial}</span>
  ) : (
    <PersonGlyph />
  );

  return (
    <div className={NAVBAR}>
      {/* `handleProfileClick` @29260 sends a signed-out visitor to the auth
          screen and a signed-in user to `#profilePage`. */}
      {user ? (
        <button type="button" className={cx(PROFILE_ICON, BTN)} onClick={onOpenProfile} aria-label="Profile">
          {avatar}
        </button>
      ) : (
        <button type="button" className={cx(PROFILE_ICON, BTN)} onClick={onProfileClick} aria-label="Sign in">
          {avatar}
        </button>
      )}
      <div className={TABS}>
        <button
          type="button"
          className={cx(TAB, BTN, tab === 'forYou' && TAB_ACTIVE)}
          onClick={() => onSelect('forYou')}
        >
          For You
        </button>
        <button
          type="button"
          className={cx(TAB, BTN, tab === 'buzz' && TAB_ACTIVE)}
          onClick={() => onSelect('buzz')}
        >
          Buzz
        </button>
        <button type="button" className={cx(TAB, BTN)} onClick={onOpenTrend}>
          Trend
        </button>
      </div>
      {/* The shell had no search button at all until this landed; the legacy
          `#searchIconBtn` is the last child of `.navbar`. */}
      <button
        type="button"
        className={cx(SEARCH_ICON, BTN)}
        onClick={onOpenSearch}
        aria-label="Search"
      >
        <i className="fas fa-magnifying-glass" />
      </button>
    </div>
  );
}
