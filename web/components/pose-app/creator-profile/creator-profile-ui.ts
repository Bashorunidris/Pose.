/**
 * The Tailwind spelling of every rule the For You profile page owns. Each
 * constant names the legacy selector it came from so a reviewer can diff the
 * two; the `@NNNN` line numbers point at `index.html`.
 */

/** `.foryou-profile-page` @6265 + `.active` @6280. */
export const PAGE = 'fixed inset-0 z-[1500] overflow-y-auto bg-[#09090b] pb-[80px]';

/**
 * `.profile-header` @7123. The gradient itself is per-creator and comes from
 * `headerGradient(uid)` (`applyForYouHeaderColor()` @45995), so it is applied as
 * an inline style rather than a class.
 */
export const HEADER =
  'fixed inset-x-0 top-0 z-[1001] flex h-[60px] items-center justify-between px-[15px] ' +
  'shadow-[0_4px_20px_rgba(0,0,0,0.3)] transition-all duration-[300ms]';

/** `.profile-back-btn` @7138 + `:hover` @7155. */
export const BACK_BTN =
  'flex h-[36px] w-[36px] cursor-pointer items-center justify-center rounded-full border-none bg-white/20 ' +
  'text-white backdrop-blur-[5px] transition-all duration-[300ms] hover:scale-[1.08] hover:bg-white/30';

/** `.profile-info-section` @7182. */
export const INFO_SECTION = 'flex flex-col gap-[20px] bg-[#09090b] px-[20px] pb-[20px] pt-[80px]';

/** `.profile-top-row` @7196. */
export const TOP_ROW = 'flex w-full items-center gap-[20px]';

/** `.avatar-squircle` @7208 — the gradient ring is what `profileRingGlow` breathes on. */
export const AVATAR_SQUIRCLE =
  'flex h-[100px] w-[100px] shrink-0 animate-app-profile-ring items-center justify-center rounded-[32px] p-[3px]';

/**
 * `.profile-pic-large` @7231. The legacy element is filled by
 * `background-image` (see `_fypPopulateUI()` @66553) and only paints its letter
 * when there is no picture, which is what `bg-cover` + a text node reproduce.
 */
export const AVATAR_IMAGE =
  'flex h-full w-full items-center justify-center rounded-[29px] border-[3px] border-[#09090b] ' +
  'bg-[#222] bg-cover bg-center text-[2rem] font-extrabold text-white';

/** `.verification-badge` @7242. */
export const VERIFIED_BADGE =
  'absolute -bottom-[7px] -right-[7px] z-[10] flex h-[32px] w-[32px] items-center justify-center ' +
  'rounded-full border-[2.5px] border-[#09090b] text-[1.1rem] font-black text-[#e9d5ff] ' +
  'shadow-[0_2px_10px_rgba(59,7,100,0.85)] [text-shadow:0_1px_3px_rgba(0,0,0,0.5)]';

/** `.profile-details` @7272. */
export const DETAILS = 'flex min-w-0 flex-1 flex-col gap-[4px]';

/** `.profile-name` @7280. */
export const NAME = 'text-[1.5rem] font-extrabold tracking-[-1px] text-white';

/** `.profile-username` @7289. */
export const USERNAME = 'text-[0.95rem] font-bold text-[#a855f7]';

/** `.profile-bio-container` @7297. */
export const BIO_WRAP = 'relative mt-[5px]';

/** `.profile-bio` @7302. */
export const BIO = 'line-clamp-2 text-[0.9rem] leading-[1.4] text-[#a1a1aa]';

/** `.see-more-btn` @7321 — `display:none` until the bio measures past two lines. */
export const SEE_MORE =
  'mt-[2px] cursor-pointer border-none bg-transparent p-0 text-[0.8rem] font-bold text-[#a855f7]';

/** `.profile-links` @7263 — always laid out horizontally. */
export const LINKS = 'mt-[6px] flex flex-row flex-wrap items-center gap-[8px]';

/** `renderProfileLinks()` @28190 — the chip, its `:hover` @28222 folded in. */
export const LINK_CHIP =
  'flex w-fit items-center gap-[6px] whitespace-nowrap rounded-[20px] border border-[rgba(138,43,226,0.3)] ' +
  'bg-[rgba(138,43,226,0.15)] px-[12px] py-[6px] text-[12px] text-[#bb86fc] no-underline ' +
  'transition-all duration-200 hover:-translate-y-px hover:bg-[rgba(138,43,226,0.25)]';

/** The `+N More` button the same function appends past the third link. */
export const LINK_MORE =
  'flex w-fit cursor-pointer items-center whitespace-nowrap rounded-[20px] border border-white/20 ' +
  'bg-white/10 px-[12px] py-[6px] text-[12px] text-[#ccc] transition-all duration-200 hover:bg-white/20';

/** `.profile-stats` @7403. */
export const STATS =
  'grid w-full grid-cols-4 rounded-[18px] border border-white/[0.08] px-[5px] py-[15px] backdrop-blur-[10px] ' +
  'bg-[rgba(24,24,27,0.7)]';

/** `.stat` @7415 + `.stat:last-child` @7424. */
export const STAT = 'flex flex-col items-center gap-[2px] border-r border-white/[0.08] text-center';

/** `.stat-value` @7426. */
export const STAT_VALUE = 'text-[1.1rem] font-extrabold text-white';

/** `.stat-label` @7433. */
export const STAT_LABEL = 'text-[0.65rem] font-bold tracking-[0.5px] text-[#a1a1aa] uppercase';

/**
 * The action row is the only part of the page written as inline styles in the
 * legacy markup @90383: `padding:10px 20px; display:flex; gap:8px;
 * justify-content:center; align-items:stretch; flex-wrap:nowrap`.
 */
export const ACTIONS = 'flex flex-nowrap items-stretch justify-center gap-[8px] px-[20px] py-[10px]';

/** `.btn-follow-main` @7498 — `updateFollowButton()` @68733 swaps the gradient. */
export const BTN_FOLLOW =
  'flex h-[48px] flex-1 cursor-pointer items-center justify-center gap-[10px] rounded-[14px] border-none ' +
  'text-[0.95rem] font-extrabold text-white';

/** `.btn-channel` @7480 as narrowed by the inline overrides at @90388. */
export const BTN_CHANNEL =
  'flex h-[44px] cursor-pointer items-center justify-center gap-[10px] rounded-[14px] px-[16px] ' +
  'text-[13px] font-extrabold text-white';

/** `.btn-icon-square` @7514. */
export const BTN_ICON_SQUARE =
  'flex h-[48px] w-[48px] shrink-0 cursor-pointer items-center justify-center rounded-[14px] border ' +
  'border-white/[0.08] bg-[rgba(24,24,27,0.7)] text-[1.1rem] text-white';

/** `.profile-tabs` @7442. */
export const TABS =
  'sticky top-[60px] z-[100] flex justify-around border-b border-white/[0.08] bg-[#09090b]';

/** `.profile-tab` @7453 + `.active` @7465. */
export const TAB = 'relative flex-1 cursor-pointer py-[15px] text-center text-[14px] text-[#a1a1aa]';

export const TAB_ACTIVE = 'text-white';

/** `.profile-tab.active::after` @7469. */
export const TAB_UNDERLINE = 'absolute bottom-0 left-1/4 h-[3px] w-1/2 rounded-[3px]';

/** The empty-state line the loaders drop in, e.g. `No buzzes yet` @37010. */
export const EMPTY = 'px-[20px] py-[20px] text-[#aaa]';

/** `showTabError()`'s message styling, used by the failed-tab state. */
export const TAB_ERROR =
  'flex flex-col items-center gap-[10px] px-[20px] py-[30px] text-center text-[13px] text-[#aaa]';

export const RETRY_BTN =
  'cursor-pointer rounded-[8px] bg-[#a855f7] px-[16px] py-[7px] text-[12px] font-bold text-white';

/* ── Grid tiles ─────────────────────────────────────────────── */

/** `.feed-grid` @7564 / `.video-grid` @7589 merge. */
export const GRID = 'grid w-full grid-cols-3 gap-[2px] p-[2px]';

/**
 * `.stories-grid` @7580 plus its wide-screen override @8294. The narrow
 * breakpoints collapse to two columns.
 */
export const STORIES_GRID =
  'grid w-full grid-cols-2 gap-[3px] p-[4px] ' +
  'sm:gap-[4px] sm:p-[8px] md:grid-cols-3 md:gap-[6px] md:p-[12px] lg:grid-cols-4 lg:gap-[8px] lg:p-[16px]';

/** `.feed-item, .profile-post-item` @7598. */
export const TILE =
  'relative min-w-0 cursor-pointer overflow-hidden rounded-[4px] bg-black aspect-[9/16]';

/** `.feed-item .grid-video, .feed-item .grid-photo, .feed-item img` @7620. */
export const TILE_MEDIA = 'block h-full w-full bg-black object-cover';

/** `.feed-item .feed-stats, .feed-item .feed-stats-overlay` @7630. */
export const TILE_STATS =
  'pointer-events-none absolute inset-x-0 bottom-0 z-[5] flex flex-col gap-[4px] px-[10px] pb-[8px] pt-[12px] ' +
  'bg-[linear-gradient(to_top,rgba(0,0,0,0.9)_0%,rgba(0,0,0,0.4)_60%,transparent_100%)] [&>*]:pointer-events-auto';

export const TILE_CAPTION = 'truncate text-[11px] text-[#ddd]';

export const TILE_COUNTS = 'flex items-center gap-[16px] text-[12px] text-white';

export const TILE_COUNT = 'flex items-center gap-[4px]';

/** `createFeedVideoItem()` @37341 — the pin button. */
export const PIN_BTN =
  'absolute right-[8px] top-[8px] z-[10] flex h-[32px] w-[32px] cursor-pointer items-center justify-center ' +
  'rounded-full border-none bg-black/60 text-[13px] text-white backdrop-blur-[4px] transition-all duration-[300ms]';

export const PLAY_OVERLAY =
  'absolute inset-0 flex cursor-pointer items-center justify-center bg-black/20 transition-all duration-[300ms]';

export const PLAY_ICON =
  'flex h-[60px] w-[60px] items-center justify-center rounded-full bg-black/50 text-[24px] text-white ' +
  '[text-shadow:0_3px_10px_rgba(0,0,0,0.8)]';

/* ── About (bio + links) sheet ──────────────────────────────── */

/** `.profile-details-modal-overlay` @7332 + `.active` @7342. */
export const ABOUT_OVERLAY =
  'fixed inset-0 z-[100000] flex items-end justify-center bg-black/70 backdrop-blur-[6px]';

/** `.profile-details-modal` @7344 — `slideUpProfileDetails` @7354 is `app-slide-up`. */
export const ABOUT_SHEET =
  'max-h-[75vh] w-full max-w-[480px] animate-app-slide-up overflow-y-auto rounded-t-[24px] ' +
  'border border-white/[0.08] bg-[#18181b] p-[20px]';

/** `.profile-details-modal-header` @7359 + its `h3` @7364. */
export const ABOUT_HEADER = 'mb-[14px] flex items-center justify-between';
export const ABOUT_TITLE = 'text-[1.05rem] text-white';

/** `.profile-details-close` @7369. */
export const ABOUT_CLOSE =
  'flex h-[32px] w-[32px] cursor-pointer items-center justify-center rounded-full border-none ' +
  'bg-white/[0.08] text-[14px] text-white';

/** `.profile-details-bio` @7380. */
export const ABOUT_BIO = 'mb-[16px] text-[0.95rem] leading-[1.6] break-words whitespace-pre-wrap text-[#d4d4d8]';

/** `.profile-details-links-title` @7390. */
export const ABOUT_LINKS_TITLE =
  'mb-[10px] text-[0.75rem] font-bold tracking-[0.5px] text-[#a1a1aa] uppercase';

/** `.profile-details-links` @7396. */
export const ABOUT_LINKS = 'flex flex-row flex-wrap gap-[8px]';

/* ── Loading skeleton ──────────────────────────────────────── */

/** `_fypApplySkeleton()` @66526 — the inline shimmer spans for name/username. */
export const SKEL_TEXT =
  'inline-block h-[14px] w-[120px] animate-app-profile-skel rounded-[6px] ' +
  'bg-[linear-gradient(90deg,#2a2a2a_25%,#3a3a3a_50%,#2a2a2a_75%)] bg-[size:200%_100%]';
