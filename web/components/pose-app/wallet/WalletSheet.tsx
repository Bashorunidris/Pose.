'use client';

import { useCallback, useEffect, useState } from 'react';

import {
  consumePinResetLink,
  loadKycState,
  loadWalletHistory,
  loadWalletProfile,
  needsWalletOnboarding,
  PIN_RESET_STORAGE_KEY,
  sendPinResetLink,
  setEmailAlertsEnabled,
  type KycState,
  type WalletHistoryItem,
  type WalletProfile,
} from '@/lib/pose-app/wallet';

import { KycModal } from './KycModal';
import { PinModal, type PinAction } from './PinModal';
import { WalletModal, type WalletTab } from './WalletModal';
import { WalletOnboardingModal } from './WalletOnboardingModal';
import { WithdrawEarningsModal } from './WithdrawEarningsModal';

type Props = {
  open: boolean;
  onClose: () => void;
  uid: string | null;
  viewer: { name: string; email: string };
  onToast: (message: string, kind?: 'success' | 'error') => void;
  /** `checkPinResetEmailLink()` @64329 raises the sheet when a reset link lands. */
  onRequestOpen: () => void;
};

type PinRequest = { action: PinAction; onVerified?: () => void };

/**
 * Hosts the wallet sheet and the four sheets it can open — PIN, wallet
 * onboarding, earnings withdrawal and KYC. This is the port of the `openWallet()`
 * @61904 cluster; the data load, the tab state and the PIN hand-off live here so
 * every child stays presentational.
 */
export function WalletSheet({ open, onClose, uid, viewer, onToast, onRequestOpen }: Props) {
  const [profile, setProfile] = useState<WalletProfile | null>(null);
  const [history, setHistory] = useState<WalletHistoryItem[]>([]);
  const [kyc, setKyc] = useState<KycState | null>(null);
  const [tab, setTab] = useState<WalletTab>('set-bank');
  const [pin, setPin] = useState<PinRequest | null>(null);
  const [onboarding, setOnboarding] = useState(false);
  const [withdraw, setWithdraw] = useState(false);
  const [kycTier, setKycTier] = useState<number | null>(null);
  const [resetPending, setResetPending] = useState(false);

  const load = useCallback(async (id: string) => {
    try {
      const loaded = await loadWalletProfile(id);
      setProfile(loaded);
      if (needsWalletOnboarding(loaded)) setOnboarding(true);
      const [loadedHistory, loadedKyc] = await Promise.all([
        loadWalletHistory(id, loaded),
        loadKycState(id),
      ]);
      setHistory(loadedHistory);
      setKyc(loadedKyc);
    } catch (error) {
      console.error('Error loading wallet data:', error);
      onToast('Could not load your wallet right now', 'error');
    }
  }, [onToast]);

  const refreshBalance = useCallback(async () => {
    if (!uid) return;
    const loaded = await loadWalletProfile(uid);
    setProfile(loaded);
    setHistory(await loadWalletHistory(uid, loaded));
  }, [uid]);

  // `openWallet()` @61904 re-ran the whole load on every open.
  useEffect(() => {
    if (!open || !uid) return;
    void Promise.resolve().then(() => load(uid));
  }, [open, uid, load]);

  // `checkPinResetEmailLink()` @64329 runs at app load, not on wallet open.
  useEffect(() => {
    void Promise.resolve().then(async () => {
      const handled = await consumePinResetLink().catch(() => false);
      if (!handled) return;
      onRequestOpen();
      setResetPending(true);
    });
  }, [onRequestOpen]);

  useEffect(() => {
    void Promise.resolve().then(() => {
      if (resetPending && uid && !pin) {
        setPin({ action: 'reset' });
        setResetPending(false);
      }
    });
  }, [resetPending, uid, pin]);

  const openPin = useCallback((action: PinAction, onVerified?: () => void) => {
    setPin({ action, onVerified });
  }, []);

  const forgot = useCallback(async () => {
    const email = viewer.email || window.localStorage.getItem(PIN_RESET_STORAGE_KEY) || '';
    if (!email) return onToast('Please sign in first', 'error');
    const result = await sendPinResetLink(email);
    if (result === 'sent') return onToast(`A secure reset link was sent to ${email}`, 'success');
    if (result === 'unsupported') return onToast('PIN recovery by email is not enabled yet. Please contact support.', 'error');
    onToast('Could not send reset link. Please try again.', 'error');
  }, [onToast, viewer.email]);

  const toggleEmailAlerts = useCallback((enabled: boolean) => {
    if (!uid) return;
    void setEmailAlertsEnabled(uid, enabled).then(
      () => setProfile((current) => (current ? { ...current, emailAlertsEnabled: enabled } : current)),
      () => onToast('Could not save that preference', 'error'),
    );
  }, [onToast, uid]);

  /**
   * `saveBankDetails()` @62905 wrote the record, then the legacy re-read the user
   * document; re-loading here keeps the balance, the bank card and the history in
   * step with what Firestore now holds.
   */
  const onBankSaved = useCallback(() => {
    void refreshBalance();
  }, [refreshBalance]);

  const topUp = useCallback(() => {
    if (!uid) return onToast('Please log in to top up', 'error');
    const email = encodeURIComponent(viewer.email || '');
    const username = encodeURIComponent(viewer.name || 'User');
    window.open(`https://poseshop.vercel.app/?uid=${uid}&email=${email}&username=${username}&source=pose_app`, '_blank');
  }, [onToast, uid, viewer.email, viewer.name]);

  if (!open) {
    // The reset-link effect has to keep running while the sheet is shut, so the
    // component stays mounted and only the tree is dropped.
    return pin && uid ? (
      <div className="wallet-shell">
        <PinModal action={pin.action} uid={uid} onClose={() => setPin(null)} onVerified={pin.onVerified} onForgot={forgot} onToast={onToast} />
      </div>
    ) : null;
  }

  if (!uid) return null;

  return (
    <div className="wallet-shell">
      {profile ? (
        <WalletModal
          uid={uid}
          profile={profile}
          history={history}
          kyc={kyc}
          tab={tab}
          onTab={setTab}
          onClose={onClose}
          onOpenPin={(action) => openPin(action)}
          onForgot={forgot}
          onOpenWithdraw={() => setWithdraw(true)}
          onTopUp={topUp}
          onOpenKyc={setKycTier}
          onEmailAlerts={toggleEmailAlerts}
          onBankSaved={onBankSaved}
          onToast={onToast}
        />
      ) : null}

      {withdraw && profile ? (
        <WithdrawEarningsModal
          uid={uid}
          profile={profile}
          profileName={profile.name || viewer.name}
          profileUsername={profile.username}
          profileEmail={viewer.email}
          onClose={() => setWithdraw(false)}
          onChangeBank={() => {
            setWithdraw(false);
            setTab('set-bank');
          }}
          onRequestPin={(onVerified) => openPin('verify', onVerified)}
          onSubmitted={() => void refreshBalance()}
        />
      ) : null}

      {kycTier !== null ? (
        <KycModal
          tier={kycTier}
          uid={uid}
          profile={{ name: profile?.name ?? viewer.name, email: viewer.email }}
          onClose={() => setKycTier(null)}
          onSubmitted={() => {
            setKycTier(null);
            void loadKycState(uid).then(setKyc).catch(() => undefined);
          }}
        />
      ) : null}

      {onboarding && profile ? (
        <WalletOnboardingModal
          uid={uid}
          onClose={() => {
            setOnboarding(false);
            onClose();
          }}
          onDone={() => {
            setOnboarding(false);
            void load(uid);
          }}
        />
      ) : null}

      {pin ? (
        <PinModal
          action={pin.action}
          uid={uid}
          onClose={() => setPin(null)}
          onVerified={pin.onVerified}
          onForgot={forgot}
          onToast={onToast}
        />
      ) : null}
    </div>
  );
}
