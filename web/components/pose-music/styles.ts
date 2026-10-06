/**
 * Class strings shared by the Pose Music port. `--tr` in the legacy stylesheet was
 * `all .22s cubic-bezier(.4,0,.2,1)`; Tailwind's default transition timing function
 * is the same curve, so only the duration needs to be pinned.
 */
export const TR = 'transition-all duration-[220ms]';

export const BTN = `inline-flex items-center justify-center gap-[5px] cursor-pointer font-body font-semibold rounded-[40px] border-0 ${TR}`;

/** Legacy `.page-content`: 22px/28px/40px, then 14px at 900px and 12px/12px/30px at 600px. */
export const PAGE_CONTENT =
  'pt-[22px] px-[28px] pb-[40px] max-[900px]:p-[14px] max-[600px]:pt-[12px] max-[600px]:px-[12px] max-[600px]:pb-[30px]';

export const FORM_FIELD =
  'bg-music-surface border border-music-hair-bright text-music-ink py-[10px] px-[13px] rounded-music-sm text-[13.5px] font-body outline-none ' +
  `${TR} placeholder:text-music-ink-muted focus:border-music-green focus:shadow-[0_0_0_3px_rgba(29,185,84,.18)]`;

/** Legacy `.btn-submit` / `#becomeCreatorBtn`; size and offset are set per call site. */
export const SUBMIT_BTN =
  `flex items-center justify-center gap-[7px] bg-music-green text-black border-0 rounded-music text-[14.5px] font-bold cursor-pointer font-body ${TR} ` +
  'hover:bg-music-green-bright hover:-translate-y-px hover:shadow-[0_8px_22px_rgba(29,185,84,.3)]';

export const CARD = 'bg-music-card border border-music-hair rounded-music-lg p-[26px] mb-[14px]';

export const SECTION_TITLE = 'font-display text-[21px] font-bold';

export const META_TAG =
  'py-[2px] px-[7px] bg-[rgba(255,255,255,.07)] rounded-[3px] text-[10px] text-music-ink-muted font-medium';

export const SPONSORED_BADGE =
  'bg-[rgba(29,185,84,.13)] border border-[rgba(29,185,84,.28)] text-music-green py-[2px] px-[9px] rounded-[4px] text-[9.5px] font-bold tracking-[.8px] whitespace-nowrap';

export const DRAWER_BUTTON =
  `w-full inline-flex items-center gap-[11px] py-[10px] px-[12px] bg-transparent border-0 text-music-ink-soft cursor-pointer rounded-music-sm font-body text-[13px] font-medium ${TR} text-left mb-[2px] hover:bg-music-surface hover:text-music-ink`;

export const ICON_18 = 'w-[18px] shrink-0';
