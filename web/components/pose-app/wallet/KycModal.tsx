'use client';

import { useRef, useState } from 'react';
import type { ChangeEvent } from 'react';

import { submitKycRequest } from '@/lib/pose-app/wallet';

type Props = {
  tier: number;
  uid: string;
  profile: { name: string; email: string };
  onClose: () => void;
  onSubmitted: () => void;
};

/**
 * `#kycModalOverlay` @73701 behind `openKycModal()` @64444. Tier 2 asks for a
 * phone number and NIN; tier 3 asks for a BVN and a proof of address; both take
 * a selfie. The legacy used emoji in the upload boxes — the port uses Font
 * Awesome, like every other ported screen.
 */
export function KycModal({ tier, uid, profile, onClose, onSubmitted }: Props) {
  const [phone, setPhone] = useState('');
  const [nin, setNin] = useState('');
  const [bvn, setBvn] = useState('');
  const [addressFile, setAddressFile] = useState<File | null>(null);
  const [addressPreview, setAddressPreview] = useState('');
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [selfiePreview, setSelfiePreview] = useState('');
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const addressInput = useRef<HTMLInputElement>(null);
  const selfieInput = useRef<HTMLInputElement>(null);

  /** `kycPreviewFile()` @64479 — inline image preview, otherwise the file name. */
  const previewFile = (
    event: ChangeEvent<HTMLInputElement>,
    setFile: (file: File | null) => void,
    setPreview: (value: string) => void,
  ) => {
    const file = event.target.files?.[0] ?? null;
    setFile(file);
    if (!file) {
      setPreview('');
      return;
    }
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (loadEvent) => setPreview(String(loadEvent.target?.result ?? ''));
      reader.readAsDataURL(file);
    } else {
      setPreview(`Selected: ${file.name}`);
    }
  };

  const submit = async () => {
    if (busy) return;
    if (tier === 2) {
      if (!phone.trim() || !nin.trim()) return setStatus('Please fill in all fields.');
      if (!/^\d{11}$/.test(nin.trim())) return setStatus('NIN must be exactly 11 digits.');
    } else {
      if (!bvn.trim()) return setStatus('Please enter your BVN.');
      if (!/^\d{11}$/.test(bvn.trim())) return setStatus('BVN must be exactly 11 digits.');
      if (!addressFile) return setStatus('Please upload a proof of address.');
    }
    if (!selfieFile) return setStatus('Please upload a selfie.');

    setBusy(true);
    setStatus('Uploading...');
    try {
      await submitKycRequest(
        uid,
        tier,
        { phone: phone.trim(), nin: nin.trim(), bvn: bvn.trim(), addressFile, selfieFile },
        profile,
      );
      setStatus(`Application submitted! We will review within ${tier === 2 ? '1-24 hours' : '24-72 hours'}.`);
      setTimeout(onSubmitted, 2000);
    } catch (error) {
      console.error('KYC submit error:', error);
      setStatus(`Error: ${(error as Error).message || 'Please try again.'}`);
      setBusy(false);
    }
  };

  return (
    <div className="kyc-modal-overlay active" role="dialog" aria-modal="true" aria-label="KYC verification">
      <div className="kyc-modal-sheet">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h3 style={{ color: '#fff', margin: 0, fontSize: '17px', fontWeight: 800 }}>KYC Verification</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{ background: 'rgba(255,255,255,0.08)', border: 'none', color: '#fff', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', fontSize: '16px' }}
          >
            &#x2715;
          </button>
        </div>
        <p style={{ color: '#888', fontSize: '13px', lineHeight: 1.6, marginBottom: '18px' }}>
          Tier {tier} verification raises your withdrawal limit.
        </p>

        {tier === 2 ? (
          <div>
            <label className="kyc-form-label">Phone Number</label>
            <input className="kyc-form-input" type="tel" placeholder="+234 800 000 0000" value={phone} onChange={(event) => setPhone(event.target.value)} />
            <label className="kyc-form-label">NIN (National Identification Number)</label>
            <input className="kyc-form-input" type="text" placeholder="11-digit NIN" maxLength={11} value={nin} onChange={(event) => setNin(event.target.value)} />
          </div>
        ) : (
          <div>
            <label className="kyc-form-label">BVN (Bank Verification Number)</label>
            <input className="kyc-form-input" type="text" placeholder="11-digit BVN" maxLength={11} value={bvn} onChange={(event) => setBvn(event.target.value)} />
            <label className="kyc-form-label">Proof of Address</label>
            <button type="button" className="kyc-photo-box" onClick={() => addressInput.current?.click()}>
              {addressPreview.startsWith('data:') ? (
                <img src={addressPreview} alt="Proof of address preview" style={{ maxWidth: '100%', maxHeight: '120px', borderRadius: '8px' }} />
              ) : (
                <span><i className="fas fa-file-arrow-up" style={{ marginRight: '8px' }} />{addressPreview || 'Tap to upload (utility bill, bank statement, etc.)'}</span>
              )}
            </button>
            <input ref={addressInput} type="file" accept="image/*,application/pdf" style={{ display: 'none' }} onChange={(event) => previewFile(event, setAddressFile, setAddressPreview)} />
          </div>
        )}

        <label className="kyc-form-label">Take a Clear Selfie (face must be visible)</label>
        <button type="button" className="kyc-photo-box" onClick={() => selfieInput.current?.click()}>
          {selfiePreview.startsWith('data:') ? (
            <img src={selfiePreview} alt="Selfie preview" style={{ maxWidth: '100%', maxHeight: '120px', borderRadius: '8px' }} />
          ) : (
            <span><i className="fas fa-camera" style={{ marginRight: '8px' }} />{selfiePreview || 'Tap to take/upload selfie'}</span>
          )}
        </button>
        <input ref={selfieInput} type="file" accept="image/*" capture="user" style={{ display: 'none' }} onChange={(event) => previewFile(event, setSelfieFile, setSelfiePreview)} />

        <div style={{ color: '#e9d5ff', fontSize: '13px', minHeight: '18px', marginBottom: '10px' }}>{status}</div>
        <button type="button" className="kyc-submit-btn" onClick={submit} disabled={busy}>Submit for Review</button>

        <p style={{ color: '#555', fontSize: '11px', textAlign: 'center', marginTop: '12px' }}>
          Your data is encrypted and used only for identity verification.
        </p>
      </div>
    </div>
  );
}
