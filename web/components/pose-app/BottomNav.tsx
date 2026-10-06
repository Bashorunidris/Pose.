'use client';

import Link from 'next/link';

import {
  BOTTOM_NAV,
  NAV_BUTTON,
  NAV_BUTTON_ACTIVE,
  NAV_BUTTON_ICON,
  NAV_BUTTON_LABEL,
  NOTIF_BADGE,
  cx,
} from './styles';

type Props = {
  unread: number;
  onHome: () => void;
  onNotifications: () => void;
  onLive: () => void;
};

export function BottomNav({ unread, onHome, onNotifications, onLive }: Props) {
  return (
    <nav className={BOTTOM_NAV}>
      {/* `updateNavActiveState` @42719 lights Home whenever a feed section is
          showing, which is the only page this shell has. */}
      <button
        type="button"
        className={cx(NAV_BUTTON, NAV_BUTTON_ACTIVE)}
        onClick={onHome}
        title="Go to Home"
      >
        <i className={cx(NAV_BUTTON_ICON, 'fa-solid fa-house')} />
        <span className={NAV_BUTTON_LABEL}>Home</span>
      </button>

      <button type="button" className={NAV_BUTTON} onClick={onNotifications} title="Notifications">
        {unread > 0 && <span className={NOTIF_BADGE}>{unread > 99 ? '99+' : unread}</span>}
        <i className={cx(NAV_BUTTON_ICON, 'fa-solid fa-bell')} />
        <span className={NAV_BUTTON_LABEL}>Alert</span>
      </button>

      <button type="button" className={NAV_BUTTON} onClick={onLive} title="Go Live">
        <i className={cx(NAV_BUTTON_ICON, 'fa-solid fa-tower-broadcast')} />
        <span className={NAV_BUTTON_LABEL}>Live</span>
      </button>

      <Link href="/pose-music" className={NAV_BUTTON} title="Music">
        <i className={cx(NAV_BUTTON_ICON, 'fa-solid fa-music')} />
        <span className={NAV_BUTTON_LABEL}>Music</span>
      </Link>
    </nav>
  );
}
