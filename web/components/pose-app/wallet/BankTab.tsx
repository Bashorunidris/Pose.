'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import {
  bankEditLockRemaining,
  BANKS_BY_COUNTRY,
  resolveAccountName,
  saveBankDetails,
  type BankDetails,
  type BankOption,
  type WalletProfile,
} from '@/lib/pose-app/wallet';

import { bankLockLabel } from './wallet-ui';

type Props = {
  uid: string;
  profile: WalletProfile;
  onSaved: (details: BankDetails) => void;
  onToast: (message: string) => void;
};

type AccountState = 'idle' | 'loading' | 'verified' | 'manual';

/**
 * The `set-bank` tab behind `createCountrySelector()` @62765,
 * `filterBanks()` @62861, `selectBank()` @62886, `onBankAcctInput()` @63022 and
 * `saveBankDetails()` @62905. The NUBAN name lookup now goes through
 * `/api/resolve-account` instead of the page's embedded Flutterwave key.
 *
 * The legacy only armed the 7-day edit lock right after a save in the same
 * session — a reload left the button live and the lock message stuck on
 * "calculating...". The port derives the lock from the stored timestamp, so a
 * returning user sees the real remaining time and a disabled button.
 */
export function BankTab({ uid, profile, onSaved, onToast }: Props) {
  const [countryCode, setCountryCode] = useState(profile.bankDetails?.countryCode ?? 'NG');
  const [query, setQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [bank, setBank] = useState<BankOption | null>(null);
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [accountState, setAccountState] = useState<AccountState>('idle');
  const [saving, setSaving] = useState(false);
  const lookupTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const country = BANKS_BY_COUNTRY[countryCode];
  const isNip = Boolean(country?.nipLookup);
  const locked = bankEditLockRemaining(profile.lastBankDetailsSave) > 0;

  useEffect(() => () => {
    if (lookupTimer.current) clearTimeout(lookupTimer.current);
  }, []);

  const matches = useMemo(() => {
    if (!country) return [];
    const term = query.trim().toLowerCase();
    return country.banks.filter(
      (entry) => entry.name.toLowerCase().includes(term) || entry.code.toLowerCase().includes(term),
    );
  }, [country, query]);

  const runLookup = (number: string, bankOption: BankOption) => {
    setAccountState('loading');
    lookupTimer.current = setTimeout(async () => {
      const name = await resolveAccountName(number, bankOption.code);
      if (name) {
        setAccountName(name);
        setAccountState('verified');
      } else {
        setAccountName('');
        setAccountState('manual');
      }
    }, 700);
  };

  const onAccountChange = (value: string) => {
    setAccountNumber(value);
    if (lookupTimer.current) clearTimeout(lookupTimer.current);
    if (value.length === 10 && /^\d{10}$/.test(value) && bank && isNip) {
      runLookup(value, bank);
    } else if (!isNip) {
      setAccountState('manual');
    } else {
      setAccountState('idle');
    }
  };

  const selectBank = (option: BankOption) => {
    setBank(option);
    setQuery(option.name);
    setDropdownOpen(false);
    if (accountNumber.length === 10 && isNip) runLookup(accountNumber, option);
    else setAccountState(isNip ? 'idle' : 'manual');
  };

  const selectCountry = (code: string) => {
    setCountryCode(code);
    setBank(null);
    setQuery('');
    setAccountNumber('');
    setAccountName('');
    setDropdownOpen(true);
    setAccountState(code && BANKS_BY_COUNTRY[code]?.nipLookup ? 'idle' : 'manual');
  };

  const save = async () => {
    if (!country) return onToast('Select a country first');
    if (!bank) return onToast('Select your bank first');
    if (!accountNumber.trim()) return onToast('Enter your account number');
    if (!/^\d{10}$/.test(accountNumber.trim())) return onToast('Account number must be exactly 10 digits');
    if (!accountName.trim()) return onToast('Enter your account holder name');
    if (locked) return onToast(bankLockLabel(profile.lastBankDetailsSave));

    setSaving(true);
    try {
      const details = await saveBankDetails(uid, countryCode, bank, accountNumber.trim(), accountName.trim());
      onSaved(details);
      onToast('Bank details saved');
      setQuery('');
      setAccountNumber('');
      setAccountName('');
      setBank(null);
      setAccountState('idle');
    } catch (error) {
      console.error('Error saving bank details:', error);
      onToast('Failed to save bank details, try again');
    } finally {
      setSaving(false);
    }
  };

  const showSaved = Boolean(profile.bankDetails);

  return (
    <div className="wallet-tab-content active" style={{ display: 'block' }}>
      <h3 className="wallet-tab-title"><i className="fas fa-credit-card" />Bank Account Information</h3>

      <div className="wallet-form-group">
        <label className="wallet-form-label">Select Country</label>
        <select className="wallet-form-input" value={countryCode} onChange={(event) => selectCountry(event.target.value)}>
          <option value="">Choose a country...</option>
          {Object.entries(BANKS_BY_COUNTRY).map(([code, data]) => (
            <option key={code} value={code}>{data.name}</option>
          ))}
        </select>
      </div>

      <div className="wallet-form-group">
        <label className="wallet-form-label">Select Bank</label>
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            className="wallet-form-input"
            placeholder={`Search ${country?.name ?? ''} banks...`}
            value={query}
            disabled={!countryCode}
            onFocus={() => setDropdownOpen(true)}
            onBlur={() => setTimeout(() => setDropdownOpen(false), 200)}
            onChange={(event) => {
              setQuery(event.target.value);
              setDropdownOpen(true);
            }}
          />
          <i className="fas fa-search" style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
          {dropdownOpen && countryCode ? (
            <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#16121f', border: '1px solid rgba(255,255,255,.1)', borderRadius: '12px', maxHeight: '300px', overflowY: 'auto', zIndex: 100, marginTop: '6px', boxShadow: '0 12px 32px rgba(0,0,0,.5)' }}>
              {matches.length === 0 ? (
                <div style={{ padding: '15px', textAlign: 'center', color: '#999' }}>
                  <i className="fas fa-search" style={{ marginRight: '8px' }} />No banks found
                </div>
              ) : (
                matches.map((option) => (
                  <div key={`${option.code}-${option.name}`} className="bank-option" onMouseDown={() => selectBank(option)}>
                    <i className={`fas fa-${option.icon === 'mobile' ? 'mobile-alt' : 'building'}`} />
                    <span>{option.name}</span>
                  </div>
                ))
              )}
            </div>
          ) : null}
        </div>
      </div>

      {bank ? (
        <div className="wallet-card wallet-card-accent">
          <div style={{ color: '#a78bfa', fontWeight: 700, fontSize: '12.5px' }}>
            <i className="fas fa-check-circle" style={{ marginRight: '8px' }} />Selected Bank
          </div>
          <div style={{ color: '#FFFFFF', fontSize: '1.05rem', fontWeight: 600, marginTop: '8px' }}>
            {country?.name} • {bank.name}
          </div>
        </div>
      ) : null}

      <div className="wallet-form-group">
        <label className="wallet-form-label">Account Number</label>
        <input
          type="text"
          className="wallet-form-input"
          placeholder="10 digit account number"
          maxLength={10}
          inputMode="numeric"
          value={accountNumber}
          onChange={(event) => onAccountChange(event.target.value.replace(/\D/g, ''))}
        />
      </div>

      <div className="wallet-form-group">
        <label className="wallet-form-label">Account Holder Name</label>
        {accountState === 'loading' ? (
          <div style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.3)', borderRadius: '10px', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <i className="fas fa-spinner fa-spin" style={{ color: '#7c3aed' }} />
            <span style={{ color: '#c4b5fd', fontSize: '14px' }}>Looking up account name...</span>
          </div>
        ) : accountState === 'verified' ? (
          <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.4)', borderRadius: '10px', padding: '14px 16px' }}>
            <div style={{ color: '#22c55e', fontSize: '13px', fontWeight: 800, marginBottom: '4px' }}>
              <i className="fas fa-circle-check" style={{ marginRight: '6px' }} />Verified
            </div>
            <div style={{ color: '#fff', fontSize: '16px', fontWeight: 700 }}>{accountName}</div>
            <div style={{ color: '#666', fontSize: '11px', marginTop: '4px' }}>Name confirmed with your bank</div>
          </div>
        ) : (
          <input
            type="text"
            className="wallet-form-input"
            placeholder="Your full name as on bank account"
            value={accountName}
            onChange={(event) => setAccountName(event.target.value)}
          />
        )}
      </div>

      <button type="button" className="wallet-submit-btn" onClick={save} disabled={saving || locked} style={{ opacity: locked ? 0.5 : 1, cursor: locked ? 'not-allowed' : 'pointer' }}>
        <i className={locked ? 'fas fa-lock' : 'fas fa-save'} style={{ marginRight: '8px' }} />
        {locked ? 'Locked for 7 Days' : 'Save Bank Details'}
      </button>

      {showSaved && profile.bankDetails ? (
        <div className="wallet-card wallet-card-success" style={{ marginTop: '1.4rem' }}>
          <div style={{ color: '#22c55e', fontWeight: 700, fontSize: '12.5px', marginBottom: '0.9rem' }}>
            <i className="fas fa-check-circle" style={{ marginRight: '8px' }} />Saved Bank Account
          </div>
          <div className="wallet-info-row">
            <span className="wallet-info-row-label"><i className="fas fa-building-columns" />Bank</span>
            <span className="wallet-info-row-value">
              {profile.bankDetails.countryName} - {profile.bankDetails.bankName}
            </span>
          </div>
          <div className="wallet-info-row">
            <span className="wallet-info-row-label"><i className="fas fa-key" />Account</span>
            <span className="wallet-info-row-value">**** {profile.bankDetails.accountNumber.slice(-4)}</span>
          </div>
          <div className="wallet-info-row">
            <span className="wallet-info-row-label"><i className="fas fa-user" />Holder</span>
            <span className="wallet-info-row-value">{profile.bankDetails.accountName}</span>
          </div>
          <div style={{ color: '#FFB74D', fontSize: '0.8rem', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,.08)' }}>
            <i className="fas fa-lock" style={{ marginRight: '6px' }} />
            {bankLockLabel(profile.lastBankDetailsSave)}
          </div>
        </div>
      ) : null}
    </div>
  );
}
