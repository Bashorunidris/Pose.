'use client';

import { useEffect, useRef, useState } from 'react';

import { isComingSoon } from '@/lib/pose-live/live-sessions';
import { LIVE_MODES, type LiveMode } from '@/lib/pose-live/types';
import { ModePanel } from './ModePanel';
import {
  BACK_BTN,
  BTN_DOT,
  BTN_SHIMMER,
  COMING_SOON_HINT,
  GO_LIVE_BTN,
  GO_LIVE_DISABLED,
  GO_LIVE_SHEEN,
  GO_LIVE_WRAP,
  LIVE_INDICATOR,
  MODE_ICON,
  MODE_STYLE,
  PANELS,
  PULSE_DOT,
  TAB_BAR,
  TAB_BTN,
  TAB_BTN_IDLE,
  TAB_GLOW,
  TAB_GLOW_ON,
  TAB_ICON,
  TAB_LABEL,
  TAB_LABEL_IDLE,
  TAB_META,
  TAB_TRACK,
  TOPBAR,
  TOPBAR_H1,
  TOPBAR_P,
  TOPBAR_TITLE,
  cx,
} from './styles';

type Props = {
  tab: LiveMode;
  onTab: (mode: LiveMode) => void;
  onBack: () => void;
  onOpenSetup: (mode: LiveMode) => void;
  followers: string;
};

/** `#page-golive` @1125. */
export function GoLivePage({ tab, onTab, onBack, onOpenSetup, followers }: Props) {
  // `switchTab` @1648 slides the outgoing panel left for 400ms before it settles.
  const [exiting, setExiting] = useState<LiveMode | null>(null);
  const previous = useRef(tab);

  useEffect(() => {
    if (previous.current === tab) return;
    const outgoing = previous.current;
    previous.current = tab;
    setExiting(outgoing);
    const timer = setTimeout(() => setExiting((current) => (current === outgoing ? null : current)), 400);
    return () => clearTimeout(timer);
  }, [tab]);

  const soon = isComingSoon(tab);
  const style = MODE_STYLE[tab];

  return (
    <>
      <div className={TOPBAR}>
        <button type="button" className={BACK_BTN} onClick={onBack} title="Back to live feed">
          <svg className="h-[22px] w-[22px] fill-none stroke-white stroke-[2.5] [stroke-linecap:round] [stroke-linejoin:round]" viewBox="0 0 24 24">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <div className={TOPBAR_TITLE}>
          <h1 className={TOPBAR_H1}>Go Live</h1>
          <p className={TOPBAR_P}>{TAB_META[tab].sub}</p>
        </div>
        <div className={LIVE_INDICATOR}>
          <div className={PULSE_DOT} />
          LIVE
        </div>
      </div>

      <div className={TAB_BAR}>
        <div className={TAB_TRACK}>
          {LIVE_MODES.map((mode) => {
            const active = mode === tab;
            const modeStyle = MODE_STYLE[mode];
            return (
              <button
                type="button"
                key={mode}
                className={cx(TAB_BTN, active ? modeStyle.tabActive : TAB_BTN_IDLE)}
                onClick={() => onTab(mode)}
              >
                <div className={cx(TAB_GLOW, modeStyle.tabGlow, active && TAB_GLOW_ON)} />
                <span className={TAB_ICON}>
                  <i className={MODE_ICON[mode]} />
                </span>
                <span className={cx(TAB_LABEL, active ? modeStyle.tabLabel : TAB_LABEL_IDLE)}>
                  {TAB_META[mode].label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className={PANELS}>
        {LIVE_MODES.map((mode) => (
          <ModePanel
            key={mode}
            mode={mode}
            state={mode === tab ? 'active' : mode === exiting ? 'exit' : 'idle'}
            followers={followers}
          />
        ))}
      </div>

      <div className={GO_LIVE_WRAP}>
        <button
          type="button"
          className={cx(GO_LIVE_BTN, style.cta, soon && GO_LIVE_DISABLED)}
          disabled={soon}
          onClick={() => !soon && onOpenSetup(tab)}
        >
          <div className={GO_LIVE_SHEEN} />
          <div className={BTN_SHIMMER} />
          <div className={BTN_DOT} />
          <i className={cx('relative z-[1]', MODE_ICON[tab])} />
          <span className="relative z-[1]">{soon ? 'Coming Soon' : 'Set Up Live'}</span>
        </button>
        {soon && (
          <div className={COMING_SOON_HINT}>
            <i className="fa-solid fa-hourglass-half mr-[5px]" />
            This mode is coming soon
          </div>
        )}
      </div>
    </>
  );
}
