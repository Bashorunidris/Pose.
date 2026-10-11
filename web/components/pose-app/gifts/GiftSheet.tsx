'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { CommentMedia } from '@/lib/pose-app/comments';
import {
  GIFT_CATALOGUE,
  GIFT_FILTERS,
  giftMedia,
  giftTotal,
  type GiftItem,
  type GiftPick,
  type GiftTag,
} from '@/lib/pose-app/gifts';
import { loadWalletProfile, markPaymentPinVerified, paymentPinRequired } from '@/lib/pose-app/wallet';

import { PinModal } from '../wallet/PinModal';

type Props = {
  uid: string | null;
  /** Whose comment the gift lands on — `gpoTargetUserId` @90004 in the legacy. */
  targetUserId: string | null;
  onClose: () => void;
  onAttach: (media: CommentMedia[]) => void;
};

type Filter = 'all' | GiftTag;

/** How long `gpo-closing` plays before the sheet is unmounted, from `gpoClose()` @90044. */
const CLOSE_MS = 270;

/**
 * `#giftPopupOverlay` @27371: the catalogue, the basket, the Pose Coin balance
 * and the Add button that writes the picks into the comment composer.
 *
 * The balance is `walletData.pCoinBalance` (a live listener in the legacy,
 * `loadWalletProfile()` here), and Add is gated by `requirePaymentPin()` @64109 —
 * the wallet's `#pinModalOverlay`, not the popup's own keypad, which index.html
 * removed for exactly this reason. That is also why the overlay sits at z-index
 * 250000: above the comment sheet, below the PIN modal.
 */
export function GiftSheet({ uid, targetUserId, onClose, onAttach }: Props) {
  const [filter, setFilter] = useState<Filter>('all');
  const [basket, setBasket] = useState<Record<string, number>>({});
  const [balance, setBalance] = useState<number | null>(null);
  const [closing, setClosing] = useState(false);
  const [pinOpen, setPinOpen] = useState(false);
  const [notice, setNotice] = useState('');
  const noticeTimer = useRef<number | null>(null);

  const showNotice = useCallback((message: string) => {
    setNotice(message);
    if (noticeTimer.current !== null) window.clearTimeout(noticeTimer.current);
    noticeTimer.current = window.setTimeout(() => setNotice(''), 2800);
  }, []);

  useEffect(
    () => () => {
      if (noticeTimer.current !== null) window.clearTimeout(noticeTimer.current);
    },
    [],
  );

  /** `gpoSyncBalanceUI()` @90137 — paint the cached balance as the sheet opens. */
  useEffect(() => {
    if (!uid) return;
    void Promise.resolve()
      .then(() => loadWalletProfile(uid))
      .then((profile) => setBalance(profile.pCoinBalance))
      .catch(() => setBalance(0));
  }, [uid]);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  const close = useCallback(() => {
    setClosing(true);
    window.setTimeout(onClose, CLOSE_MS);
  }, [onClose]);

  /** `gpoIncrement()` @90070 / `gpoDecrement()` @90076. */
  const step = useCallback((id: string, delta: number) => {
    setBasket((current) => {
      const next = Math.max(0, (current[id] ?? 0) + delta);
      if (next === 0) return Object.fromEntries(Object.entries(current).filter(([key]) => key !== id));
      return { ...current, [id]: next };
    });
  }, []);

  const picks: GiftPick[] = useMemo(
    () =>
      GIFT_CATALOGUE.filter((gift) => basket[gift.id]).map((gift) => ({
        gift,
        qty: basket[gift.id],
      })),
    [basket],
  );
  const total = giftTotal(picks);
  const balanceKnown = balance !== null;
  const unaffordable = balanceKnown && total > balance;

  const attach = useCallback(() => {
    onAttach(giftMedia(picks, targetUserId));
    close();
  }, [close, onAttach, picks, targetUserId]);

  /** `gpoAddToComment()` @90084 — the PIN gate in front of `_gpoDoAddToComment()` @90100. */
  const add = useCallback(async () => {
    if (!picks.length) return;
    if (unaffordable) {
      showNotice(`Not enough Pose Coins. Balance: ${(balance ?? 0).toLocaleString()}`);
      return;
    }
    if (await paymentPinRequired(uid)) {
      setPinOpen(true);
      return;
    }
    attach();
  }, [attach, balance, picks.length, showNotice, uid, unaffordable]);

  const visible: GiftItem[] =
    filter === 'all'
      ? GIFT_CATALOGUE
      : GIFT_CATALOGUE.filter((gift) => gift.tags.includes(filter));

  const sendLabel = unaffordable ? 'Insufficient Coins' : 'Add';
  const sendIcon = unaffordable ? 'fa-exclamation-circle' : 'fa-plus';

  return (
    <div className="gifts-shell">
      <div
        id="giftPopupOverlay"
        className={closing ? 'gpo-closing' : 'gpo-open'}
        onClick={(event) => {
          if (event.target === event.currentTarget) close();
        }}
      >
        <div className="gpo-sheet">
          <div className="gpo-handle" />
          <div className="gpo-header">
            <h3>
              <i className="fas fa-gift" style={{ marginRight: 7, fontSize: 14 }} />
              Send a Gift
            </h3>
            <div
              className="gpo-wallet mr-[10px] ml-auto flex items-center gap-[6px] rounded-[18px] border border-[rgba(245,158,11,0.4)] bg-[linear-gradient(90deg,rgba(245,158,11,0.18),rgba(251,146,60,0.12))] px-[12px] py-[6px] text-[12px] font-bold text-[#fbbf24]"
              title="Your Pose Coin balance"
            >
              <i className="fas fa-coins" style={{ fontSize: 13 }} />
              <span>{(balance ?? 0).toLocaleString()}</span>
            </div>
            <button type="button" className="gpo-close" onClick={close} aria-label="Close gifts">
              <i className="fas fa-times" />
            </button>
          </div>

          <div className="gpo-tabs">
            {GIFT_FILTERS.map((entry) => (
              <button
                type="button"
                key={entry.id}
                className={`gpo-tab${filter === entry.id ? ' active' : ''}`}
                onClick={() => setFilter(entry.id)}
              >
                {entry.label}
              </button>
            ))}
          </div>
          <div className="gpo-divider" />

          <div className="gpo-body">
            <div className="gpo-grid">
              {visible.map((gift) => {
                const count = basket[gift.id] ?? 0;
                return (
                  <div
                    key={gift.id}
                    className={`gpo-card${count > 0 ? ' gpo-selected' : ''}`}
                    onClick={(event) => {
                      if (!(event.target as HTMLElement).closest('.gpo-counter')) step(gift.id, 1);
                    }}
                  >
                    <span className={`gpo-badge${count > 0 ? ' show' : ''}`}>{count}</span>
                    <img src={gift.img} alt={gift.name} loading="lazy" />
                    <div className="gpo-cname">{gift.name}</div>
                    <div className="gpo-cprice">
                      <i className="fas fa-coins" />
                      {gift.price.toLocaleString()} Pose
                    </div>
                    <div className="gpo-counter">
                      <button
                        type="button"
                        aria-label={`Remove one ${gift.name}`}
                        onClick={(event) => {
                          event.stopPropagation();
                          step(gift.id, -1);
                        }}
                      >
                        −
                      </button>
                      <span className="gpo-num">{count}</span>
                      <button
                        type="button"
                        aria-label={`Add one ${gift.name}`}
                        onClick={(event) => {
                          event.stopPropagation();
                          step(gift.id, 1);
                        }}
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="gpo-footer">
            <div className="gpo-total-wrap">
              <div className="gpo-total-label">Total</div>
              <div className="gpo-total-value">
                <i className="fas fa-coins" />
                <span style={unaffordable ? { color: '#ff6b6b' } : undefined}>
                  {total.toLocaleString()}
                </span>
                &nbsp;Pose Coins
              </div>
            </div>
            <button
              type="button"
              className="gpo-send"
              disabled={total === 0 || unaffordable}
              onClick={() => void add()}
            >
              <i className={`fas ${sendIcon}`} /> {sendLabel}
            </button>
          </div>
        </div>
      </div>

      <div className={`gpo-toast${notice ? ' gpo-toast-show' : ''}`}>{notice}</div>

      {pinOpen ? (
        // `.pin-modal-overlay` is styled under `.wallet-shell`, so the wallet's
        // PIN sheet is wrapped in its own scope rather than restyled here.
        <div className="wallet-shell">
          <PinModal
            action="verify"
            uid={uid ?? ''}
            onClose={() => setPinOpen(false)}
            onVerified={() => {
              markPaymentPinVerified();
              setPinOpen(false);
              attach();
            }}
            onForgot={() => showNotice('Reset your PIN from the wallet')}
            onToast={showNotice}
          />
        </div>
      ) : null}
    </div>
  );
}
