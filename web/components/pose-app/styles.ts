/**
 * Shared class strings for the ported app shell. Each constant is the Tailwind
 * spelling of one rule from legacy `index.html`; the `/* @NNNN *\/` comments point
 * back at the source line so a reviewer can diff the two.
 */

export const TRANSITION = 'transition-all duration-[200ms] ease-[cubic-bezier(.4,0,.2,1)]';

/**
 * `.navbar` @8855, `@media (max-width:768px)` @9067, `@media (max-width:480px)`
 * @9093 and the desktop phone-shell override @8533. In shell mode the bar is
 * fixed over the centered 420px column instead of sticky above the page.
 */
export const NAVBAR =
  'sticky top-0 z-[1000] flex items-center justify-between px-[20px] py-[15px] ' +
  'max-md:px-[10px] max-md:py-[12px] max-md:justify-center ' +
  'max-sm:px-[8px] max-sm:py-[10px] ' +
  'md:fixed md:top-0 md:left-1/2 md:right-auto md:z-[1100] md:w-[420px] md:max-w-full md:-translate-x-1/2 md:bg-transparent';

/** `.profile-icon` @8865 + `:hover` @8884. */
export const PROFILE_ICON =
  'relative shrink-0 box-border cursor-pointer flex items-center justify-center rounded-full p-[8px] ' +
  'w-[clamp(38px,10vw,48px)] h-[clamp(38px,10vw,48px)] text-[clamp(20px,5.5vw,26px)] ' +
  'border-2 border-pose-purple-mid bg-pose-purple-deep/80 ' +
  'transition-all duration-300 ease-[cubic-bezier(.4,0,.2,1)] hover:bg-pose-purple-deep hover:scale-110';

/** The same chip with the `:hover` @8884 and pointer behaviour removed. */
export const TABS =
  'flex flex-1 justify-center gap-[12px] mx-[15px] text-[16px] font-semibold relative z-[1001] overflow-visible ' +
  'max-md:mx-auto max-md:gap-[14px] max-md:text-[15px] ' +
  'max-sm:gap-[12px] max-sm:text-[14px]';

/** `.tabs span` @8909 + `:hover` @8920. */
export const TAB =
  'cursor-pointer relative whitespace-nowrap text-white text-[15px] font-semibold p-[5px] ' +
  'transition-all duration-300 ease-out hover:opacity-80 ' +
  'max-md:px-[4px] max-md:py-[6px] max-md:text-[15px] ' +
  'max-sm:px-[3px] max-sm:py-[5px] max-sm:text-[14px]';

/** `.tabs .active::after` @8924 — the underline sits outside the 5px padding. */
export const TAB_ACTIVE =
  'after:content-[""] after:absolute after:-bottom-[5px] after:left-0 after:right-0 after:mx-auto ' +
  'after:h-[2px] after:w-[60%] after:bg-white';

/** `.search-icon` @10770 as pinned by `#searchIconBtn` @10789. */
export const SEARCH_ICON =
  'absolute right-[20px] top-1/2 -translate-y-1/2 z-[1100] box-border cursor-pointer flex items-center justify-center ' +
  'rounded-full bg-white p-[8px] text-black ' +
  'w-[clamp(38px,10vw,48px)] h-[clamp(38px,10vw,48px)] text-[clamp(18px,4.5vw,22px)] select-none';

/**
 * `.bottom-nav` @13515 plus the phone-shell override @8540. Safe-area padding is
 * added on top: the legacy bar is a fixed 68px with no `env()` inset, so its
 * labels sit under the home indicator on notched phones.
 */
export const BOTTOM_NAV =
  'fixed bottom-0 left-0 right-0 z-[1000] flex h-[68px] items-center justify-around border-t border-app-hair bg-app-black ' +
  'pt-[calc(8px+env(safe-area-inset-bottom))] pb-[calc(8px+env(safe-area-inset-bottom))] text-[12px] text-white ' +
  'touch-manipulation ' +
  'md:bottom-0 md:left-1/2 md:right-auto md:w-[420px] md:max-w-full md:-translate-x-1/2';

/**
 * `.nav-btn` @13533 merged with the higher-specificity `.bottom-nav div` @13632
 * and `.bottom-nav div:hover` / `:active` @13645/@13650, which override the
 * purple hover with the white one.
 */
export const NAV_BUTTON =
  'flex flex-1 flex-col items-center justify-center gap-0 h-full box-border cursor-pointer select-none rounded-[12px] ' +
  'p-[10px] px-[12px] text-app-muted font-medium z-[1] relative ' +
  'transition-all duration-200 ease-out [&>*]:pointer-events-none ' +
  'hover:bg-white/10 hover:scale-[1.05] active:scale-[0.95]';

export const NAV_BUTTON_ACTIVE = 'text-app-interact bg-app-interact/15 [text-shadow:none]';

/** `.nav-btn i` @13579 merged with `.bottom-nav i` @13654 (later rule wins). */
export const NAV_BUTTON_ICON = 'flex items-end justify-center text-[24px] leading-none';

/** `.bottom-nav span` @13662. */
export const NAV_BUTTON_LABEL = 'mt-[1px] text-[11px] leading-none';

/** `.nav-btn-create i` @13603 — the Create button carries a gradient chip. */
export const NAV_BUTTON_CREATE_ICON =
  'grid h-[28px] w-[40px] place-items-center rounded-[10px] bg-gradient-to-br from-app-interact to-pose-purple-mid ' +
  'text-[17px] text-white shadow-[0_2px_10px_rgba(138,43,226,0.45)] transition-[transform,box-shadow] duration-[120ms] ease-out ' +
  'group-hover:shadow-[0_4px_14px_rgba(138,43,226,0.6)] group-active:scale-[0.92]';

/** `.nav-btn-create span` @13627. */
export const NAV_BUTTON_CREATE_LABEL = 'text-[#c9b3f0]';

/** `.pose-notif-badge-dot` @1641. */
export const NOTIF_BADGE =
  'absolute right-[2px] top-[2px] z-[5] flex h-[16px] min-w-[16px] items-center justify-center rounded-[8px] ' +
  'border-2 border-[#0f0f12] bg-pose-accent px-[4px] text-[10px] font-bold leading-none text-white ' +
  'shadow-[0_0_6px_rgba(255,0,80,0.6)]';

/**
 * Feed scrollers. `.tab-content` @14108/@14121/@14170 (fixed full-bleed, smooth,
 * hidden scrollbar) with the phone-shell geometry from @8462/@8600.
 */
export const TAB_CONTENT =
  'fixed inset-0 z-[100] overflow-x-hidden overflow-y-scroll scroll-smooth text-white bg-app-panel [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ' +
  'md:inset-auto md:top-0 md:bottom-0 md:left-1/2 md:h-[100dvh] md:max-h-[100dvh] md:w-[420px] md:max-w-full md:-translate-x-1/2';

/** `.buzz-feed-page` @13810/@14136 plus the `#friendTab` override @14175. */
export const BUZZ_PAGE =
  'min-h-[100vh] overflow-y-auto bg-app-black pt-[80px] pb-[100px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden';

export const POSE_PAGE =
  'min-h-[100vh] overflow-y-auto bg-app-black pt-[80px] pb-[100px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden';

/** `.video-feed` @14144 (the later declaration overrides `height:100%` @8424). */
export const VIDEO_FEED =
  'h-[100vh] w-full overflow-y-scroll snap-y snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ' +
  'md:h-full';

export function cx(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}
