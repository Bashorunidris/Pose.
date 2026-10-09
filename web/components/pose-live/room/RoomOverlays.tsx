'use client';

import { useEffect, useRef } from 'react';

import type { Gift } from '@/lib/pose-live/room';
import type { Announcement, RoomMessage } from '@/lib/pose-live/use-host-room';

/** `.ambient` @66 — the three drifting orbs behind the room. */
export function Ambient() {
  return (
    <div className="ambient" aria-hidden>
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />
    </div>
  );
}

/** `showToast` @1781. */
export function Toast({ toast }: { toast: { id: number; message: string } | null }) {
  return (
    <div
      role="status"
      className={[
        'fixed left-1/2 bottom-[110px] z-[500] -translate-x-1/2 rounded-[100px] border border-white/10',
        'bg-[rgba(20,20,35,0.95)] px-[20px] py-[10px] text-[13px] font-medium whitespace-nowrap text-white',
        'backdrop-blur-[20px] transition-opacity duration-300',
        toast ? 'translate-y-[-6px] opacity-100' : 'opacity-0',
      ].join(' ')}
    >
      {toast?.message}
    </div>
  );
}

/** `processAnnQueue` @1514 — one big-gift banner at a time. */
export function Announcements({ announcement }: { announcement: Announcement | null }) {
  return (
    <div id="announcements">
      {announcement && (
        <div className="announcement">
          <div className="ann-emoji">
            <i className="fa-solid fa-bullhorn" />
          </div>
          <div className="ann-text">{announcement.text}</div>
          <div className="ann-amount">{announcement.amount}</div>
        </div>
      )}
    </div>
  );
}

const PARTICLE_COUNT: Record<Gift['anim'], number> = { float: 8, burst: 12, rocket: 0, crown: 0 };

/**
 * `triggerGiftAnimation` @1532 / `spawnParticle` @1571.
 *
 * Legacy appended throwaway nodes to `#gift-canvas` and let CSS animations run,
 * removing each on a timer. That is one of the few places where imperative DOM
 * work is still the right call: React has nothing to reconcile, and the node
 * lifetime is the animation's.
 */
export function GiftCanvas({ signal }: { signal: { seq: number; gift: Gift } | null }) {
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const seen = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !signal || signal.seq === seen.current) return;
    seen.current = signal.seq;
    // Narrowed once here so the nested spawner does not re-widen it to nullable.
    const host = canvas;

    const { gift } = signal;
    const width = window.innerWidth;
    const height = window.innerHeight;

    function spawn(icon: string, x: number, y: number, anim: 'float' | 'burst') {
      const el = document.createElement('div');
      el.className = 'gift-particle';
      el.innerHTML = `<i class="${icon}"></i>`;
      el.style.left = `${x}px`;
      el.style.top = `${y}px`;
      const tx1 = (Math.random() - 0.5) * 100;
      const ty1 = -(Math.random() * 80 + 40);
      const tx2 = (Math.random() - 0.5) * 300;
      const ty2 = -(Math.random() * 300 + 150);
      const duration = anim === 'burst' ? 0.8 + Math.random() * 0.6 : 1.5 + Math.random() * 0.8;
      el.style.setProperty('--tx1', `${tx1}px`);
      el.style.setProperty('--ty1', `${ty1}px`);
      el.style.setProperty('--tx2', `${tx2}px`);
      el.style.setProperty('--ty2', `${ty2}px`);
      el.style.setProperty('--rot1', `${(Math.random() - 0.5) * 60}deg`);
      el.style.setProperty('--rot2', `${(Math.random() - 0.5) * 180}deg`);
      el.style.setProperty('--dur', `${duration}s`);
      el.style.animationDelay = `${Math.random() * 0.3}s`;
      host.appendChild(el);
      setTimeout(() => el.remove(), duration * 1000 + 500);
    }

    if (gift.anim === 'crown') {
      const el = document.createElement('div');
      el.className = 'crown-particle';
      el.innerHTML = `<i class="${gift.icon}"></i>`;
      el.style.left = `${width / 2}px`;
      el.style.top = `${height / 2}px`;
      host.appendChild(el);
      setTimeout(() => el.remove(), 2100);
      for (let i = 0; i < 8; i += 1) {
        spawn('fa-solid fa-star', width / 2 + (Math.random() - 0.5) * 80, height / 2 + (Math.random() - 0.5) * 80, 'float');
      }
      return;
    }

    if (gift.anim === 'rocket') {
      for (let i = 0; i < 4; i += 1) {
        const el = document.createElement('div');
        el.className = 'rocket-particle';
        el.innerHTML = `<i class="${gift.icon}"></i>`;
        el.style.left = `${Math.random() * width * 0.6 + width * 0.2}px`;
        el.style.top = `${Math.random() * height * 0.5 + height * 0.3}px`;
        el.style.animationDelay = `${i * 0.2}s`;
        host.appendChild(el);
        setTimeout(() => el.remove(), 1700 + i * 200);
      }
      for (let i = 0; i < 5; i += 1) spawn('fa-solid fa-star', Math.random() * width, Math.random() * height, 'burst');
      return;
    }

    const count = PARTICLE_COUNT[gift.anim];
    for (let i = 0; i < count; i += 1) {
      spawn(gift.icon, Math.random() * width, height * 0.7 + Math.random() * height * 0.2, gift.anim);
    }
  }, [signal]);

  return <div id="gift-canvas" ref={canvasRef} />;
}

/** `#msg-action-sheet` @812 and `closeActionSheet` @1260. */
export function ActionSheet({
  message,
  onClose,
  onPin,
  onDelete,
  onMute,
  onBan,
}: {
  message: RoomMessage | null;
  onClose: () => void;
  onPin: (message: RoomMessage) => void;
  onDelete: (message: RoomMessage) => void;
  onMute: (message: RoomMessage) => void;
  onBan: (message: RoomMessage) => void;
}) {
  return (
    <>
      <div id="sheet-overlay" className={message ? 'open' : ''} onClick={onClose} />
      <div id="msg-action-sheet" className={message ? 'open' : ''}>
        <div className="sheet-handle" />
        <div className="sheet-msg-preview">{message?.text || '(no text)'}</div>
        <div className="sheet-actions">
          <div className="sheet-action" onClick={() => message && onPin(message)}>
            <span className="sa-icon">
              <i className="fa-solid fa-thumbtack" />
            </span>
            <span className="sa-label">Pin Message</span>
          </div>
          <div className="sheet-action danger" onClick={() => message && onDelete(message)}>
            <span className="sa-icon">
              <i className="fa-solid fa-trash" />
            </span>
            <span className="sa-label">Delete Message</span>
          </div>
          <div className="sheet-action danger" onClick={() => message && onMute(message)}>
            <span className="sa-icon">
              <i className="fa-solid fa-volume-xmark" />
            </span>
            <span className="sa-label">Mute User</span>
          </div>
          <div className="sheet-action danger" onClick={() => message && onBan(message)}>
            <span className="sa-icon">
              <i className="fa-solid fa-ban" />
            </span>
            <span className="sa-label">Ban User</span>
          </div>
        </div>
      </div>
    </>
  );
}

/** `#confirm-modal` @821. */
export function ConfirmModal({
  open,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div id="confirm-modal" className={open ? 'open' : ''}>
      <div className="confirm-card">
        <div className="confirm-icon">
          <i className="fa-solid fa-circle text-[#ef4444]" />
        </div>
        <div className="confirm-title">End Stream?</div>
        <div className="confirm-desc">
          This will close the room for all viewers. Your stream stats will be saved.
        </div>
        <div className="confirm-btns">
          <button type="button" className="confirm-btn cancel" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="confirm-btn confirm" onClick={onConfirm}>
            End Now
          </button>
        </div>
      </div>
    </div>
  );
}

