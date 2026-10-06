'use client';

import { useEffect, useState } from 'react';

import { cx } from './styles';
import {
  NOTIF_TAB_LABELS,
  NOTIF_TABS,
  dedupeNotifications,
  followBackNotification,
  markAllNotificationsRead,
  markNotificationRead,
  notifActionText,
  notifIcon,
  notifTime,
  type NotifTab,
} from '@/lib/pose-app/notifications';
import type { PoseNotification } from '@/lib/pose-app/types';

type Props = {
  open: boolean;
  onClose: () => void;
  uid: string | null;
  displayName: string;
  items: PoseNotification[];
};

/**
 * `.notifications-overlay` @1266 + `.pose-notifications` @1432, sized to the
 * centered 420px shell at ≥768px by the @8478/@8559 overrides. `left` is used
 * instead of a translate so the slide-up animation owns the transform.
 */
const OVERLAY =
  'fixed inset-0 z-[1999] flex animate-app-slide-up flex-col bg-[#0f0f12] text-white ' +
  'md:left-[calc(50%-210px)] md:right-auto md:h-[100dvh] md:max-h-[100dvh] md:w-[420px] md:max-w-full md:overflow-x-hidden';

/** `.notifications-header` @1306 merged with `.pose-notif-header` @1436. */
const HEADER =
  'sticky top-0 z-[10] flex items-center justify-between gap-[12px] border-b border-[rgba(187,134,252,0.2)] ' +
  'bg-[linear-gradient(135deg,#1a1025_0%,#0f0f12_100%)] px-[16px] py-[14px]';

/** `.pose-notif-back` / `.pose-notif-mark-all` @1454. */
const HEADER_BTN =
  'grid h-9 w-9 shrink-0 cursor-pointer place-items-center rounded-full border border-[rgba(187,134,252,0.25)] ' +
  'bg-[rgba(187,134,252,0.12)] text-[14px] text-[#bb86fc] transition-all duration-200 hover:scale-105 hover:bg-[rgba(187,134,252,0.22)]';

/** `.pose-notif-tabs` @1469. */
const TABS_WRAP =
  'flex gap-[6px] overflow-x-auto border-b border-white/5 bg-[#0f0f12] px-[12px] py-[10px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden';

/** `.pose-notif-tab` @1479 with `.active` @1494. */
const TAB =
  'inline-flex shrink-0 cursor-pointer items-center gap-[6px] whitespace-nowrap rounded-[20px] border border-white/8 ' +
  'bg-white/4 px-[14px] py-[8px] text-[13px] font-semibold text-[#ccc] transition-all duration-200 hover:bg-[rgba(187,134,252,0.12)] hover:text-white';
const TAB_ACTIVE =
  'border-transparent bg-[linear-gradient(135deg,#8a2be2_0%,#bb86fc_100%)] text-white shadow-[0_4px_12px_rgba(138,43,226,0.35)]';

/** `.pose-notif-tab-count` @1500 — hidden until it has a count. */
const TAB_COUNT = 'hidden min-w-[18px] rounded-[10px] bg-white/18 px-[7px] py-[1px] text-center text-[11px] text-white';
const TAB_COUNT_ON = 'inline-block';

/** `.pose-notif-container` @1511. */
const LIST = 'flex-1 overflow-y-auto bg-[#0f0f12] pt-[4px] pb-[80px]';

/** `.pose-notif-card` @1515 with `.unread` @1526/@1536. */
const CARD =
  'relative flex cursor-pointer gap-[12px] border-b border-white/5 bg-[#0f0f12] px-[16px] py-[14px] transition-colors duration-200 hover:bg-[rgba(187,134,252,0.06)]';
const CARD_UNREAD =
  'bg-[rgba(187,134,252,0.05)] before:absolute before:left-[6px] before:top-1/2 before:h-[6px] before:w-[6px] ' +
  'before:-translate-y-1/2 before:rounded-full before:bg-[#bb86fc] before:shadow-[0_0_8px_#bb86fc] before:content-[""]';

/** `.pose-notif-card-avatar` @1537. */
const AVATAR =
  'relative grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[linear-gradient(135deg,#8a2be2_0%,#bb86fc_100%)] ' +
  'bg-cover bg-center text-[15px] font-bold text-white';

/** `.pose-notif-card-icon` @1547 plus the per-type fills @1557-1564. */
const ICON_CHIP =
  'absolute -bottom-[2px] -right-[2px] grid h-5 w-5 place-items-center rounded-full border-2 border-[#0f0f12] text-[10px] text-white';
const ICON_TINTS: Record<string, string> = {
  follow: 'bg-[#bb86fc]',
  like: 'bg-pose-accent',
  comment: 'bg-[#00b4d8]',
  mention: 'bg-[#ffb703] text-black!',
  message: 'bg-[#ff6b6b]',
  visit: 'bg-[#4ade80]',
  view: 'bg-[#f59e0b]',
  pose: 'bg-[linear-gradient(135deg,#8a2be2,#bb86fc)]',
};

const BODY = 'flex min-w-0 flex-1 flex-col justify-center gap-[3px]';
const TEXT = 'text-[14px] leading-[1.35] break-words text-white';
const NAME = 'font-bold text-white';
const ACTION = 'text-[#bbb]';
const TIME = 'text-[12px] text-[#777]';

/** `.pose-notif-card-thumb` @1590. */
const THUMB = 'h-11 w-11 shrink-0 self-center rounded-[6px] bg-[#222] bg-cover bg-center';

/** `.pose-notif-card-action-btn` @1598 with `.followed` @1610. */
const ACTION_BTN =
  'self-center whitespace-nowrap rounded-[6px] border-none bg-[linear-gradient(135deg,#8a2be2_0%,#bb86fc_100%)] ' +
  'px-[14px] py-[6px] text-[12px] font-bold text-white';
const ACTION_BTN_DONE = 'bg-white/8 text-[#ccc]';

/** `.pose-notif-empty-state` @1614. */
const EMPTY = 'flex flex-col items-center px-[24px] py-[80px] text-center text-[#777]';

const INITIAL = 'U';

export function NotificationsPanel({ open, onClose, uid, displayName, items }: Props) {
  const [tab, setTab] = useState<NotifTab>('all');

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  const deduped = dedupeNotifications(items);
  const list = tab === 'all' ? deduped : deduped.filter((n) => n.type === tab);
  const counts = NOTIF_TABS.reduce<Record<string, number>>((acc, key) => {
    const scope = key === 'all' ? deduped : deduped.filter((n) => n.type === key);
    acc[key] = scope.filter((n) => !n.read).length;
    return acc;
  }, {});

  const markRead = (n: PoseNotification) => {
    if (uid) void markNotificationRead(uid, n.id);
  };

  return (
    <div className={OVERLAY} role="dialog" aria-modal="true" aria-label="Activity">
      <div className={HEADER}>
        <button type="button" className={HEADER_BTN} onClick={onClose} title="Back" aria-label="Back">
          <i className="fas fa-arrow-left" />
        </button>
        <h2 className="m-0 flex-1 text-center text-[18px] font-bold tracking-[0.3px] text-white">Activity</h2>
        <button
          type="button"
          className={HEADER_BTN}
          title="Mark all as read"
          aria-label="Mark all as read"
          onClick={() => {
            if (uid) void markAllNotificationsRead(uid, items);
          }}
        >
          <i className="fas fa-check-double" />
        </button>
      </div>

      <div className={TABS_WRAP}>
        {NOTIF_TABS.map((key) => {
          const count = counts[key] ?? 0;
          return (
            <button
              type="button"
              key={key}
              className={cx(TAB, tab === key && TAB_ACTIVE)}
              onClick={() => setTab(key)}
            >
              {NOTIF_TAB_LABELS[key]}
              <span className={cx(TAB_COUNT, count > 0 && TAB_COUNT_ON)}>
                {count > 99 ? '99+' : count}
              </span>
            </button>
          );
        })}
      </div>

      <div className={LIST}>
        {list.length === 0 ? (
          <div className={EMPTY}>
            <i className="fas fa-bell-slash mb-[16px] text-[48px] text-[#bb86fc] opacity-40" />
            <div className="mb-[6px] text-[18px] font-bold text-white">No notifications yet</div>
            <div className="text-[13px] text-[#888]">
              When someone follows you, likes your post or sends a message, you&apos;ll see it here.
            </div>
          </div>
        ) : (
          list.map((n) => {
            const initial = (n.fromUserName || INITIAL).charAt(0).toUpperCase();
            const isFollow = n.type === 'follow';
            const followed = Boolean(n.followedBack);
            return (
              <div
                key={n.id}
                className={cx(CARD, !n.read && CARD_UNREAD)}
                onClick={() => markRead(n)}
              >
                <div
                  className={AVATAR}
                  style={
                    n.fromUserPic
                      ? { backgroundImage: `url('${n.fromUserPic}')` }
                      : undefined
                  }
                >
                  {!n.fromUserPic && initial}
                  <span className={cx(ICON_CHIP, ICON_TINTS[n.type] ?? 'bg-[#bb86fc]')}>
                    <i className={notifIcon(n.type)} />
                  </span>
                </div>

                <div className={BODY}>
                  <div className={TEXT}>
                    <span className={NAME}>{n.fromUserName || 'Someone'}</span>{' '}
                    <span className={ACTION}>{notifActionText(n)}</span>
                  </div>
                  <div className={TIME}>{notifTime(n.createdAt)}</div>
                </div>

                {isFollow ? (
                  <button
                    type="button"
                    className={cx(ACTION_BTN, followed && ACTION_BTN_DONE)}
                    onClick={(event) => {
                      event.stopPropagation();
                      if (!uid || followed) return;
                      void followBackNotification(uid, n, displayName);
                    }}
                  >
                    {followed ? 'Following' : 'Follow back'}
                  </button>
                ) : (
                  n.thumbUrl && (
                    <div
                      className={THUMB}
                      style={{ backgroundImage: `url('${n.thumbUrl}')` }}
                    />
                  )
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
