import { cx } from '@/components/pose-app/styles';
import type { LiveMode } from '@/lib/pose-live/types';

/** Re-exported so every pose-live component imports its class helpers from here. */
export { cx };

/**
 * Class strings for the Pose Live port (legacy `poselivevisual.html`).
 *
 * Legacy repainted a dozen shared surfaces per broadcast mode with
 * `[data-mode="video"] .card-feat-bg { … }` descendant selectors. A Tailwind port
 * cannot lean on that trick, because two same-property utilities of equal
 * specificity resolve by generated-stylesheet order rather than by the order they
 * appear in `class=""`. Every mode-dependent property therefore lives in this
 * lookup table and is applied exclusively, never composed onto a conflicting base.
 */

export const TR_BOUNCE = 'transition-all duration-[220ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]';

export type ModeStyle = {
  /** Three-stop surface behind the featured card and the panel hero @273. */
  cardBg: string;
  /** Two-stop surface behind the small, tall and wide cards @358. */
  cardBgShort: string;
  /** Hard blurred accent blob @281 and its softer second layer @564. */
  blob: string;
  blobSoft: string;
  /** Accent text colour used by badges, stats and active labels. */
  accent: string;
  /** `.section-badge` @249. */
  badge: string;
  /** `.chip.active` @221. */
  chipActive: string;
  /** `.tab-btn.active-*` @517 and its `.t-label` @521 plus `.tab-glow` @526. */
  tabActive: string;
  tabLabel: string;
  tabGlow: string;
  /** `.live-pill` @487 / the setup pill `modeColors[].pill` @1999. */
  pill: string;
  /** `.hero-tag` @577 — a heavier wash than `.section-badge` @249. */
  heroTag: string;
  /** `.streamer-av` @336 and `.av-ring` @410. */
  avatarBg: string;
  /** `.setting-icon` @603 and `.setup-field-icon` @869. */
  iconBg: string;
  /** `.toggle:checked` @614. */
  toggleOn: string;
  /** `.go-live-btn.*-btn` @658. */
  cta: string;
  /** `.timer-chip.selected-*` @963. */
  timerOn: string;
};

export const MODE_STYLE: Record<LiveMode, ModeStyle> = {
  video: {
    cardBg: 'bg-[linear-gradient(135deg,#1a0a2e_0%,#2d0a4e_50%,#120820_100%)]',
    cardBgShort: 'bg-[linear-gradient(135deg,#1a0a2e,#2d0a4e)]',
    blob: 'bg-[rgba(124,58,237,0.55)]',
    blobSoft: 'bg-[rgba(192,132,252,0.3)]',
    accent: 'text-[#c084fc]',
    badge: 'bg-[rgba(124,58,237,0.2)] border-[rgba(124,58,237,0.4)] text-[#c084fc]',
    chipActive: 'bg-[rgba(124,58,237,0.25)] border-[rgba(124,58,237,0.5)]',
    tabActive: 'bg-[rgba(124,58,237,0.22)] border-[rgba(124,58,237,0.38)]',
    tabLabel: 'text-[#c084fc]',
    tabGlow: 'bg-[radial-gradient(circle_at_50%_50%,rgba(124,58,237,0.3),transparent_70%)]',
    pill: 'bg-[rgba(124,58,237,0.18)] border-[rgba(124,58,237,0.38)] text-[#c084fc]',
    heroTag: 'bg-[rgba(124,58,237,0.3)] border-[rgba(124,58,237,0.5)] text-[#c084fc]',
    avatarBg: 'bg-[linear-gradient(135deg,#5b21b6,#7c3aed)]',
    iconBg: 'bg-[rgba(124,58,237,0.2)] border-[rgba(124,58,237,0.3)]',
    toggleOn: 'checked:bg-[#7c3aed] checked:border-[#7c3aed]',
    cta: 'bg-[linear-gradient(135deg,#5b21b6,#7c3aed,#9d5cf6)] shadow-[0_12px_40px_rgba(124,58,237,0.5)]',
    timerOn: 'bg-[rgba(124,58,237,0.2)] border-[rgba(124,58,237,0.5)] text-[#c084fc]',
  },
  voice: {
    cardBg: 'bg-[linear-gradient(135deg,#1a0818_0%,#3a0a2a_50%,#110610_100%)]',
    cardBgShort: 'bg-[linear-gradient(135deg,#1a0818,#3a0a2a)]',
    blob: 'bg-[rgba(236,72,153,0.55)]',
    blobSoft: 'bg-[rgba(244,114,182,0.3)]',
    accent: 'text-[#f9a8d4]',
    badge: 'bg-[rgba(236,72,153,0.2)] border-[rgba(236,72,153,0.4)] text-[#f9a8d4]',
    chipActive: 'bg-[rgba(236,72,153,0.25)] border-[rgba(236,72,153,0.5)]',
    tabActive: 'bg-[rgba(236,72,153,0.22)] border-[rgba(236,72,153,0.38)]',
    tabLabel: 'text-[#f9a8d4]',
    tabGlow: 'bg-[radial-gradient(circle_at_50%_50%,rgba(236,72,153,0.3),transparent_70%)]',
    pill: 'bg-[rgba(236,72,153,0.18)] border-[rgba(236,72,153,0.38)] text-[#f9a8d4]',
    heroTag: 'bg-[rgba(236,72,153,0.3)] border-[rgba(236,72,153,0.5)] text-[#f9a8d4]',
    avatarBg: 'bg-[linear-gradient(135deg,#9d174d,#ec4899)]',
    iconBg: 'bg-[rgba(236,72,153,0.2)] border-[rgba(236,72,153,0.3)]',
    toggleOn: 'checked:bg-[#ec4899] checked:border-[#ec4899]',
    cta: 'bg-[linear-gradient(135deg,#9d174d,#ec4899,#f472b6)] shadow-[0_12px_40px_rgba(236,72,153,0.5)]',
    timerOn: 'bg-[rgba(236,72,153,0.2)] border-[rgba(236,72,153,0.5)] text-[#f9a8d4]',
  },
  chat: {
    cardBg: 'bg-[linear-gradient(135deg,#060f1e_0%,#0a1a3a_50%,#060a14_100%)]',
    cardBgShort: 'bg-[linear-gradient(135deg,#060f1e,#0a1a3a)]',
    blob: 'bg-[rgba(59,130,246,0.55)]',
    blobSoft: 'bg-[rgba(96,165,250,0.3)]',
    accent: 'text-[#93c5fd]',
    badge: 'bg-[rgba(59,130,246,0.2)] border-[rgba(59,130,246,0.4)] text-[#93c5fd]',
    chipActive: 'bg-[rgba(59,130,246,0.25)] border-[rgba(59,130,246,0.5)]',
    tabActive: 'bg-[rgba(59,130,246,0.22)] border-[rgba(59,130,246,0.38)]',
    tabLabel: 'text-[#93c5fd]',
    tabGlow: 'bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.3),transparent_70%)]',
    pill: 'bg-[rgba(59,130,246,0.18)] border-[rgba(59,130,246,0.38)] text-[#93c5fd]',
    heroTag: 'bg-[rgba(59,130,246,0.3)] border-[rgba(59,130,246,0.5)] text-[#93c5fd]',
    avatarBg: 'bg-[linear-gradient(135deg,#1d4ed8,#3b82f6)]',
    iconBg: 'bg-[rgba(59,130,246,0.2)] border-[rgba(59,130,246,0.3)]',
    toggleOn: 'checked:bg-[#3b82f6] checked:border-[#3b82f6]',
    cta: 'bg-[linear-gradient(135deg,#1d4ed8,#3b82f6,#60a5fa)] shadow-[0_12px_40px_rgba(59,130,246,0.5)]',
    timerOn: 'bg-[rgba(59,130,246,0.2)] border-[rgba(59,130,246,0.5)] text-[#93c5fd]',
  },
  gaming: {
    cardBg: 'bg-[linear-gradient(135deg,#05130f_0%,#082318_50%,#050d0a_100%)]',
    cardBgShort: 'bg-[linear-gradient(135deg,#05130f,#082318)]',
    blob: 'bg-[rgba(16,185,129,0.55)]',
    blobSoft: 'bg-[rgba(52,211,153,0.3)]',
    accent: 'text-[#6ee7b7]',
    badge: 'bg-[rgba(16,185,129,0.2)] border-[rgba(16,185,129,0.4)] text-[#6ee7b7]',
    chipActive: 'bg-[rgba(16,185,129,0.25)] border-[rgba(16,185,129,0.5)]',
    tabActive: 'bg-[rgba(16,185,129,0.22)] border-[rgba(16,185,129,0.38)]',
    tabLabel: 'text-[#6ee7b7]',
    tabGlow: 'bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.3),transparent_70%)]',
    pill: 'bg-[rgba(16,185,129,0.18)] border-[rgba(16,185,129,0.38)] text-[#6ee7b7]',
    heroTag: 'bg-[rgba(16,185,129,0.3)] border-[rgba(16,185,129,0.5)] text-[#6ee7b7]',
    avatarBg: 'bg-[linear-gradient(135deg,#065f46,#10b981)]',
    iconBg: 'bg-[rgba(16,185,129,0.2)] border-[rgba(16,185,129,0.3)]',
    toggleOn: 'checked:bg-[#10b981] checked:border-[#10b981]',
    cta: 'bg-[linear-gradient(135deg,#065f46,#10b981,#34d399)] shadow-[0_12px_40px_rgba(16,185,129,0.5)]',
    timerOn: 'bg-[rgba(16,185,129,0.2)] border-[rgba(16,185,129,0.5)] text-[#6ee7b7]',
  },
};

/** `MODE_META` @1719 — the emoji it carried is now a Font Awesome glyph. */
export const MODE_ICON: Record<LiveMode, string> = {
  video: 'fas fa-video',
  voice: 'fas fa-microphone-lines',
  chat: 'fas fa-comment-dots',
  gaming: 'fas fa-gamepad',
};

export const MODE_LABEL: Record<LiveMode, string> = {
  video: 'Video Stream',
  voice: 'Voice Stream',
  chat: 'Live Chat',
  gaming: 'Game Stream',
};

/** `tabMeta` @1640. */
export const TAB_META: Record<LiveMode, { label: string; sub: string }> = {
  video: { label: 'Stream', sub: 'Camera & HD video broadcast' },
  voice: { label: 'Voice', sub: 'Audio-only podcast broadcast' },
  chat: { label: 'Chat', sub: 'Real-time interactive chat' },
  gaming: { label: 'Gaming', sub: 'Screen share & commentary' },
};

/** Root @55 and `#root` @62 — a fixed viewport the three pages slide over. */
export const ROOT = 'fixed inset-0 overflow-hidden bg-live-ink font-live text-white';

/** `.ambient` @69 and the three drifting orbs @70. */
export const AMBIENT = 'pointer-events-none absolute inset-0 z-0 overflow-hidden';
export const ORB = 'absolute rounded-full blur-[90px] animate-live-drift';
export const ORB_1 =
  'h-[320px] w-[320px] bg-[radial-gradient(circle,rgba(124,58,237,0.28),transparent_70%)] -top-[100px] -left-[80px]';
export const ORB_2 =
  'h-[260px] w-[260px] bg-[radial-gradient(circle,rgba(236,72,153,0.15),transparent_70%)] top-[40px] -right-[90px] -animation-delay-[4s] [animation-delay:-4s]';
export const ORB_3 =
  'h-[220px] w-[220px] bg-[radial-gradient(circle,rgba(124,58,237,0.12),transparent_70%)] bottom-[180px] left-[40%] [animation-delay:-7s]';

/** `.grid-tex` @79. */
export const GRID_TEX =
  'pointer-events-none absolute inset-0 z-0 ' +
  'bg-[linear-gradient(rgba(124,58,237,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(124,58,237,0.04)_1px,transparent_1px)] ' +
  'bg-[size:36px_36px] [mask-image:radial-gradient(ellipse_at_top,black_0%,transparent_65%)]';

/** `.page` @87 with its three visibility states @95. */
export const PAGE =
  'absolute inset-0 flex flex-col [backface-visibility:hidden] will-change-[transform,opacity] ' +
  'transition-[transform,opacity] duration-[380ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)]';
export const PAGE_VISIBLE = 'translate-x-0 scale-100 opacity-100 pointer-events-auto z-[1]';
export const PAGE_HIDDEN_RIGHT = 'translate-x-full scale-[0.96] opacity-0 pointer-events-none z-[1]';
export const PAGE_HIDDEN_LEFT = '-translate-x-[30%] scale-[0.97] opacity-0 pointer-events-none z-[1]';

/** `#loader` @111. */
export const LOADER =
  'absolute inset-0 z-[500] flex flex-col items-center justify-center gap-[14px] bg-live-ink transition-opacity duration-[400ms]';
export const LOADER_GONE = 'opacity-0 pointer-events-none';
export const LOADER_ICON = 'text-[44px] animate-live-loader-pop';
export const LOADER_BAR = 'h-[3px] w-[100px] overflow-hidden rounded-[100px] bg-[rgba(255,255,255,0.08)]';
export const LOADER_FILL =
  'h-full w-0 rounded-[100px] bg-[linear-gradient(90deg,#7c3aed,#c084fc)] animate-live-loader-bar';

/** `#toast` @126. */
export const TOAST =
  'pointer-events-none fixed bottom-[110px] left-1/2 z-[600] -translate-x-1/2 whitespace-nowrap ' +
  'rounded-[100px] border border-[rgba(255,255,255,0.1)] bg-[rgba(20,20,35,0.95)] px-[20px] py-[10px] ' +
  'text-[13px] font-medium text-white opacity-0 backdrop-blur-[20px] transition-[opacity,transform] duration-300';
export const TOAST_SHOW = 'translate-x-[-50%] translate-y-[-6px] opacity-100';

/** `#feed-topbar` @144 and `#golive-topbar` @464 share this geometry. */
export const TOPBAR =
  'relative z-[10] flex items-center gap-[12px] pt-[52px] pr-[clamp(16px,4vw,32px)] pb-[14px] pl-[clamp(16px,4vw,32px)] max-[700px]:pt-[28px]';
export const TOPBAR_TITLE = 'flex-1';
export const TOPBAR_H1 = 'm-0 text-[26px] font-black tracking-[-0.03em] max-[700px]:text-[22px]';
export const TOPBAR_H1_SMALL = 'text-[22px] font-black leading-none tracking-[-0.02em]';
export const TOPBAR_P = 'mt-[1px] text-[12px] text-live-muted';
export const BRAND_ROW = 'flex items-center gap-[10px]';
export const BRAND_LOGO = 'h-[36px] w-[36px] shrink-0 rounded-[10px] object-cover';

/** `.live-indicator` @159 and `.live-pill` @487. */
export const LIVE_INDICATOR =
  'flex items-center gap-[5px] rounded-[100px] border border-[rgba(124,58,237,0.35)] ' +
  'bg-[rgba(124,58,237,0.15)] px-[12px] py-[5px] text-[11px] font-bold tracking-[0.08em] text-live-purple-light';
export const PULSE_DOT = 'h-[6px] w-[6px] rounded-full bg-live-purple-light animate-live-pulse-dot';

/** `.go-live-top-btn` @177. */
export const GO_LIVE_TOP_BTN =
  'relative flex shrink-0 cursor-pointer items-center gap-[6px] overflow-hidden rounded-[100px] border-0 ' +
  'bg-[linear-gradient(135deg,#5b21b6,#7c3aed,#9d5cf6)] px-[16px] py-[9px] text-[12px] font-extrabold ' +
  'tracking-[0.04em] whitespace-nowrap text-white shadow-[0_6px_24px_rgba(124,58,237,0.45)] ' +
  'transition-[transform,box-shadow] duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)] ' +
  'hover:-translate-y-[2px] hover:scale-[1.06] hover:shadow-[0_10px_32px_rgba(124,58,237,0.6)] active:scale-[0.95]';
export const GO_LIVE_TOP_SHEEN =
  'absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.15)_0%,transparent_60%)]';
export const BTN_DOT = 'h-[7px] w-[7px] rounded-full bg-[rgba(255,255,255,0.85)] animate-live-pulse-dot-hard';

/** `#filter-bar` @198 and `.chip` @206. */
export const FILTER_BAR =
  'relative z-[10] flex gap-[8px] overflow-x-auto px-[clamp(16px,4vw,32px)] pb-[14px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden';
export const CHIP =
  'flex shrink-0 cursor-pointer items-center gap-[6px] whitespace-nowrap rounded-[100px] border ' +
  'border-[rgba(255,255,255,0.09)] bg-[rgba(255,255,255,0.06)] px-[14px] py-[7px] text-[12px] font-bold ' +
  'text-live-muted transition-all duration-[220ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] ' +
  'hover:bg-[rgba(255,255,255,0.1)] hover:text-white';
export const CHIP_IDLE = 'bg-[rgba(255,255,255,0.06)] border-[rgba(255,255,255,0.09)] text-live-muted';
export const CHIP_ACTIVE = 'scale-[1.04] border text-white';

/** `#feed-scroll` @228. */
export const FEED_SCROLL =
  'relative z-[10] min-h-0 flex-1 overflow-y-auto px-[clamp(16px,4vw,32px)] pb-[120px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden max-[700px]:pb-[80px]';

/** `.feed-section` @236. */
export const FEED_SECTION = 'mb-[28px]';
export const FEED_SECTION_HDR = 'mb-[12px] flex items-center justify-between';
export const FEED_SECTION_TITLE = 'flex items-center gap-[7px] text-[14px] font-extrabold tracking-[-0.01em]';
export const SECTION_BADGE =
  'rounded-[100px] border px-[8px] py-[2px] text-[10px] font-bold tracking-[0.06em]';
export const SEE_ALL =
  'cursor-pointer text-[11px] font-bold tracking-[0.04em] text-live-muted transition-colors duration-200 hover:text-white';
export const H_SCROLL =
  'flex gap-[10px] overflow-x-auto pb-[4px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden';

/** `.card-featured` @262. */
export const CARD_FEATURED =
  'relative mb-[10px] h-[200px] cursor-pointer overflow-hidden rounded-[22px] ' +
  'transition-[transform,box-shadow] duration-[220ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] ' +
  'hover:-translate-y-[3px] hover:scale-[1.02] active:scale-[0.98] max-[700px]:h-[165px]';
export const ABS_FILL = 'absolute inset-0';
export const FEAT_BLOB = 'absolute -right-[30px] -top-[30px] h-[180px] w-[180px] rounded-full blur-[50px]';
export const FEAT_GRID =
  'absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:24px_24px]';
export const FEAT_OVERLAY = 'absolute inset-0 bg-gradient-to-t from-[rgba(0,0,0,0.75)] to-transparent from-0% to-[60%]';
export const FEAT_EMOJI =
  'absolute right-[20px] top-1/2 text-[68px] opacity-[0.18] animate-live-hero-float';
export const FEAT_CONTENT = 'absolute inset-x-0 bottom-0 z-[2] px-[18px] py-[16px]';
export const FEAT_TOP = 'mb-[8px] flex items-center gap-[8px]';

/** `.live-tag` @314 and `.viewer-pill` @322. */
export const LIVE_TAG =
  'inline-flex items-center gap-[5px] rounded-[6px] bg-[rgba(255,20,20,0.85)] px-[8px] py-[3px] ' +
  'text-[10px] font-extrabold tracking-[0.08em] text-white';
export const LIVE_TAG_DOT = 'h-[5px] w-[5px] rounded-full bg-white animate-live-pulse-dot-fast';
export const VIEWER_PILL =
  'flex items-center gap-[4px] rounded-[100px] bg-black/45 px-[10px] py-[3px] text-[11px] font-semibold text-[rgba(255,255,255,0.85)]';

/** `.streamer-info` @329. */
export const STREAMER_INFO = 'flex items-center gap-[10px]';
export const STREAMER_AV =
  'flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-full border-2 border-[rgba(255,255,255,0.2)] text-[16px] font-black';
export const STREAMER_NAME = 'text-[15px] font-extrabold';
export const STREAMER_TITLE = 'mt-[1px] text-[11px] text-[rgba(255,255,255,0.6)]';

/** `.stream-card` @349, `.stream-card-tall` @382 and `.stream-card-wide` @436. */
export const STREAM_CARD =
  'relative h-[110px] w-[160px] shrink-0 cursor-pointer overflow-hidden rounded-[16px] ' +
  'transition-transform duration-[220ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] ' +
  'hover:-translate-y-[3px] hover:scale-[1.04] active:scale-[0.96]';
export const STREAM_CARD_TALL =
  'relative h-[140px] w-[130px] shrink-0 cursor-pointer overflow-hidden rounded-[16px] ' +
  'transition-transform duration-[220ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] ' +
  'hover:-translate-y-[3px] hover:scale-[1.04] active:scale-[0.96]';
export const STREAM_CARD_WIDE =
  'relative h-[120px] w-[200px] shrink-0 cursor-pointer overflow-hidden rounded-[16px] ' +
  'transition-transform duration-[220ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] ' +
  'hover:-translate-y-[3px] hover:scale-[1.04] active:scale-[0.96]';
export const SC_BLOB = 'absolute -right-[15px] -top-[15px] h-[100px] w-[100px] rounded-full blur-[30px]';
export const SC_BLOB_TALL = 'absolute -right-[10px] -top-[10px] h-[90px] w-[90px] rounded-full blur-[30px]';
export const SC_BLOB_WIDE = 'absolute -right-[20px] -top-[20px] h-[120px] w-[120px] rounded-full blur-[35px]';
export const SC_OVERLAY =
  'absolute inset-0 bg-gradient-to-t from-[rgba(0,0,0,0.7)] to-transparent from-0% to-[55%]';
export const SC_OVERLAY_TALL =
  'absolute inset-0 bg-gradient-to-t from-[rgba(0,0,0,0.72)] to-transparent from-0% to-[55%]';
export const SC_EMOJI = 'absolute right-[10px] top-[8px] text-[28px] opacity-[0.22]';
export const SC_EMOJI_TALL = 'absolute right-[10px] top-[10px] text-[32px] opacity-20';
export const SC_EMOJI_WIDE = 'absolute right-[12px] top-[10px] text-[36px] opacity-20';
export const SC_CONTENT = 'absolute inset-x-0 bottom-0 px-[10px] py-[10px]';
export const SC_CONTENT_WIDE = 'absolute inset-x-0 bottom-0 p-[12px]';
export const SC_LIVE_ROW = 'mb-[5px] flex items-center gap-[5px]';
export const SC_LIVE =
  'rounded-[4px] bg-[rgba(255,20,20,0.85)] px-[6px] py-[2px] text-[9px] font-extrabold tracking-[0.06em] text-white';
export const SC_VIEWS = 'text-[10px] font-semibold text-[rgba(255,255,255,0.7)]';
export const SC_NAME = 'text-[12px] font-extrabold leading-[1.1]';
export const SC_SUB = 'mt-[1px] overflow-hidden whitespace-nowrap text-ellipsis text-[10px] text-[rgba(255,255,255,0.5)]';

/** `.av-card` @400. */
export const AV_CARD =
  'flex w-[80px] shrink-0 cursor-pointer flex-col items-center gap-[8px] ' +
  'transition-transform duration-[220ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] ' +
  'hover:-translate-y-[3px] hover:scale-[1.06] active:scale-[0.96]';
export const AV_RING =
  'relative flex h-[62px] w-[62px] items-center justify-center rounded-full text-[24px] ' +
  'before:absolute before:-inset-[3px] before:-z-[1] before:rounded-full before:animate-live-ring-pulse before:content-[""]';
export const AV_RING_GLOW = 'before:bg-[linear-gradient(135deg,#ec4899,#7c3aed)]';
export const AV_RING_GLOW_CHAT = 'before:bg-[linear-gradient(135deg,#3b82f6,#7c3aed)]';
export const AV_LIVE_DOT =
  'absolute bottom-[2px] right-[2px] h-[14px] w-[14px] rounded-full border-2 border-live-ink bg-[#ff1414] animate-live-pulse-dot-hard';
export const AV_NAME = 'text-center text-[11px] font-bold leading-[1.2]';
export const AV_VIEWS = 'text-center text-[10px] text-live-muted';

/** `.empty-state` @450. */
export const EMPTY_STATE = 'flex flex-col items-center gap-[12px] px-[20px] py-[50px] text-center';
export const EMPTY_TITLE = 'text-[16px] font-extrabold text-[rgba(255,255,255,0.5)]';
export const EMPTY_SUB = 'text-[13px] text-live-muted';

/** `.back-btn` @470. */
export const BACK_BTN =
  'flex h-[40px] w-[40px] shrink-0 cursor-pointer items-center justify-center rounded-full ' +
  'border border-live-glass-bright bg-live-glass text-white backdrop-blur-[16px] ' +
  'transition-[background,transform] duration-200 hover:scale-[1.08] hover:bg-[rgba(255,255,255,0.1)] active:scale-[0.9]';

/** `.tab-track` @500 and `.tab-btn` @506. */
export const TAB_BAR = 'relative z-[10] px-[clamp(16px,4vw,32px)]';
export const TAB_TRACK =
  'flex gap-[6px] rounded-[18px] border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.04)] p-[5px]';
export const TAB_BTN =
  'relative flex flex-1 cursor-pointer flex-col items-center gap-[3px] overflow-hidden rounded-[13px] ' +
  'border px-[4px] py-[9px] transition-[background,transform] duration-[250ms] ' +
  'ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-[1.04] active:scale-[0.96]';
export const TAB_BTN_IDLE = 'border-transparent bg-transparent';
export const TAB_ICON = 'text-[18px] leading-none text-white';
export const TAB_LABEL =
  'whitespace-nowrap text-[9px] font-bold tracking-[0.04em] transition-colors duration-[250ms]';
export const TAB_LABEL_IDLE = 'text-live-muted';
export const TAB_GLOW = 'absolute inset-0 rounded-[13px] opacity-0 transition-opacity duration-300';
export const TAB_GLOW_ON = 'opacity-100';

/** `#panels` @532 and `.panel` @536. */
export const PANELS = 'relative z-[10] mt-[16px] min-h-0 flex-1 overflow-hidden px-[clamp(16px,4vw,32px)]';
export const PANEL =
  'absolute inset-0 overflow-y-auto px-[clamp(16px,4vw,32px)] pb-[24px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ' +
  'transition-[opacity,transform] duration-[350ms] ease-[cubic-bezier(0.22,1,0.36,1)]';
export const PANEL_IDLE = 'pointer-events-none translate-x-[30px] opacity-0';
export const PANEL_ACTIVE = 'pointer-events-auto translate-x-0 opacity-100';
export const PANEL_EXIT_LEFT = 'pointer-events-none -translate-x-[30px] opacity-0';

/** `.panel-hero` @548. */
export const PANEL_HERO =
  'relative mb-[16px] flex h-[160px] items-end overflow-hidden rounded-[24px] p-[20px] max-[700px]:h-[130px]';
export const HERO_BLOB = 'absolute -right-[40px] -top-[40px] h-[200px] w-[200px] rounded-full blur-[50px]';
export const HERO_BLOB_2 = 'absolute -bottom-[20px] left-[20px] h-[140px] w-[140px] rounded-full blur-[60px]';
export const HERO_GRID =
  'absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:28px_28px]';
export const HERO_ICON_BIG = 'absolute right-[20px] top-1/2 text-[64px] opacity-15 animate-live-hero-float';
export const HERO_CONTENT = 'relative z-[2]';
export const HERO_TAG =
  'mb-[8px] inline-flex items-center gap-[5px] rounded-[100px] border px-[12px] py-[4px] ' +
  'text-[9px] font-bold uppercase tracking-[0.1em]';
export const HERO_TITLE = 'text-[24px] font-black leading-none tracking-[-0.02em] max-[700px]:text-[20px]';
export const HERO_SUB = 'mt-[3px] text-[12px] font-normal text-[rgba(255,255,255,0.55)]';

/** `.stats-row` @629. */
export const STATS_ROW = 'mb-[16px] flex gap-[10px]';
export const STAT_CARD =
  'flex-1 rounded-[16px] border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.04)] px-[14px] py-[12px] text-center';
export const STAT_VAL = 'text-[20px] font-black tracking-[-0.02em]';
export const STAT_LBL = 'mt-[2px] text-[10px] font-medium text-live-muted';
export const SECTION_LABEL =
  'mb-[8px] mt-[4px] text-[10px] font-bold uppercase tracking-[0.12em] text-live-muted';

/** `.settings-list` @590 and `.setting-row` @591. */
export const SETTINGS_LIST = 'mb-[16px] flex flex-col gap-[10px]';
export const SETTING_ROW =
  'flex items-center gap-[14px] rounded-[16px] border border-[rgba(255,255,255,0.07)] ' +
  'bg-[rgba(255,255,255,0.04)] px-[16px] py-[14px] transition-colors duration-200 hover:bg-[rgba(255,255,255,0.07)]';
export const SETTING_ICON =
  'flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[12px] border text-[17px]';
export const SETTING_TEXT = 'min-w-0 flex-1';
export const SETTING_LABEL = 'text-[13px] font-bold';
export const SETTING_DESC = 'mt-[1px] text-[11px] text-live-muted';

/** `.toggle` @612 — the knob is the `after:` layer, the track colour is `checked:`. */
export const TOGGLE =
  'relative h-[24px] w-[44px] shrink-0 cursor-pointer appearance-none rounded-[100px] ' +
  'border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.12)] transition-colors duration-300 ' +
  'after:absolute after:left-[3px] after:top-[3px] after:h-[18px] after:w-[18px] after:rounded-full ' +
  'after:bg-white after:transition-transform after:duration-300 after:ease-[cubic-bezier(0.34,1.56,0.64,1)] ' +
  'after:content-[""] checked:after:translate-x-[20px]';

/** `.setting-select` @620. */
export const SETTING_SELECT =
  'cursor-pointer appearance-none rounded-[10px] border border-[rgba(255,255,255,0.12)] ' +
  'bg-[rgba(255,255,255,0.07)] px-[10px] py-[5px] text-[12px] font-semibold text-white outline-none';

/** `#go-live-wrap` @641 and `.go-live-btn` @645. */
export const GO_LIVE_WRAP = 'relative z-[10] shrink-0 px-[clamp(16px,4vw,32px)] pt-[12px] pb-[36px] max-[700px]:pb-[24px]';
export const GO_LIVE_BTN =
  'relative flex h-[62px] w-full cursor-pointer items-center justify-center gap-[10px] overflow-hidden ' +
  'rounded-[20px] border-0 text-[18px] font-black tracking-[0.02em] text-white ' +
  'transition-[transform,box-shadow] duration-[220ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] ' +
  'hover:-translate-y-[3px] hover:scale-[1.02] active:scale-[0.97] max-[700px]:h-[56px] max-[700px]:text-[16px]';
export const GO_LIVE_SHEEN =
  'absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.12)_0%,transparent_60%)]';
export const BTN_SHIMMER =
  'absolute inset-0 -translate-x-full bg-[linear-gradient(105deg,transparent_30%,rgba(255,255,255,0.15)_50%,transparent_70%)] animate-live-btn-shimmer';
export const GO_LIVE_DISABLED = 'cursor-not-allowed opacity-[0.45] grayscale-[0.4]';
export const COMING_SOON_HINT =
  'mt-[8px] block text-center text-[11px] font-medium tracking-[0.04em] text-[rgba(255,255,255,0.35)]';

/** `.live-coming-soon-card` @761. */
export const LCS_CARD =
  'relative my-[16px] overflow-hidden rounded-[24px] border border-[rgba(124,58,237,0.2)] p-[32px_24px] ' +
  'bg-[linear-gradient(145deg,rgba(124,58,237,0.08),rgba(236,72,153,0.06),rgba(59,130,246,0.05))] text-center';
export const LCS_GLOW =
  'pointer-events-none absolute -top-[60px] left-1/2 h-[220px] w-[220px] -translate-x-1/2 rounded-full ' +
  'bg-[radial-gradient(circle,rgba(124,58,237,0.18),transparent_70%)] animate-live-lcs-float';
export const LCS_ICON = 'relative z-[1] mb-[10px] text-[48px] animate-live-lcs-bounce';
export const LCS_TITLE =
  'relative z-[1] mb-[10px] bg-[linear-gradient(135deg,#c084fc,#f472b6,#60a5fa)] bg-clip-text text-[22px] ' +
  'font-black tracking-[-0.02em] text-transparent';
export const LCS_DESC =
  'relative z-[1] mx-auto mb-[20px] max-w-[320px] text-[13px] font-normal leading-[1.6] text-[rgba(255,255,255,0.65)]';
export const LCS_DESC_STRONG = 'font-bold text-live-purple-light';
export const LCS_PROGRESS_WRAP = 'relative z-[1] mb-[22px]';
export const LCS_PROGRESS_BAR =
  'mx-auto mb-[8px] h-[8px] w-full max-w-[280px] overflow-hidden rounded-[100px] bg-[rgba(255,255,255,0.08)]';
export const LCS_PROGRESS_FILL =
  'h-full rounded-[100px] bg-[linear-gradient(90deg,#7c3aed,#ec4899,#c084fc)] bg-[length:200%_100%] ' +
  'animate-live-lcs-shimmer transition-[width] duration-[1500ms] ease-[cubic-bezier(0.22,1,0.36,1)]';
export const LCS_PROGRESS_LABEL =
  'font-live-mono text-[12px] font-bold text-[rgba(255,255,255,0.5)]';
export const LCS_FEATURES =
  'relative z-[1] mx-auto mb-[18px] grid max-w-[300px] grid-cols-2 gap-[8px]';
export const LCS_FEAT =
  'flex items-center gap-[8px] rounded-[12px] border border-[rgba(255,255,255,0.07)] ' +
  'bg-[rgba(255,255,255,0.04)] px-[12px] py-[10px] text-[12px] font-semibold text-[rgba(255,255,255,0.75)]';
export const LCS_FEAT_ICON = 'text-[16px] text-live-purple-light';
export const LCS_CTA = 'relative z-[1] text-[12px] font-semibold tracking-[0.01em] text-[rgba(255,255,255,0.4)]';

/** Setup page: `#setup-topbar` @825 and `#setup-scroll` @832. */
export const SETUP_SCROLL =
  'relative z-[10] min-h-0 flex-1 overflow-y-auto px-[clamp(16px,4vw,32px)] pb-[120px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden max-[700px]:pb-[80px]';
export const SETUP_SECTION_TITLE =
  'mb-[8px] mt-[20px] text-[10px] font-bold uppercase tracking-[0.12em] text-live-muted first:mt-[4px]';
export const SETUP_FIELD =
  'mb-[10px] rounded-[16px] border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.04)] ' +
  'px-[16px] py-[14px] transition-colors duration-200 focus-within:border-[rgba(255,255,255,0.14)] focus-within:bg-[rgba(255,255,255,0.07)]';
export const SETUP_FIELD_ROW = 'flex items-center gap-[14px]';
export const SETUP_FIELD_BODY = 'min-w-0 flex-1';
export const SETUP_FIELD_LABEL = 'mb-[2px] text-[13px] font-bold';
export const SETUP_FIELD_DESC = 'text-[11px] text-live-muted';
export const SETUP_INPUT =
  'mt-[8px] w-full rounded-[10px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.06)] ' +
  'px-[12px] py-[8px] font-live text-[14px] font-medium text-white outline-none transition-colors duration-200 ' +
  'placeholder:text-live-muted placeholder:font-normal focus:border-[rgba(255,255,255,0.2)]';
export const COIN_WRAP = 'mt-[8px] flex items-center gap-[8px]';
export const COIN_PREFIX =
  'flex shrink-0 items-center gap-[5px] rounded-[10px] border border-[rgba(245,158,11,0.25)] ' +
  'bg-[rgba(245,158,11,0.12)] px-[12px] py-[8px] text-[12px] font-bold whitespace-nowrap text-[#f59e0b]';
export const COIN_INPUT =
  'flex-1 rounded-[10px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.06)] ' +
  'px-[12px] py-[8px] font-live text-[14px] font-medium text-white outline-none transition-colors duration-200 ' +
  'placeholder:text-live-muted placeholder:font-normal focus:border-[rgba(245,158,11,0.4)]';
export const SETUP_TOGGLE_ROW = 'flex items-center justify-between gap-[14px]';
export const SETUP_TOGGLE_INFO = 'flex-1';

/** `.privacy-opt` @930. */
export const PRIVACY_OPT =
  'flex-1 cursor-pointer rounded-[12px] border p-[10px] text-center ' +
  'transition-all duration-[220ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:bg-[rgba(255,255,255,0.08)]';
export const PRIVACY_OPT_IDLE = 'border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)]';
export const PRIVACY_OPT_PUBLIC = 'border-[rgba(34,197,94,0.5)] bg-[rgba(34,197,94,0.1)]';
export const PRIVACY_OPT_PRIVATE = 'border-[rgba(245,158,11,0.5)] bg-[rgba(245,158,11,0.1)]';
export const PRIVACY_ICON = 'mb-[4px] text-[22px] text-white';
export const PRIVACY_LABEL = 'text-[12px] font-bold';
export const PRIVACY_SUB = 'mt-[2px] text-[10px] text-live-muted';

/** `.timer-chip` @954. */
export const TIMER_CHIP =
  'cursor-pointer whitespace-nowrap rounded-[100px] border px-[14px] py-[7px] text-[12px] font-bold ' +
  'transition-all duration-[220ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] ' +
  'hover:bg-[rgba(255,255,255,0.08)] hover:text-white';
export const TIMER_CHIP_IDLE = 'border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] text-live-muted';
export const SETUP_FOOTNOTE =
  'mt-[8px] text-center text-[11px] tracking-[0.03em] text-live-muted';

/** `.live-pill` @487 in the mode colour the setup page picks for it. */
export const LIVE_PILL = (style: ModeStyle) =>
  cx(
    'flex shrink-0 items-center gap-[5px] rounded-[100px] border px-[12px] py-[5px] ' +
      'text-[11px] font-bold tracking-[0.08em]',
    style.tabActive.replace('0.22', '0.18').replace('0.38', '0.38'),
    style.tabLabel,
  );
