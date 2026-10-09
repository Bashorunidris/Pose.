/**
 * Tailwind spellings of the comment sheet's rules — `#commentModal` @72649 and
 * the `<style>` block at 12339-12990. Each constant names its legacy selector so
 * the two can be diffed.
 */

/** `.comment-modal-overlay` @12340 + `.active` @12354. */
export const OVERLAY = 'fixed inset-0 z-[10001] bg-black/60';

/** `.comment-modal` @12359 + `.active` @12375 + the ≥768px docked override @12397. */
export const MODAL =
  'fixed inset-x-0 bottom-0 z-[10002] flex max-h-[85vh] flex-col rounded-t-[20px] bg-black ' +
  'animate-app-slide-up max-[480px]:max-h-[88vh] max-[360px]:max-h-[90vh] max-[360px]:rounded-t-[16px] ' +
  'md:bottom-[20px] md:left-1/2 md:max-h-[80vh] md:w-[500px] md:-translate-x-1/2 md:rounded-[20px]';

/** `.comment-header` @12413 + `.comment-header h3` @12428 + the ≤360px overrides. */
export const HEADER =
  'flex shrink-0 items-center justify-between border-b border-white/10 p-[12px_15px] max-[360px]:p-[10px_12px]';

export const TITLE = 'm-0 text-[16px] font-semibold text-white max-[360px]:text-[14px]';

/** `.comment-close-btn` @12447. */
export const CLOSE_BTN =
  'flex h-[30px] w-[30px] cursor-pointer items-center justify-center border-0 bg-transparent ' +
  'text-[24px] text-white';

/** `.comment-list` @12455. */
export const LIST = 'flex-1 overflow-y-auto py-[15px] [-webkit-overflow-scrolling:touch]';

/** `.empty-comments` @12376 (rendered when the sheet has nothing to show). */
export const EMPTY = 'flex flex-col items-center justify-center p-[40px_20px] text-center text-[#999]';
export const EMPTY_ICON = 'mb-[15px] text-[40px]';
export const EMPTY_TEXT = 'text-[14px]';

/** `.comment-item` @12462 + the ≤360px override @12636. */
export const ITEM =
  'relative flex items-start gap-[10px] border-b border-white/5 p-[10px_12px] max-[360px]:gap-[8px] max-[360px]:p-[8px_10px]';

/** `.comment-item.comment-owner` @12573 and `.comment-first` @12585. */
export const ITEM_OWNER = 'border-l-[3px] border-l-[#8A2BE2] bg-[rgba(138,43,226,0.1)] pl-[9px]';
export const ITEM_FIRST = 'border-l-[3px] border-l-[#FFC107] bg-[rgba(255,193,7,0.08)] pl-[9px]';

/** `.comment-left-container` @12622. */
export const LEFT = 'flex shrink-0 flex-col items-center gap-[8px]';

/** `.comment-avatar-wrapper` @12563. */
export const AVATAR_WRAP = 'relative inline-block shrink-0';

/** `.comment-avatar` @12629 + its hover cursor rule @12672 + ≤360px override. */
export const AVATAR =
  'flex h-[32px] w-[32px] min-w-[32px] shrink-0 items-center justify-center rounded-full ' +
  'bg-[rgba(138,43,226,0.3)] bg-cover bg-center text-[12px] text-white ' +
  'max-[360px]:h-[28px] max-[360px]:w-[28px] max-[360px]:min-w-[28px] max-[360px]:text-[11px]';

export const AVATAR_CLICKABLE = 'cursor-pointer';

/** `.comment-item.comment-owner .comment-avatar` @12579 and `.comment-first …` @12591. */
export const AVATAR_OWNER = 'border-[3px] border-[#8A2BE2] shadow-[0_0_15px_rgba(138,43,226,0.5)]';
export const AVATAR_FIRST = 'border-[3px] border-[#FFC107] shadow-[0_0_15px_rgba(255,193,7,0.4)]';

/** `.comment-badge-ring` @12598 + the two variants @12612 / @12619. */
export const BADGE_RING =
  'absolute -right-[5px] -bottom-[5px] flex h-[32px] w-[32px] items-center justify-center ' +
  'rounded-full border-2 border-black text-[16px] font-bold animate-app-pop-in';

export const BADGE_OWNER = 'bg-[linear-gradient(135deg,#8A2BE2,#a855f7)] text-white shadow-[0_4px_12px_rgba(138,43,226,0.6)]';
export const BADGE_FIRST =
  'bg-[linear-gradient(135deg,#FFC107,#FFD54F)] text-[#333] shadow-[0_4px_12px_rgba(255,193,7,0.6)]';

/** `.comment-content` @12709. */
export const CONTENT = 'min-w-0 flex-1';

/** `.comment-user` @12760, `.comment-username` @12766, `.comment-time` @12779. */
export const USER_ROW = 'mb-[4px] flex items-center gap-[8px]';
export const USERNAME = 'text-[13px] font-semibold text-white max-[360px]:text-[12px]';
export const TIME = 'text-[11px] text-[#999] max-[360px]:text-[10px]';

/** `.comment-text` @12786. */
export const TEXT =
  'text-[13px] leading-[1.4] break-words text-[#e4e6eb] max-[360px]:text-[12px] max-[360px]:leading-[1.35]';

/** `.reply-mention` @12908. */
export const REPLY_MENTION = 'mb-[4px] text-[11px] text-[#8A2BE2]';

/** `.comment-actions` @12798 / `.comment-actions-left` @12472 / @12470. */
export const ACTIONS = 'mt-[8px] flex items-center justify-between gap-[12px]';
export const ACTIONS_LEFT = 'flex gap-[10px]';

/** `.comment-like-btn` @12805 + `:hover` @12815 + `.liked` @12819. */
export const ACTION_BTN = 'cursor-pointer border-0 bg-transparent p-0 text-[12px] transition-all duration-200';
export const LIKE_BTN = 'text-[#999] hover:text-[#ff2d55]';
export const LIKE_BTN_ON = 'text-[#ff2d55]';

/** `.comment-reply-btn` @12823 + `:hover` @12860. */
export const REPLY_BTN = 'text-[#999] hover:text-[#8A2BE2]';

/** `.comment-replies-count` @12865 + `:hover` @12875. */
export const REPLIES_COUNT = 'cursor-pointer border-0 bg-transparent p-0 text-[12px] text-[#8A2BE2] hover:text-[#a855f7]';

/** `.comment-replies-container` @12879 — the ≤2 level reply well. */
export const REPLIES_WRAP = 'mt-[12px] border-l-2 border-white/10 pl-[40px]';

/** `.comment-reply-item` @12892 + `.nested-replies-container` @69730. */
export const REPLY_ITEM = 'mb-[12px] flex gap-[8px] animate-app-slide-in';

/** `.comment-input-section` @12935 + the ≤480 / ≤360 overrides @12945 / @12952. */
export const INPUT_SECTION =
  'flex shrink-0 items-end gap-[8px] border-t border-white/10 p-[10px_12px] ' +
  'max-[480px]:gap-[6px] max-[480px]:p-[8px_10px] max-[360px]:gap-[4px] max-[360px]:p-[6px_8px]';

/** `.comment-input-wrapper` @12961 + the two narrower overrides. */
export const INPUT_WRAP =
  'flex flex-1 items-center gap-[8px] rounded-[20px] bg-white/10 p-[8px_12px] ' +
  'max-[480px]:gap-[6px] max-[480px]:rounded-[18px] max-[480px]:p-[6px_10px] ' +
  'max-[360px]:gap-[4px] max-[360px]:rounded-[16px] max-[360px]:p-[5px_8px]';

/** `.comment-input` @12985. */
export const INPUT =
  'flex-1 border-0 bg-transparent text-[14px] text-white outline-none placeholder:text-[#888]';

/** `.comment-emoji-btn` @12995 — the sticker / image / more / gift buttons. */
export const EMOJI_BTN =
  'flex min-w-[20px] cursor-pointer items-center justify-center border-0 bg-transparent ' +
  'text-[18px] text-[#999] transition-all duration-200 hover:text-white ' +
  'max-[480px]:min-w-[18px] max-[480px]:text-[16px] max-[360px]:min-w-[16px] max-[360px]:text-[14px]';

/** `.comment-send-btn` @13028 + `:hover` @13054 + the two narrower overrides. */
export const SEND_BTN =
  'flex h-[44px] min-w-[44px] shrink-0 cursor-pointer items-center justify-center rounded-[20px] ' +
  'border-0 bg-[linear-gradient(135deg,#8A2BE2,#a855f7)] p-[10px_12px] text-[16px] font-semibold ' +
  'whitespace-nowrap text-white transition-all duration-200 ' +
  'hover:bg-[linear-gradient(135deg,#9c27b0,#b85af0)] hover:shadow-[0_4px_12px_rgba(138,43,226,0.4)] ' +
  'disabled:cursor-not-allowed disabled:opacity-50 ' +
  'max-[480px]:h-[40px] max-[480px]:min-w-[40px] max-[480px]:p-[8px_10px] max-[480px]:text-[14px] ' +
  'max-[360px]:h-[36px] max-[360px]:min-w-[36px] max-[360px]:p-[6px_8px] max-[360px]:text-[12px]';

/**
 * `.comment-reactions` @12484 + `.show` @12497 + `.reaction-btn` @12514 and its
 * hover/active states @12528 / @12534. The legacy floated this bar at fixed
 * coordinates under the row; here it sits in the row's own flow, under the
 * actions, which reads the same and survives the list scrolling.
 */
export const REACTIONS_POPOVER =
  'mt-[6px] flex w-fit gap-[6px] rounded-[20px] bg-black/85 p-[8px_6px] shadow-[0_4px_12px_rgba(0,0,0,0.4)] animate-app-pop-in';

export const REACTION_BTN =
  'flex cursor-pointer items-center justify-center rounded-[16px] border border-white/20 bg-transparent ' +
  'p-[4px_8px] text-[18px] leading-none text-white transition-all duration-200 ' +
  'hover:border-[rgba(138,43,226,0.5)] hover:bg-[rgba(138,43,226,0.2)] hover:scale-[1.1] active:scale-[0.95]';

/** `.comment-reaction-counts` @12538 + `.reaction-count` @12547 (and its hover). */
export const REACTION_COUNTS = 'mt-[8px] flex flex-wrap gap-[8px]';
export const REACTION_COUNT =
  'inline-flex cursor-default items-center gap-[4px] rounded-[12px] border border-[rgba(138,43,226,0.3)] ' +
  'bg-[rgba(138,43,226,0.15)] p-[4px_8px] text-[12px] text-[#a0aec0] transition-all duration-200';
export const REACTION_COUNT_MINE = 'border-[rgba(255,0,80,0.45)] bg-[rgba(255,0,80,0.14)] text-[#ff8fab]';

/** The emoji strip `toggleEmojiPanel()` @71849 reveals above the input bar. */
export const EMOJI_PANEL = 'flex shrink-0 gap-[6px] overflow-x-auto border-t border-white/10 px-[12px] py-[8px]';

export const EMOJI_OPTION =
  'cursor-pointer rounded-[8px] border-0 bg-transparent p-[4px] text-[20px] leading-none ' +
  'transition-transform duration-200 hover:scale-[1.2]';

/** The `#commentLoadingSkeleton` @66234 shown while a cold sheet loads. */
export const SKELETON_ROW = 'flex items-start gap-[10px]';
export const SKELETON_AVATAR = 'h-[36px] w-[36px] shrink-0 rounded-full bg-white/[0.08]';
