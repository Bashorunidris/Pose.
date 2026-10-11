'use client';

import { useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';

import type { WalletHistoryItem } from '@/lib/pose-app/wallet';

import {
  amount,
  applyHistoryFilters,
  DATE_FILTERS,
  formatDateTime,
  HISTORY_FILTERS,
  type DateFilter,
  type HistoryFilter,
} from './wallet-ui';

type Props = { items: WalletHistoryItem[] };

/** `filterWalletHistory()`/`filterByDate()` styled active/inactive buttons inline. */
function chipStyle(active: boolean): CSSProperties {
  return {
    padding: '8px 14px',
    background: active ? '#4C1D95' : '#333',
    color: active ? '#fff' : '#999',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.8rem',
  };
}

/**
 * `displayWalletHistory()` @62187, `filterWalletHistory()` @62426,
 * `searchWalletHistory()` @62460 and `filterByDate()` @62478. The legacy filtered
 * by scraping each entry's rendered text; the port filters the items and renders
 * the rows that survive, which is the same result without the DOM round-trip.
 */
export function WalletHistory({ items }: Props) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<HistoryFilter>('all');
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');

  if (items.length === 0) {
    return (
      <div style={{ textAlign: 'center', color: '#6b6b80', padding: '2.5rem 1rem', fontSize: '13px' }}>
        <i className="fas fa-inbox" style={{ fontSize: '2rem', marginBottom: '1rem', display: 'block' }} />
        No transactions yet
      </div>
    );
  }

  const visible = applyHistoryFilters(items, filter, dateFilter, search).slice(0, 100);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <input
            type="text"
            placeholder="Search transactions..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            style={{ width: '100%', padding: '10px 15px 10px 35px', background: '#1a1a1a', border: '1px solid #333', borderRadius: '6px', color: '#FFFFFF', fontSize: '0.9rem' }}
          />
          <i className="fas fa-search" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#4C1D95' }} />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {HISTORY_FILTERS.map((entry) => (
          <button key={entry.id} type="button" style={chipStyle(filter === entry.id)} onClick={() => setFilter(entry.id)}>
            {entry.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {DATE_FILTERS.map((entry) => (
          <button key={entry.id} type="button" style={chipStyle(dateFilter === entry.id)} onClick={() => setDateFilter(entry.id)}>
            {entry.label}
          </button>
        ))}
      </div>

      <div>
        {visible.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#6b6b80', padding: '1.5rem 1rem', fontSize: '13px' }}>
            No transactions match these filters
          </div>
        ) : (
          visible.map((item) => <HistoryEntry key={`${item.kind}-${item.id}`} item={item} />)
        )}
      </div>
    </div>
  );
}

function StatusPill({ text, color }: { text: string; color: string }) {
  return (
    <div style={{ color: '#999', fontSize: '0.8rem', marginTop: '6px' }}>
      <span style={{ background: `${color}33`, padding: '4px 8px', borderRadius: '4px', color }}>{text}</span>
    </div>
  );
}

function EntryShell({ color, children }: { color: string; children: ReactNode }) {
  return (
    <div
      className="wallet-history-entry"
      style={{ background: 'rgba(76, 29, 149, 0.1)', padding: '15px', borderRadius: '10px', marginBottom: '12px', borderLeft: `4px solid ${color}` }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>{children}</div>
    </div>
  );
}

function statusColorFor(status: string | undefined, pending: string[]): string {
  if (status && pending.includes(status)) return '#FFB74D';
  if (status === 'completed') return '#22c55e';
  return '#EF4444';
}

function statusTextFor(status: string | undefined, map: Record<string, string>): string {
  return (status && map[status]) || 'Failed';
}

function HistoryEntry({ item }: { item: WalletHistoryItem }) {
  if (item.kind === 'withdrawal') {
    const color = statusColorFor(item.status, ['pending_normal', 'pending_speedy']);
    const statusText = statusTextFor(item.status, {
      pending_normal: 'Pending (Normal)',
      pending_speedy: 'Pending (Speedy)',
      completed: 'Completed',
    });
    return (
      <EntryShell color={color}>
        <div style={{ flex: 1 }}>
          <div style={{ color: '#999', fontSize: '0.9rem', marginBottom: '8px' }}>
            <i className="fas fa-arrow-up-right" style={{ color, marginRight: '8px' }} />
            <strong style={{ color: '#FFFFFF' }}>Withdrawal</strong>
            {` - ${item.processingType === 'normal' ? 'Normal (1-24hrs)' : 'Speedy (5-30min)'}`}
          </div>
          <div style={{ color: '#666', fontSize: '0.85rem', marginBottom: '6px' }}>
            {item.bankName} • {item.accountNumber}
          </div>
          <div style={{ color: '#666', fontSize: '0.85rem' }}>{formatDateTime(item.date)}</div>
          <StatusPill text={statusText} color={color} />
        </div>
        <div style={{ textAlign: 'right', color: '#EF4444' }}>
          <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
            -<i className="fas fa-naira-sign" />{amount(item.amount)}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#999', marginTop: '4px' }}>
            You get: <i className="fas fa-naira-sign" />{amount(item.youReceive)}
          </div>
        </div>
      </EntryShell>
    );
  }

  if (item.kind === 'deposit') {
    const color = statusColorFor(item.status, ['pending']);
    const statusText = statusTextFor(item.status, { pending: 'Pending', completed: 'Completed' });
    return (
      <EntryShell color={color}>
        <div style={{ flex: 1 }}>
          <div style={{ color: '#999', fontSize: '0.9rem', marginBottom: '8px' }}>
            <i className="fas fa-arrow-down-left" style={{ color, marginRight: '8px' }} />
            <strong style={{ color: '#FFFFFF' }}>Deposit</strong>
          </div>
          <div style={{ color: '#666', fontSize: '0.85rem', marginBottom: '6px' }}>Reference: {item.reference || 'N/A'}</div>
          <div style={{ color: '#666', fontSize: '0.85rem' }}>{formatDateTime(item.date)}</div>
          <StatusPill text={statusText} color={color} />
        </div>
        <div style={{ textAlign: 'right', color: '#22c55e' }}>
          <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
            +<i className="fas fa-naira-sign" />{amount(item.amount)}
          </div>
        </div>
      </EntryShell>
    );
  }

  if (item.kind === 'pcoin_purchase') {
    const color = statusColorFor(item.status, ['pending']);
    const statusText = statusTextFor(item.status, { pending: 'Pending', completed: 'Completed' });
    return (
      <EntryShell color={color}>
        <div style={{ flex: 1 }}>
          <div style={{ color: '#999', fontSize: '0.9rem', marginBottom: '8px' }}>
            <i className="fas fa-coins" style={{ color, marginRight: '8px' }} />
            <strong style={{ color: '#FFFFFF' }}>pCoin Purchase</strong>
          </div>
          <div style={{ color: '#666', fontSize: '0.85rem', marginBottom: '6px' }}>Reference: {item.reference || 'N/A'}</div>
          <div style={{ color: '#666', fontSize: '0.85rem' }}>{formatDateTime(item.date)}</div>
          <StatusPill text={statusText} color={color} />
        </div>
        <div style={{ textAlign: 'right', color: '#FFC107' }}>
          <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{amount(item.pCoins)} pCoin</div>
          <div style={{ fontSize: '0.8rem', color: '#999', marginTop: '4px' }}>
            <i className="fas fa-naira-sign" />{amount(item.amount)}
          </div>
        </div>
      </EntryShell>
    );
  }

  if (item.kind === 'gift_claim') {
    return (
      <EntryShell color="#FBBF24">
        <div style={{ flex: 1 }}>
          <div style={{ color: '#999', fontSize: '0.9rem', marginBottom: '8px' }}>
            <i className="fas fa-gift" style={{ color: '#FBBF24', marginRight: '8px' }} />
            <strong style={{ color: '#FFFFFF' }}>Gift Claimed</strong>
          </div>
          <div style={{ color: '#666', fontSize: '0.85rem', marginBottom: '6px' }}>{item.giftName}</div>
          <div style={{ color: '#666', fontSize: '0.85rem' }}>{formatDateTime(item.date)}</div>
          <StatusPill text="Completed" color="#22c55e" />
        </div>
        <div style={{ textAlign: 'right', color: '#FBBF24' }}>
          <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
            +{amount(item.amount)} <i className="fas fa-coins" />
          </div>
        </div>
      </EntryShell>
    );
  }

  if (item.kind === 'bank_details_saved') {
    return (
      <EntryShell color="#4C1D95">
        <div style={{ flex: 1 }}>
          <div style={{ color: '#999', fontSize: '0.9rem', marginBottom: '8px' }}>
            <i className="fas fa-save" style={{ color: '#4C1D95', marginRight: '8px' }} />
            <strong style={{ color: '#FFFFFF' }}>Bank Account Saved</strong>
          </div>
          <div style={{ color: '#666', fontSize: '0.85rem', marginBottom: '6px' }}>
            {item.countryName} • {item.bankName} • {item.accountNumber || '****'}
          </div>
          <div style={{ color: '#666', fontSize: '0.85rem' }}>{formatDateTime(item.date)}</div>
          <StatusPill text="Completed" color="#22c55e" />
        </div>
      </EntryShell>
    );
  }

  const created = item.action === 'created';
  return (
    <EntryShell color="#64C8FF">
      <div style={{ flex: 1 }}>
        <div style={{ color: '#999', fontSize: '0.9rem', marginBottom: '8px' }}>
          <i className={`fas ${created ? 'fa-plus' : 'fa-refresh'}`} style={{ color: '#64C8FF', marginRight: '8px' }} />
          <strong style={{ color: '#FFFFFF' }}>PIN {created ? 'Created' : 'Changed'}</strong>
        </div>
        <div style={{ color: '#666', fontSize: '0.85rem' }}>{formatDateTime(item.date)}</div>
        <StatusPill text="Completed" color="#64C8FF" />
      </div>
    </EntryShell>
  );
}
