'use client';

import { useState } from 'react';

import { loadPinPayMode, savePinPayMode, type PinPayMode, type WalletProfile } from '@/lib/pose-app/wallet';

import type { PinAction } from './PinModal';

type Props = {
  profile: WalletProfile;
  onOpenPin: (action: PinAction) => void;
  onForgot: () => void;
  onEmailAlerts: (enabled: boolean) => void;
};

const MODES: { id: PinPayMode; title: string; sub: string }[] = [
  { id: 'always', title: 'Always ask', sub: 'PIN required for every payment' },
  { id: '5min', title: 'Ask once every 5 minutes', sub: 'PIN skipped for 5 mins after entering it' },
  { id: 'never', title: 'Never ask', sub: 'No PIN needed for payments (less secure)' },
];

/**
 * The `security` tab behind `updatePinStatus()` @64046, `handlePinAction()`
 * @64022, `savePinPayMode()` @64091 and `setEmailAlertsEnabled()` @64402. The
 * PIN's age used to be unknowable because nothing wrote `pinHistory`; the port
 * records an event on create and reset, so the history tab has something to show.
 */
export function SecurityTab({ profile, onOpenPin, onForgot, onEmailAlerts }: Props) {
  const [mode, setMode] = useState<PinPayMode>(() => loadPinPayMode());
  const hasPin = Boolean(profile.walletPin);

  const chooseMode = (next: PinPayMode) => {
    setMode(next);
    savePinPayMode(next);
  };

  return (
    <div className="wallet-tab-content active" style={{ display: 'block' }}>
      <h3 className="wallet-tab-title"><i className="fas fa-shield-alt" />Wallet Security</h3>

      <div className="wallet-card wallet-card-accent">
        <div className="wallet-card-title"><i className="fas fa-lock" />PIN Protection</div>
        <p className="wallet-card-text" style={{ margin: 0 }}>
          A 6-digit PIN secures your wallet. Set how often it is required for payments below.
        </p>
      </div>

      <div className="wallet-card" style={{ borderLeft: `4px solid ${hasPin ? '#22c55e' : '#f59e0b'}` }}>
        <div style={{ color: '#9a94b8', fontWeight: 700, fontSize: '11.5px', textTransform: 'uppercase', letterSpacing: '.6px', marginBottom: '8px' }}>
          PIN Status
        </div>
        {hasPin ? (
          <>
            <div style={{ color: '#22c55e', marginBottom: '0.5rem' }}>
              <i className="fas fa-check-circle" style={{ marginRight: '5px' }} />PIN is Active
            </div>
            <div style={{ color: '#999', fontSize: '0.9rem' }}>
              Created: {profile.walletPinCreatedAt ? new Date(profile.walletPinCreatedAt).toLocaleDateString() : 'Unknown'}
            </div>
          </>
        ) : (
          <>
            <div style={{ color: '#f59e0b' }}>
              <i className="fas fa-exclamation-circle" style={{ marginRight: '5px' }} />PIN Not Set
            </div>
            <div style={{ color: '#999', fontSize: '0.9rem' }}>Secure your wallet by creating a PIN</div>
          </>
        )}
      </div>

      <button type="button" className="wallet-submit-btn" onClick={() => onOpenPin(hasPin ? 'change' : 'create')} style={{ marginBottom: '0.9rem' }}>
        <i className={hasPin ? 'fas fa-sync-alt' : 'fas fa-key'} style={{ marginRight: '8px' }} />
        {hasPin ? 'Change PIN' : 'Create PIN'}
      </button>

      <div style={{ textAlign: 'center', marginBottom: '1.4rem' }}>
        <button
          type="button"
          onClick={onForgot}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#a78bfa', fontSize: '12.5px', fontWeight: 600 }}
        >
          <i className="fas fa-envelope" style={{ marginRight: '5px' }} />Forgot PIN? Reset via email
        </button>
      </div>

      <div className="wallet-card">
        <div className="wallet-card-title" style={{ marginBottom: '4px' }}><i className="fas fa-sliders-h" />PIN Required For Payments</div>
        <div style={{ color: '#6b6b80', fontSize: '11.5px', marginBottom: '12px' }}>
          Choose when your PIN is asked before sending gifts or buying content
        </div>
        {MODES.map((entry) => (
          <label key={entry.id} className="wallet-radio-option">
            <input type="radio" name="pinPayMode" checked={mode === entry.id} onChange={() => chooseMode(entry.id)} />
            <div>
              <div className="wallet-radio-title">{entry.title}</div>
              <div className="wallet-radio-sub">{entry.sub}</div>
            </div>
          </label>
        ))}
      </div>

      <div className="wallet-card wallet-toggle-row">
        <div>
          <div className="wallet-card-title" style={{ marginBottom: '4px' }}>
            <i className="fas fa-envelope-open-text" />Email Security Alerts
          </div>
          <div style={{ color: '#6b6b80', fontSize: '11.5px' }}>
            Get notified at your sign-up email when your PIN changes or a withdrawal is requested
          </div>
        </div>
        <label className="rec-toggle-switch" style={{ flexShrink: 0 }}>
          <input type="checkbox" checked={profile.emailAlertsEnabled} onChange={(event) => onEmailAlerts(event.target.checked)} />
          <span className="rec-toggle-slider" />
        </label>
      </div>

      <div className="wallet-card wallet-card-warn">
        <div style={{ color: '#d97706', fontWeight: 700, fontSize: '12.5px', marginBottom: '0.7rem' }}>
          <i className="fas fa-exclamation-triangle" style={{ marginRight: '6px' }} />Important
        </div>
        <ul style={{ color: '#9a94b8', fontSize: '12px', lineHeight: 1.8, margin: 0, paddingLeft: '1.3rem' }}>
          <li>Never share your PIN with anyone</li>
          <li>You can change your PIN anytime from this screen</li>
          <li>Forgotten PINs can be reset via a secure link sent to your email</li>
        </ul>
      </div>
    </div>
  );
}
