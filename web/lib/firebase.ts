'use client';

import { getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

/**
 * Replaces the legacy CDN compat SDK (`firebase-*-compat.js` 9.22.0 loaded as
 * globals plus `firebase.initializeApp` in every page). The compat bundle cannot
 * run under the App Router because it touches `window` at module scope.
 */

type PoseFirebase = {
  app: FirebaseApp;
  auth: Auth;
  db: Firestore;
  storage: FirebaseStorage;
};

let cached: PoseFirebase | undefined;

export function getPoseFirebase(): PoseFirebase {
  const apiKey = process.env['NEXT_PUBLIC_FIREBASE_API_KEY'];
  const authDomain = process.env['NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN'];
  const projectId = process.env['NEXT_PUBLIC_FIREBASE_PROJECT_ID'];
  const storageBucket = process.env['NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET'];
  const appId = process.env['NEXT_PUBLIC_FIREBASE_APP_ID'];

  if (!apiKey || !authDomain || !projectId || !storageBucket || !appId) {
    throw new Error(
      'Missing NEXT_PUBLIC_FIREBASE_* environment variables. See .env.example.',
    );
  }

  if (!cached) {
    const app: FirebaseApp = getApps()[0] ?? initializeApp({
      apiKey,
      authDomain,
      projectId,
      storageBucket,
      appId,
    });
    cached = {
      app,
      auth: getAuth(app),
      db: getFirestore(app),
      storage: getStorage(app),
    };
  }

  return cached;
}

export const POSE_CREATORS_COLLECTION = 'pose_creators';
export const POSE_SONGS_COLLECTION = 'pose_songs';
