'use client';

import { useMemo, useState } from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

import { getPoseFirebase } from '@/lib/firebase';
import {
  buildWithdrawChips,
  getWithdrawFee,
  MIN_WITHDRAWAL,
  PAID_VIEW_COPY,
  type PaidBreakdown,
} from '@/lib/channel-dashboard/earnings';
import type { ChannelData } from '@/lib/channel-dashboard/types';

type Props = {
  channelId: string;
  channel: ChannelData | null;
  balance: number;
  paid: PaidBreakdown;
  payMethod: 'auto' | 'manual';
  onClose: () => void;
  onSubmitted: () => void;
  onToast: (message: string) => void;
};

const money = (value: number) => `₦${Math.round(value).toLocaleString('en-NG')}`;

/** `#withdrawPopup` — the manual payout request, fees and all. */
export function WithdrawPopup({ channelId, channel, balance, paid, payMethod, onClose, onSubmitted, onToast }: Props) {
  const [raw, setRaw] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const acctNum = String(channel?.bankAcctNum ?? '');
  const acctName = String(channel?.bankAcctName ?? '');
  const bankName = String(channel?.bankName ?? '');
  const hasBank = acctNum.length >= 10 && Boolean(acctName) && Boolean(bankName);

  const amount = Number(raw) || 0;
  const fee = getWithdrawFee(amount);
  const receive = Math.max(0, amount - fee);
  const chips = useMemo(() => buildWithdrawChips(balance), [balance]);

  let error = '';
  if (amount > 0 && amount < MIN_WITHDRAWAL) error = `Minimum withdrawal is ${money(MIN_WITHDRAWAL)}`;
  else if (amount > balance) error = `Amount exceeds your balance of ${money(balance)}`;

  const valid = !error && amount >= MIN_WITHDRAWAL && hasBank;
  const canSubmit = valid && payMethod === 'manual' && !submitting;

  async function submit() {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      await addDoc(collection(getPoseFirebase().db, 'channels', channelId, 'withdrawals'), {
        amount,
        fee,
        netAmount: receive,
        bankAcctName: acctName,
        bankAcctNum: acctNum,
        bankName,
        paymentMethod: payMethod,
        status: 'pending',
        requestedAt: serverTimestamp(),
      });
      onSubmitted();
      onClose();
      onToast('Withdrawal request submitted. You will be notified once it is processed.');
    } catch (submitError) {
      onToast(`Failed to submit request: ${(submitError as Error).message}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div id="withdrawPopup" className="earn-popup-overlay" onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div className="earn-popup-card">
        <div className="uppop-handle" />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: '20px', fontWeight: 700, color: 'var(--text-main)' }}>
            <i className="fas fa-wallet" style={{ marginRight: '6px', color: '#059669' }} /> Withdraw Earnings
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '20px', color: 'var(--gray-400)', cursor: 'pointer', padding: '4px' }}><i className="fas fa-times" /></button>
        </div>

        <div style={{ margin: '16px 0', background: 'linear-gradient(135deg,var(--purple-deep),var(--purple-main))', borderRadius: '16px', padding: '20px', textAlign: 'center', color: 'white' }}>
          <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.7, marginBottom: '6px' }}>Available Balance</div>
          <div id="wdBalance" style={{ fontFamily: "'Playfair Display',serif", fontSize: '36px', fontWeight: 700 }}>{money(balance)}</div>
        </div>

        <div style={{ margin: '10px 0 12px', borderRadius: '11px', padding: '11px 13px', fontSize: '11.5px', lineHeight: 1.5, ...(paid.locked > 0
          ? { background: '#FFFBEB', border: '1px solid #FDE68A', color: '#92400E' }
          : { background: '#ECFDF5', border: '1px solid #A7F3D0', color: '#065F46' }) }}
        >
          {paid.locked > 0 ? (
            <>
              <div style={{ fontWeight: 800, marginBottom: '6px', color: '#78350F' }}>
                <i className="fas fa-lock" style={{ marginRight: '5px' }} />{money(paid.locked)} locked in pools
              </div>
              <div>
                • <b>Paid Videos</b> have {money(paid.locked)} sitting in the pool — releases once each video
                passes <b>{PAID_VIEW_COPY} views</b>, every <b>5 hours</b>.
              </div>
            </>
          ) : (
            <span><b><i className="fas fa-circle-check" style={{ marginRight: '5px' }} />All requirements met.</b> Your full balance is available.</span>
          )}
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label htmlFor="wdAmountInput" style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.6px', color: 'var(--gray-500)', display: 'block', marginBottom: '8px' }}>
            <i className="fas fa-coins" style={{ marginRight: '5px', color: 'var(--purple-main)' }} />Amount to Withdraw
          </label>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '16px', fontWeight: 700, color: 'var(--gray-400)' }}>₦</span>
            <input
              id="wdAmountInput"
              type="number"
              min={MIN_WITHDRAWAL}
              placeholder="0"
              value={raw}
              onChange={(event) => setRaw(event.target.value)}
              style={{ width: '100%', padding: '13px 14px 13px 30px', borderRadius: '12px', border: '1.5px solid var(--gray-200)', fontSize: '20px', fontWeight: 700, fontFamily: "'Playfair Display',serif", color: 'var(--purple-deep)', outline: 'none', boxSizing: 'border-box', transition: 'border .2s' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '7px', marginTop: '10px', flexWrap: 'wrap' }}>
            {chips.map((chip) => (
              <div
                key={`${chip.label}-${chip.amount}`}
                className={`wd-chip${chip.isMax ? ' max-chip' : ''}${amount === chip.amount ? ' active' : ''}`}
                onClick={() => setRaw(String(chip.amount))}
              >
                {chip.label}
              </div>
            ))}
          </div>

          {error ? (
            <div style={{ fontSize: '11.5px', color: 'var(--red)', marginTop: '6px', fontWeight: 600 }}>
              <i className="fas fa-triangle-exclamation" style={{ marginRight: '4px' }} />{error}
            </div>
          ) : null}
        </div>

        {hasBank ? (
          <div style={{ background: 'var(--gray-50)', border: '1.5px solid var(--gray-200)', borderRadius: '12px', padding: '14px 16px', marginBottom: '16px' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--gray-500)', marginBottom: '8px' }}>Sending to:</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)' }}>{acctName}</div>
              <div style={{ fontSize: '13px', color: 'var(--gray-500)' }}>{acctNum}</div>
              <div style={{ fontSize: '12px', color: 'var(--gray-400)' }}>{bankName}</div>
            </div>
          </div>
        ) : (
          <div style={{ background: '#FEF2F2', border: '1.5px solid #FECACA', borderRadius: '12px', padding: '14px', marginBottom: '16px', textAlign: 'center' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#DC2626', marginBottom: '4px' }}><i className="fas fa-triangle-exclamation" style={{ marginRight: '4px' }} /> No bank account set up</div>
            <div style={{ fontSize: '12px', color: '#991B1B' }}>Go to <b>Payment Method</b> to add your bank details first.</div>
          </div>
        )}

        {amount > 0 ? (
          <div style={{ background: 'var(--purple-ghost)', border: '1.5px solid var(--purple-pale)', borderRadius: '12px', padding: '14px 16px', marginBottom: '16px' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--purple-deep)', marginBottom: '8px' }}><i className="fas fa-receipt" style={{ marginRight: '4px' }} /> Fee Breakdown</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--gray-600)', marginBottom: '4px' }}>
              <span>Withdrawal Amount</span><span>{money(amount)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--gray-600)', marginBottom: '4px' }}>
              <span>Processing Fee</span><span>{money(fee)}</span>
            </div>
            <div style={{ borderTop: '1px solid var(--purple-pale)', marginTop: '8px', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 700, color: 'var(--purple-deep)' }}>
              <span>You Receive</span><span>{money(receive)}</span>
            </div>
          </div>
        ) : null}

        {amount > 0 && amount < MIN_WITHDRAWAL ? (
          <div style={{ background: '#FEF3C7', border: '1.5px solid #FDE68A', borderRadius: '10px', padding: '10px 14px', marginBottom: '16px', fontSize: '12px', color: '#92400E', textAlign: 'center' }}>
            <i className="fas fa-info-circle" style={{ marginRight: '4px' }} /> Minimum withdrawal is {money(MIN_WITHDRAWAL)}
          </div>
        ) : null}

        {payMethod !== 'manual' && hasBank ? (
          <div style={{ background: '#FEF3C7', border: '1.5px solid #FDE68A', borderRadius: '10px', padding: '10px 14px', marginBottom: '16px', fontSize: '12px', color: '#92400E', textAlign: 'center' }}>
            <i className="fas fa-info-circle" style={{ marginRight: '4px' }} /> Switch payment method to &quot;Manual Request&quot; to withdraw
          </div>
        ) : null}

        <button
          onClick={() => void submit()}
          disabled={!canSubmit}
          className="earn-primary-btn"
          style={{ background: 'linear-gradient(135deg,#059669,#10B981)', boxShadow: '0 4px 14px rgba(5,150,105,.3)' }}
        >
          {submitting
            ? <><i className="fas fa-spinner fa-spin" style={{ marginRight: '6px' }} /> Requesting…</>
            : <><i className="fas fa-paper-plane" style={{ marginRight: '6px' }} /> Request Withdrawal</>}
        </button>
      </div>
    </div>
  );
}
