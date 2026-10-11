'use client';

import { PoseCategoryCard } from './PoseCards';
import { POSE_SIDEBAR_GROUPS, type PoseCategoryRequest, type PoseTabSeason, type PoseTabVideo } from '@/lib/pose-app/pose-tab';
import type { WatchLaterItem } from '@/lib/pose-app/watch-later';

type SidebarProps = {
  open: boolean;
  onClose: () => void;
  onOpenCategory: (request: PoseCategoryRequest) => void;
  /** `ptUpdateCatWallet()` @31814 — Pose Coin holdings, painted on open. */
  coins: number | null;
  onOpenWallet: () => void;
};

/** `#ptCatOverlay` / `#ptCatSidebar` @25876 with `ptOpenCatSidebar()` @31825. */
export function PoseCategoriesSidebar({ open, onClose, onOpenCategory, coins, onOpenWallet }: SidebarProps) {
  return (
    <>
      <div className={`pt-cat-overlay${open ? ' pt-open' : ''}`} id="ptCatOverlay" onClick={onClose} />
      <aside className={`pt-cat-sidebar${open ? ' pt-open' : ''}`} id="ptCatSidebar">
        <div className="pt-cat-side-head">
          <h3>Categories</h3>
          <button type="button" className="pt-cat-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <div
          className="pt-cat-side-wallet"
          role="button"
          tabIndex={0}
          title="Open Wallet"
          onClick={() => {
            onClose();
            onOpenWallet();
          }}
          onKeyDown={() => {
            onClose();
            onOpenWallet();
          }}
        >
          <div className="pt-cat-side-wallet-icon">
            <i className="fas fa-coins" />
          </div>
          <div className="pt-cat-side-wallet-info">
            <div className="pt-cat-side-wallet-label">Wallet Balance</div>
            <div className="pt-cat-side-wallet-amount" id="ptCatWalletBalance">
              {coins === null ? '—' : `${coins.toLocaleString()} Pose Coin`}
            </div>
          </div>
        </div>
        <div className="pt-cat-side-list">
          {POSE_SIDEBAR_GROUPS.map((group) => (
            <div key={group.section}>
              <div className="pt-cat-side-section">{group.section}</div>
              {group.items.map((entry) => (
                <div
                  key={entry.label}
                  className="pt-cat-side-item"
                  onClick={() => onOpenCategory({ type: entry.type, key: entry.key, title: entry.label })}
                >
                  <i className={`fas ${entry.icon}`} />
                  <span>{entry.label}</span>
                  <i className="fas fa-chevron-right pt-cat-chev" />
                </div>
              ))}
            </div>
          ))}
        </div>
      </aside>
    </>
  );
}

type CategoryProps = {
  open: boolean;
  title: string;
  items: (PoseTabVideo | PoseTabSeason)[];
  isSeason: boolean;
  onClose: () => void;
  onOpen: (item: PoseTabVideo | PoseTabSeason, isSeason: boolean) => void;
};

/** `#ptCatPage` @25972 with `ptOpenCategoryPage()` @31845. */
export function PoseCategoryPage({ open, title, items, isSeason, onClose, onOpen }: CategoryProps) {
  return (
    <div className={`pt-catpage${open ? ' pt-open' : ''}`} id="ptCatPage">
      <div className="pt-catpage-head">
        <button type="button" className="pt-catpage-back" onClick={onClose}>
          <i className="fas fa-arrow-left" />
        </button>
        <h2 id="ptCatPageTitle">{title}</h2>
        <span className="pt-catpage-count" id="ptCatPageCount">
          {items.length ? `${items.length} ${isSeason ? 'series' : 'videos'}` : ''}
        </span>
      </div>
      <div className="pt-catpage-grid" id="ptCatPageGrid">
        {items.length === 0 ? (
          <div className="pt-catpage-empty">No content yet in this category.</div>
        ) : (
          items.map((item, position) => (
            <PoseCategoryCard key={`${item.id}-${position}`} video={item} isSeason={isSeason} onOpen={onOpen} />
          ))
        )}
      </div>
    </div>
  );
}

type WatchLaterProps = {
  open: boolean;
  items: WatchLaterItem[];
  onClose: () => void;
  onRemove: (videoId: string) => void;
  onOpen: (item: WatchLaterItem) => void;
};

/** `#ptWatchLaterPage` @25982 with `ptOpenWatchLaterPage()` @31645. */
export function PoseWatchLaterPage({ open, items, onClose, onRemove, onOpen }: WatchLaterProps) {
  return (
    <div className={`pt-catpage pt-wlpage${open ? ' pt-open' : ''}`} id="ptWatchLaterPage">
      <div className="pt-catpage-head">
        <button type="button" className="pt-catpage-back" onClick={onClose}>
          <i className="fas fa-arrow-left" />
        </button>
        <h2>
          <i className="fas fa-bookmark" style={{ color: 'var(--nr)', marginRight: 8 }} /> Watch Later
        </h2>
        <span className="pt-catpage-count" id="ptWatchLaterCount">
          {items.length ? `${items.length} saved` : ''}
        </span>
      </div>
      <div className="pt-catpage-grid" id="ptWatchLaterGrid">
        {items.length === 0 ? (
          <div className="pt-catpage-empty">
            Your Watch Later list is empty. Tap the <i className="fas fa-plus" /> Watch Later button on the hero to add
            videos.
          </div>
        ) : (
          items.map((item) => (
            <div key={item.videoId} className="pt-catpage-card pt-wl-card" data-vid={item.videoId} onClick={() => onOpen(item)}>
              <button
                type="button"
                className="pt-wl-remove"
                title="Remove from Watch Later"
                onClick={(event) => {
                  event.stopPropagation();
                  onRemove(item.videoId);
                }}
              >
                <i className="fas fa-times" />
              </button>
              {item.thumbnail ? (
                <img className="pt-catpage-thumb" src={item.thumbnail} alt="" loading="lazy" />
              ) : (
                <div className="pt-catpage-thumb bg-[linear-gradient(135deg,#1a3a5c,#2e6aa8)]" />
              )}
              <div className="pt-catpage-info">
                <div className="pt-catpage-title">{item.title}</div>
                <div className="pt-catpage-sub">{[item.channelName, item.category].filter(Boolean).join(' · ')}</div>
                <div className="pt-wl-time">
                  <i className="far fa-clock" /> Saved {item.addedAtMs ? relativeTime(item.addedAtMs) : 'Recently'}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/** `_ptWLRelTime()` @31687 — the "Saved 2d ago" line on a Watch Later card. */
function relativeTime(millis: number): string {
  const minutes = Math.floor(Math.max(0, Date.now() - millis) / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}
