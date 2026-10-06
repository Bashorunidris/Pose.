'use client';

import type { ToastState } from '@/lib/pose-music/use-toast';

const BORDER_BY_TYPE = {
  success: 'border-l-[3px] border-l-music-green',
  error: 'border-l-[3px] border-l-music-red',
} as const;

const ICON_COLOR_BY_TYPE = {
  success: 'text-music-green',
  error: 'text-music-red',
} as const;

export function Toast({ toast }: { toast: ToastState }) {
  if (!toast) return null;

  return (
    <div
      role="status"
      className={`fixed bottom-[104px] right-[22px] bg-music-elevated border border-music-hair-bright ${BORDER_BY_TYPE[toast.type]} text-music-ink py-[11px] px-[16px] rounded-music shadow-[0_8px_28px_rgba(0,0,0,.5)] flex items-center gap-[9px] z-[200] text-[13px] max-w-[310px] animate-toast-in`}
      style={toast.leaving ? { animation: 'toast-in .25s ease-out reverse' } : undefined}
    >
      <i
        className={`hgi hgi-stroke text-[14px] ${ICON_COLOR_BY_TYPE[toast.type]} ${
          toast.type === 'success' ? 'hgi-checkmark-circle-02' : 'hgi-cancel-01'
        }`}
      />
      <span>{toast.message}</span>
    </div>
  );
}
