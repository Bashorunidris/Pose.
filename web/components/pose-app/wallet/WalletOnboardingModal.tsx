'use client';

import { useEffect, useRef, useState } from 'react';
import { collection, doc, getDocs, limit, query, setDoc, where } from 'firebase/firestore';

import { getPoseFirebase } from '@/lib/firebase';
import { hashPin, PIN_LENGTH, WO_COUNTRIES, woDialFor } from '@/lib/pose-app/wallet';

import { PinInput } from './PinInput';

type Props = {
  uid: string;
  /** `submitWalletOnboarding()` @64240 stamped the PIN change on the user document. */
  onDone: () => void;
  /** `closeWalletOnboardingModal()` @64235 also closed the wallet behind it. */
  onClose: () => void;
};

const ALL_SAME = /^(\d)\1{5}$/;

/**
 * `#walletOnboardingModalOverlay` @73551 behind `openWalletOnboardingModal()`
 * @64219 — the mandatory first-time step where the phone number becomes the
 * wallet ID and a PIN is set in the same pass.
 */
export function WalletOnboardingModal({ uid, onDone, onClose }: Props) {
  const [countryCode, setCountryCode] = useState('NG');
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState<string[]>(Array(PIN_LENGTH).fill(''));
  const [confirmPin, setConfirmPin] = useState<string[]>(Array(PIN_LENGTH).fill(''));
  const [status, setStatus] = useState<{ kind: '' | 'error' | 'success'; text: string }>({ kind: '', text: '' });
  const [busy, setBusy] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const dial = woDialFor(countryCode);
  const localDigits = phone.replace(/\D/g, '');
  const pinValue = pin.join('');
  const confirmValue = confirmPin.join('');
  const complete =
    localDigits.length >= 6 && localDigits.length <= 12 && pinValue.length === PIN_LENGTH && confirmValue.length === PIN_LENGTH;

  const submit = async () => {
    if (!complete || busy) return;
    if (pinValue !== confirmValue) {
      setStatus({ kind: 'error', text: 'PINs do not match. Please try again.' });
      return;
    }
    if (ALL_SAME.test(pinValue)) {
      setStatus({ kind: 'error', text: 'PIN cannot be all same digits.' });
      return;
    }

    setBusy(true);
    setStatus({ kind: '', text: 'Checking phone number...' });
    try {
      const { db } = getPoseFirebase();
      const walletId = dial + localDigits;
      const duplicate = await getDocs(
        query(collection(db, 'users'), where('walletId', '==', walletId), limit(2)),
      );
      if (duplicate.docs.some((entry) => entry.id !== uid)) {
        setStatus({ kind: 'error', text: 'This phone number is already linked to another wallet.' });
        return;
      }

      await setDoc(
        doc(db, 'users', uid),
        {
          walletId,
          phone: walletId,
          walletPin: hashPin(pinValue),
          walletPinCreatedAt: new Date().toISOString(),
        },
        { merge: true },
      );

      setStatus({ kind: 'success', text: 'Wallet secured! Your phone number is now your wallet ID.' });
      timer.current = setTimeout(onDone, 1200);
    } catch (error) {
      console.error('Wallet onboarding error:', error);
      setStatus({ kind: 'error', text: 'Error saving details. Please try again.' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="pin-modal-overlay active" role="dialog" aria-modal="true" aria-label="Secure your wallet">
      <div className="pin-modal">
        <button type="button" className="pin-modal-close" onClick={onClose} aria-label="Close">×</button>

        <div className="pin-modal-header">
          <div className="pin-modal-title">Secure Your Wallet</div>
          <div className="pin-modal-subtitle">Add your phone number and create a PIN to continue</div>
        </div>

        <div className="pin-info">
          <i className="fas fa-lock" aria-hidden="true" /> Your phone number becomes your wallet ID and your PIN protects it from unauthorized transactions.
        </div>

        <div className={`pin-status${status.kind ? ` ${status.kind}` : ''}`}>{status.text}</div>

        <label className="kyc-form-label" style={{ display: 'block', marginBottom: '6px' }}>Country</label>
        <select
          className="kyc-form-input"
          value={countryCode}
          onChange={(event) => setCountryCode(event.target.value)}
          style={{ marginBottom: '1rem' }}
        >
          {WO_COUNTRIES.map((country) => (
            <option key={country.code} value={country.code}>
              {country.name} (+{country.dial})
            </option>
          ))}
        </select>

        <label className="kyc-form-label" style={{ display: 'block', marginBottom: '6px' }}>Phone Number</label>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '1.25rem' }}>
          <div
            style={{
              flex: '0 0 auto',
              display: 'flex',
              alignItems: 'center',
              background: '#1a1a2e',
              border: '1px solid #333',
              borderRadius: '10px',
              padding: '0 14px',
              color: '#c4b5fd',
              fontSize: '14px',
              fontWeight: 700,
            }}
          >
            +{dial}
          </div>
          <input
            className="kyc-form-input"
            type="tel"
            placeholder="800 000 0000"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            style={{ marginBottom: 0, flex: 1 }}
          />
        </div>

        <div className="pin-modal-subtitle" style={{ marginBottom: '0.75rem' }}>Create a 6-digit PIN</div>
        <PinInput value={pin} onChange={setPin} ariaLabel="PIN" />

        <div className="pin-modal-subtitle" style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>Confirm your PIN</div>
        <PinInput value={confirmPin} onChange={setConfirmPin} variant="confirm" ariaLabel="Confirm PIN" />

        <div className="pin-button-group">
          <button type="button" className="pin-action-btn primary" onClick={submit} disabled={!complete || busy} style={{ width: '100%' }}>
            Secure My Wallet
          </button>
        </div>
      </div>
    </div>
  );
}
