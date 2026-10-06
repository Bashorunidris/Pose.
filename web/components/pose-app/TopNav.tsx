'use client';

import { NAVBAR, TAB, TAB_ACTIVE, TABS, cx } from './styles';

/** The two top-level feed tabs; Trend opens a modal instead of a panel. */
export type FeedTab = 'forYou' | 'buzz';

type Props = {
  /** `switchMainTab('trend')` returns before it moves `.active`, so the
   *  underline stays on the feed that is showing underneath the modal. */
  tab: FeedTab;
  onSelect: (tab: FeedTab) => void;
  onOpenTrend: () => void;
};

const BTN = 'appearance-none border-0 bg-transparent';

export function TopNav({ tab, onSelect, onOpenTrend }: Props) {
  return (
    <div className={NAVBAR}>
      <div className={TABS}>
        <button
          type="button"
          className={cx(TAB, BTN, tab === 'forYou' && TAB_ACTIVE)}
          onClick={() => onSelect('forYou')}
        >
          For You
        </button>
        <button
          type="button"
          className={cx(TAB, BTN, tab === 'buzz' && TAB_ACTIVE)}
          onClick={() => onSelect('buzz')}
        >
          Buzz
        </button>
        <button type="button" className={cx(TAB, BTN)} onClick={onOpenTrend}>
          Trend
        </button>
      </div>
    </div>
  );
}
