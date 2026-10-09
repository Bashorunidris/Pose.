/**
 * Class strings for the profile settings surface, transcribed from the legacy
 * stylesheet: `.settings-container` @17561, `.settings-nav` @17712,
 * `.settings-section` @17755, `.setting-item` @17785, `.setting-info` @17798,
 * `.setting-select` @17890, `.policy-*` @17930, `.account-settings-modal*`
 * @18009, `.help-popup*` @18230 and `.confirm-modal*` @18496.
 */

/** `.settings-container` @17561 — full-bleed panel, slides in from the right. */
export const SETTINGS_PANEL =
  'fixed inset-0 z-[1000] flex flex-col overflow-y-auto bg-black/80 animate-app-slide-in';

/** `.settings-nav` @17712. */
export const SETTINGS_NAV = 'sticky top-0 z-10 border-b border-[#2a2a2a] bg-[#121212] p-[15px]';

/** `.settings-content` @17749. */
export const SETTINGS_CONTENT = 'flex-1 overflow-y-auto bg-[#121212] p-[20px]';

/** `.settings-section` @17755 — the later `h2` rule @17804 wins, so the title is white. */
export const SETTINGS_SECTION =
  'mb-[20px] rounded-[12px] bg-[#1a1a1a] p-[20px] shadow-[0_4px_6px_rgba(0,0,0,0.1)]';

export const SETTINGS_SECTION_TITLE =
  'mb-[15px] mt-0 border-b border-[#2a2a2a] pb-[10px] text-[1.2rem] font-medium text-white';

/** `.setting-item` @17785 + `:hover` @17805. */
export const SETTING_ITEM =
  'my-[5px] flex w-full cursor-pointer items-center justify-between rounded-[8px] px-[15px] py-[12px] text-left text-white transition-colors duration-300 hover:bg-[#333]';

/** Same row when it is not interactive (legacy `div.setting-item`). */
export const SETTING_ITEM_STATIC =
  'my-[5px] flex w-full items-center justify-between rounded-[8px] px-[15px] py-[12px] text-left text-white';

export const SETTING_INFO = 'flex items-center gap-[10px]';

/** `.setting-info i` @17799. */
export const SETTING_ICON = 'w-[24px] text-center text-[18px] text-[#8a2be2]';

/** `.setting-item i.fa-chevron-right` @17817. */
export const SETTING_CHEVRON = 'text-[0.9rem] text-[#666]';

/** `.danger-zone .setting-info i` @17918 / `.delete-account` @17923. */
export const SETTING_ICON_DANGER = 'w-[24px] text-center text-[18px] text-[#f44336]';
export const SETTING_TEXT_DANGER = 'text-[#f44336]';

/** `.setting-select` @17890 — native arrow swapped for the legacy inline chevron. */
export const SETTING_SELECT =
  'cursor-pointer appearance-none rounded-[6px] border-none bg-[#2a2a2a] py-[8px] pl-[12px] pr-[30px] text-[#e0e0e0] outline-none ' +
  "bg-[url(\"data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e\")] " +
  'bg-[length:16px] bg-[right_8px_center] bg-no-repeat focus:shadow-[0_0_0_2px_rgba(156,39,176,0.3)]';

/** `.account-settings-modal-container` @18009 + `.account-settings-modal` @18031. */
export const MODAL_OVERLAY =
  'fixed inset-0 z-[2000] flex items-center justify-center bg-black/80 p-[20px]';

export const MODAL_CARD =
  'max-h-[85vh] w-[90%] max-w-[500px] overflow-y-auto rounded-[12px] bg-[#121212] shadow-[0_10px_25px_rgba(0,0,0,0.5)] animate-app-modal-rise';

export const MODAL_HEADER =
  'sticky top-0 z-10 flex items-center justify-between border-b border-[#2a2a2a] bg-[#121212] px-[20px] py-[15px]';

export const MODAL_TITLE = 'm-0 text-[1.3rem] font-medium text-[#bb86fc]';

export const MODAL_CLOSE =
  'flex cursor-pointer items-center justify-center rounded-full border-none bg-none p-[8px] text-[1.2rem] text-[#999] transition-colors duration-200 hover:bg-white/10 hover:text-white';

export const MODAL_BODY = 'p-[20px]';

/** `.account-settings-form-group` @18106 + its label/input/textarea rules. */
export const FORM_GROUP = 'flex flex-col gap-[8px]';
export const FORM_LABEL = 'text-[0.9rem] font-medium text-[#bbb]';
export const FORM_INPUT =
  'rounded-[6px] border border-[#333] bg-[#1e1e1e] p-[12px] text-[1rem] text-white transition-colors duration-200 focus:border-[#bb86fc] focus:outline-none';
export const FORM_TEXTAREA = `${FORM_INPUT} min-h-[100px] resize-y`;

/** `.account-settings-save-profile-btn` @18187. */
export const PRIMARY_BUTTON =
  'w-full cursor-pointer rounded-[6px] border-none bg-[#9c27b0] px-[20px] py-[12px] text-[1rem] font-semibold text-white transition-colors duration-200 hover:bg-[#7b1fa2] disabled:opacity-60';

/** `.modal-btn` @374, with the legacy inline overrides applied by the caller. */
export const MODAL_BUTTON =
  'cursor-pointer rounded-[8px] px-[12px] py-[12px] font-bold text-white transition-opacity duration-200 hover:opacity-90';

/** `.confirm-btn` @18569 and its three variants @18584. */
export const CONFIRM_BUTTON =
  'cursor-pointer rounded-[6px] border-none px-[20px] py-[12px] text-[1rem] font-semibold transition-all duration-200';
export const CONFIRM_PRIMARY = `${CONFIRM_BUTTON} bg-[#9c27b0] text-white hover:bg-[#7b1fa2]`;
export const CONFIRM_DANGER = `${CONFIRM_BUTTON} bg-[#f44336] text-white hover:bg-[#d32f2f]`;
export const CONFIRM_SECONDARY = `${CONFIRM_BUTTON} bg-[#333] text-white hover:bg-[#444]`;
