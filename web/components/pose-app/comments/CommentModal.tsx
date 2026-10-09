'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';

import { cx } from '../styles';
import * as UI from './comment-ui';
import { initials } from '@/lib/pose-app/format';
import {
  applyReaction,
  commentTimeLabel,
  commentTotal,
  isLikedBy,
  loadComments,
  reactionEntries,
  saveComment,
  saveReply,
  setCommentLike,
  setCommentReactions,
  setReplyLike,
  setReplyReactions,
  type Comment,
  type CommentMedia,
  type CommentTarget,
  type ReactionMode,
} from '@/lib/pose-app/comments';

type Props = {
  open: boolean;
  /** Which sheet this is — a For You video or a buzz post. */
  target: CommentTarget | null;
  /** The item's owner, so the sheet can ring their comments and the 1st badge. */
  ownerId: string | null;
  uid: string | null;
  viewerName: string;
  viewerPic: string;
  onClose: () => void;
  onToast: (message: string) => void;
  onOpenCreator: (userId: string) => void;
  /** `updateCommentCountDisplay()` @70809 — the sheet reports the real total back. */
  onCount: (target: CommentTarget, count: number) => void;
};

/** `insertEmoji()` @71842's palette. Voice recording is the only other entry. */
const EMOJI = ['❤️', '😂', '🔥', '😍', '👏', '😮', '😢', '🙏', '💯', '✨'];

/**
 * The bar `addCommentReaction()` offered on both sheets. For You takes a
 * reaction back when a second one is picked; Buzz lets a user hold several — see
 * `applyReaction()`. The emoji are the stored keys, not decoration, so they stay
 * emoji.
 */
const REACTIONS = ['😠', '😊', '😑'];

/** `startCommentLongPress()` @71693 held the row for 500ms before revealing. */
const LONG_PRESS_MS = 500;

/**
 * Where a row's document lives: the top-level comment it hangs under, and the
 * reply it hangs under when it is a reply to a reply.
 */
type RowPath = { commentId: string; replyId: string | null };

/** One row's identity inside the sheet — what a revealed reaction bar keys off. */
function rowKey(path: RowPath, rowId: string): string {
  return `${path.commentId}/${path.replyId ?? ''}/${rowId}`;
}

/**
 * The comment sheet — `#commentModal` @72649 (For You) and `#buzzCommentModal`
 * @72874 (Buzz), which the legacy built twice from the same code.
 *
 * Comments are newest first, exactly as `fetchCommentsInBackground()` read them,
 * with replies one level under a comment and one level under those.
 */
export function CommentModal({
  open,
  target,
  ownerId,
  uid,
  viewerName,
  viewerPic,
  onClose,
  onToast,
  onOpenCreator,
  onCount,
}: Props) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [state, setState] = useState<'idle' | 'loading' | 'ready' | 'failed'>('idle');
  const [text, setText] = useState('');
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [replyTo, setReplyTo] = useState<{ commentId: string; username: string; replyId?: string } | null>(null);
  const [sending, setSending] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [openMedia, setOpenMedia] = useState<{ kind: 'image' | 'video'; url: string } | null>(null);
  /** The one row whose reaction bar long-press has revealed, if any. */
  const [revealed, setRevealed] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  /** Only the newest load may write results — the sheet can be re-pointed mid-flight. */
  const requestRef = useRef(0);

  // `openCommentModal()` cleared the previous video's list before showing the
  // sheet, so one item's comments can never appear under another's.
  useEffect(() => {
    if (!open || !target) return;
    const token = requestRef.current + 1;
    requestRef.current = token;

    void Promise.resolve().then(async () => {
      setComments([]);
      setState('loading');
      setText('');
      setReplyTo(null);
      setEmojiOpen(false);
      setExpanded({});
      setRevealed(null);
      try {
        const loaded = await loadComments(target);
        if (requestRef.current !== token) return;
        setComments(loaded);
        setState('ready');
      } catch (error) {
        console.error('❌ loading comments:', error);
        if (requestRef.current === token) setState('failed');
      }
    });
  }, [open, target]);

  // `renderCommentsList()` reported the true total back onto the comment button.
  useEffect(() => {
    if (!target || state !== 'ready') return;
    onCount(target, commentTotal(comments));
  }, [target, state, comments, onCount]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  /** For You holds one reaction per user, Buzz holds as many as are tapped. */
  const mode: ReactionMode = target?.kind === 'buzz' ? 'multi' : 'single';

  /**
   * `renderCommentsList()` @69769's badge pass: the first comment left by anyone
   * other than the item's owner wears the "1st" ring.
   */
  const firstCommenterId = useMemo(() => {
    if (!ownerId) return null;
    const candidates = comments.filter((comment) => comment.userId !== ownerId);
    if (candidates.length === 0) return null;
    return [...candidates].sort((a, b) => toMs(a.timestamp) - toMs(b.timestamp))[0]?.id ?? null;
  }, [comments, ownerId]);

  const patchComment = useCallback((commentId: string, update: (comment: Comment) => Comment) => {
    setComments((current) => current.map((comment) => (comment.id === commentId ? update(comment) : comment)));
  }, []);

  /**
   * Rewrites one reply, wherever it sits: a comment's reply, or a reply of one of
   * those. The legacy addressed replies by array index inside the parent comment,
   * which is why a nested reply's like landed on the wrong document.
   */
  const patchReply = useCallback(
    (path: RowPath, replyId: string, update: (reply: Comment) => Comment) => {
      const patchIn = (rows: Comment[]): Comment[] =>
        rows.map((row) => {
          if (row.id === replyId) return update(row);
          const nested = row.replies ?? [];
          return nested.length === 0 ? row : { ...row, replies: patchIn(nested) };
        });

      setComments((current) =>
        current.map((comment) => (comment.id === path.commentId ? { ...comment, replies: patchIn(comment.replies ?? []) } : comment)),
      );
    },
    [],
  );

  const insertReply = useCallback((path: RowPath, reply: Comment) => {
    setComments((current) =>
      current.map((comment) => {
        if (comment.id !== path.commentId) return comment;
        if (!path.replyId) return { ...comment, replies: [...(comment.replies ?? []), reply] };
        return {
          ...comment,
          replies: (comment.replies ?? []).map((item) =>
            item.id === path.replyId ? { ...item, replies: [...(item.replies ?? []), reply] } : item,
          ),
        };
      }),
    );
  }, []);

  /**
   * Drops a row's pending flag once its document exists — or the row itself when
   * the write failed, so the sheet never claims a comment that was never saved.
   */
  const settleRow = useCallback((id: string, remove: boolean) => {
    const settle = (rows: Comment[]): Comment[] =>
      rows.flatMap((row) => {
        if (row.id === id) return remove ? [] : [{ ...row, isPending: false }];
        const nested = row.replies ?? [];
        return nested.length === 0 ? [row] : [{ ...row, replies: settle(nested) }];
      });
    setComments((current) => settle(current));
  }, []);

  const toggleCommentLike = (comment: Comment) => {
    if (!uid || !target) {
      onToast('Please login to like comments');
      return;
    }
    const liked = isLikedBy(comment, uid);
    const count = Math.max(0, (comment.likes ?? 0) + (liked ? -1 : 1));
    patchComment(comment.id, (current) => ({
      ...current,
      likes: count,
      likedBy: { ...(current.likedBy ?? {}), [uid]: !liked },
    }));
    void setCommentLike(target, comment.id, uid, !liked, count);
  };

  const toggleReplyLike = (reply: Comment, path: RowPath) => {
    if (!uid || !target) {
      onToast('Please login to like replies');
      return;
    }
    const liked = isLikedBy(reply, uid);
    const count = Math.max(0, (reply.likes ?? 0) + (liked ? -1 : 1));
    patchReply(path, reply.id, (current) => ({
      ...current,
      likes: count,
      likedBy: { ...(current.likedBy ?? {}), [uid]: !liked },
    }));
    void setReplyLike(target, path.commentId, path.replyId, reply.id, uid, !liked, count);
  };

  /**
   * `addCommentReaction()` @71421 and `addBuzzCommentReaction()` @35017 — only
   * how a reaction stacks differed, and `applyReaction()` holds that rule.
   */
  const react = (comment: Comment, emoji: string, path: RowPath | null) => {
    if (!uid || !target) {
      onToast('Please login to react to comments');
      return;
    }
    const reactions = applyReaction(comment.reactions, emoji, uid, mode);
    if (path) {
      patchReply(path, comment.id, (current) => ({ ...current, reactions }));
      void setReplyReactions(target, path.commentId, path.replyId, comment.id, reactions);
    } else {
      patchComment(comment.id, (current) => ({ ...current, reactions }));
      void setCommentReactions(target, comment.id, reactions);
    }
    setRevealed(null);
  };

  /**
   * `postComment()` @70253, and the buzz `postBuzzComment()` @34514 beside it. The
   * optimistic entry goes in first with the viewer's real name, then the same
   * document is written under the same id — the legacy generated the id up front
   * for exactly that reason.
   */
  const post = async () => {
    const body = text.trim();
    if (!body || !uid || !target || sending) return;

    const name = viewerName || 'User';
    const now = new Date().toISOString();
    const isReply = Boolean(replyTo);

    setSending(true);
    setText('');
    setEmojiOpen(false);

    const optimistic: Comment = {
      id: `${isReply ? 'reply' : 'comment'}_${Date.now()}`,
      text: body,
      username: name,
      userId: uid,
      userInitial: initials(name),
      profilePic: viewerPic || undefined,
      timestamp: now,
      likes: 0,
      likedBy: {},
      media: [],
      replies: [],
      isReply,
      replyingTo: replyTo?.username,
      isPending: true,
    };

    const path: RowPath | null = replyTo
      ? { commentId: replyTo.commentId, replyId: replyTo.replyId ?? null }
      : null;

    if (path) {
      insertReply(path, { ...optimistic, videoOwnerId: ownerId ?? undefined });
      setExpanded((current) => ({ ...current, [path.commentId]: true }));
    } else {
      setComments((current) => [optimistic, ...current]);
    }

    setReplyTo(null);

    try {
      if (path) {
        await saveReply(target, {
          parentCommentId: path.commentId,
          parentReplyId: path.replyId,
          reply: { ...optimistic, videoOwnerId: ownerId ?? undefined },
        });
      } else {
        await saveComment(target, { ...optimistic, videoOwnerId: ownerId ?? undefined });
      }
      settleRow(optimistic.id, false);
    } catch (error) {
      console.error('❌ posting the comment:', error);
      onToast('Could not post that comment');
      // `postComment()` left a failed optimistic entry on screen; the port takes
      // it back out so the sheet never claims a comment that was never saved.
      settleRow(optimistic.id, true);
    } finally {
      setSending(false);
    }
  };

  const insertEmoji = (emoji: string) => {
    setText((current) => `${current}${emoji}`);
    inputRef.current?.focus();
  };

  /**
   * Still legacy-only pieces of this sheet, each of which toasted here rather
   * than going dead. The buttons stay in place so the bar keeps its shape.
   */
  const notYet = (what: string) => onToast(`${what} is the next part of comments to be ported`);

  if (!open || !target) return null;

  const placeholder = replyTo ? `Reply to @${replyTo.username}...` : 'Add a comment...';

  return (
    <>
      <div className={UI.OVERLAY} onClick={onClose} />

      <div className={UI.MODAL} role="dialog" aria-label="Comments">
        <div className={UI.HEADER}>
          <h3 className={UI.TITLE}>Comments</h3>
          <button type="button" className={UI.CLOSE_BTN} onClick={onClose} aria-label="Close comments">
            <i className="fas fa-times" />
          </button>
        </div>

        {/* A tap anywhere that is not the revealed reaction bar closes it —
            the legacy did the same from a document-level listener. */}
        <div className={UI.LIST} onClick={() => setRevealed(null)}>
          {state === 'loading' || state === 'idle' ? (
            <div className="flex flex-col gap-[14px] px-[14px] py-[18px]">
              {[0, 1, 2].map((row) => (
                <div key={row} className={UI.SKELETON_ROW}>
                  <div className={UI.SKELETON_AVATAR} />
                  <div className="flex flex-1 flex-col gap-[6px]">
                    <div className="h-[10px] w-[40%] rounded-[5px] bg-white/[0.08]" />
                    <div className="h-[10px] w-[85%] rounded-[5px] bg-white/[0.06]" />
                    <div className="h-[10px] w-[60%] rounded-[5px] bg-white/[0.06]" />
                  </div>
                </div>
              ))}
            </div>
          ) : state === 'failed' ? (
            <div className={UI.EMPTY}>
              <div className={UI.EMPTY_ICON}>
                <i className="fas fa-circle-exclamation opacity-40" />
              </div>
              <div className={UI.EMPTY_TEXT}>Could not load comments</div>
            </div>
          ) : comments.length === 0 ? (
            <div className={UI.EMPTY}>
              <div className={UI.EMPTY_ICON}>
                <i className="fas fa-comment" />
              </div>
              <div className={UI.EMPTY_TEXT}>No comments yet. Be the first!</div>
            </div>
          ) : (
            comments.map((comment) => (
              <CommentRow
                key={comment.id}
                comment={comment}
                path={{ commentId: comment.id, replyId: null }}
                depth={0}
                uid={uid}
                ownerId={ownerId}
                firstCommenterId={firstCommenterId}
                expandedMap={expanded}
                onToggleExpanded={(rowId) =>
                  setExpanded((current) => ({ ...current, [rowId]: !current[rowId] }))
                }
                revealed={revealed}
                onReveal={setRevealed}
                onLike={toggleCommentLike}
                onReplyLike={toggleReplyLike}
                onReact={react}
                onReply={(replyPath, username) =>
                  setReplyTo({ commentId: replyPath.commentId, username, replyId: replyPath.replyId ?? undefined })
                }
                onOpenCreator={onOpenCreator}
                onOpenMedia={setOpenMedia}
              />
            ))
          )}
        </div>

        {replyTo && (
          <div className={UI.REPLY_MENTION + ' px-[12px] pt-[8px]'}>
            <i className="fas fa-at" /> Replying to @{replyTo.username}
            <button
              type="button"
              className="ml-[8px] cursor-pointer border-0 bg-transparent text-[11px] text-[#999]"
              onClick={() => setReplyTo(null)}
            >
              Cancel
            </button>
          </div>
        )}

        {emojiOpen && (
          <div className={UI.EMOJI_PANEL}>
            {EMOJI.map((emoji) => (
              <button key={emoji} type="button" className={UI.EMOJI_OPTION} onClick={() => insertEmoji(emoji)}>
                {emoji}
              </button>
            ))}
          </div>
        )}

        <div className={UI.INPUT_SECTION}>
          <div className={UI.INPUT_WRAP}>
            <input
              ref={inputRef}
              type="text"
              className={UI.INPUT}
              placeholder={placeholder}
              value={text}
              onChange={(event) => setText(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') void post();
              }}
            />
            <button
              type="button"
              className={UI.EMOJI_BTN}
              title="Add sticker"
              onClick={() => notYet('The sticker picker')}
            >
              <i className="fas fa-face-grin-squint" />
            </button>
            <button
              type="button"
              className={UI.EMOJI_BTN}
              title="Add image"
              onClick={() => notYet('Comment images')}
            >
              <i className="fas fa-image" />
            </button>
            <button
              type="button"
              className={UI.EMOJI_BTN}
              title="More options"
              onClick={() => setEmojiOpen((current) => !current)}
            >
              <i className="fas fa-plus" />
            </button>
            <button type="button" className={UI.EMOJI_BTN} title="Send a gift" onClick={() => notYet('Gifting')}>
              <i className="fas fa-gift" />
            </button>
          </div>
          <button
            type="button"
            className={UI.SEND_BTN}
            onClick={() => void post()}
            disabled={sending || !text.trim()}
            aria-label="Post comment"
          >
            <i className="fas fa-paper-plane" />
          </button>
        </div>
      </div>

      {openMedia && (
        <div className="fixed inset-0 z-[10003] flex items-center justify-center bg-black/95 p-[20px]">
          <button
            type="button"
            className="absolute top-[20px] right-[20px] flex h-[40px] w-[40px] cursor-pointer items-center justify-center rounded-full border-0 bg-black/60 text-[28px] text-white"
            onClick={() => setOpenMedia(null)}
            aria-label="Close media"
          >
            <i className="fas fa-times" />
          </button>
          {openMedia.kind === 'video' ? (
            <video src={openMedia.url} controls autoPlay playsInline className="max-h-full max-w-full rounded-[12px]" />
          ) : (
            <img src={openMedia.url} alt="" className="max-h-full max-w-full rounded-[12px] object-contain" />
          )}
        </div>
      )}
    </>
  );
}

function toMs(value: unknown): number {
  if (!value) return 0;
  if (typeof value === 'string') return Date.parse(value) || 0;
  const maybe = value as { toMillis?: () => number; seconds?: number };
  if (typeof maybe.toMillis === 'function') return maybe.toMillis();
  if (typeof maybe.seconds === 'number') return maybe.seconds * 1000;
  return 0;
}

/** `addCommentReaction()`'s three buttons carried these titles. */
const REACTION_TITLES: Record<string, string> = { '😠': 'Angry', '😊': 'Smile', '😑': 'Indifferent' };

type RowProps = {
  comment: Comment;
  /** Where this row's document lives. */
  path: RowPath;
  depth: 0 | 1 | 2;
  uid: string | null;
  ownerId: string | null;
  firstCommenterId: string | null;
  /** Which rows have their replies open — keyed by row id, like `expanded` was. */
  expandedMap: Record<string, boolean>;
  onToggleExpanded: (rowId: string) => void;
  revealed: string | null;
  onReveal: (key: string | null) => void;
  onLike: (comment: Comment) => void;
  onReplyLike: (reply: Comment, path: RowPath) => void;
  onReact: (comment: Comment, emoji: string, path: RowPath | null) => void;
  /** `openReplyToComment()` @70223 / `openReplyToReply()` @69672 — the row being replied to. */
  onReply: (path: RowPath, username: string) => void;
  onOpenCreator: (userId: string) => void;
  onOpenMedia: (media: { kind: 'image' | 'video'; url: string }) => void;
};

/**
 * One comment, or one reply when `depth > 0`. The legacy renderer had a
 * `renderReplyItem()` alongside its main builder; this is the shared shape, with
 * the ring/badge treatment reserved for the top level the way the CSS was.
 */
function CommentRow({
  comment,
  path,
  depth,
  uid,
  ownerId,
  firstCommenterId,
  expandedMap,
  onToggleExpanded,
  revealed,
  onReveal,
  onLike,
  onReplyLike,
  onReact,
  onReply,
  onOpenCreator,
  onOpenMedia,
}: RowProps) {
  const top = depth === 0;
  const isOwner = Boolean(ownerId && comment.userId === ownerId);
  const isFirst = top && comment.id === firstCommenterId;
  const liked = isLikedBy(comment, uid);
  const replies = comment.replies ?? [];
  const name = comment.username ?? 'Anonymous';
  const profilePic = comment.profilePic ?? '';
  const pending = Boolean(comment.isPending);
  const counts = reactionEntries(comment.reactions, uid);
  const expanded = Boolean(expandedMap[comment.id]);

  const key = rowKey(path, comment.id);
  const barOpen = revealed === key;
  /** Child rows hang under this one; a comment's replies sit one level in. */
  const childPath: RowPath = top
    ? { commentId: comment.id, replyId: null }
    : { commentId: path.commentId, replyId: comment.id };

  const holdRef = useRef<number | null>(null);
  const release = () => {
    if (holdRef.current !== null) {
      window.clearTimeout(holdRef.current);
      holdRef.current = null;
    }
  };

  /**
   * `startCommentLongPress()` @71693 / `startReplyLongPress()` @71758 — a 500ms
   * hold on the row reveals its reaction bar. Buttons are exempt so the bar never
   * opens in place of a tap, and the native long-press menu is suppressed.
   */
  const beginHold = (event: ReactPointerEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest('button')) return;
    release();
    holdRef.current = window.setTimeout(() => {
      holdRef.current = null;
      onReveal(key);
    }, LONG_PRESS_MS);
  };

  return (
    <div
      className={cx(
        top ? UI.ITEM : UI.REPLY_ITEM,
        top && isOwner && UI.ITEM_OWNER,
        top && !isOwner && isFirst && UI.ITEM_FIRST,
      )}
      onPointerDown={beginHold}
      onPointerUp={release}
      onPointerCancel={release}
      onPointerLeave={release}
      onContextMenu={(event) => event.preventDefault()}
    >
      <div className={UI.LEFT}>
        <div className={UI.AVATAR_WRAP}>
          <div
            className={cx(
              UI.AVATAR,
              comment.userId && UI.AVATAR_CLICKABLE,
              top && isOwner && UI.AVATAR_OWNER,
              top && !isOwner && isFirst && UI.AVATAR_FIRST,
              !top && 'h-[26px] w-[26px] min-w-[26px] text-[10px]',
            )}
            style={profilePic ? { backgroundImage: `url('${profilePic}')` } : undefined}
            onClick={() => comment.userId && onOpenCreator(comment.userId)}
          >
            {profilePic ? '' : initials(name)}
          </div>
          {top && isOwner && (
            <div className={cx(UI.BADGE_RING, UI.BADGE_OWNER)} title="Creator">
              <i className="fas fa-crown text-[13px]" />
            </div>
          )}
          {top && !isOwner && isFirst && <div className={cx(UI.BADGE_RING, UI.BADGE_FIRST)}>1st</div>}
        </div>
      </div>

      <div className={UI.CONTENT}>
        <div className={UI.USER_ROW}>
          <span className={UI.USERNAME}>{name}</span>
          <span className={UI.TIME}>{commentTimeLabel(comment.timestamp)}</span>
        </div>

        {comment.replyingTo && (
          <div className={UI.REPLY_MENTION}>
            <i className="fas fa-at" /> @{comment.replyingTo}
          </div>
        )}

        {comment.text && <div className={UI.TEXT}>{comment.text}</div>}

        {comment.media && comment.media.length > 0 && (
          <div className="mt-[8px] flex w-[100px] max-w-[100px] flex-col gap-[6px] max-[360px]:w-[80px] max-[360px]:max-w-[80px]">
            {comment.media.map((media, index) => (
              <CommentMediaItem
                key={`${media.url ?? media.name ?? 'gift'}-${index}`}
                media={media}
                onOpen={(kind, url) => onOpenMedia({ kind, url })}
              />
            ))}
          </div>
        )}

        <div className={UI.ACTIONS}>
          <div className={UI.ACTIONS_LEFT}>
            <button
              type="button"
              className={cx(UI.ACTION_BTN, liked ? UI.LIKE_BTN_ON : UI.LIKE_BTN)}
              onClick={() => (top ? onLike(comment) : onReplyLike(comment, path))}
              disabled={pending}
            >
              <i className="fas fa-heart" /> {comment.likes ?? 0}
            </button>
            <button
              type="button"
              className={cx(UI.ACTION_BTN, UI.REPLY_BTN)}
              onClick={() => onReply(childPath, comment.username ?? '')}
              title="Reply"
            >
              <i className="fas fa-reply" /> Reply
            </button>
            {replies.length > 0 && (
              <button type="button" className={UI.REPLIES_COUNT} onClick={() => onToggleExpanded(comment.id)}>
                <i className="fas fa-comment-dots" /> {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
              </button>
            )}
          </div>
        </div>

        {counts.length > 0 && (
          <div className={UI.REACTION_COUNTS}>
            {counts.map((entry) => (
              <span
                key={entry.emoji}
                className={cx(UI.REACTION_COUNT, entry.mine && UI.REACTION_COUNT_MINE)}
                title={`${entry.count} reaction${entry.count === 1 ? '' : 's'}`}
              >
                {entry.emoji} {entry.count}
              </span>
            ))}
          </div>
        )}

        {barOpen && (
          <div className={UI.REACTIONS_POPOVER}>
            {REACTIONS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                className={UI.REACTION_BTN}
                title={REACTION_TITLES[emoji]}
                aria-label={REACTION_TITLES[emoji]}
                onClick={(event) => {
                  event.stopPropagation();
                  onReact(comment, emoji, top ? null : path);
                }}
              >
                {emoji}
              </button>
            ))}
          </div>
        )}

        {replies.length > 0 && expanded && (
          <div className={UI.REPLIES_WRAP}>
            {replies.map((reply) => (
              <CommentRow
                key={reply.id}
                comment={reply}
                path={childPath}
                depth={depth === 0 ? 1 : 2}
                uid={uid}
                ownerId={ownerId}
                firstCommenterId={null}
                expandedMap={expandedMap}
                onToggleExpanded={onToggleExpanded}
                revealed={revealed}
                onReveal={onReveal}
                onLike={(target) => onReplyLike(target, childPath)}
                onReplyLike={onReplyLike}
                onReact={onReact}
                onReply={onReply}
                onOpenCreator={onOpenCreator}
                onOpenMedia={onOpenMedia}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/** The sticker / GIF / image thumbnails and the voice-note chip. */
function CommentMediaItem({
  media,
  onOpen,
}: {
  media: CommentMedia;
  onOpen: (kind: 'image' | 'video', url: string) => void;
}) {
  const url = media.url ?? '';
  if (!url) {
    // A gifted comment has no upload — it renders as its receipt chip.
    if (media.type === 'gift') {
      return (
        <div className="flex items-center gap-[6px] rounded-[14px] border border-[rgba(245,158,11,0.55)] bg-[linear-gradient(135deg,rgba(245,158,11,0.22),rgba(251,146,60,0.12))] p-[4px_10px_4px_4px]">
          <i className="fas fa-gift text-[#f59e0b]" />
          <span className="text-[12px] text-white">
            {media.name ?? media.filename ?? 'Gift'}
            {media.qty && media.qty > 1 ? ` ×${media.qty}` : ''}
          </span>
        </div>
      );
    }
    return null;
  }

  if (media.type === 'video') {
    return (
      <button
        type="button"
        className="w-full cursor-pointer border-0 bg-transparent p-0"
        onClick={() => onOpen('video', url)}
        aria-label="Play comment video"
      >
        <video src={url} muted playsInline className="w-full rounded-[8px]" />
      </button>
    );
  }

  if (media.type === 'audio') {
    // The legacy built a bespoke player with a 0.5x-2x speed menu. A native
    // control is the honest stand-in until that player is ported.
    return <audio src={url} controls className="w-full" />;
  }

  if (media.type === 'gift') {
    return (
      <div className="flex items-center gap-[6px] rounded-[14px] border border-[rgba(245,158,11,0.55)] bg-[linear-gradient(135deg,rgba(245,158,11,0.22),rgba(251,146,60,0.12))] p-[4px_10px_4px_4px]">
        <i className="fas fa-gift text-[#f59e0b]" />
        <span className="text-[12px] text-white">{media.name ?? media.filename ?? 'Gift'}</span>
      </div>
    );
  }

  return (
    <img
      src={url}
      alt=""
      className="h-auto w-full cursor-pointer rounded-[8px]"
      onClick={() => onOpen('image', url)}
    />
  );
}
