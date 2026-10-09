'use client';

import type { JoinRequest, LeaderboardRow } from '@/lib/pose-live/use-host-room';
import { rankIcon } from '@/lib/pose-live/room';

type Props = {
  roomName: string;
  roomTitle: string;
  privacy: 'public' | 'private';
  viewerCount: number;
  msgCount: number;
  giftCount: number;
  timerLabel: string;
  timerLow: boolean;
  leaderboard: LeaderboardRow[];
  joinRequests: JoinRequest[];
  onBack: () => void;
  onEnd: () => void;
  onReview: () => void;
  onOpenGifts: () => void;
};

/** `#header` @83. */
export function RoomHeader({
  roomName,
  roomTitle,
  privacy,
  viewerCount,
  msgCount,
  giftCount,
  timerLabel,
  timerLow,
  leaderboard,
  joinRequests,
  onBack,
  onEnd,
  onReview,
  onOpenGifts,
}: Props) {
  const isPrivate = privacy === 'private';
  return (
    <div id="header">
      <div className="header-row1">
        <button type="button" className="back-btn" onClick={onBack} title="Back">
          <svg viewBox="0 0 24 24">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <div className="room-info">
          <div className="room-name">{roomName}</div>
          <div className="room-title">{roomTitle}</div>
        </div>
        <div className="live-badge">
          <div className="live-dot" />
          LIVE
        </div>
        <div className={`privacy-badge ${isPrivate ? 'private' : 'public'}`}>
          <i className={`fa-solid ${isPrivate ? 'fa-lock' : 'fa-earth-africa'}`} />
          {isPrivate ? 'Private' : 'Public'}
        </div>
        <button type="button" className="end-btn" onClick={onEnd}>
          End
        </button>
      </div>

      <div className="header-row2">
        <div className="stat-pill">
          <span className="sp-icon">
            <i className="fa-solid fa-eye" />
          </span>
          {viewerCount} watching
        </div>
        <div className="stat-pill">
          <span className="sp-icon">
            <i className="fa-solid fa-comment-dots" />
          </span>
          {msgCount} msgs
        </div>
        <div className="stat-pill">
          <span className="sp-icon">
            <i className="fa-solid fa-gift" />
          </span>
          {giftCount} gifts
        </div>
        {timerLabel && (
          <div id="timer-pill" style={timerLow ? { color: '#FCA5A5' } : undefined}>
            <i className="fa-solid fa-stopwatch" />
            <span>{timerLabel}</span>
          </div>
        )}
      </div>

      <div id="gifters-peek" onClick={onOpenGifts}>
        <span className="peek-label">
          <i className="fa-solid fa-trophy" /> TOP
        </span>
        <div id="peek-items">
          {leaderboard.slice(0, 3).map((row, index) => (
            <div key={row.uid} className={`peek-item rank${index + 1}`}>
              <i className={rankIcon(index)} /> {row.name} · {row.total} PC
            </div>
          ))}
        </div>
      </div>

      <div id="join-requests-bar" className={isPrivate && joinRequests.length > 0 ? 'visible' : ''}>
        <span className="jr-text">
          {joinRequests.length} join request{joinRequests.length === 1 ? '' : 's'}
        </span>
        <button type="button" className="jr-btn approve" onClick={onReview}>
          Review
        </button>
      </div>
    </div>
  );
}

/** `#bottom-tabs` @169. */
export function BottomTabs({
  tab,
  onTab,
  notify,
}: {
  tab: 'chat' | 'gifts' | 'controls';
  onTab: (tab: 'chat' | 'gifts' | 'controls') => void;
  notify: { chat: number; gifts: number };
}) {
  const items = [
    { key: 'chat' as const, label: 'Chat', icon: 'fa-solid fa-comment-dots', badge: notify.chat },
    { key: 'gifts' as const, label: 'Gifts', icon: 'fa-solid fa-gift', badge: notify.gifts },
    { key: 'controls' as const, label: 'Controls', icon: 'fa-solid fa-sliders', badge: 0 },
  ];
  return (
    <div id="bottom-tabs">
      {items.map((item) => (
        <div
          key={item.key}
          id={`tab-${item.key}`}
          className={tab === item.key ? `tab-item active-${item.key}` : 'tab-item'}
          onClick={() => onTab(item.key)}
        >
          <div className="tab-indicator" />
          <span className="ti-icon">
            <i className={item.icon} />
          </span>
          <span className="ti-label">{item.label}</span>
          <div className={`tab-notif ${item.badge > 0 ? 'show' : ''}`}>
            {item.badge >= 10 ? '9+' : item.badge}
          </div>
        </div>
      ))}
    </div>
  );
}
