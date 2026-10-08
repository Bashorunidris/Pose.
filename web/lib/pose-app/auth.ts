'use client';

import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';

import { getPoseFirebase } from '@/lib/firebase';
import { saveLegacySession } from '@/lib/pose-app/session';

/** `PASSWORD_RULES` @28038 — the sign-up checklist. */
export const PASSWORD_RULES: Record<'length' | 'upper' | 'lower' | 'number' | 'symbol', (pw: string) => boolean> = {
  length: (pw) => pw.length >= 8,
  upper: (pw) => /[A-Z]/.test(pw),
  lower: (pw) => /[a-z]/.test(pw),
  number: (pw) => /[0-9]/.test(pw),
  symbol: (pw) => /[^A-Za-z0-9]/.test(pw),
};

export function isPasswordStrong(password: string): boolean {
  return Object.values(PASSWORD_RULES).every((check) => check(password || ''));
}

/** `getFriendlyAuthError` @28058. */
export function friendlyAuthError(error: unknown): string {
  const code = error instanceof Error && 'code' in error ? String((error as { code?: unknown }).code) : '';
  switch (code) {
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
    case 'auth/invalid-login-credentials':
      return 'Incorrect email or password. Please try again.';
    case 'auth/user-not-found':
      return 'No account found with this email. Please sign up first.';
    case 'auth/invalid-email':
      return 'That email address looks invalid.';
    case 'auth/user-disabled':
      return 'This account has been disabled. Contact support.';
    case 'auth/email-already-in-use':
      return 'An account already exists with this email. Please log in instead.';
    case 'auth/weak-password':
      return 'Password is too weak. Use at least 6 characters.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait a moment and try again.';
    case 'auth/network-request-failed':
      return 'Network error. Check your connection and try again.';
    case 'auth/operation-not-allowed':
      return 'Email/password sign-in is currently disabled.';
    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request':
      return 'Sign-in was cancelled.';
    default:
      return error instanceof Error && error.message
        ? error.message
        : 'Something went wrong. Please try again.';
  }
}

/** `generateWalletId` @64406 — no `I`, `O`, `0` or `1` so the id stays readable. */
export function generateWalletId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let id = 'PW-';
  for (let i = 0; i < 8; i += 1) id += chars[Math.floor(Math.random() * chars.length)];
  return id;
}

/** The `users/{uid}` document both signup paths write; `merge` keeps Google re-auth idempotent. */
async function writeUserDoc(
  uid: string,
  fields: Record<string, unknown>,
  options: { merge: boolean },
): Promise<void> {
  const { db } = getPoseFirebase();
  await setDoc(
    doc(db, 'users', uid),
    {
      ...fields,
      createdAt: serverTimestamp(),
      followers: 0,
      following: 0,
      pCoinBalance: 0,
      walletId: generateWalletId(),
      kycTier: 1,
      withdrawalLimit: 300000,
      kycStatus: 'none',
    },
    { merge: options.merge },
  );
}

export type PersonalSignup = {
  name: string;
  username: string;
  email: string;
  password: string;
};

/** `personal-signup-form` submit @29521. */
export async function signUpPersonal(input: PersonalSignup): Promise<void> {
  const { auth } = getPoseFirebase();
  const credential = await createUserWithEmailAndPassword(auth, input.email, input.password);
  try {
    await writeUserDoc(
      credential.user.uid,
      { name: input.name, username: input.username, email: input.email },
      { merge: false },
    );
  } catch (error) {
    // A profile document we cannot write leaves the account unusable, so undo the
    // Auth user instead of signing them into a half-created account.
    await deleteAuthUser(credential.user.uid);
    throw error;
  }
}

/** `personal-login-form` submit @29588. */
export async function loginPersonal(email: string, password: string): Promise<void> {
  const { auth } = getPoseFirebase();
  await signInWithEmailAndPassword(auth, email, password);
}

async function deleteAuthUser(uid: string): Promise<void> {
  try {
    const { auth } = getPoseFirebase();
    if (auth.currentUser?.uid === uid) await auth.currentUser.delete();
  } catch {
    /* the caller already has the real error */
  }
}

/**
 * `handleGoogleSignup` @29805 / `handleGoogleLogin` @29839. Google creates a
 * Firebase Auth user for any account that has never signed in, so the login path
 * has to reject newcomers — otherwise they land authenticated with no profile
 * document, which breaks every read downstream.
 */
export async function authenticateWithGoogle(
  mode: 'signup' | 'login',
  accountType: string,
): Promise<void> {
  const { auth, db } = getPoseFirebase();
  const credential = await signInWithPopup(auth, new GoogleAuthProvider());
  const user = credential.user;

  // The compat SDK read `result.additionalUserInfo.isNewUser`; the modular SDK
  // keeps that off the public `UserCredential`, so a first-time sign-in is
  // detected by `creationTime` and `lastSignInTime` being the same instant.
  const { creationTime, lastSignInTime } = user.metadata;
  const isFreshAccount = Boolean(creationTime) && creationTime === lastSignInTime;

  if (mode === 'login' && isFreshAccount) {
    await signOut(auth);
    throw new Error('No account found for this Google account. Please use Sign Up to create one.');
  }

  if (mode === 'signup' || !(await getDoc(doc(db, 'users', user.uid))).exists()) {
    await writeUserDoc(
      user.uid,
      {
        name: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        accountType: mode === 'signup' ? accountType : 'personal',
      },
      { merge: true },
    );
  }
}

/** `sendPasswordResetEmail` @29739. */
export async function sendPasswordReset(email: string): Promise<void> {
  const { auth } = getPoseFirebase();
  await sendPasswordResetEmail(auth, email);
}

/**
 * The legacy counterpart of `saveSessionLocally(user, await loadUserProfile(uid))`
 * @29991. The avatar lives in the Firestore document rather than on the Auth user,
 * so the document has to be read back before the session is cached.
 */
export async function persistLegacySession(): Promise<void> {
  const { auth, db } = getPoseFirebase();
  const user = auth.currentUser;
  if (!user) return;
  const snapshot = await getDoc(doc(db, 'users', user.uid)).catch(() => null);
  saveLegacySession(user, snapshot?.exists() ? (snapshot.data() as Record<string, unknown>) : null);
}
