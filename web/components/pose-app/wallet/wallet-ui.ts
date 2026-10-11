import { bankEditLockRemaining, type WalletHistoryItem, type WalletHistoryKind } from '@/lib/pose-app/wallet';

/** `new Date(x).toLocaleString()` — the legacy's one date spelling in history. */
export function formatDateTime(value: unknown): string {
  const millis = toMillis(value);
  return millis ? new Date(millis).toLocaleString() : '—';
}

export function toMillis(value: unknown): number {
  if (!value) return 0;
  if (typeof value === 'string') return Date.parse(value) || 0;
  const maybe = value as { toMillis?: () => number; seconds?: number };
  if (typeof maybe?.toMillis === 'function') return maybe.toMillis();
  if (typeof maybe?.seconds === 'number') return maybe.seconds * 1000;
  return 0;
}

/** `toLocaleString()` on money values, exactly as the legacy printed them. */
export function amount(value: number | undefined): string {
  return (Number(value) || 0).toLocaleString();
}

/**
 * `filterWalletHistory()` @62426 matched on the rendered text of each entry.
 * The port matches on the item instead, which is the same set of rows without
 * scraping the DOM.
 */
export type HistoryFilter = 'all' | 'withdrawal' | 'deposit' | 'pcoin' | 'gifts' | 'bank_details' | 'pin';

export const HISTORY_FILTERS: { id: HistoryFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'withdrawal', label: 'Withdrawals' },
  { id: 'pcoin', label: 'pCoin' },
  { id: 'gifts', label: 'Gifts' },
  { id: 'bank_details', label: 'Bank' },
  { id: 'pin', label: 'PIN' },
];

const FILTER_KINDS: Record<Exclude<HistoryFilter, 'all'>, WalletHistoryKind> = {
  withdrawal: 'withdrawal',
  deposit: 'deposit',
  pcoin: 'pcoin_purchase',
  gifts: 'gift_claim',
  bank_details: 'bank_details_saved',
  pin: 'pin_event',
};

export type DateFilter = 'all' | 'today' | 'week' | 'month' | 'year';

export const DATE_FILTERS: { id: DateFilter; label: string }[] = [
  { id: 'all', label: 'All Time' },
  { id: 'today', label: 'Today' },
  { id: 'week', label: 'This Week' },
  { id: 'month', label: 'This Month' },
  { id: 'year', label: 'This Year' },
];

/** `filterWalletHistory()` + `filterByDate()` + `searchWalletHistory()` @62426-62500. */
export function applyHistoryFilters(
  items: WalletHistoryItem[],
  filter: HistoryFilter,
  dateFilter: DateFilter,
  search: string,
): WalletHistoryItem[] {
  const term = search.trim().toLowerCase();
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const boundaries: Record<Exclude<DateFilter, 'all'>, number> = {
    today: today,
    week: today - 7 * 24 * 60 * 60 * 1000,
    month: new Date(now.getFullYear(), now.getMonth(), 1).getTime(),
    year: new Date(now.getFullYear(), 0, 1).getTime(),
  };

  return items.filter((item) => {
    if (filter !== 'all' && item.kind !== FILTER_KINDS[filter]) return false;

    const millis = toMillis(item.date);
    if (dateFilter !== 'all' && (!millis || millis < boundaries[dateFilter])) return false;

    if (!term) return true;
    return historySearchText(item).includes(term);
  });
}

/** The text `searchWalletHistory()` @62460 would have matched against. */
function historySearchText(item: WalletHistoryItem): string {
  const parts: (string | undefined)[] = [
    item.kind,
    item.status,
    item.reference ?? undefined,
    item.bankName,
    item.accountNumber,
    item.giftName,
    item.action,
    item.processingType,
    item.amount === undefined ? undefined : String(item.amount),
  ];
  return parts.filter(Boolean).join(' ').toLowerCase();
}

/** `startBankEditCountdown()` @63203's lock message. */
export function bankLockLabel(lastSave: string | null): string {
  const remaining = bankEditLockRemaining(lastSave);
  if (remaining <= 0) return 'Account is now editable';
  const totalHours = Math.ceil(remaining / (60 * 60 * 1000));
  return `Next edit available in: ${Math.floor(totalHours / 24)}d ${totalHours % 24}h`;
}
