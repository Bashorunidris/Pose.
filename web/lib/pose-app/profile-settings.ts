/**
 * The profile screen's editing surface, lifted from `saveProfileChanges()`,
 * `saveProfileVisibility()`, the blocked-accounts modal and the two account
 * teardown flows.
 *
 * The profile picture is stored base64 in the user document, so it is downscaled
 * before encoding — a raw camera photo blows past Firestore's 1 MiB document
 * limit (see the legacy `resizeImageToBase64`, which this mirrors).
 */

import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
  writeBatch,
} from 'firebase/firestore';
import { deleteUser, type User } from 'firebase/auth';

import { getPoseFirebase } from '@/lib/firebase';

export const PHOTO_MAX_DIMENSION = 400;
export const PHOTO_QUALITY = 0.82;

export type ProfileVisibility = 'public' | 'followers' | 'private';

export const VISIBILITY_OPTIONS: { value: ProfileVisibility; label: string }[] = [
  { value: 'public', label: 'Public' },
  { value: 'followers', label: 'Followers Only' },
  { value: 'private', label: 'Private' },
];

export type ProfileLinkInput = { title: string; url: string };

export type ProfileEditValues = {
  name: string;
  username: string;
  bio: string;
  links: ProfileLinkInput[];
};

export type BlockedAccount = {
  uid: string;
  name: string;
  pic: string;
};

/** `resizeImageToBase64()` — canvas downscale, longer edge capped, JPEG re-encode. */
export function resizeImageToBase64(
  file: File,
  maxDimension = PHOTO_MAX_DIMENSION,
  quality = PHOTO_QUALITY,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read the selected image'));
    reader.onload = (event) => {
      const image = new Image();
      image.onerror = () => reject(new Error('Could not decode the selected image'));
      image.onload = () => {
        const scale = Math.min(1, maxDimension / Math.max(image.width, image.height));
        const width = Math.max(1, Math.round(image.width * scale));
        const height = Math.max(1, Math.round(image.height * scale));

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas is unavailable'));
          return;
        }
        ctx.drawImage(image, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      image.src = String(event.target?.result ?? '');
    };
    reader.readAsDataURL(file);
  });
}

/** `loadProfileDataForEdit()` — the fields the edit form opens with. */
export async function loadProfileForEdit(uid: string): Promise<ProfileEditValues> {
  const { db } = getPoseFirebase();
  const snapshot = await getDoc(doc(db, 'users', uid));
  const data = snapshot.exists() ? (snapshot.data() as Record<string, unknown>) : {};
  const name = String(data.displayName ?? data.name ?? '');
  const rawLinks = Array.isArray(data.links) ? (data.links as unknown[]) : [];

  return {
    name,
    username: String(data.username ?? ''),
    bio: String(data.bio ?? ''),
    links: rawLinks
      .map((entry) => {
        if (!entry || typeof entry !== 'object') return null;
        const record = entry as { title?: string; url?: string };
        if (!record.title || !record.url) return null;
        return { title: record.title, url: record.url };
      })
      .filter((entry): entry is ProfileLinkInput => entry !== null),
  };
}

/**
 * `saveProfileChanges()` — the legacy form also wrote `name` beside
 * `displayName`, because older screens read one and newer ones read the other.
 */
export async function saveProfileChanges(
  uid: string,
  values: ProfileEditValues,
  photo?: File | null,
): Promise<{ photoDataUrl: string | null }> {
  const { db } = getPoseFirebase();
  const name = values.name.trim();
  const username = values.username.trim();

  const updates: Record<string, unknown> = {
    displayName: name,
    name,
    username,
    bio: values.bio.trim(),
    links: values.links
      .map((link) => ({ title: link.title.trim(), url: link.url.trim() }))
      .filter((link) => link.title && link.url),
    updatedAt: new Date().toISOString(),
  };

  let photoDataUrl: string | null = null;
  if (photo) {
    photoDataUrl = await resizeImageToBase64(photo);
    updates.profilePicUrl = photoDataUrl;
  }

  await setDoc(doc(db, 'users', uid), updates, { merge: true });
  return { photoDataUrl };
}

/** `saveProfileVisibility()` — who is allowed to open this profile. */
export async function saveProfileVisibility(uid: string, value: ProfileVisibility): Promise<void> {
  const { db } = getPoseFirebase();
  await setDoc(
    doc(db, 'users', uid),
    { profileVisibility: value, updatedAt: new Date().toISOString() },
    { merge: true },
  );
}

/** `loadUserSettings()` @45305 — seeds the visibility `<select>` on open. */
export async function loadProfileVisibility(uid: string): Promise<ProfileVisibility> {
  const { db } = getPoseFirebase();
  const snapshot = await getDoc(doc(db, 'users', uid));
  const value = snapshot.exists() ? snapshot.get('profileVisibility') : undefined;
  return value === 'followers' || value === 'private' ? value : 'public';
}

/** `loadBlockedAccountsList()` — `users/{uid}/blockedUsers`. */
export async function loadBlockedAccounts(uid: string): Promise<BlockedAccount[]> {
  const { db } = getPoseFirebase();
  const snapshot = await getDocs(collection(db, 'users', uid, 'blockedUsers'));
  return snapshot.docs.map((entry) => {
    const data = (entry.data() ?? {}) as Record<string, unknown>;
    return {
      uid: String(data.blockedUserId ?? entry.id),
      name: String(data.blockedUsername ?? data.blockedUserId ?? entry.id),
      pic: String(data.blockedProfilePic ?? ''),
    };
  });
}

/** `unblockUser()` — clears the Firestore record and the local moderation cache. */
export async function unblockUser(uid: string, blockedUid: string): Promise<void> {
  const { db } = getPoseFirebase();
  await deleteDoc(doc(db, 'users', uid, 'blockedUsers', blockedUid));
  try {
    const cached = JSON.parse(localStorage.getItem('blockedUsers') || '[]') as string[];
    localStorage.setItem('blockedUsers', JSON.stringify(cached.filter((id) => id !== blockedUid)));
  } catch {
    // A blocked local cache is not worth failing the unblock over.
  }
}

/** `confirmDeactivateAccount()` — soft disable; logging out is the caller's job. */
export async function deactivateAccount(uid: string): Promise<void> {
  const { db } = getPoseFirebase();
  await setDoc(
    doc(db, 'users', uid),
    {
      accountStatus: 'deactivated',
      isActive: false,
      deactivatedAt: new Date().toISOString(),
    },
    { merge: true },
  );
}

async function deleteWhere(uid: string, path: string): Promise<void> {
  const { db } = getPoseFirebase();
  const snapshot = await getDocs(collection(db, path));
  const owned = snapshot.docs.filter((entry) => (entry.data() as { userId?: string }).userId === uid);
  if (owned.length === 0) return;
  const batch = writeBatch(db);
  owned.forEach((entry) => batch.delete(entry.ref));
  await batch.commit();
}

/**
 * `confirmDeleteAccount()` — the legacy chain deleted the user document, then
 * their posts, then their comments, and only then the auth account. Each step
 * tolerates a missing record so a half-deleted account can still be finished.
 *
 * The Auth delete can still refuse because the session is stale; the legacy
 * chain branched on `auth/requires-recent-login` and told the creator to sign in
 * again, so the outcome is reported back instead of thrown.
 */
export type DeleteAccountResult = {
  requiresRecentLogin: boolean;
  error: string | null;
};

export async function deleteAccount(uid: string, authUser: User | null): Promise<DeleteAccountResult> {
  const { db } = getPoseFirebase();

  await deleteDoc(doc(db, 'users', uid)).catch(() => undefined);
  await deleteWhere(uid, 'posts').catch(() => undefined);
  await deleteWhere(uid, 'comments').catch(() => undefined);

  if (authUser) {
    try {
      await deleteUser(authUser);
    } catch (error) {
      const code = (error as { code?: string }).code;
      if (code === 'auth/requires-recent-login') {
        return { requiresRecentLogin: true, error: null };
      }
      return { requiresRecentLogin: false, error: error instanceof Error ? error.message : String(error) };
    }
  }

  return { requiresRecentLogin: false, error: null };
}
