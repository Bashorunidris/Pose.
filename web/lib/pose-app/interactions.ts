'use client';

import { deleteField, doc, getDoc, updateDoc } from 'firebase/firestore';

import { getPoseFirebase } from '@/lib/firebase';

/**
 * Every write below mirrors the legacy handler it replaces (line numbers are
 * `index.html`): optimistic UI first, then one `update()` on the document, and
 * failures are logged rather than surfaced because the legacy app never blocked
 * the feed on a rejected vote.
 */

function logError(context: string, error: unknown): void {
  console.error(`❌ ${context}:`, error);
}

export async function setVideoLike(videoId: string, uid: string, liked: boolean, likeCount: number): Promise<void> {
  const { db } = getPoseFirebase();
  try {
    await updateDoc(doc(db, 'videos', videoId), {
      likeCount,
      [`likes.${uid}`]: liked ? true : deleteField(),
    });
  } catch (error) {
    logError('updating video like', error);
  }
}

export async function setVideoRepost(videoId: string, uid: string, reposted: boolean, repostCount: number): Promise<void> {
  const { db } = getPoseFirebase();
  try {
    await updateDoc(doc(db, 'videos', videoId), {
      repostCount,
      [`reposts.${uid}`]: reposted ? true : deleteField(),
    });
  } catch (error) {
    logError('updating video repost', error);
  }
}

function buzzRef(buzzDate: string, buzzId: string) {
  const { db } = getPoseFirebase();
  return doc(db, 'postedtweetdata', buzzDate, 'posts', buzzId);
}

export async function setBuzzLike(buzzId: string, buzzDate: string, uid: string, liked: boolean, likes: number): Promise<void> {
  try {
    await updateDoc(buzzRef(buzzDate, buzzId), {
      likes,
      [`likedBy.${uid}`]: liked ? true : deleteField(),
    });
  } catch (error) {
    logError('updating buzz like', error);
  }
}

export async function setBuzzRepost(buzzId: string, buzzDate: string, uid: string, reposted: boolean, reposts: number): Promise<void> {
  try {
    await updateDoc(buzzRef(buzzDate, buzzId), {
      reposts,
      [`repostedBy.${uid}`]: reposted ? true : deleteField(),
    });
  } catch (error) {
    logError('updating buzz repost', error);
  }
}

/**
 * Hit and pass are one vote each: hitting clears the pass and vice versa, and the
 * counters are recounted from the two voter maps so they can never go negative
 * (`updateBuzzHitInFirebase` @33708, `updateBuzzPassInFirebase` @33783).
 */
async function setBuzzVote(
  buzzId: string,
  buzzDate: string,
  uid: string,
  vote: 'hit' | 'pass',
  active: boolean,
): Promise<{ buzzhit: number; buzzpass: number } | null> {
  const key = vote === 'hit' ? 'buzzhitBy' : 'buzzpassBy';
  const other = vote === 'hit' ? 'buzzpassBy' : 'buzzhitBy';
  const ref = buzzRef(buzzDate, buzzId);
  try {
    await updateDoc(ref, {
      [`${key}.${uid}`]: active ? true : deleteField(),
      ...(active ? { [`${other}.${uid}`]: deleteField() } : {}),
    });
    const fresh = await getDoc(ref);
    const data = fresh.data();
    if (!data) return null;
    const hitCount = Object.keys((data.buzzhitBy as Record<string, unknown> | undefined) ?? {}).length;
    const passCount = Object.keys((data.buzzpassBy as Record<string, unknown> | undefined) ?? {}).length;
    await updateDoc(ref, { buzzhit: hitCount, buzzpass: passCount });
    return { buzzhit: hitCount, buzzpass: passCount };
  } catch (error) {
    logError('updating buzz vote', error);
    return null;
  }
}

export function setBuzzHit(buzzId: string, buzzDate: string, uid: string, active: boolean) {
  return setBuzzVote(buzzId, buzzDate, uid, 'hit', active);
}

export function setBuzzPass(buzzId: string, buzzDate: string, uid: string, active: boolean) {
  return setBuzzVote(buzzId, buzzDate, uid, 'pass', active);
}

/**
 * Follow writes a pair of reverse maps on the two user documents
 * (`toggleFollowUser` @33005); the legacy code marks the current user's cached
 * `following` too so a re-render does not offer the button again.
 */
export async function setFollow(targetUserId: string, uid: string, following: boolean): Promise<void> {
  const { db } = getPoseFirebase();
  try {
    await updateDoc(doc(db, 'users', uid), {
      [`following.${targetUserId}`]: following ? true : deleteField(),
    });
    await updateDoc(doc(db, 'users', targetUserId), {
      [`followers.${uid}`]: following ? true : deleteField(),
    });
  } catch (error) {
    logError('updating follow', error);
  }
}
