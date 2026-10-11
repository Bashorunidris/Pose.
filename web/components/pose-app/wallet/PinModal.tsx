'use client';

import { useEffect, useRef, useState } from 'react';

import { MAX_PIN_ATTEMPTS, PIN_LENGTH, recordPinEvent, saveWalletPin, verifyWalletPin } from '@/lib/pose-app/wallet';

import { PinInput } from './PinInput';

export type PinAction = 'create' | 'change' | 'verify' | 'reset';

type Props = {
  action: PinAction;
  uid: string;
  onClose: () => void;
  /** `verifyPinBeforeTransaction()` @64016 handed the caller a callback that runs on a match. */
  onVerified?: () => void;
  /** `forgotWalletPin()` @64306 emails a sign-in link that lands back on `?pinReset=1`. */
  onForgot: () => void;
  onToast: (message: string) => void;
};

type Status = { kind: '' | 'error' | 'success'; text: string };

const COPY: Record<PinAction, { title: string; subtitle: string; info: string; submit: string }> = {
  create: {
    title: 'Create Wallet PIN',
    subtitle: 'Set a 6-digit PIN to secure your wallet',
    info: 'Your PIN protects your wallet from unauthorized transactions. Do not share it with anyone!',
    submit: 'Create PIN',
  },
  change: {
    title: 'Change Wallet PIN',
    subtitle: 'Enter your current PIN, then set a new one',
    info: 'Changing your PIN will protect your wallet with a new security code.',
    submit: 'Update PIN',
  },
  verify: {
    title: 'Verify Wallet PIN',
    subtitle: 'Enter your PIN to continue',
    info: 'Your PIN is required to complete this transaction.',
    submit: 'Verify PIN',
  },
  reset: {
    title: 'Set New Wallet PIN',
    subtitle: 'Identity verified via email — set your new PIN',
    info: 'Email verified. Choose a new 6-digit PIN for your wallet.',
    submit: 'Set New PIN',
  },
};

const ALL_SAME = /^(\d)\1{5}$/;

/**
 * `#pinModalOverlay` @73123 behind `openPinModal()` @63717. One sheet serves all
 * four actions. The change action runs as two steps because the legacy asked
 * for the current PIN in its copy ("Enter your current PIN, then set a new
 * one") but then saved a new PIN without ever checking the old one — the port
 * verifies first, which is what the copy always promised.
 */
export function PinModal({ action, uid, onClose, onVerified, onForgot, onToast }: Props) {
  const needsConfirm = action === 'create' || action === 'reset' || action === 'change';
  const [step, setStep] = useState<'current' | 'new'>(action === 'change' ? 'current' : 'new');
  const [pin, setPin] = useState<string[]>(Array(PIN_LENGTH).fill(''));
  const [confirmPin, setConfirmPin] = useState<string[]>(Array(PIN_LENGTH).fill(''));
  const [reveal, setReveal] = useState(false);
  const [status, setStatus] = useState<Status>({ kind: '', text: '' });
  const [busy, setBusy] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const enterNew = () => {
    setPin(Array(PIN_LENGTH).fill(''));
    setConfirmPin(Array(PIN_LENGTH).fill(''));
    setStep('new');
  };

  const currentPin = pin.join('');
  const confirming = step === 'new' && needsConfirm;
  const complete =
    currentPin.length === PIN_LENGTH && (!confirming || confirmPin.join('').length === PIN_LENGTH);

  const handleVerifyCurrent = async () => {
    if (currentPin.length !== PIN_LENGTH) return;
    setBusy(true);
    try {
      const ok = await verifyWalletPin(uid, currentPin);
      if (ok) {
        setStatus({ kind: 'success', text: 'PIN verified. Choose your new PIN.' });
        enterNew();
        return;
      }
      const remaining = MAX_PIN_ATTEMPTS - (attempts + 1);
      setAttempts(attempts + 1);
      if (attempts + 1 >= MAX_PIN_ATTEMPTS) {
        setStatus({ kind: 'error', text: 'Too many failed attempts.' });
        timer.current = setTimeout(() => {
          onClose();
          onToast('Too many failed attempts. Please try again later.');
        }, 1500);
        return;
      }
      setStatus({ kind: 'error', text: `Incorrect PIN. Attempts remaining: ${remaining}` });
      setPin(Array(PIN_LENGTH).fill(''));
    } finally {
      setBusy(false);
    }
  };

  const handleSave = async () => {
    if (currentPin !== confirmPin.join('')) {
      setStatus({ kind: 'error', text: 'PINs do not match. Please try again.' });
      timer.current = setTimeout(() => {
        setPin(Array(PIN_LENGTH).fill(''));
        setConfirmPin(Array(PIN_LENGTH).fill(''));
        setStatus({ kind: '', text: '' });
      }, 1500);
      return;
    }
    if (ALL_SAME.test(currentPin)) {
      setStatus({ kind: 'error', text: 'PIN cannot be all same digits. Try a different PIN.' });
      return;
    }
    setBusy(true);
    try {
      await saveWalletPin(uid, currentPin);
      await recordPinEvent(uid, action === 'create' ? 'created' : 'changed');
      setStatus({
        kind: 'success',
        text: action === 'create' ? 'Wallet PIN created successfully!' : 'Wallet PIN updated successfully!',
      });
      timer.current = setTimeout(onClose, 1500);
    } catch (error) {
      console.error('PIN operation error:', error);
      setStatus({ kind: 'error', text: 'Error. Please try again.' });
    } finally {
      setBusy(false);
    }
  };

  const handleVerify = async () => {
    if (currentPin.length !== PIN_LENGTH) return;
    setBusy(true);
    try {
      const ok = await verifyWalletPin(uid, currentPin);
      if (!ok) {
        const remaining = MAX_PIN_ATTEMPTS - (attempts + 1);
        setAttempts(attempts + 1);
        if (attempts + 1 >= MAX_PIN_ATTEMPTS) {
          setStatus({ kind: 'error', text: 'Too many failed attempts.' });
          timer.current = setTimeout(() => onClose(), 1500);
          return;
        }
        setStatus({ kind: 'error', text: `Incorrect PIN. Attempts remaining: ${remaining}` });
        setPin(Array(PIN_LENGTH).fill(''));
        return;
      }
      setStatus({ kind: 'success', text: 'PIN verified successfully!' });
      timer.current = setTimeout(() => {
        onClose();
        onVerified?.();
      }, 250);
    } finally {
      setBusy(false);
    }
  };

  const submit = () => {
    if (step === 'current') return handleVerifyCurrent();
    if (action === 'verify') return handleVerify();
    return handleSave();
  };

  const copy = COPY[action];
  const showForgot = action === 'verify' || action === 'change';
  const title = step === 'current' ? 'Change Wallet PIN' : copy.title;
  const subtitle =
    step === 'current' ? 'Enter your current PIN, then set a new one' : copy.subtitle;

  return (
    <div className="pin-modal-overlay active" role="dialog" aria-modal="true" aria-label={title}>
      <div className="pin-modal">
        <button type="button" className="pin-modal-close" onClick={onClose} aria-label="Close">×</button>

        <div className="pin-modal-header">
          <div className="pin-modal-title">{title}</div>
          <div className="pin-modal-subtitle">{subtitle}</div>
        </div>

        <div className="pin-info">
          <i className="fas fa-lock" aria-hidden="true" /> {copy.info}
        </div>

        <div className={`pin-status${status.kind ? ` ${status.kind}` : ''}`}>{status.text}</div>

        <PinInput
          value={pin}
          onChange={setPin}
          reveal={reveal}
          autoFocus
          ariaLabel={step === 'current' ? 'Current PIN' : 'PIN'}
        />

        <div className="pin-toggle-visibility">
          <label>
            <input type="checkbox" checked={reveal} onChange={(event) => setReveal(event.target.checked)} />
            Show PIN
          </label>
        </div>

        {showForgot && step === 'current' ? (
          <div style={{ textAlign: 'center', margin: '0.5rem 0 1rem' }}>
            <button
              type="button"
              onClick={onForgot}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#a78bfa', fontSize: '12.5px', fontWeight: 600 }}
            >
              <i className="fas fa-envelope" style={{ marginRight: '5px' }} />Forgot PIN? Verify by email
            </button>
          </div>
        ) : null}

        {confirming ? (
          <div>
            <div className="pin-modal-subtitle" style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>
              Confirm your PIN
            </div>
            <PinInput value={confirmPin} onChange={setConfirmPin} reveal={reveal} variant="confirm" ariaLabel="Confirm PIN" />
          </div>
        ) : null}

        <div className="pin-button-group">
          <button type="button" className="pin-action-btn secondary" onClick={onClose}>Cancel</button>
          <button type="button" className="pin-action-btn primary" onClick={submit} disabled={!complete || busy}>
            {step === 'current' ? 'Continue' : copy.submit}
          </button>
        </div>
      </div>
    </div>
  );
}
