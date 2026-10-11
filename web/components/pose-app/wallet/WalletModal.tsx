'use client';

import { useEffect, useState } from 'react';

import { headerGradient } from '@/lib/pose-app/creator-profile';
import {
  ensureNgnRate,
  POSE_COIN_TO_NAIRA,
  starsToNgn,
  type BankDetails,
  type KycState,
  type WalletHistoryItem,
  type WalletProfile,
} from '@/lib/pose-app/wallet';

import { BankTab } from './BankTab';
import { KycTab } from './KycTab';
import type { PinAction } from './PinModal';
import { SecurityTab } from './SecurityTab';
import { WalletHistory } from './WalletHistory';

export type WalletTab = 'set-bank' | 'history' | 'security' | 'kyc';

type Props = {
  uid: string;
  profile: WalletProfile;
  history: WalletHistoryItem[];
  kyc: KycState | null;
  tab: WalletTab;
  onTab: (tab: WalletTab) => void;
  onClose: () => void;
  onOpenPin: (action: PinAction) => void;
  onForgot: () => void;
  onOpenWithdraw: () => void;
  /** `redirectToWebStore()` @63280 opened the Pose web store in a new tab. */
  onTopUp: () => void;
  onOpenKyc: (tier: number) => void;
  onEmailAlerts: (enabled: boolean) => void;
  onBankSaved: (details: BankDetails) => void;
  onToast: (message: string) => void;
};

const VISIBILITY_KEY = 'walletBalanceHidden';

const TABS: { id: WalletTab; label: string; icon: string }[] = [
  { id: 'set-bank', label: 'Bank', icon: 'university' },
  { id: 'history', label: 'History', icon: 'history' },
  { id: 'security', label: 'Security', icon: 'shield-alt' },
  { id: 'kyc', label: 'KYC', icon: 'id-card' },
];

/**
 * `#walletModal` @73123 behind `openWallet()` @61904 — the balance header, the
 * Pose Star and pending-pool tiles, and the four tabs. The tab bodies live in
 * their own files so the sheet stays readable.
 */
export function WalletModal({
  uid,
  profile,
  history,
  kyc,
  tab,
  onTab,
  onClose,
  onOpenPin,
  onForgot,
  onOpenWithdraw,
  onTopUp,
  onOpenKyc,
  onEmailAlerts,
  onBankSaved,
  onToast,
}: Props) {
  const [hidden, setHidden] = useState(false);
  const [rate, setRate] = useState<number | undefined>(undefined);

  // `applyWalletBalanceVisibilityPref()` @30410 read the same localStorage flag.
  useEffect(() => {
    // Deferred a microtask so the first paint matches the server render and the
    // reads land outside the effect body.
    void Promise.resolve().then(async () => {
      try {
        setHidden(window.localStorage.getItem(VISIBILITY_KEY) === '1');
      } catch {
        /* storage can be blocked; the balance simply starts visible */
      }
      setRate(await ensureNgnRate());
    });
  }, []);

  const toggleHidden = () => {
    const next = !hidden;
    setHidden(next);
    try {
      window.localStorage.setItem(VISIBILITY_KEY, next ? '1' : '0');
    } catch {
      /* the preference simply will not persist */
    }
  };

  const copyWalletId = () => {
    const id = profile.walletId;
    if (!id || id === 'Loading...' || id === 'Generating...') return;
    navigator.clipboard.writeText(id).then(
      () => onToast('Wallet ID copied!'),
      () => onToast('Wallet ID copied!'),
    );
  };

  const naira = (profile.pCoinBalance * POSE_COIN_TO_NAIRA).toLocaleString();

  return (
    <div className="wallet-modal active" role="dialog" aria-modal="true" aria-label="My Wallet">
      <div className="wallet-content">
        <div className="wallet-page-header" style={{ background: headerGradient(uid) }}>
          <button type="button" className="wallet-back-btn" onClick={onClose} aria-label="Back">
            <i className="fas fa-arrow-left" />
          </button>
          <div className="wallet-page-title"><i className="fas fa-wallet" style={{ marginRight: '8px' }} />My Wallet</div>
        </div>

        <div className="wallet-page-body">
          <div className="wallet-header">
            <button type="button" className="wallet-close" onClick={onClose} aria-label="Close">×</button>
          </div>

          <div className={`wallet-balance-display${hidden ? ' balance-hidden' : ''}`}>
            <div className="wallet-id-row">
              <div>
                <span className="wallet-id-label">ID</span>
                <span className="wallet-id-value">{profile.walletId || 'Generating...'}</span>
              </div>
              <button type="button" className="wallet-id-copy-btn" onClick={copyWalletId} aria-label="Copy wallet ID">
                <i className="fas fa-copy" />
              </button>
            </div>

            <div className="wallet-balance-label">
              Total Balance
              <button type="button" className="wallet-eye-btn" onClick={toggleHidden} aria-label="Show or hide balance">
                <i className={`fas ${hidden ? 'fa-eye-slash' : 'fa-eye'}`} />
              </button>
            </div>
            <div className="wallet-balance-amount-wrap">
              <div className="wallet-balance-amount"><i className="fas fa-naira-sign" />{naira}</div>
              <div className="wallet-balance-dots">•••••••</div>
            </div>

            <div className="wallet-coin-pill">
              <div className="wallet-coin-pill-icon">P</div>
              <span>{profile.pCoinBalance.toLocaleString()} Pose Coin</span>
              <small><i className="fas fa-naira-sign" />{POSE_COIN_TO_NAIRA} per pCoin</small>
            </div>

            <div className="wallet-card-actions">
              <button type="button" className="wallet-btn-topup" onClick={onTopUp}>
                <i className="fas fa-plus" /> Top Up
              </button>
              <button type="button" className="wallet-btn-withdraw" onClick={onOpenWithdraw}>
                <i className="fas fa-arrow-up" /> Withdraw
              </button>
            </div>
          </div>

          <div className="wallet-currency-grid">
            <div className="posestar-section">
              <div className="posestar-label"><i className="fas fa-star" /> Pose Star</div>
              <div className="posestar-balance">{profile.poseStarBalance.toLocaleString()} Pose Star</div>
              <div className="wallet-currency-sub">≈ ₦{Math.round(starsToNgn(profile.poseStarBalance, rate)).toLocaleString('en-NG')}</div>
            </div>

            <div className="posestar-section">
              <div className="posestar-label"><i className="fas fa-hourglass-half" /> Pending Views Pool</div>
              <div className="posestar-balance">{profile.pendingPoolStars.toLocaleString(undefined, { maximumFractionDigits: 4 })} Pose Star</div>
              <div className="wallet-currency-sub">≈ ₦{Math.round(starsToNgn(profile.pendingPoolStars, rate)).toLocaleString('en-NG')}</div>
              <div className="wallet-pool-views">{profile.pendingPoolViews.toLocaleString('en-NG')} / 1,000 views accumulated</div>
              <div className="wallet-pool-hint">
                Auto-transfers to your main wallet at 1,000 views, or every 24 hours — whichever comes first.
              </div>
            </div>
          </div>

          <div className="wallet-tabs">
            {TABS.map((entry) => (
              <button
                key={entry.id}
                type="button"
                className={`wallet-tab-btn${tab === entry.id ? ' active' : ''}`}
                onClick={() => onTab(entry.id)}
              >
                <i className={`fas fa-${entry.icon}`} />{entry.label}
              </button>
            ))}
          </div>

          {tab === 'set-bank' ? (
            <BankTab uid={uid} profile={profile} onSaved={onBankSaved} onToast={onToast} />
          ) : null}

          {tab === 'history' ? (
            <div className="wallet-tab-content active" style={{ display: 'block' }}>
              <h3 className="wallet-tab-title">Transaction History</h3>
              <WalletHistory items={history} />
            </div>
          ) : null}

          {tab === 'security' ? (
            <SecurityTab profile={profile} onOpenPin={onOpenPin} onForgot={onForgot} onEmailAlerts={onEmailAlerts} />
          ) : null}

          {tab === 'kyc' ? <KycTab kyc={kyc} onOpenKyc={onOpenKyc} /> : null}
        </div>
      </div>
    </div>
  );
}
