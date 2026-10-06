'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';

import { getPoseFirebase } from '@/lib/firebase';

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
    const parsed = JSON.parse(raw) as Partial<PoseSession>;
    if (typeof parsed.uid !== 'string' || parsed.uid.length === 0) return null;
    return {
      uid: parsed.uid,
      email: parsed.email ?? '',
      displayName: parsed.displayName ?? '',
      photoURL: parsed.photoURL ?? '',
    };
  } catch {
    return null;
  }
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
        const next: PoseSessionState = user
          ? { status: 'signed-in', user: fromAuthUser(user) }
          : { status: 'signed-out', user: null };
        if (previous.status === next.status && sameSession(previous.user, next.user)) {
          return previous;
        }
        return next;
      });
    });
  }, []);

  return state;
}
