'use client';

import {
  collection,
  deleteField,
  doc,
  getDoc,
  getDocs,
  increment,
  limit,
  orderBy,
  query,
  setDoc,
  updateDoc,
} from 'firebase/firestore';

import { getPoseFirebase } from '@/lib/firebase';

import { toMillis } from './feed';

/**
 * The comment sheet behind `#commentModal` @72649 (For You, opened by
 * `openCommentModal()` @66211) and `#buzzCommentModal` @72874 (Buzz, opened by
 * `openBuzzComments()` @33961).
 *
 * The two are the same sheet — the legacy duplicated the markup, the renderer and
 * the input bar, and the only real difference is where the documents live: a For
 * You comment hangs off `{videos|posts}/{videoId}/comments/{commentId}`, a buzz one
 * off `postedtweetdata/{date}/posts/{postId}/comments/{commentId}`. Replies are a
 * `replies` subcollection one level under a comment, and a reply to a reply is
 * another `replies` subcollection under that.
 */

export type CommentMedia = {
  type?: string;
  url?: string;
  filename?: string;
  duration?: number;
  publicId?: string;
  cloudinaryUrl?: string;
  /** A gifted comment carries its receipt instead of an upload — `cleanMedia()`. */
  giftId?: string | null;
  name?: string;
  qty?: number;
  price?: number;
  subtotal?: number;
  img?: string | null;
  targetUserId?: string | null;
  giftStatus?: string;
  giftDocId?: string;
};

export type CommentReaction = { count: number; users: Record<string, unknown> };

/**
 * Which sheet's comments these are. `openCommentModal()` and `openBuzzComments()`
 * differed only in the path they built, so the port hands that identity around as
 * data instead of duplicating the sheet.
 */
export type CommentTarget =
  | { kind: 'video'; id: string }
  | { kind: 'buzz'; id: string; date: string };

/** A For You item's key in the count tables — see `commentTargetKey()`. */
export function videoCommentsKey(videoId: string): string {
  return `video:${videoId}`;
}

/** A buzz post's key in the count tables — see `commentTargetKey()`. */
export function buzzCommentsKey(post: { id: string; date?: string }): string {
  return `buzz:${post.date ?? ''}/${post.id}`;
}

/** A stable key for a target: React keys, and the feed buttons' count tables. */
export function commentTargetKey(target: CommentTarget): string {
  return target.kind === 'video' ? videoCommentsKey(target.id) : buzzCommentsKey(target);
}

export type Comment = {
  id: string;
  text?: string;
  username?: string;
  userId?: string;
  userInitial?: string;
  profilePic?: string;
  timestamp?: unknown;
  likes?: number;
  likedBy?: Record<string, unknown>;
  reactions?: Record<string, CommentReaction>;
  media?: CommentMedia[];
  replies?: Comment[];
  /** The item's owner, so the sheet can ring their comments and the 1st badge. */
  videoOwnerId?: string;
  /** The username a reply's `@mention` points at. */
  replyingTo?: string;
  /** Set on a reply while it is being optimistically rendered. */
  isReply?: boolean;
  isPending?: boolean;
};

const COMMENT_LIMIT = 100;

/**
 * `getCommentCollection()` @70827. Comments hang off whichever doc exists, so a
 * video that lives in `posts` reads and writes there. The legacy *reads* did that;
 * the like writes hard-coded `videos` and so silently did nothing for a post — this
 * resolves once and both sides use it. The answer is cached per video because the
 * like/reply writes call it on every tap.
 */
const collectionCache = new Map<string, 'videos' | 'posts'>();

async function resolveCommentCollection(videoId: string): Promise<'videos' | 'posts'> {
  if (!videoId) return 'videos';
  const cached = collectionCache.get(videoId);
  if (cached) return cached;

  const { db } = getPoseFirebase();
  for (const name of ['videos', 'posts'] as const) {
    try {
      const snapshot = await getDoc(doc(db, name, videoId));
      if (snapshot.exists()) {
        collectionCache.set(videoId, name);
        return name;
      }
    } catch {
      /* a refused read is not a reason to stop trying the next collection */
    }
  }

  // Neither exists yet: the first write creates it under `videos`, exactly as the
  // legacy fallback did.
  collectionCache.set(videoId, 'videos');
  return 'videos';
}

type Db = ReturnType<typeof getPoseFirebase>['db'];

/**
 * `getCommentCollection()` resolved a video's comments and both sheets then walked
 * their own path from there; this is that one place.
 */
async function commentsOf(db: Db, target: CommentTarget) {
  if (target.kind === 'buzz') {
    return collection(db, 'postedtweetdata', target.date, 'posts', target.id, 'comments');
  }
  const name = await resolveCommentCollection(target.id);
  return collection(db, name, target.id, 'comments');
}

/**
 * `fetchCommentsInBackground()` @69468. Parents are newest-first, capped at 100;
 * replies are fetched per parent, and each reply's own replies one level deeper.
 * The legacy version did this with a `Promise` per reply and only ever reported
 * failures to the console; the nesting stops at two levels here for the same reason
 * it did there — the sheet renders no deeper.
 */
export async function loadComments(target: CommentTarget): Promise<Comment[]> {
  const { db } = getPoseFirebase();
  const comments = await commentsOf(db, target);

  const parents = await getDocs(query(comments, orderBy('timestamp', 'desc'), limit(COMMENT_LIMIT)));

  const loaded: Comment[] = [];
  for (const entry of parents.docs) {
    const comment = { id: entry.id, ...entry.data() } as Comment;
    comment.replies = await loadReplies(comments, entry.id, entry.data().replies);
    loaded.push(comment);
  }
  return loaded;
}

/**
 * Reads one level of replies, then each reply's own replies from the subcollection
 * under it. A comment written before replies moved into a subcollection can still
 * carry them as an inline `replies` array, so that is the fallback — the legacy
 * merged the two the same way, with the subcollection winning.
 */
async function loadReplies(
  comments: ReturnType<typeof collection>,
  commentId: string,
  inline: unknown,
): Promise<Comment[]> {
  const snapshot = await getDocs(query(collection(comments, commentId, 'replies'), orderBy('timestamp', 'desc')));

  if (snapshot.empty && Array.isArray(inline)) {
    return (inline as Comment[]).map((reply) => ({
      ...reply,
      isReply: true,
      replies: reply.replies?.map((nested) => ({ ...nested, isReply: true })),
    }));
  }

  const replies: Comment[] = [];
  for (const entry of snapshot.docs) {
    const reply = { id: entry.id, ...entry.data(), isReply: true } as Comment;
    const nested = await getDocs(
      query(collection(comments, commentId, 'replies', entry.id, 'replies'), orderBy('timestamp', 'desc')),
    );
    reply.replies = nested.docs.map((doc) => ({ id: doc.id, ...doc.data(), isReply: true }) as Comment);
    replies.push(reply);
  }
  return replies;
}

/** `cleanReplies_Helper()` @71040 — strips anything that cannot be stored. */
function cleanReplies(replies: Comment[] | undefined): Comment[] {
  return (replies ?? []).map((reply) => ({
    id: reply.id,
    text: reply.text ?? '',
    username: reply.username,
    userInitial: reply.userInitial,
    profilePic: reply.profilePic,
    timestamp: reply.timestamp,
    likes: reply.likes ?? 0,
    likedBy: reply.likedBy ?? {},
    userId: reply.userId,
    replyingTo: reply.replyingTo,
    media: cleanMedia(reply.media),
    replies: reply.replies ? cleanReplies(reply.replies) : [],
  }));
}

/**
 * `saveCommentToFirebase()` @70853's media pass. The legacy version carried a
 * `blob` on local media for immediate playback and stripped it here; the port
 * previews from an object URL instead, so only the fields Firestore can hold
 * survive — and a media item with no URL is dropped rather than saved broken,
 * unless it is a gift, which never had one.
 */
function cleanMedia(media: CommentMedia[] | undefined): CommentMedia[] {
  return (media ?? [])
    .map((item) => {
      if (item.type === 'gift') {
        const gift: CommentMedia = {
          type: 'gift',
          giftId: item.giftId ?? null,
          name: item.name ?? '',
          qty: Number(item.qty) || 1,
          price: Number(item.price) || 0,
          subtotal: Number(item.subtotal) || 0,
          img: item.img ?? null,
          giftStatus: item.giftStatus ?? 'unclaimed',
        };
        if (item.targetUserId) gift.targetUserId = item.targetUserId;
        if (item.giftDocId) gift.giftDocId = item.giftDocId;
        return gift;
      }

      if (typeof item.url !== 'string' || !item.url) return null;
      const clean: CommentMedia = {
        type: item.type ?? 'unknown',
        url: item.url,
        filename: item.filename ?? 'unnamed',
      };
      if (item.publicId) clean.publicId = item.publicId;
      if (item.cloudinaryUrl) clean.cloudinaryUrl = item.cloudinaryUrl;
      if (typeof item.duration === 'number') clean.duration = item.duration;
      return clean;
    })
    .filter((item): item is CommentMedia => item !== null);
}

/**
 * `saveCommentToFirebase()` @70853. Writes the comment and then bumps the item's
 * `comments` counter — but only for a top-level entry, which is the legacy
 * `isParentWithReply` guard: attaching a reply must not count twice.
 */
export async function saveComment(
  target: CommentTarget,
  comment: Comment,
  options: { countsAsParent?: boolean } = {},
): Promise<void> {
  if (!comment?.id) return;
  const { db } = getPoseFirebase();
  const comments = await commentsOf(db, target);

  const payload: Record<string, unknown> = {
    id: comment.id,
    text: comment.text ?? '',
    username: comment.username,
    userInitial: comment.userInitial,
    profilePic: comment.profilePic ?? null,
    timestamp: comment.timestamp,
    likes: comment.likes ?? 0,
    likedBy: comment.likedBy ?? {},
    userId: comment.userId,
    media: cleanMedia(comment.media),
    replies: cleanReplies(comment.replies),
  };
  if (comment.videoOwnerId) payload.videoOwnerId = comment.videoOwnerId;

  try {
    await setDoc(doc(comments, comment.id), payload);
    if (options.countsAsParent !== false) await bumpCommentCount(target);
  } catch (error) {
    console.error('❌ saving the comment:', error);
    throw error;
  }
}

/**
 * A brand-new parent document has no `comments` field yet and `update()` on a
 * missing document throws — the legacy swallowed that, so the first comment on such
 * a document never counted. `setDoc` with `merge` creates it instead.
 */
async function bumpCommentCount(target: CommentTarget): Promise<void> {
  const { db } = getPoseFirebase();
  // `commentsOf()` ends in `.../comments`, so its parent is the item itself,
  // whichever collection that turned out to be.
  const parent = (await commentsOf(db, target)).parent;
  if (!parent) return;
  try {
    await setDoc(parent, { comments: increment(1) }, { merge: true });
  } catch (error) {
    console.warn('⚠️ could not increment the comment count:', error);
  }
}

/**
 * `saveReplyToFirebase()` @71266. A reply is its own document in the parent
 * comment's `replies` subcollection; a reply to a reply goes one level deeper
 * again, which is where the reader looks for it. `saveBuzzNestedReplyToFirebase()`
 * @34933 wrote the buzz side that way, while the For You writer flattened a nested
 * reply into a sibling and lost the nesting — this keeps the deeper document on
 * both.
 *
 * Buzz counts a reply towards the post's comment tally (`saveBuzzReplyToFirebase()`
 * @34861) and the For You path never touched the counter, so which it is follows
 * the target rather than the caller.
 */
export async function saveReply(
  target: CommentTarget,
  params: { parentCommentId: string; parentReplyId?: string | null; reply: Comment },
): Promise<void> {
  const { parentCommentId, parentReplyId, reply } = params;
  if (!parentCommentId || !reply?.id) return;

  const { db } = getPoseFirebase();
  const comments = await commentsOf(db, target);
  const destination = parentReplyId
    ? doc(comments, parentCommentId, 'replies', parentReplyId, 'replies', reply.id)
    : doc(comments, parentCommentId, 'replies', reply.id);

  const payload: Record<string, unknown> = {
    id: reply.id,
    text: reply.text ?? '',
    username: reply.username,
    userInitial: reply.userInitial,
    profilePic: reply.profilePic ?? null,
    timestamp: reply.timestamp,
    likes: reply.likes ?? 0,
    likedBy: reply.likedBy ?? {},
    userId: reply.userId,
    media: cleanMedia(reply.media),
    replyingTo: reply.replyingTo ?? null,
  };
  if (reply.videoOwnerId) payload.videoOwnerId = reply.videoOwnerId;

  try {
    await setDoc(destination, payload);
    if (target.kind === 'buzz') await bumpCommentCount(target);
  } catch (error) {
    console.error('❌ saving the reply:', error);
    throw error;
  }
}

/** `saveCommentLikeToFirebase()` @71327, against the resolved collection. */
export async function setCommentLike(
  target: CommentTarget,
  commentId: string,
  uid: string,
  liked: boolean,
  likeCount: number,
): Promise<void> {
  const { db } = getPoseFirebase();
  try {
    await updateDoc(doc(await commentsOf(db, target), commentId), {
      likes: likeCount,
      [`likedBy.${uid}`]: liked ? true : deleteField(),
    });
  } catch (error) {
    console.error('❌ saving the comment like:', error);
  }
}

/**
 * `saveReplyLikeToFirebase()` @71369 wrote the like onto a `replies` *array field*
 * of the parent comment, while a reply is read back from the `replies`
 * subcollection — so a reply like never survived a reload. This writes where the
 * reader looks.
 */
export async function setReplyLike(
  target: CommentTarget,
  parentCommentId: string,
  parentReplyId: string | null,
  replyId: string,
  uid: string,
  liked: boolean,
  likeCount: number,
): Promise<void> {
  const { db } = getPoseFirebase();
  const comments = await commentsOf(db, target);
  const reply = parentReplyId
    ? doc(comments, parentCommentId, 'replies', parentReplyId, 'replies', replyId)
    : doc(comments, parentCommentId, 'replies', replyId);
  try {
    await updateDoc(reply, {
      likes: likeCount,
      [`likedBy.${uid}`]: liked ? true : deleteField(),
    });
  } catch (error) {
    console.error('❌ saving the reply like:', error);
  }
}

/**
 * How the two sheets stack reactions. `addCommentReaction()` @71421 kept *one*
 * reaction per user on the For You side — picking a second emoji took the first one
 * back — while `addBuzzCommentReaction()` @35017 let a user hold several at once.
 * Both are kept as-is; the sheet asks for the one its target uses.
 */
export type ReactionMode = 'single' | 'multi';

/** The pure part of the two reaction writers, so the rules can be read at once. */
export function applyReaction(
  reactions: Record<string, CommentReaction> | undefined,
  emoji: string,
  uid: string,
  mode: ReactionMode,
): Record<string, CommentReaction> {
  const next: Record<string, CommentReaction> = {};
  for (const [key, value] of Object.entries(reactions ?? {})) {
    next[key] = { count: value.count, users: { ...value.users } };
  }

  const remove = (key: string) => {
    const entry = next[key];
    if (!entry) return;
    const users = { ...entry.users };
    delete users[uid];
    const count = Math.max(0, entry.count - 1);
    if (count === 0) delete next[key];
    else next[key] = { count, users };
  };

  // Tapping the emoji you already picked always takes it back.
  if (next[emoji]?.users?.[uid]) {
    remove(emoji);
    return next;
  }

  if (mode === 'single') {
    for (const key of Object.keys(next)) {
      if (next[key]?.users?.[uid]) remove(key);
    }
  }

  next[emoji] = {
    count: (next[emoji]?.count ?? 0) + 1,
    users: { ...(next[emoji]?.users ?? {}), [uid]: true },
  };
  return next;
}

/** The counts row under a comment: the emoji and its tally, plus whether it is yours. */
export function reactionEntries(
  reactions: Record<string, CommentReaction> | undefined,
  uid: string | null,
): { emoji: string; count: number; mine: boolean }[] {
  return Object.entries(reactions ?? {}).map(([emoji, value]) => ({
    emoji,
    count: value.count,
    mine: Boolean(uid && value.users?.[uid]),
  }));
}

/**
 * `saveCommentReactionToFirebase()` @71564. The legacy used `update()`, which
 * throws when the document is missing; `setDoc` with `merge` writes the map and
 * leaves the rest of the comment alone either way.
 */
export async function setCommentReactions(
  target: CommentTarget,
  commentId: string,
  reactions: Record<string, CommentReaction>,
): Promise<void> {
  const { db } = getPoseFirebase();
  try {
    await setDoc(doc(await commentsOf(db, target), commentId), { reactions }, { merge: true });
  } catch (error) {
    console.error('❌ saving the reaction:', error);
  }
}

/** `saveReplyReactionToFirebase()` @71619, written to the reply document itself. */
export async function setReplyReactions(
  target: CommentTarget,
  parentCommentId: string,
  parentReplyId: string | null,
  replyId: string,
  reactions: Record<string, CommentReaction>,
): Promise<void> {
  const { db } = getPoseFirebase();
  const comments = await commentsOf(db, target);
  const reply = parentReplyId
    ? doc(comments, parentCommentId, 'replies', parentReplyId, 'replies', replyId)
    : doc(comments, parentCommentId, 'replies', replyId);
  try {
    await setDoc(reply, { reactions }, { merge: true });
  } catch (error) {
    console.error('❌ saving the reply reaction:', error);
  }
}

/** `getTimeAgo()` — the sheet's timestamps, from the shared relative formatter. */
export function commentTimeLabel(timestamp: unknown): string {
  const millis = toMillis(timestamp);
  if (!millis) return 'now';

  const seconds = Math.floor((Date.now() - millis) / 1000);
  if (seconds < 60) return 'now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo`;
  return `${Math.floor(days / 365)}y`;
}

/**
 * `renderCommentsList()` @69769 counted every parent plus its replies and wrote
 * that total back onto the comment button, rather than trusting the stored counter.
 * Kept, because the two drift apart the moment a comment is deleted.
 */
export function commentTotal(comments: Comment[]): number {
  return comments.reduce((total, comment) => total + 1 + (comment.replies?.length ?? 0), 0);
}

export function isLikedBy(comment: Comment, uid: string | null): boolean {
  return Boolean(uid && comment.likedBy?.[uid]);
}
