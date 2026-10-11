'use client';

import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import {
  isSignInWithEmailLink,
  sendSignInLinkToEmail,
  signInWithEmailLink,
} from 'firebase/auth';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';

import { getPoseFirebase } from '@/lib/firebase';

/**
 * The wallet screens — `#walletModal` @73123 behind `openWallet()` @61904, plus
 * the PIN sheet it opens. The legacy hung all of this off the user document, and
 * so does the port: balances, the bank account, the PIN hash and the KYC tier are
 * all fields on `users/{uid}`.
 */

/** Both are the legacy's fixed conversion rates (`POSE_COIN_TO_NAIRA` @27571). */
export const POSE_COIN_TO_NAIRA = 25;
export const POSE_STAR_USD_RATE = 10;

/** `PIN_LENGTH` @63714 / `MAX_PIN_ATTEMPTS` @63713. */
export const PIN_LENGTH = 6;
export const MAX_PIN_ATTEMPTS = 3;

export type BankOption = { name: string; code: string; icon: string };
export type CountryBanks = { name: string; nipLookup?: boolean; banks: BankOption[] };

/**
 * `BANKS_BY_COUNTRY` @28336. The legacy labelled each country with a flag emoji;
 * the port keeps the names plain, because ported UI is Font Awesome only.
 */
export const BANKS_BY_COUNTRY: Record<string, CountryBanks> = {
  NG: {
    name: 'Nigeria',
    nipLookup: true,
    banks: [
      { name: 'GTBank', code: '058', icon: 'building' },
      { name: 'First Bank', code: '011', icon: 'building' },
      { name: 'Access Bank', code: '044', icon: 'building' },
      { name: 'Zenith Bank', code: '057', icon: 'building' },
      { name: 'FCMB', code: '214', icon: 'building' },
      { name: 'UBA', code: '033', icon: 'building' },
      { name: 'Sterling Bank', code: '232', icon: 'building' },
      { name: 'Fidelity Bank', code: '070', icon: 'building' },
      { name: 'Polaris Bank', code: '076', icon: 'building' },
      { name: 'Union Bank', code: '032', icon: 'building' },
      { name: 'Wema Bank', code: '035', icon: 'building' },
      { name: 'Stanbic IBTC', code: '221', icon: 'building' },
      { name: 'Ecobank Nigeria', code: '050', icon: 'building' },
      { name: 'Heritage Bank', code: '030', icon: 'building' },
      { name: 'Providus Bank', code: '101', icon: 'building' },
      { name: 'Jaiz Bank', code: '301', icon: 'building' },
      { name: 'Moniepoint', code: '50515', icon: 'mobile' },
      { name: 'Opay', code: '999992', icon: 'mobile' },
      { name: 'Palmpay', code: '999991', icon: 'mobile' },
      { name: 'Kuda Bank', code: '50211', icon: 'mobile' },
      { name: 'VFD Microfinance', code: '090110', icon: 'mobile' },
      { name: 'Carbon (One Finance)', code: '565', icon: 'mobile' },
    ],
  },
  US: {
    name: 'United States',
    banks: [
      { name: 'Chase Bank', code: 'CHB', icon: 'building' },
      { name: 'Bank of America', code: 'BOA', icon: 'building' },
      { name: 'Wells Fargo', code: 'WF', icon: 'building' },
      { name: 'Citibank', code: 'CITI', icon: 'building' },
    ],
  },
  UK: {
    name: 'United Kingdom',
    banks: [
      { name: 'HSBC', code: 'HSBC', icon: 'building' },
      { name: 'Barclays', code: 'BARC', icon: 'building' },
      { name: 'Lloyds', code: 'LLOY', icon: 'building' },
    ],
  },
  CA: {
    name: 'Canada',
    banks: [
      { name: 'TD Bank', code: 'TD', icon: 'building' },
      { name: 'RBC', code: 'RBC', icon: 'building' },
    ],
  },
  AU: {
    name: 'Australia',
    banks: [
      { name: 'Commonwealth Bank', code: 'CBA', icon: 'building' },
      { name: 'Westpac', code: 'WBC', icon: 'building' },
    ],
  },
  GH: {
    name: 'Ghana',
    banks: [
      { name: 'Ecobank', code: 'ECO', icon: 'building' },
      { name: 'MTN Mobile Money', code: 'MOMO', icon: 'mobile' },
    ],
  },
  KE: {
    name: 'Kenya',
    banks: [
      { name: 'Equity Bank', code: 'EQB', icon: 'building' },
      { name: 'M-Pesa', code: 'MPESA', icon: 'mobile' },
    ],
  },
  UG: {
    name: 'Uganda',
    banks: [
      { name: 'Stanbic Bank', code: 'SBU', icon: 'building' },
      { name: 'MTN Mobile Money', code: 'MOMO', icon: 'mobile' },
    ],
  },
};

export type BankDetails = {
  countryCode: string;
  countryName: string;
  bankName: string;
  bankCode: string;
  accountNumber: string;
  accountName: string;
  savedAt?: string;
};

/**
 * `ensureNgnRate()` @27852 asked exchangerate-api for USD→NGN on every wallet
 * open. The port keeps the call (the browser makes it, not the sandbox) and the
 * legacy's fallback for when it is blocked.
 */
let usdToNgn = 1620;
let ngnRateFetched = false;

export async function ensureNgnRate(): Promise<number> {
  if (ngnRateFetched) return usdToNgn;
  ngnRateFetched = true;
  try {
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
    const json = (await response.json()) as { rates?: { NGN?: number } };
    if (json?.rates?.NGN) usdToNgn = json.rates.NGN;
  } catch {
    /* keep the fallback */
  }
  return usdToNgn;
}

/** `starsToNgn()` @27862 — Pose Star is tracked at a fixed $10 per star. */
export function starsToNgn(stars: number, rate = usdToNgn): number {
  return (Number(stars) || 0) * POSE_STAR_USD_RATE * rate;
}

/** `generateWalletId()` @64406. */
export function generateWalletId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let id = 'PW-';
  for (let i = 0; i < 8; i += 1) id += chars[Math.floor(Math.random() * chars.length)];
  return id;
}

export type WalletProfile = {
  walletId: string;
  /** `submitEarningsWithdrawal()` @63411 stamped these on the request document. */
  name: string;
  username: string;
  pCoinBalance: number;
  balanceNaira: number;
  poseStarBalance: number;
  pendingPoolViews: number;
  pendingPoolStars: number;
  withdrawalLimit: number;
  kycTier: number;
  kycStatus: string;
  bankDetails: BankDetails | null;
  lastBankDetailsSave: string | null;
  walletPin: string | null;
  walletPinCreatedAt: string | null;
  emailAlertsEnabled: boolean;
  pinHistory: { id?: string; action?: string; date?: string; timestamp?: string }[];
};

/**
 * `ensureWalletId()` @64413. A wallet ID is minted on first open and the KYC
 * defaults ride along with it, because `loadWalletData()` read them straight off
 * the document afterwards.
 */
export async function ensureWalletId(uid: string): Promise<void> {
  if (!uid) return;
  const { db } = getPoseFirebase();
  const ref = doc(db, 'users', uid);
  const snapshot = await getDoc(ref);
  const data = snapshot.data() ?? {};
  if (data.walletId) return;
  await updateDoc(ref, {
    walletId: generateWalletId(),
    kycTier: data.kycTier || 1,
    withdrawalLimit: data.withdrawalLimit || 300000,
    kycStatus: data.kycStatus || 'none',
  });
}

/** `needsWalletOnboarding()` @64149 — a `PW-` id means the phone was never set. */
export function needsWalletOnboarding(profile: Partial<WalletProfile> | null): boolean {
  const hasPhoneId = Boolean(profile?.walletId && !/^PW-/.test(profile.walletId));
  return !hasPhoneId || !profile?.walletPin;
}

/** `loadWalletData()` @61932 — the one read the whole sheet hangs off. */
export async function loadWalletProfile(uid: string): Promise<WalletProfile> {
  await ensureWalletId(uid);
  const { db } = getPoseFirebase();
  const snapshot = await getDoc(doc(db, 'users', uid));
  const data = snapshot.data() ?? {};
  const pCoinBalance = Number(data.pCoinBalance) || 0;

  return {
    walletId: data.walletId || '',
    name: String(data.name || ''),
    username: String(data.username || ''),
    pCoinBalance,
    // The wallet's headline balance is always the naira value of the Pose Coin
    // holdings — Pose Coin is the source of truth (`loadWalletData()` @61932).
    balanceNaira: pCoinBalance * POSE_COIN_TO_NAIRA,
    poseStarBalance: Number(data.poseStarBalance) || 0,
    pendingPoolViews: Number(data.pendingPoolViews) || 0,
    pendingPoolStars: Number(data.pendingPoolStars) || 0,
    withdrawalLimit: Number(data.withdrawalLimit) || 300000,
    kycTier: Number(data.kycTier) || 1,
    kycStatus: data.kycStatus || 'none',
    bankDetails: (data.bankDetails as BankDetails) || null,
    lastBankDetailsSave: data.lastBankDetailsSave || null,
    walletPin: data.walletPin || null,
    walletPinCreatedAt: data.walletPinCreatedAt || null,
    emailAlertsEnabled: Boolean(data.emailAlertsEnabled),
    pinHistory: Array.isArray(data.pinHistory) ? data.pinHistory : [],
  };
}

export type WalletHistoryKind =
  | 'withdrawal'
  | 'deposit'
  | 'pcoin_purchase'
  | 'gift_claim'
  | 'bank_details_saved'
  | 'pin_event';

export type WalletHistoryItem = {
  kind: WalletHistoryKind;
  id: string;
  amount?: number;
  youReceive?: number;
  fee?: number;
  pCoins?: number;
  reference?: string | null;
  status?: string;
  processingType?: string;
  date?: unknown;
  bankName?: string;
  accountNumber?: string;
  countryName?: string;
  giftName?: string;
  action?: string;
};

/**
 * `loadWalletHistory()` @62021. Three readers in parallel — the withdrawal
 * requests, the user's own `walletTransactions`, and the bank/PIN events that live
 * on the user document — merged into one list, newest first, capped at the 100
 * the legacy displayed.
 */
export async function loadWalletHistory(uid: string, profile: WalletProfile): Promise<WalletHistoryItem[]> {
  const { db } = getPoseFirebase();

  const withdrawals = await getDocs(
    query(
      collection(db, 'posewithdrawalrequests'),
      orderBy('createdAt', 'desc'),
      limit(50),
    ),
  ).catch(() => null);

  const transactions = await getDocs(
    query(collection(db, 'users', uid, 'walletTransactions'), orderBy('date', 'desc'), limit(100)),
  ).catch(() => null);

  const items: WalletHistoryItem[] = [];

  withdrawals?.forEach((entry) => {
    const data = entry.data();
    if (data.userId && data.userId !== uid) return;
    items.push({
      kind: 'withdrawal',
      id: entry.id,
      amount: Number(data.amount) || 0,
      fee: Number(data.fee) || 0,
      youReceive: Number(data.youReceive) || 0,
      processingType: data.processingType,
      status: data.status,
      date: data.createdAt,
      bankName: data.bankDetails?.bankName,
      accountNumber: data.bankDetails?.accountNumberMasked,
    });
  });

  transactions?.forEach((entry) => {
    const data = entry.data();
    if (data.type === 'Deposit') {
      items.push({
        kind: 'deposit',
        id: data.transactionId || entry.id,
        amount: Number(data.amount) || 0,
        status: data.status || 'completed',
        date: data.date,
        reference: data.transactionId,
      });
    } else if (data.type === 'pCoin Purchase') {
      items.push({
        kind: 'pcoin_purchase',
        id: data.id || entry.id,
        pCoins: Number(data.pCoins) || 0,
        amount: Number(data.amount) || 0,
        status: data.status || 'completed',
        date: data.date,
        reference: data.id,
      });
    } else if (data.type === 'Gift Claim') {
      items.push({
        kind: 'gift_claim',
        id: entry.id,
        giftName: data.giftName || 'Gift',
        amount: Number(data.amount) || 0,
        status: data.status || 'completed',
        date: data.date,
      });
    }
  });

  if (profile.bankDetails && profile.lastBankDetailsSave) {
    items.push({
      kind: 'bank_details_saved',
      id: `bank_${profile.lastBankDetailsSave}`,
      bankName: profile.bankDetails.bankName,
      accountNumber:
        profile.bankDetails.accountNumber?.slice(-4) === undefined
          ? undefined
          : `**** ${profile.bankDetails.accountNumber.slice(-4)}`,
      countryName: profile.bankDetails.countryName,
      date: profile.lastBankDetailsSave,
      status: 'completed',
    });
  }

  profile.pinHistory.forEach((event) => {
    items.push({
      kind: 'pin_event',
      id: String(event.id ?? event.timestamp ?? ''),
      action: event.action,
      date: event.date || event.timestamp,
      status: 'completed',
    });
  });

  return items.sort((a, b) => historyTime(b.date) - historyTime(a.date)).slice(0, 100);
}

function historyTime(value: unknown): number {
  if (!value) return 0;
  if (typeof value === 'string') return Date.parse(value) || 0;
  const maybe = value as { toMillis?: () => number; seconds?: number };
  if (typeof maybe?.toMillis === 'function') return maybe.toMillis();
  if (typeof maybe?.seconds === 'number') return maybe.seconds * 1000;
  return 0;
}

/** `saveBankDetails()` @62905's 7-day edit lock (168 hours). */
export const BANK_EDIT_LOCK_MS = 7 * 24 * 60 * 60 * 1000;

export function bankEditLockRemaining(lastSave: string | null): number {
  if (!lastSave) return 0;
  const elapsed = Date.now() - (Date.parse(lastSave) || 0);
  return Math.max(0, BANK_EDIT_LOCK_MS - elapsed);
}

/** `saveBankDetails()` @62905. */
export async function saveBankDetails(
  uid: string,
  countryCode: string,
  bank: BankOption,
  accountNumber: string,
  accountName: string,
): Promise<BankDetails> {
  const country = BANKS_BY_COUNTRY[countryCode];
  const details: BankDetails = {
    countryCode,
    countryName: country.name,
    bankName: bank.name,
    bankCode: bank.code,
    accountNumber,
    accountName,
    savedAt: new Date().toISOString(),
  };
  const { db } = getPoseFirebase();
  await setDoc(
    doc(db, 'users', uid),
    { bankDetails: details, lastBankDetailsSave: details.savedAt },
    { merge: true },
  );
  return details;
}

/**
 * `_doNubanLookup()` @63068 resolved the account name by calling Flutterwave
 * straight from the browser with a secret key embedded in the page — that key is
 * in the legacy file and has to be rotated. The port posts to
 * `/api/resolve-account` instead, which reads `FLUTTERWAVE_SECRET_KEY` on the
 * server; a null answer means "ask the user for the name", the same fallback the
 * legacy used when the request failed.
 */
export async function resolveAccountName(accountNumber: string, bankCode: string): Promise<string | null> {
  try {
    const response = await fetch('/api/resolve-account', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accountNumber, bankCode }),
    });
    if (!response.ok) return null;
    const json = (await response.json()) as { accountName?: string };
    return json.accountName ?? null;
  } catch {
    return null;
  }
}

/** `loadPinPayMode()` @64091 saved the payment behaviour to localStorage. */
export const PIN_PAY_MODES = ['always', '5min', 'never'] as const;
export type PinPayMode = (typeof PIN_PAY_MODES)[number];
const PIN_MODE_KEY = 'pose_pin_pay_mode';

export function loadPinPayMode(): PinPayMode {
  try {
    const stored = localStorage.getItem(PIN_MODE_KEY);
    if (stored === '5min' || stored === 'never' || stored === 'always') return stored;
  } catch {
    /* storage can be blocked; the default is the legacy default */
  }
  return 'always';
}

export function savePinPayMode(mode: PinPayMode): void {
  try {
    localStorage.setItem(PIN_MODE_KEY, mode);
  } catch {
    /* nothing to do — the setting simply will not persist */
  }
}

/**
 * `window._pinLastVerifiedAt` @64115 — the stamp `_pinModeIsSkip()` @64100 reads
 * to decide whether the five-minute window is still open.
 */
let lastPinVerifiedAt = 0;

export function markPaymentPinVerified(): void {
  lastPinVerifiedAt = Date.now();
}

/** `_pinModeIsSkip()` @64100 — 'never', or '5min' inside the window. */
export function paymentPinSkipped(): boolean {
  const mode = loadPinPayMode();
  if (mode === 'never') return true;
  return mode === '5min' && Date.now() - lastPinVerifiedAt < 5 * 60 * 1000;
}

/**
 * `requirePaymentPin()` @64109 — run the callback straight away when the mode
 * skips the prompt or the account has never set a PIN, and otherwise hand the
 * callback to the wallet's `#pinModalOverlay` and let the PIN gate it.
 *
 * The legacy reached into Firestore for the whole user document only to test for
 * `walletPin`; this reads the same field.
 */
export async function paymentPinRequired(uid: string | null): Promise<boolean> {
  if (paymentPinSkipped() || !uid) return false;
  const { db } = getPoseFirebase();
  try {
    const snapshot = await getDoc(doc(db, 'users', uid));
    return Boolean(snapshot.data()?.walletPin);
  } catch {
    return false;
  }
}

/**
 * `submitPin()` @63899. The legacy stored `btoa(pin)` with the comment "simple
 * hash for demo" — that is an encoding, not a hash, and a six-digit PIN falls out
 * of it instantly. The port keeps the same field so existing PINs still verify,
 * and this is flagged as a follow-up that needs server-side verification.
 */
export function hashPin(pin: string): string {
  return btoa(pin);
}

export async function saveWalletPin(uid: string, pin: string): Promise<void> {
  const { db } = getPoseFirebase();
  await updateDoc(doc(db, 'users', uid), {
    walletPin: hashPin(pin),
    walletPinCreatedAt: new Date().toISOString(),
  });
}

export async function setEmailAlertsEnabled(uid: string, enabled: boolean): Promise<void> {
  const { db } = getPoseFirebase();
  await updateDoc(doc(db, 'users', uid), { emailAlertsEnabled: enabled });
}

/**
 * `WO_COUNTRIES` @64138 — the phone-country list the onboarding sheet numbers
 * against. The legacy prefixed each name with a flag emoji; the port drops it,
 * because ported UI is Font Awesome only.
 */
export const WO_COUNTRIES: { code: string; name: string; dial: string }[] = [
  { code: 'NG', name: 'Nigeria', dial: '234' },
  { code: 'US', name: 'United States', dial: '1' },
  { code: 'GB', name: 'United Kingdom', dial: '44' },
  { code: 'CA', name: 'Canada', dial: '1' },
  { code: 'AU', name: 'Australia', dial: '61' },
  { code: 'GH', name: 'Ghana', dial: '233' },
  { code: 'KE', name: 'Kenya', dial: '254' },
  { code: 'UG', name: 'Uganda', dial: '256' },
];

/** `WO_COUNTRIES`/`BANKS_BY_COUNTRY` share the NG dial code the sheet opens on. */
export function woDialFor(code: string): string {
  return WO_COUNTRIES.find((country) => country.code === code)?.dial ?? WO_COUNTRIES[0].dial;
}

/**
 * `EW_MIN_AMOUNT`/`EW_MAX_AMOUNT`/`EW_POSE_COIN_MIN_NAIRA` @63314-63316. Pose
 * Star withdrawals are capped at a flat star range; Pose Coin withdrawals are
 * capped in naira and converted back at the fixed rate, so the ceiling per
 * request tracks the user's KYC tier limit.
 */
export const EW_MIN_AMOUNT = 0.072;
export const EW_MAX_AMOUNT = 14.48;
export const EW_POSE_COIN_MIN_NAIRA = 1000;

export type EarningsCurrency = 'poseCoin' | 'poseStar';

export function ewLimits(currency: EarningsCurrency, withdrawalLimit: number): { min: number; max: number } {
  if (currency === 'poseCoin') {
    return {
      min: Math.ceil(EW_POSE_COIN_MIN_NAIRA / POSE_COIN_TO_NAIRA),
      max: Math.floor((withdrawalLimit || 300000) / POSE_COIN_TO_NAIRA),
    };
  }
  return { min: EW_MIN_AMOUNT, max: EW_MAX_AMOUNT };
}

/** `submitPin()` @63899's `verify` branch — the caller's callback only fires on a match. */
export async function verifyWalletPin(uid: string, pin: string): Promise<boolean> {
  const { db } = getPoseFirebase();
  const snapshot = await getDoc(doc(db, 'users', uid));
  const stored = snapshot.data()?.walletPin as string | undefined;
  if (!stored) return false;
  return stored === hashPin(pin);
}

/** `submitEarningsWithdrawal()` @63411 — one request doc, PIN already verified. */
export async function submitWithdrawalRequest(
  uid: string,
  currency: EarningsCurrency,
  amount: number,
  balanceAtRequest: number,
  bankDetails: BankDetails,
  profile: { name?: string; username?: string; email?: string },
): Promise<void> {
  const { db } = getPoseFirebase();
  await setDoc(doc(collection(db, 'posecoinwalletrequest')), {
    userId: uid,
    userName: profile.name || 'Anonymous',
    username: profile.username || '',
    userEmail: profile.email || '',
    currency,
    amount,
    balanceAtRequest,
    bankDetails,
    pinVerified: true,
    status: 'pending',
    createdAt: serverTimestamp(),
  });
}

/** `maybeLogSecurityAlert()` @64389 — only ever written when the user opted in. */
export async function logSecurityAlert(
  uid: string,
  email: string,
  type: string,
  description: string,
): Promise<void> {
  const { db } = getPoseFirebase();
  const snapshot = await getDoc(doc(db, 'users', uid));
  if (!snapshot.data()?.emailAlertsEnabled) return;
  await setDoc(doc(collection(db, 'securityAlerts')), {
    userId: uid,
    userEmail: email,
    type,
    description,
    createdAt: serverTimestamp(),
  }).catch(() => undefined);
}

export type WalletHistoryEvent = { id?: string; action?: string; date?: string; timestamp?: string };

/** `submitPin()` @63899 never wrote this at all; the port records it for the history tab. */
export async function recordPinEvent(uid: string, action: 'created' | 'changed'): Promise<void> {
  const { db } = getPoseFirebase();
  const snapshot = await getDoc(doc(db, 'users', uid));
  const existing = (snapshot.data()?.pinHistory as WalletHistoryEvent[] | undefined) ?? [];
  const now = new Date().toISOString();
  await setDoc(
    doc(db, 'users', uid),
    { pinHistory: [...existing, { id: `${action}_${Date.now()}`, action, date: now, timestamp: now }] },
    { merge: true },
  ).catch(() => undefined);
}

/* ---------------------------------------------------------------- KYC tiers */

export type KycTierCard = {
  tier: number;
  label: string;
  limit: string;
  desc: string;
  color: string;
  icon: string;
};

/**
 * `loadKycTab()` @64558's `TIERS` table. The legacy labelled each tier with an
 * emoji (✅ 📱 🏦); the port swaps them for the Font Awesome glyphs named here.
 */
export const KYC_TIERS: KycTierCard[] = [
  { tier: 1, label: 'Tier 1', limit: 'NGN 300,000', desc: 'Default for all users. No verification needed.', color: '#22c55e', icon: 'circle-check' },
  { tier: 2, label: 'Tier 2', limit: 'NGN 5,000,000', desc: 'Provide phone number, NIN, and a selfie. Review: 1-24 hours.', color: '#f59e0b', icon: 'mobile-screen' },
  { tier: 3, label: 'Tier 3', limit: 'NGN 50,000,000', desc: 'Provide BVN, proof of address, and a selfie. Review: 24-72 hours.', color: '#a855f7', icon: 'building-columns' },
];

export type KycState = { tier: number; status: string; note: string };

/** `loadKycTab()` @64558 read the tier, status and the rejection note off the user doc. */
export async function loadKycState(uid: string): Promise<KycState> {
  const { db } = getPoseFirebase();
  const snapshot = await getDoc(doc(db, 'users', uid));
  const data = snapshot.data() ?? {};
  const status = String(data.kycStatus || 'none');
  const rejectedTier = status.startsWith('rejected_') ? status.split('_')[1] : '';
  const note = rejectedTier
    ? String((data[`kycTier${rejectedTier}`] as { note?: string } | undefined)?.note ?? 'Please re-apply with correct details.')
    : '';
  return { tier: Number(data.kycTier) || 1, status, note };
}

export type KycSubmission = {
  phone: string;
  nin: string;
  bvn: string;
  addressFile: File | null;
  selfieFile: File;
};

/**
 * `submitKycRequest()` @64495. The legacy builds the whole `kycTierN` object as
 * one field — a plain object plus dotted sub-fields in one `update()` made
 * Firestore reject the write, which is why nothing ever saved. The port keeps
 * the object-as-one-field shape that actually worked.
 */
export async function submitKycRequest(
  uid: string,
  tier: number,
  input: KycSubmission,
  profile: { name?: string; email?: string },
): Promise<void> {
  const { db, storage } = getPoseFirebase();
  const payload: Record<string, unknown> = {
    userId: uid,
    tier,
    status: 'pending',
    submittedAt: serverTimestamp(),
    userName: profile.name || '',
    userEmail: profile.email || '',
  };

  if (tier === 2) {
    payload.phone = input.phone;
    payload.nin = input.nin;
  } else {
    payload.bvn = input.bvn;
    if (input.addressFile) {
      const addressRef = ref(storage, `kyc/${uid}/tier3_address_${Date.now()}`);
      await uploadBytes(addressRef, input.addressFile);
      payload.addressProofUrl = await getDownloadURL(addressRef);
    }
  }

  const selfieRef = ref(storage, `kyc/${uid}/tier${tier}_selfie_${Date.now()}`);
  await uploadBytes(selfieRef, input.selfieFile);
  payload.selfieUrl = await getDownloadURL(selfieRef);

  await setDoc(doc(db, 'kycRequests', `${uid}_tier${tier}_${Date.now()}`), payload);

  const tierData: Record<string, unknown> = { submittedAt: serverTimestamp(), status: 'pending' };
  if (payload.phone) tierData.phone = payload.phone;
  if (payload.nin) tierData.nin = payload.nin;
  if (payload.bvn) tierData.bvn = payload.bvn;
  if (payload.selfieUrl) tierData.selfieUrl = payload.selfieUrl;
  if (payload.addressProofUrl) tierData.addressProofUrl = payload.addressProofUrl;

  await setDoc(doc(db, 'users', uid), { kycStatus: `pending_${tier}`, [`kycTier${tier}`]: tierData }, { merge: true });
}

/** `PIN_RESET_STORAGE_KEY` @64304. */
export const PIN_RESET_STORAGE_KEY = 'pose_pin_reset_email';

/**
 * `forgotWalletPin()` @64306. Emails a sign-in link that returns to this page
 * with `?pinReset=1`; `checkPinResetEmailLink()` @64329 then completes the flow.
 */
export async function sendPinResetLink(email: string): Promise<'sent' | 'unsupported' | 'failed'> {
  if (!email) return 'failed';
  const { auth } = getPoseFirebase();
  const continueUrl = `${window.location.origin}${window.location.pathname}?pinReset=1`;
  try {
    await sendSignInLinkToEmail(auth, email, { url: continueUrl, handleCodeInApp: true });
    window.localStorage.setItem(PIN_RESET_STORAGE_KEY, email);
    return 'sent';
  } catch (error) {
    const code = (error as { code?: string }).code;
    return code === 'auth/operation-not-allowed' ? 'unsupported' : 'failed';
  }
}

/**
 * `checkPinResetEmailLink()` @64329 — called on load. True means the page URL is a
 * reset link and the reset sheet should come up once the sign-in settles.
 */
export async function consumePinResetLink(): Promise<boolean> {
  const { auth } = getPoseFirebase();
  const href = window.location.href;
  if (!isSignInWithEmailLink(auth, href)) return false;

  let email = window.localStorage.getItem(PIN_RESET_STORAGE_KEY);
  if (!email) email = window.prompt('Please confirm the email you used to request PIN reset:');
  if (!email) return false;

  const current = auth.currentUser;
  if (!current || current.email !== email) {
    try {
      await signInWithEmailLink(auth, email, href);
    } catch (error) {
      console.error('PIN reset email link error:', error);
      return false;
    }
  }

  window.localStorage.removeItem(PIN_RESET_STORAGE_KEY);
  window.history.replaceState({}, document.title, href.split('#')[0].split('?')[0]);
  return true;
}
