/**
 * Tailwind spellings of the search overlay's rules — `#searchInterfaceOverlay`
 * @82481 and the `<style>` block that follows it @82519-83313. Each constant
 * names its legacy selector so the two can be diffed.
 */

/** `.search-interface-overlay` @82520 + `.active` @82532. */
export const OVERLAY = 'fixed inset-0 z-[3000] overflow-y-auto bg-black';

/** `.search-interface-container` @82535. */
export const CONTAINER = 'mx-auto flex min-h-screen max-w-[680px] flex-col';

/** `.search-interface-header` @82544 + the ≤767px override @83313. */
export const HEADER =
  'sticky top-0 z-[10] flex items-center gap-[12px] border-b border-[#1a1a1a] bg-black p-[12px] ' +
  'max-md:gap-[8px] max-md:p-[8px]';

/** `.search-back-btn` @82557 + `:hover` @82570. */
export const BACK_BTN =
  'flex h-[40px] w-[40px] cursor-pointer items-center justify-center border-none bg-transparent ' +
  'text-[24px] text-[#8b5cf6] transition-[0.2s] hover:rounded-full hover:bg-[#1a1a1a]';

/** `.search-interface-input-wrapper` @82574. */
export const INPUT_WRAP = 'relative flex-1';

/** `.search-interface-input` @82579 + `:focus` @82592 + the ≤767px override @83322. */
export const INPUT =
  'w-full rounded-[20px] border border-[#333] bg-[#1a1a1a] py-[10px] pr-[36px] pl-[12px] text-[14px] ' +
  'text-white outline-none transition-[0.2s] ' +
  'focus:border-[#8b5cf6] focus:shadow-[0_0_0_2px_rgba(139,92,246,0.2)] ' +
  'max-md:py-[8px] max-md:pr-[32px] max-md:pl-[10px] max-md:text-[13px]';

/** `.search-clear-btn` @82599 + `:hover` @82611. */
export const CLEAR_BTN =
  'absolute top-1/2 right-[12px] -translate-y-1/2 cursor-pointer border-none bg-transparent ' +
  'text-[18px] text-[#666] transition-[0.2s] hover:text-white';

/** `.search-suggestions-dropdown` @82618 + `.active` @82634. */
export const SUGGESTIONS =
  'absolute inset-x-0 top-[calc(100%+6px)] z-[30] max-h-[280px] overflow-y-auto rounded-[14px] ' +
  'border border-[rgba(139,92,246,0.35)] bg-[#0d0d12] shadow-[0_16px_40px_rgba(0,0,0,0.6)]';

/** `.search-suggestion-item` @82637 + `:last-child` @82647 + `:hover` @82651. */
export const SUGGESTION_ITEM =
  'flex cursor-pointer items-center gap-[10px] border-b border-[#1a1a1a] px-[14px] py-[11px] ' +
  'transition-[background_0.15s] last:border-b-0 hover:bg-[#1a1a1a]';

export const SUGGESTION_ICON = 'w-[16px] shrink-0 text-center text-[13px] text-[#8b5cf6]';
export const SUGGESTION_TEXT = 'min-w-0 flex-1 truncate text-[13.5px] text-white';
export const SUGGESTION_MATCH = 'text-[#c4b5fd]';
export const SUGGESTION_META = 'shrink-0 text-[10.5px] text-[#666]';

/** `.search-interface-tabs` @82676 (+ the hidden scrollbar rules @82684). */
export const TABS =
  'flex gap-[16px] overflow-x-auto border-b border-[#1a1a1a] p-[12px] ' +
  '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden';

/** `.search-tab` @82688 + `:hover` @82704 + `.active` @82708. */
export const TAB =
  'cursor-pointer border-0 border-b-2 border-transparent bg-transparent py-[8px] text-[14px] ' +
  'font-semibold whitespace-nowrap text-[#666] transition-[0.2s] hover:text-white';

export const TAB_ACTIVE = 'border-b-[#8b5cf6] text-white';

/** `.search-interface-content` @82713. */
export const CONTENT = 'flex-1 overflow-y-auto px-[12px] pt-[16px] pb-[60px]';

/** `.search-section` / `.search-trending-section` @82719. */
export const SECTION = 'mb-[24px]';

/** `.search-section-header` @82725. */
export const SECTION_HEADER =
  'mb-[16px] text-[14px] font-bold tracking-[0.5px] text-[#999] uppercase';

/** `.search-trending-list` @82734. */
export const TRENDING_LIST = 'flex flex-col gap-[8px]';

/** `.search-trending-item` @82740 + `:hover` @82753. */
export const TRENDING_ITEM =
  'flex cursor-pointer items-center gap-[12px] rounded-[8px] border border-transparent bg-[#0a0a0a] ' +
  'p-[12px] transition-[0.2s] hover:border-[#333] hover:bg-[#1a1a1a]';

export const TRENDING_ICON = 'text-[20px] font-bold';
export const TRENDING_NAME = 'text-[14px] font-semibold text-white';
export const TRENDING_COUNT = 'text-[12px] text-[#666]';

/** `.search-see-more-btn` @82776 + `:hover` @82785. */
export const SEE_MORE =
  'cursor-pointer p-[10px] text-center text-[12.5px] font-bold text-[#8b5cf6] transition-colors ' +
  'hover:text-[#a78bfa]';

/** The empty line every section drops in, e.g. `No videos found` @81021. */
export const EMPTY = 'p-[20px] text-center text-[#666]';

/** `.search-filter-bar` @82790 / `.search-filter-toggle` @82794 + `:hover` @82805. */
export const FILTER_BAR = 'mb-[16px]';

export const FILTER_TOGGLE =
  'cursor-pointer rounded-[20px] border-none bg-[#8b5cf6] px-[16px] py-[8px] text-[12px] ' +
  'font-semibold text-white transition-[0.2s] hover:bg-[#a78bfa]';

/** `.search-filter-options` @82810 / `.search-filter-btn` @82818 + `:hover` @82830 + `.active` @82835. */
export const FILTER_OPTIONS = 'mt-[12px] flex flex-wrap gap-[8px]';

export const FILTER_BTN =
  'cursor-pointer rounded-[6px] border border-[#333] bg-[#0a0a0a] px-[12px] py-[8px] text-[12px] ' +
  'text-[#666] transition-[0.2s] hover:border-[#666] hover:text-white';

export const FILTER_BTN_ACTIVE = 'border-[#8b5cf6] bg-[#8b5cf6] text-white';

/** `.search-trends-cards` @82841 (+ the hidden scrollbar rules @82850). */
export const TREND_CARDS =
  'flex gap-[12px] overflow-x-auto pb-[8px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden';

/** `.search-trend-card` @82855 + `:hover` @82873. */
export const TREND_CARD =
  'relative flex min-w-[280px] cursor-pointer items-center gap-[12px] rounded-[12px] ' +
  'border border-transparent bg-[#0a0a0a] p-[12px] transition-[0.2s] hover:border-[#333] hover:bg-[#1a1a1a]';

/** `.search-trend-badge` @82880 — the gradient is inline so the pair stays in one place. */
export const TREND_BADGE =
  'flex h-[32px] w-[32px] shrink-0 items-center justify-center rounded-full text-[12px] font-bold text-white';

export const TREND_ICON = 'shrink-0 text-[18px] font-bold';
export const TREND_INFO = 'min-w-0 flex-1';
export const TREND_NAME = 'truncate text-[15px] font-semibold text-white';
export const TREND_POSTS = 'text-[12px] text-[#666]';
export const TREND_CHANGE = 'shrink-0 rounded-[4px] px-[8px] py-[4px] text-[12px] font-semibold text-white';

/** `.search-users-list` @82923. */
export const USERS_LIST = 'flex flex-col gap-[12px]';

/** `.search-user-card` @82929 + `:hover` @82941. */
export const USER_CARD =
  'flex items-center gap-[12px] rounded-[8px] border border-transparent bg-[#0a0a0a] p-[12px] ' +
  'transition-[0.2s] hover:border-[#333] hover:bg-[#1a1a1a]';

/** `.search-user-avatar` @82945. */
export const USER_AVATAR =
  'flex h-[56px] w-[56px] shrink-0 items-center justify-center rounded-full ' +
  'bg-[linear-gradient(135deg,#8b5cf6,#6d28d9)] text-[24px]';

export const USER_INFO = 'min-w-0 flex-1';
export const USER_NAME = 'text-[14px] font-semibold text-white';
export const USER_HANDLE = 'text-[12px] text-[#666]';
export const USER_BIO = 'truncate text-[12px] text-[#888]';

/** `.search-follow-btn` @82981 + `:hover` @82992. */
export const FOLLOW_BTN =
  'shrink-0 cursor-pointer rounded-[20px] border border-[#8b5cf6] bg-transparent px-[16px] py-[6px] ' +
  'text-[12px] font-semibold text-[#8b5cf6] transition-[0.2s] hover:bg-[#8b5cf6] hover:text-white';

/** `.search-grid-2` @83001 — the masonry column layout. */
export const GRID_2 = '[column-count:2] [column-gap:8px]';

/** `.search-grid-4` @83006. */
export const GRID_4 = 'grid grid-cols-2 gap-[12px]';

/** `.search-video-card, .search-photo-card` @83013 + `:active` @83026. */
export const MEDIA_CARD =
  'relative mb-[8px] cursor-pointer overflow-hidden rounded-[12px] border ' +
  'border-[rgba(139,92,246,0.16)] bg-[#0a0a0a] transition-[border-color_0.2s] ' +
  '[break-inside:avoid] active:border-[rgba(139,92,246,0.55)]';

/** `.search-video-thumbnail, .search-photo-image` @83032. */
export const MEDIA_THUMB =
  'relative flex w-full flex-col justify-between bg-[#14101f] bg-cover bg-center';

/** `.search-thumb-h1` … `h5` @83043. Cycled so the grid reads as masonry. */
export const THUMB_HEIGHTS = ['h-[210px]', 'h-[270px]', 'h-[170px]', 'h-[240px]', 'h-[190px]'];

export function thumbHeight(index: number): string {
  return THUMB_HEIGHTS[index % THUMB_HEIGHTS.length];
}

/** `.search-play-center` @83050. */
export const PLAY_CENTER =
  'pointer-events-none absolute top-1/2 left-1/2 z-[2] flex h-[38px] w-[38px] -translate-x-1/2 ' +
  '-translate-y-1/2 items-center justify-center rounded-full border border-white/30 ' +
  'bg-[rgba(6,5,9,0.45)] text-[13px] text-white';

/** `.search-duration-tag` @83070. */
export const DURATION_TAG =
  'absolute top-[8px] right-[8px] z-[2] rounded-[6px] bg-[rgba(6,5,9,0.6)] px-[6px] py-[3px] ' +
  'text-[10px] font-bold text-white';

/** `.search-carousel-badge` @83084. */
export const CAROUSEL_BADGE =
  'absolute top-[8px] left-[8px] z-[2] flex items-center gap-[4px] rounded-[7px] ' +
  'bg-[rgba(6,5,9,0.6)] px-[7px] py-[3px] text-[10.5px] font-bold text-white';

/** `.search-overlay-info` @83100. */
export const MEDIA_OVERLAY =
  'absolute inset-x-0 bottom-0 z-[1] bg-[linear-gradient(to_top,rgba(0,0,0,0.88)_10%,rgba(0,0,0,0.35)_60%,transparent_100%)] ' +
  'px-[10px] pt-[22px] pb-[10px]';

export const VIEWS_ROW = 'mb-[4px] flex items-center gap-[4px] text-[11px] font-bold text-white';
export const MEDIA_USERNAME = 'text-[10.5px] font-semibold text-[#c4b5fd]';
export const MEDIA_TITLE = 'my-[4px] line-clamp-2 text-[11.5px] leading-[1.35] font-semibold text-white';
export const MEDIA_USER_ROW = 'mt-[4px] flex items-center gap-[6px]';

/** `.search-user-row-inline .search-user-avatar-sm` @83149. */
export const MEDIA_AVATAR =
  'h-[16px] w-[16px] shrink-0 rounded-full bg-[linear-gradient(135deg,#8b5cf6,#4c1d95)] bg-cover ' +
  'bg-center shadow-[0_0_0_1px_rgba(255,255,255,0.3)]';

/** `.search-sounds-list` @83163. */
export const SOUNDS_LIST = 'flex flex-col';

/** `.search-sound-item` @83169 + `:hover` @83179. */
export const SOUND_ITEM =
  'group flex items-center gap-[12px] border-b border-[#1a1a1a] p-[12px] transition-[0.2s] hover:bg-[#0a0a0a]';

export const SOUND_THUMB = 'relative h-[56px] w-[56px] shrink-0 rounded-[8px] bg-cover';

/** `.search-play-icon` @83191 + the `:hover` reveal @83211. */
export const SOUND_PLAY =
  'absolute top-1/2 left-1/2 flex h-[24px] w-[24px] -translate-x-1/2 -translate-y-1/2 items-center ' +
  'justify-center rounded-full bg-[#8b5cf6] text-[12px] text-white opacity-0 transition-[0.2s] ' +
  'group-hover:opacity-100';

export const SOUND_INFO = 'min-w-0 flex-1';
export const SOUND_TITLE = 'truncate text-[14px] font-semibold text-white';
export const SOUND_ARTIST = 'truncate text-[12px] text-[#999]';
export const SOUND_META = 'mt-[4px] text-[11px] text-[#666]';
export const SOUND_ACTIONS = 'flex shrink-0 gap-[8px]';

/** `.search-use-btn` @83247 + `:hover` @83259. */
export const USE_BTN =
  'cursor-pointer rounded-[20px] border-none bg-[#8b5cf6] px-[12px] py-[6px] text-[12px] ' +
  'font-semibold text-white transition-[0.2s] hover:bg-[#a78bfa]';

/** `.search-hashtag-card` @83264 + `:hover` @83277. */
export const HASHTAG_CARD =
  'relative cursor-pointer rounded-[12px] border border-transparent bg-[#0a0a0a] p-[12px] ' +
  'text-center transition-[0.2s] hover:border-[#333] hover:bg-[#1a1a1a]';

/** `.search-hashtag-icon` @83280. */
export const HASHTAG_ICON =
  'mx-auto mb-[8px] flex h-[56px] w-[56px] items-center justify-center rounded-full text-[28px] font-bold';

export const HASHTAG_NAME = 'mb-[4px] truncate text-[16px] font-bold text-white';
export const HASHTAG_POSTS = 'text-[12px] text-[#666]';

/** `.search-featured-badge` @83305. */
export const FEATURED_BADGE =
  'absolute top-[8px] right-[8px] rounded-[4px] bg-[#8b5cf6] px-[8px] py-[4px] text-[10px] ' +
  'font-semibold text-white';

/** The centered "nothing here yet" block `loadRecentTab()` @80848 falls back to. */
export const RECENT_EMPTY =
  'px-[20px] py-[60px] text-center text-[#666]';

/** The `#ef4444` failure line `renderSearchContent()` @80859 fell back to. */
export const TAB_ERROR =
  'flex flex-col items-center gap-[10px] px-[20px] py-[40px] text-center text-[13px] text-[#ef4444]';

export const RETRY_BTN =
  'cursor-pointer rounded-[8px] bg-[#8b5cf6] px-[16px] py-[7px] text-[12px] font-bold text-white';

/* ── Buzz search (`#buzzSearchOverlay` @82457) ────────────────── */

/**
 * The Posts tab lays its real post cards out in the same auto-fill grid the
 * legacy inline style used (`grid-template-columns:repeat(auto-fill,minmax(280px,1fr))`).
 */
export const BUZZ_POSTS_GRID =
  'grid gap-[12px] [grid-template-columns:repeat(auto-fill,minmax(280px,1fr))]';

/** `.buzz-search-posts-grid` cards: the whole card opens the post. */
export const BUZZ_GRID_CARD = 'cursor-pointer';

/** The `#0a0a0a` text-preview rows the Trending, All and Trending-Posts blocks share. */
export const BUZZ_ROW =
  'flex cursor-pointer gap-[10px] rounded-[8px] bg-[#0a0a0a] p-[10px]';

export const BUZZ_ROW_AVATAR =
  'flex h-[36px] w-[36px] shrink-0 items-center justify-center overflow-hidden rounded-full ' +
  'bg-gradient-to-br from-[#667eea] to-[#764ba2] bg-cover bg-center text-[13px] font-bold text-white';

export const BUZZ_ROW_BODY = 'min-w-0 flex-1';
export const BUZZ_ROW_NAME = 'text-[13px] font-semibold text-white';
export const BUZZ_ROW_TEXT = 'mt-[4px] text-[13px] leading-[1.4] text-[#ccc]';
export const BUZZ_ROW_SCORE = 'mt-[6px] text-[11px] text-[#8b5cf6]';
export const BUZZ_ROWS = 'flex flex-col gap-[8px]';

/** The Trending tab's engagement tally, which the All tab's user rows do not carry. */
export const BUZZ_ROW_META = 'text-[12px] text-[#666]';
