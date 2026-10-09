'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';

import { getPoseFirebase } from '@/lib/firebase';
import { clearBuzzFeedCache, clearForYouFeedCache } from '@/lib/pose-app/feed';

/**
 * The legacy app kept its own copy of the signed-in user in
 * `localStorage['pose_user_session']` (written by `saveSessionLocally`) so a
 * reload could paint the profile before Firebase Auth finished resolving. The
 * port reads the same key, so a session started in the legacy app keeps working
 * in the Next app and vice versa.
 */
const SESSION_KEY = 'pose_user_session';
const LOGGED_OUT_KEY = 'pose_logged_out';

export type PoseSession = {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
};

export type PoseSessionState = {
  status: 'loading' | 'signed-in' | 'signed-out';
  user: PoseSession | null;
};

function sameSession(a: PoseSession | null, b: PoseSession | null): boolean {
  if (a === null && b === null) return true;
  if (a === null || b === null) return false;
  return a.uid === b.uid && a.displayName === b.displayName && a.photoURL === b.photoURL;
}

function fromAuthUser(user: User): PoseSession {
  return {
    uid: user.uid,
    email: user.email ?? '',
    displayName: user.displayName ?? '',
    photoURL: user.photoURL ?? '',
  };
}

export function readLegacySession(): PoseSession | null {
  if (typeof window === 'undefined') return null;
  if (window.localStorage.getItem(LOGGED_OUT_KEY) === '1') return null;
  const raw = window.localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<PoseSession> & { userData?: Record<string, unknown> | null };
    if (typeof parsed.uid !== 'string' || parsed.uid.length === 0) return null;
    // Email/password accounts have no `photoURL` on the Auth user; the legacy app
    // keeps the avatar in `userData.profilePicUrl` (`displayUserProfile` @28276).
    const profile = parsed.userData ?? null;
    const picFromProfile = typeof profile?.profilePicUrl === 'string' ? profile.profilePicUrl : '';
    const nameFromProfile = typeof profile?.name === 'string' ? profile.name : '';
    return {
      uid: parsed.uid,
      email: parsed.email ?? '',
      displayName: parsed.displayName || nameFromProfile,
      photoURL: parsed.photoURL || picFromProfile,
    };
  } catch {
    return null;
  }
}

/**
 * `saveSessionLocally` @28119. The Next app is the writer as well as the reader
 * now, so a sign-in started here keeps working in the legacy pages. Clearing the
 * logged-out flag is what @46628 does on sign-in; without it `readLegacySession`
 * would keep reporting signed-out on the next load.
 */
export function saveLegacySession(user: User, userData?: Record<string, unknown> | null): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(LOGGED_OUT_KEY);
  window.localStorage.setItem(
    SESSION_KEY,
    JSON.stringify({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || '',
      photoURL: user.photoURL || '',
      userData: userData ?? null,
      timestamp: Date.now(),
    }),
  );
}

/** `handleGuestMode` @29787 — a flag only; guests have no Firebase identity. */
export function enterGuestMode(): void {
  if (typeof window === 'undefined') return;
  window.sessionStorage.setItem('guestMode', 'true');
}

/**
 * `logoutUser()` @45339. The logout flag is stamped *before* anything is
 * cleared, because Firebase's local persistence can fire `onAuthStateChanged`
 * while the keys are still being removed and would otherwise look signed-in
 * again. The legacy function finished with `location.href = 'index.html'`; the
 * App Router equivalent is a `router.replace('/')` after this resolves.
 */
export async function signOutPose(options?: { clearAll?: boolean }): Promise<void> {
  if (typeof window === 'undefined') return;

  // `confirmDeleteAccount()` @45567 finished by wiping every key, not just the
  // session ones, because the account it belonged to no longer exists.
  if (options?.clearAll) {
    window.localStorage.clear();
    window.sessionStorage.clear();
    clearForYouFeedCache();
    clearBuzzFeedCache();
    const { auth: staleAuth } = getPoseFirebase();
    await staleAuth.signOut().catch(() => undefined);
    return;
  }

  window.localStorage.setItem(LOGGED_OUT_KEY, '1');
  window.localStorage.removeItem(SESSION_KEY);
  window.localStorage.removeItem('userLoggedIn');
  window.localStorage.removeItem('currentUserId');
  window.sessionStorage.clear();
  clearForYouFeedCache();
  clearBuzzFeedCache();

  const { auth } = getPoseFirebase();
  await auth.signOut().catch(() => undefined);
}

export function usePoseSession(): PoseSessionState {
  const [state, setState] = useState<PoseSessionState>(() => ({
    status: 'loading',
    user: readLegacySession(),
  }));

  useEffect(() => {
    const { auth } = getPoseFirebase();
    return onAuthStateChanged(auth, (user) => {
      setState((previous) => {
        if (!user) return previous.status === 'signed-out' && previous.user === null ? previous : { status: 'signed-out', user: null };
        const cached = readLegacySession();
        const next: PoseSessionState = {
          status: 'signed-in',
          // Auth carries no Firestore avatar, so the cached session fills it in.
          user: cached && cached.uid === user.uid ? merge(cached, fromAuthUser(user)) : fromAuthUser(user),
        };
        if (previous.status === next.status && sameSession(previous.user, next.user)) {
          return previous;
        }
        return next;
      });
    });
  }, []);

  return state;
}

function merge(cached: PoseSession, fresh: PoseSession): PoseSession {
  return {
    ...fresh,
    displayName: fresh.displayName || cached.displayName,
    photoURL: fresh.photoURL || cached.photoURL,
  };
}
