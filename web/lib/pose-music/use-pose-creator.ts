'use client';

import { useCallback, useEffect, useState } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { POSE_CREATORS_COLLECTION, getPoseFirebase } from '@/lib/firebase';
import type { Artist } from './types';

/**
 * Replaces the legacy `initPoseFirebase()` / `initPoseMusicFeature()` pair, which
 * read `pose_creators/{uid}` through the compat SDK. The page has no sign-in UI of
 * its own: it adopts whatever Firebase Auth session the shared origin already
 * holds, exactly as the standalone HTML page did.
 */
export function usePoseCreator() {
  const [user, setUser] = useState<User | null>(null);
  const [artist, setArtist] = useState<Artist | null>(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const { auth, db } = getPoseFirebase();
    let cancelled = false;

    const unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
      if (cancelled) return;
      setUser(nextUser);
      if (!nextUser) {
        setArtist(null);
        setAuthReady(true);
        return;
      }
      try {
        const snapshot = await getDoc(doc(db, POSE_CREATORS_COLLECTION, nextUser.uid));
        if (cancelled) return;
        setArtist(snapshot.exists() ? { id: nextUser.uid, ...snapshot.data() } as Artist : null);
      } catch (error) {
        console.error('[Pose] Init:', error);
        if (!cancelled) setArtist(null);
      } finally {
        if (!cancelled) setAuthReady(true);
      }
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  const createProfile = useCallback(async (profile: Omit<Artist, 'id' | 'uid'>) => {
    const { auth, db } = getPoseFirebase();
    const current = auth.currentUser;
    if (!current) throw new Error('not-signed-in');
    const record: Artist = { ...profile, uid: current.uid, id: current.uid };
    await setDoc(doc(db, POSE_CREATORS_COLLECTION, current.uid), {
      ...record,
      joinedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return record;
  }, []);

  const updateProfile = useCallback(
    async (uid: string, updates: Partial<Artist>) => {
      const { db } = getPoseFirebase();
      await updateDoc(doc(db, POSE_CREATORS_COLLECTION, uid), {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    },
    [],
  );

  return { user, artist, setArtist, authReady, createProfile, updateProfile };
}
