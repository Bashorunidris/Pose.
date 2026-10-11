/**
 * The two things every publish path needs before it can write a document: who
 * the author is, and the permission switches as named fields.
 *
 * Both were private to `publish.ts` while video was the only thing being
 * published; photo mode writes the same shape, so they live here rather than
 * being copied into a second module.
 */
import { doc, getDoc } from 'firebase/firestore';

import { getPoseFirebase } from '@/lib/firebase';
import { POST_TOGGLES, type PostFields } from './publish';

export type PostAuthor = {
  uid: string;
  name: string;
  username: string;
  profilePic: string | null;
};

/** The `users/{uid}` lookup every publish path did before it wrote anything. */
export async function loadPostAuthor(uid: string): Promise<PostAuthor> {
  const { db } = getPoseFirebase();
  const snapshot = await getDoc(doc(db, 'users', uid));
  const data = snapshot.data() ?? {};
  return {
    uid,
    name: (data['name'] as string) || 'Anonymous',
    username: (data['username'] as string) || 'user',
    profilePic: (data['profilePicUrl'] as string) || null,
  };
}

/**
 * The seven switches as the fields they write. The legacy read them back with
 * `input[type="checkbox"]:nth-of-type(n)`, which silently reorders if a switch
 * is ever added, and defaulted Allow Download to off with the rest on.
 */
export function toggleFields(fields: PostFields): Record<string, boolean> {
  return Object.fromEntries(
    POST_TOGGLES.map((toggle) => [toggle.field, fields.toggles[toggle.field] ?? false]),
  );
}
