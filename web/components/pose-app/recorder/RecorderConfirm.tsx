'use client';

type Props = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  confirmBusy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

/**
 * `#v2CloseConfirmModal` @73669, `#v2BackToRecordConfirmModal` @73722 and
 * `#screen4CloseConfirmModal` @73753 were the same black full-bleed `.modal`
 * page three times over. The port keeps the copy and the pink confirm, and
 * centres it the way every other sheet in the app already does.
 */
export function RecorderConfirm({
  open,
  title,
  message,
  confirmLabel,
  confirmBusy,
  onConfirm,
  onCancel,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[2147483645] flex items-center justify-center bg-black/80 p-[20px]">
      <div className="animate-app-modal-rise w-full max-w-[400px] rounded-[12px] bg-[#121212] p-[30px] text-center shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
        <h2 className="m-0 mb-[15px] text-[1.4rem] font-bold text-white">{title}</h2>
        <p className="m-0 mb-[22px] text-[0.95rem] leading-[1.5] text-[#aaa]">{message}</p>
        <div className="flex gap-[10px]">
          <button
            type="button"
            className="flex-1 rounded-[8px] border border-white/10 bg-white/10 p-[12px] text-[15px] font-bold text-white transition-all duration-200 hover:bg-white/20"
            onClick={onCancel}
          >
            Stay
          </button>
          <button
            type="button"
            className="flex-1 rounded-[8px] bg-gradient-to-r from-[#ff0050] to-[#ff4081] p-[12px] text-[15px] font-bold text-white transition-all duration-200 hover:brightness-110 disabled:opacity-60"
            disabled={confirmBusy}
            onClick={onConfirm}
          >
            {confirmBusy ? <i className="fa-solid fa-spinner fa-spin" /> : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
