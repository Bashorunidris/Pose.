'use client';

import { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';

import { getPoseFirebase } from '@/lib/firebase';
import type { ChannelData } from '@/lib/channel-dashboard/types';

export type PayMethod = 'auto' | 'manual';

/** `isPayMethodChangeLocked()` — the payout method is frozen from the 26th on. */
export function isPayMethodChangeLocked(today = new Date()): boolean {
  return today.getDate() > 25;
}

type Props = {
  channelId: string;
  channel: ChannelData | null;
  method: PayMethod;
  onMethodChange: (method: PayMethod) => void;
  onClose: () => void;
  /** Fired after the bank details are persisted, so the withdraw popup re-reads them. */
  onSaved: () => void;
};

/** `#payMethodPopup` — the bank details form that `loadPaymentDetails()` filled. */
export function PaymentMethodPopup({ channelId, channel, method, onMethodChange, onClose, onSaved }: Props) {
  // The legacy popup read the saved details out of the channel doc on open; the
  // popup is only mounted while it is open, so the mount values are current.
  const [acctNum, setAcctNum] = useState(() => String(channel?.bankAcctNum ?? ''));
  const [acctName, setAcctName] = useState(() => String(channel?.bankAcctName ?? ''));
  const [bankName, setBankName] = useState(() => String(channel?.bankName ?? ''));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const locked = isPayMethodChangeLocked();

  async function save() {
    const trimmedNum = acctNum.trim();
    const trimmedName = acctName.trim();
    const trimmedBank = bankName.trim();

    if (!trimmedNum || !trimmedName || !trimmedBank) {
      setError('Please fill in all bank details.');
      return;
    }
    if (trimmedNum.length < 10) {
      setError('Account number must be 10 digits.');
      return;
    }

    setError('');
    setSaving(true);
    try {
      await updateDoc(doc(getPoseFirebase().db, 'channels', channelId), {
        paymentMethod: method,
        bankAcctNum: trimmedNum,
        bankAcctName: trimmedName,
        bankName: trimmedBank,
      });
      setSaved(true);
      onSaved();
      setTimeout(() => setSaved(false), 4000);
    } catch (saveError) {
      setError(`Failed to save: ${(saveError as Error).message}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div id="payMethodPopup" className="earn-popup-overlay" onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div className="earn-popup-card">
        <div className="uppop-handle" />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: '20px', fontWeight: 700, color: 'var(--text-main)' }}>
            <i className="fas fa-building-columns" style={{ marginRight: '6px', color: 'var(--purple-main)' }} /> Payment Method
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '20px', color: 'var(--gray-400)', cursor: 'pointer', padding: '4px' }}><i className="fas fa-times" /></button>
        </div>
        <div style={{ fontSize: '12px', color: 'var(--gray-400)', marginBottom: '18px' }}>Choose how you receive your earnings</div>

        {locked ? (
          <div id="pmDateWarning" style={{ background: '#FEF2F2', border: '1.5px solid #FECACA', borderRadius: '12px', padding: '12px 14px', marginBottom: '16px' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#DC2626' }}><i className="fas fa-lock" style={{ marginRight: '4px' }} /> Payment method changes are locked</div>
            <div style={{ fontSize: '11px', color: '#991B1B', marginTop: '4px' }}>You can only change your payment method between the <b>1st and 25th</b> of each month.</div>
          </div>
        ) : null}

        <div style={{ display: 'flex', gap: '0', background: 'var(--gray-100)', borderRadius: '12px', padding: '4px', marginBottom: '20px' }}>
          <div className={`pay-method-tab${method === 'auto' ? ' active' : ''}${locked ? ' locked' : ''}`} onClick={() => { if (!locked) onMethodChange('auto'); }}>
            <i className="fas fa-clock" style={{ marginRight: '5px' }} />Auto Monthly
          </div>
          <div className={`pay-method-tab${method === 'manual' ? ' active' : ''}${locked ? ' locked' : ''}`} onClick={() => { if (!locked) onMethodChange('manual'); }}>
            <i className="fas fa-hand-holding-dollar" style={{ marginRight: '5px' }} />Manual Request
          </div>
        </div>

        {method === 'auto' ? (
          <div style={{ background: 'var(--purple-ghost)', border: '1.5px solid var(--purple-pale)', borderRadius: '12px', padding: '14px 16px', marginBottom: '18px' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--purple-deep)', marginBottom: '4px' }}><i className="fas fa-info-circle" style={{ marginRight: '4px' }} /> Automatic Transfer</div>
            <div style={{ fontSize: '12px', color: 'var(--gray-500)', lineHeight: 1.5 }}>Your earnings are automatically sent to your bank on the <b>25th of every month</b>. Minimum payout: ₦5,000.</div>
          </div>
        ) : (
          <div style={{ background: '#FEF3C7', border: '1.5px solid #FDE68A', borderRadius: '12px', padding: '14px 16px', marginBottom: '18px' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#92400E', marginBottom: '4px' }}><i className="fas fa-info-circle" style={{ marginRight: '4px' }} /> Manual Request</div>
            <div style={{ fontSize: '12px', color: 'var(--gray-500)', lineHeight: 1.5 }}>Withdraw anytime using the <b>Withdraw</b> button. Minimum: ₦2,000. Fees apply.</div>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label htmlFor="pmAcctNum" style={{ fontSize: '12px', fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '6px', display: 'block' }}>Account Number</label>
            <input id="pmAcctNum" type="text" maxLength={10} placeholder="e.g. 0123456789" className="earn-input" value={acctNum} onChange={(event) => setAcctNum(event.target.value)} />
          </div>
          <div>
            <label htmlFor="pmAcctName" style={{ fontSize: '12px', fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '6px', display: 'block' }}>Account Name</label>
            <input id="pmAcctName" type="text" placeholder="e.g. John Doe" className="earn-input" value={acctName} onChange={(event) => setAcctName(event.target.value)} />
          </div>
          <div>
            <label htmlFor="pmBankName" style={{ fontSize: '12px', fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '6px', display: 'block' }}>Bank Name</label>
            <input id="pmBankName" type="text" placeholder="e.g. Access Bank" className="earn-input" value={bankName} onChange={(event) => setBankName(event.target.value)} />
          </div>
        </div>

        {error ? (
          <div style={{ marginTop: '12px', background: '#FEF2F2', border: '1.5px solid #FECACA', borderRadius: '10px', padding: '10px 14px', fontSize: '12px', color: '#991B1B' }}>
            <i className="fas fa-triangle-exclamation" style={{ marginRight: '5px' }} />{error}
          </div>
        ) : null}

        <button onClick={() => void save()} disabled={saving} className="earn-primary-btn" style={{ marginTop: '18px' }}>
          {saving ? <><i className="fas fa-spinner fa-spin" style={{ marginRight: '6px' }} /> Saving…</> : <><i className="fas fa-save" style={{ marginRight: '6px' }} /> Save Payment Details</>}
        </button>

        {saved ? (
          <div style={{ marginTop: '12px', textAlign: 'center' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#ECFDF5', color: '#059669', fontSize: '12px', fontWeight: 600, padding: '7px 16px', borderRadius: '20px', border: '1px solid #A7F3D0' }}>
              <i className="fas fa-check-circle" /> Payment details saved
            </span>
          </div>
        ) : null}
      </div>
    </div>
  );
}
