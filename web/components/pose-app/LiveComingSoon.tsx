'use client';

import { useEffect, useState } from 'react';

import { cx } from './styles';
import { getPoseFirebase } from '@/lib/firebase';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';

/**
 * `#liveSoonModal` @24583 — Live is not built yet, so the bottom-nav entry opens
 * this page and offers the launch-notification opt-in on `users/{uid}`.
 */

const PAGE =
  'fixed inset-0 z-[5000] block overflow-y-auto bg-[linear-gradient(160deg,#1a0d2e_0%,#0b0714_65%)] ' +
  'md:left-[calc(50%-210px)] md:right-auto md:w-[420px] md:max-w-full';

const HEADER =
  'sticky top-0 z-[5] flex items-center gap-[12px] border-b border-[rgba(124,58,237,0.25)] ' +
  'bg-[rgba(11,7,20,0.92)] px-[16px] py-[14px] backdrop-blur-[10px]';

const BACK_BTN =
  'grid h-[38px] w-[38px] shrink-0 cursor-pointer place-items-center rounded-[12px] border border-white/18 ' +
  'bg-white/10 text-[15px] leading-none text-white transition-all duration-200 hover:bg-white/22';

const CONTENT = 'relative mx-auto max-w-[560px] px-[20px] pt-[24px] pb-[48px]';
const HERO = 'mb-[22px] text-center';
const HERO_ICON =
  'mx-auto mb-[14px] grid h-[68px] w-[68px] place-items-center rounded-full ' +
  'bg-[linear-gradient(135deg,#7c3aed,#4c1d95)] text-[28px] text-white shadow-[0_10px_28px_-6px_rgba(124,58,237,0.7)]';
const HERO_TITLE = 'mb-[8px] text-[21px] font-extrabold tracking-[-0.3px] text-white';
const HERO_COPY = 'mx-auto max-w-[360px] text-[13px] leading-[1.6] text-[#b8b3cc]';

const TYPES = 'mb-[22px] grid grid-cols-2 gap-[10px]';
const TYPE_CARD = 'relative rounded-[16px] border p-[14px_12px]';
const TYPE_BADGE =
  'mb-[8px] inline-block rounded-[20px] px-[9px] py-[3px] text-[9.5px] font-bold uppercase tracking-[0.5px]';
const TYPE_TITLE = 'mb-[6px] flex items-center gap-[7px] text-[14.5px] font-bold text-white';
const TYPE_COPY = 'text-[11.5px] leading-[1.55] text-[#9a94b8]';

const SECTION_TITLE = 'mb-[12px] text-[13.5px] font-bold text-white';
const REVENUE_GRID = 'mb-[22px] grid grid-cols-3 gap-[8px] max-[380px]:grid-cols-2';
const REVENUE_CARD =
  'rounded-[14px] border border-[rgba(124,58,237,0.3)] bg-[rgba(124,58,237,0.1)] px-[6px] py-[14px] text-center';
const REVENUE_PCT = 'mb-[4px] text-[20px] font-extrabold text-pose-purple-soft';
const REVENUE_LABEL = 'text-[10px] leading-[1.4] text-[#9a94b8]';

const FEATURES = 'mb-[24px] flex flex-col gap-[4px]';
const FEATURE =
  'flex items-center gap-[12px] border-b border-white/6 px-[4px] py-[10px] text-[12.5px] text-[#d8d3ec] last:border-b-0';
const FEATURE_ICON =
  'grid h-[30px] w-[30px] shrink-0 place-items-center rounded-full bg-[rgba(124,58,237,0.15)] text-[13px] text-pose-purple-soft';

const NOTIFY_BTN =
  'flex w-full cursor-pointer items-center justify-center gap-[8px] rounded-[14px] border-none ' +
  'bg-[linear-gradient(135deg,#7c3aed,#4c1d95)] px-[15px] py-[15px] text-[14px] font-bold text-white ' +
  'shadow-[0_10px_26px_-10px_rgba(124,58,237,0.6)] transition-[transform,filter] duration-200 ' +
  'hover:-translate-y-[2px] hover:brightness-[1.08] disabled:translate-y-0 disabled:cursor-default disabled:opacity-70';

const CARDS: { title: string; badge: string; icon: string; copy: string; tone: 'wave' | 'normal' }[] = [
  {
    title: 'Wave',
    badge: 'Pay to Join',
    icon: 'fa-solid fa-water',
    copy: 'Premium live rooms where viewers pay to join — an exclusive space for your biggest fans.',
    tone: 'wave',
  },
  {
    title: 'Normal Live',
    badge: 'Free to Join',
    icon: 'fa-solid fa-signal',
    copy: 'Classic free live streaming — go live anytime and grow your audience.',
    tone: 'normal',
  },
];

const TONES = {
  wave: {
    card: 'border-[rgba(251,191,36,0.35)] bg-[rgba(251,191,36,0.06)]',
    badge: 'bg-[rgba(251,191,36,0.18)] text-[#fbbf24]',
    icon: 'text-[#fbbf24]',
  },
  normal: {
    card: 'border-[rgba(124,58,237,0.35)] bg-[rgba(124,58,237,0.06)]',
    badge: 'bg-[rgba(124,58,237,0.2)] text-pose-purple-soft',
    icon: 'text-pose-purple-soft',
  },
};

const FEATURES_LIST: { icon: string; copy: string }[] = [
  { icon: 'fa-solid fa-ranking-star', copy: 'Leaderboard — climb the ranks and boost your revenue' },
  { icon: 'fa-solid fa-wifi', copy: 'Smooth, reliable streaming' },
  { icon: 'fa-solid fa-comments', copy: 'Live chat' },
  { icon: 'fa-solid fa-microphone', copy: 'Voice chat' },
  { icon: 'fa-solid fa-gamepad', copy: 'Game streaming' },
  { icon: 'fa-solid fa-store', copy: 'Online store' },
];

type Props = {
  open: boolean;
  onClose: () => void;
  uid: string | null;
};

export function LiveComingSoon({ open, onClose, uid }: Props) {
  const [optedIn, setOptedIn] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open || !uid) return;
    const { db } = getPoseFirebase();
    let cancelled = false;
    void getDoc(doc(db, 'users', uid))
      .then((snap) => {
        if (!cancelled) setOptedIn(Boolean(snap.exists() && (snap.data() as { liveNotifyOptIn?: boolean }).liveNotifyOptIn));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [open, uid]);

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

  const save = async () => {
    if (!uid || optedIn) return;
    setSaving(true);
    const { db } = getPoseFirebase();
    try {
      await setDoc(
        doc(db, 'users', uid),
        { liveNotifyOptIn: true, liveNotifyOptInAt: serverTimestamp() },
        { merge: true },
      );
      setOptedIn(true);
    } catch (error) {
      console.error('❌ live notify opt-in:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={PAGE} role="dialog" aria-modal="true" aria-label="Live">
      <div className={HEADER}>
        <button type="button" className={BACK_BTN} onClick={onClose} aria-label="Back">
          <i className="fas fa-arrow-left" />
        </button>
        <span className="text-[16px] font-bold text-white">Live</span>
      </div>

      <div className={CONTENT}>
        <div className={HERO}>
          <div className={HERO_ICON}>
            <i className="fa-solid fa-tower-broadcast" />
          </div>
          <h2 className={HERO_TITLE}>Live is Coming Soon</h2>
          <p className={HERO_COPY}>Go live, connect with your fans in real time, and earn more than anywhere else.</p>
        </div>

        <div className={TYPES}>
          {CARDS.map((card) => (
            <div key={card.title} className={cx(TYPE_CARD, TONES[card.tone].card)}>
              <div className={cx(TYPE_BADGE, TONES[card.tone].badge)}>{card.badge}</div>
              <h3 className={TYPE_TITLE}>
                <i className={cx(card.icon, TONES[card.tone].icon)} />
                {card.title}
              </h3>
              <p className={TYPE_COPY}>{card.copy}</p>
            </div>
          ))}
        </div>

        <h4 className={SECTION_TITLE}>Earn More, Keep More</h4>
        <div className={REVENUE_GRID}>
          {[
            ['60%', 'Gifts back to you'],
            ['60%', 'Ad revenue share'],
            ['75%', 'Subscription revenue'],
          ].map(([pct, label]) => (
            <div key={label} className={REVENUE_CARD}>
              <div className={REVENUE_PCT}>{pct}</div>
              <div className={REVENUE_LABEL}>{label}</div>
            </div>
          ))}
        </div>

        <h4 className={SECTION_TITLE}>What&apos;s Coming</h4>
        <div className={FEATURES}>
          {FEATURES_LIST.map((feature) => (
            <div key={feature.copy} className={FEATURE}>
              <i className={cx(FEATURE_ICON, feature.icon)} />
              <span>{feature.copy}</span>
            </div>
          ))}
        </div>

        <button type="button" className={NOTIFY_BTN} disabled={!uid || optedIn || saving} onClick={() => void save()}>
          {optedIn ? (
            <>
              <i className="fa-solid fa-check" /> You&apos;re on the list
            </>
          ) : saving ? (
            <>
              <i className="fa-solid fa-spinner fa-spin" /> Saving…
            </>
          ) : uid ? (
            <>
              <i className="fa-solid fa-bell" /> Notify Me When Live Launches
            </>
          ) : (
            <>
              <i className="fa-solid fa-bell" /> Sign in to be notified
            </>
          )}
        </button>
      </div>
    </div>
  );
}
