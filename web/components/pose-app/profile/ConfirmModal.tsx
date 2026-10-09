'use client';

import type { ReactNode } from 'react';

import { CONFIRM_DANGER, CONFIRM_PRIMARY, CONFIRM_SECONDARY } from './settings-ui';

type Props = {
  variant: 'warning' | 'danger';
  title: string;
  message: ReactNode;
  confirmLabel: string;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

/**
 * `#deactivateConfirmModal` / `#deleteConfirmModal` and `closeConfirmModal()`
 * @45449 — one dialog, two colourways, and the action stack is a column.
 */
export function ConfirmModal({
  variant,
  title,
  message,
  confirmLabel,
  busy,
  onConfirm,
  onCancel,
}: Props) {
  return (
    <div className="fixed inset-0 z-[2100] flex items-center justify-center bg-black/80 p-[20px]">
      <div className="w-full max-w-[400px] rounded-[12px] bg-[#121212] p-[30px] shadow-[0_10px_40px_rgba(0,0,0,0.5)] animate-app-modal-rise">
        <div
          className={`mb-[20px] flex justify-center text-[3rem] ${
            variant === 'warning' ? 'text-[#ff9800]' : 'text-[#f44336]'
          }`}
        >
          <i className={variant === 'warning' ? 'fas fa-exclamation-triangle' : 'fas fa-trash-alt'} />
        </div>
        <h2 className="m-0 mb-[15px] text-center text-[1.5rem] text-white">{title}</h2>
        <div className="m-0 mb-[20px] text-center text-[0.95rem] leading-[1.5] text-[#ccc]">{message}</div>
        <div className="flex flex-col gap-[10px]">
          <button
            type="button"
            className={variant === 'warning' ? CONFIRM_PRIMARY : CONFIRM_DANGER}
            disabled={busy}
            onClick={onConfirm}
          >
            {busy ? <i className="fa-solid fa-spinner fa-spin" /> : confirmLabel}
          </button>
          <button type="button" className={CONFIRM_SECONDARY} onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
