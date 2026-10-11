'use client';

export type PublishState =
  | { kind: 'idle' }
  | { kind: 'working'; label: string; percent: number }
  | { kind: 'done'; label: string }
  | { kind: 'error'; label: string };

type Props = {
  state: PublishState;
  onDismiss: () => void;
};

function badgeClass(kind: PublishState['kind']): string {
  const base = 'mx-auto mb-[16px] grid h-[52px] w-[52px] place-items-center rounded-full';
  if (kind === 'error') return `${base} bg-[#ff0050]/20 text-[#ff5c7a]`;
  if (kind === 'done') return `${base} bg-[#4caf50]/25 text-[#7ee08a]`;
  return `${base} bg-white/10 text-white`;
}

/**
 * `showUploadResultModal()` @28966 and the ring it drove. The port keeps the
 * stage label and a real percentage, and drops the minimised-pill variant — a
 * post either lands or it does not, and the sheet has nothing to go back to
 * while it does.
 */
export function PublishOverlay({ state, onDismiss }: Props) {
  if (state.kind === 'idle') return null;
  const working = state.kind === 'working';

  return (
    <div className="fixed inset-0 z-[2147483646] flex items-center justify-center bg-black/85 p-[24px]">
      <div className="animate-app-modal-rise w-full max-w-[360px] rounded-[14px] bg-[#121212] p-[28px] text-center">
        <div className={badgeClass(state.kind)} aria-hidden>
          {working ? (
            <i className="fa-solid fa-spinner fa-spin text-[26px]" />
          ) : (
            <i className={`fas ${state.kind === 'error' ? 'fa-times' : 'fa-check'} text-[24px]`} />
          )}
        </div>

        <div className="mb-[16px] text-[14px] font-semibold text-white">{state.label}</div>

        {working ? (
          <div className="h-[6px] w-full overflow-hidden rounded-[3px] bg-white/15">
            <div
              className="h-full rounded-[3px] bg-gradient-to-r from-[#8A2BE2] to-[#FF0050] transition-[width] duration-200"
              style={{ width: `${Math.round(state.percent * 100)}%` }}
            />
          </div>
        ) : (
          <button
            type="button"
            className="mt-[4px] w-full rounded-[10px] border border-white/15 bg-white/10 p-[12px] text-[14px] font-bold text-white"
            onClick={onDismiss}
          >
            {state.kind === 'error' ? 'Close' : 'Done'}
          </button>
        )}
      </div>
    </div>
  );
}
