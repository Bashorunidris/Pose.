import { TOAST, TOAST_SHOW, cx } from './styles';

/** `showToast` @1613 — the legacy `⚠️` prefix is now a Font Awesome glyph. */
export function Toast({ message }: { message: string | null }) {
  return (
    <div className={cx(TOAST, message !== null && TOAST_SHOW)} role="status" aria-live="polite">
      <i className="fa-solid fa-triangle-exclamation mr-[7px] text-[#f59e0b]" />
      <span>{message}</span>
    </div>
  );
}
