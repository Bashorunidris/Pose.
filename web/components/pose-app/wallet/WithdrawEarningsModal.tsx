'use client';

import { useState } from 'react';

import {
  ewLimits,
  logSecurityAlert,
  POSE_COIN_TO_NAIRA,
  submitWithdrawalRequest,
  type EarningsCurrency,
  type WalletProfile,
} from '@/lib/pose-app/wallet';

type Props = {
  uid: string;
  profile: WalletProfile;
  profileName: string;
  profileUsername: string;
  profileEmail: string;
  onClose: () => void;
  /** `switchWalletTab('set-bank')` @63441 — the sheet closes and switches tab. */
  onChangeBank: () => void;
  /** `verifyPinBeforeTransaction()` @64016 gates the request behind the PIN sheet. */
  onRequestPin: (onVerified: () => void) => void;
  onSubmitted: () => void;
};

type Status = { kind: '' | 'warning' | 'error' | 'success'; text: string };

/**
 * `#earningsWithdrawalModalOverlay` @73413 behind `openEarningsWithdrawalModal()`
 * @63328, `selectEarningsCurrency()` @63364, `ewValidateAmount()` @63384 and
 * `submitEarningsWithdrawal()` @63411. One flow for both currencies, no fees,
 * and the PIN is required before the request document is ever written.
 */
export function WithdrawEarningsModal({
  uid,
  profile,
  profileName,
  profileUsername,
  profileEmail,
  onClose,
  onChangeBank,
  onRequestPin,
  onSubmitted,
}: Props) {
  const [currency, setCurrency] = useState<EarningsCurrency>('poseCoin');
  const [amountText, setAmountText] = useState('');
  const [status, setStatus] = useState<Status>({ kind: '', text: '' });
  const [busy, setBusy] = useState(false);

  const balance = currency === 'poseCoin' ? profile.pCoinBalance : profile.poseStarBalance;
  const label = currency === 'poseCoin' ? 'Pose Coin' : 'Pose Star';
  const limits = ewLimits(currency, profile.withdrawalLimit);
  const parsed = Number.parseFloat(amountText) || 0;

  const validate = (value: number): Status => {
    if (value <= 0) return { kind: '', text: '' };
    if (value > balance) return { kind: 'warning', text: `Insufficient balance. You have ${balance.toLocaleString()} ${label}.` };
    if (value < limits.min) return { kind: 'warning', text: `Minimum withdrawal is ${limits.min.toLocaleString()} ${label}.` };
    if (value > limits.max) return { kind: 'warning', text: `Maximum withdrawal is ${limits.max.toLocaleString()} ${label}.` };
    return { kind: '', text: '' };
  };

  const onAmount = (value: string) => {
    setAmountText(value);
    setStatus(validate(Number.parseFloat(value) || 0));
  };

  const submit = () => {
    if (!parsed || parsed <= 0) return setStatus({ kind: 'error', text: 'Please enter a valid amount' });
    if (parsed < limits.min) return setStatus({ kind: 'error', text: `Minimum withdrawal is ${limits.min.toLocaleString()} ${label}` });
    if (parsed > limits.max) return setStatus({ kind: 'error', text: `Maximum withdrawal per request is ${limits.max.toLocaleString()} ${label}` });
    if (parsed > balance) return setStatus({ kind: 'error', text: `Insufficient balance. You have ${balance.toLocaleString()} ${label}.` });
    if (!profile.bankDetails) return setStatus({ kind: 'error', text: 'Please set your bank details first' });

    onRequestPin(() => {
      void (async () => {
        setBusy(true);
        try {
          await submitWithdrawalRequest(uid, currency, parsed, balance, profile.bankDetails!, {
            name: profileName,
            username: profileUsername,
            email: profileEmail,
          });
          await logSecurityAlert(uid, profileEmail, 'withdrawal', `Withdrawal requested: ${parsed} ${label}`);
          setStatus({ kind: 'success', text: 'Withdrawal request submitted! We will review and pay out to your bank account.' });
          setAmountText('');
          onSubmitted();
          setTimeout(onClose, 2000);
        } catch (error) {
          console.error('Error submitting earnings withdrawal request:', error);
          setStatus({ kind: 'error', text: 'Could not submit request. Please try again.' });
        } finally {
          setBusy(false);
        }
      })();
    });
  };

  const bank = profile.bankDetails;

  return (
    <div className="withdrawal-modal-overlay active" role="dialog" aria-modal="true" aria-label="Withdraw earnings">
      <div className="withdrawal-modal-content">
        <button type="button" className="withdrawal-modal-close" onClick={onClose} aria-label="Close">×</button>

        <div className="withdrawal-modal-header">
          <h2 style={{ color: '#FFFFFF', marginBottom: '0.5rem' }}><i className="fas fa-star" style={{ marginRight: '8px' }} />Withdraw Earnings</h2>
          <p style={{ color: '#999', fontSize: '0.9rem' }}>Withdraw your Pose Star or Pose Coin balance to your bank account</p>
        </div>

        <div className="withdrawal-form">
          <div className="withdrawal-form-group">
            <label className="withdrawal-form-label">Withdraw From</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <button type="button" className={`ew-currency-tab${currency === 'poseCoin' ? ' active' : ''}`} onClick={() => { setCurrency('poseCoin'); setStatus({ kind: '', text: '' }); }}>
                <div><i className="fas fa-coins" style={{ color: '#FFD700' }} /> Pose Coin</div>
              </button>
              <button type="button" className={`ew-currency-tab ew-currency-tab-star${currency === 'poseStar' ? ' active' : ''}`} onClick={() => { setCurrency('poseStar'); setStatus({ kind: '', text: '' }); }}>
                <div><i className="fas fa-star" style={{ color: '#fbbf24' }} /> Pose Star</div>
              </button>
            </div>
          </div>

          <div className="withdrawal-form-group">
            <label className="withdrawal-form-label">Available Balance</label>
            <div style={{ color: '#c4b5fd', fontSize: '1.8rem', fontWeight: 900 }}>
              {balance.toLocaleString()} {label}
            </div>
          </div>

          <div className="withdrawal-form-group">
            <label className="withdrawal-form-label">Amount to Withdraw</label>
            <div className="withdrawal-amount-input-wrapper">
              <input
                type="number"
                className="withdrawal-amount-input"
                placeholder={`Min ${limits.min.toLocaleString()} - Max ${limits.max.toLocaleString()}`}
                min={limits.min}
                max={limits.max}
                value={amountText}
                onChange={(event) => onAmount(event.target.value)}
                style={{ paddingLeft: '1rem' }}
              />
            </div>
            <div className="withdrawal-form-info">
              Minimum {limits.min.toLocaleString()} · Maximum {limits.max.toLocaleString()} {label} per request. No charges.
            </div>
          </div>

          <div className="withdrawal-form-group" style={{ background: '#0a0a0a', padding: '1rem', borderRadius: '10px', border: '2px solid #333' }}>
            <div style={{ color: '#999', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Saved Bank Details:</div>
            <div style={{ color: '#FFFFFF', fontWeight: 700 }}>
              <div style={{ marginBottom: '0.5rem' }}>Bank: {bank?.bankName ?? '-'}</div>
              <div style={{ marginBottom: '0.5rem' }}>Account: {bank ? `**** ${bank.accountNumber.slice(-4)}` : '****'}</div>
              <div>Name: {bank?.accountName ?? '-'}</div>
            </div>
            <button
              type="button"
              onClick={onChangeBank}
              style={{ marginTop: '1rem', padding: '0.5rem 1rem', background: 'transparent', color: '#c4b5fd', border: '2px solid #4C1D95', borderRadius: '6px', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem' }}
            >
              Change Bank Account
            </button>
          </div>

          {status.kind ? (
            <div className={`withdrawal-status ${status.kind}`} style={{ display: 'block' }}>{status.text}</div>
          ) : null}

          <button type="button" className="withdrawal-pay-btn" onClick={submit} disabled={busy} style={{ background: 'linear-gradient(135deg, #fbbf24 0%, #7c3aed 55%, #22c55e 100%)', color: '#0a0a0a' }}>
            {busy ? 'Submitting request...' : 'Request Withdrawal'}
          </button>

          <div className="withdrawal-info-box">
            <p style={{ color: '#999', fontSize: '0.85rem', lineHeight: 1.6 }}>
              <span style={{ fontWeight: 700 }}>One withdrawal method, no charges.</span><br />
              Your PIN is required to confirm. Requests are reviewed and paid out to your saved bank account.
              {` Pose Coin pays out at ₦${POSE_COIN_TO_NAIRA} each.`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
