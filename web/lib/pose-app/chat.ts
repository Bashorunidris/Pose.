'use client';

import {
  addDoc,
  collection,
  doc,
  getDoc,
  increment,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';

import { getPoseFirebase } from '@/lib/firebase';
import { toMillis } from './feed';

/**
 * The direct-message room (`#chatRoomOverlay` @90506). The legacy kept the room
 * on module-level globals in `index.html` (`currentChatUserId`,
 * `currentChatRoomId`, `chatUnsubscribe`, `presenceUnsubscribe`,
 * `chatMediaFile`); this module holds the document reads and the two writes, so
 * the room component stays about the conversation.
 *
 * Chat media went to Firebase Storage in the legacy
 * (`storage.ref('chat_media/…')`). There is no Storage bucket in the port, so
 * the caller uploads through `uploadToR2()` and hands the URL in.
 */

export type ChatMessageType = 'text' | 'image' | 'video' | 'voice';

export type ChatMessage = {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  type: ChatMessageType;
  mediaUrl: string;
  /** Voice notes only, in seconds. */
  duration: number;
  /** Epoch millis; 0 while the server timestamp is still pending. */
  timestamp: number;
};

export type ChatPeer = {
  userId: string;
  name: string;
  pic: string;
};

export type ChatPresence = {
  online: boolean;
  lastSeen: number;
};

/** `EMOJI_LIST` @68881. The picker's own contents, not UI chrome. */
export const EMOJI_LIST = [
  '😀', '😂', '🥰', '😍', '😎', '🤩', '😢', '😭', '🥺', '😤', '🤯', '🤗', '🤔', '🙄', '😏',
  '🔥', '❤️', '💜', '💙', '💚', '💛', '🧡', '🖤', '💯', '✨', '🎉', '🎊', '👏', '🙌', '💪',
  '👍', '👎', '🤝', '✌️', '🤞', '👋', '🫶', '💀', '😈', '👀', '🗿', '💅', '🥳', '🤡', '👑',
  '🌹', '🌸', '🍕', '🍔', '☕', '🎵', '🎶', '📸', '💬', '💌', '🎁', '🏆', '⭐', '🌟', '💎',
] as const;

/** `handleChatVideoSelect()` @69183 rejected anything over 50MB. */
export const CHAT_VIDEO_LIMIT = 50 * 1024 * 1024;

/** `getChatRoomId()` @68892 — both uids, sorted, joined by an underscore. */
export function chatRoomId(a: string, b: string): string {
  return [a, b].sort().join('_');
}

/**
 * `openChatRoomWithUser()` @81223 filled a missing name or picture in from
 * `users/{userId}` before it painted the header.
 */
export async function fetchChatPeer(
  userId: string,
  name?: string,
  pic?: string,
): Promise<ChatPeer> {
  if (name && pic) return { userId, name, pic };

  const { db } = getPoseFirebase();
  let resolved = { name: name ?? '', pic: pic ?? '' };
  try {
    const snap = await getDoc(doc(db, 'users', userId));
    if (snap.exists()) {
      const data = snap.data() as Record<string, string | undefined>;
      resolved = {
        name: resolved.name || data.name || data.displayName || data.username || '',
        pic:
          resolved.pic ||
          data.profilePicUrl ||
          data.userProfilePic ||
          data.photoURL ||
          '',
      };
    }
  } catch {
    // Header falls back to the initial and "User", exactly like the legacy.
  }
  return { userId, name: resolved.name || 'User', pic: resolved.pic };
}

/**
 * `listenToChatMessages()` @68952 — `chats/{roomId}/messages` ordered by
 * `timestamp` ascending. Docs still waiting on a server timestamp are excluded
 * by the order, which is what the legacy showed too.
 */
export function watchChatMessages(
  roomId: string,
  onMessages: (messages: ChatMessage[]) => void,
  onError: (error: unknown) => void,
): () => void {
  const { db } = getPoseFirebase();
  return onSnapshot(
    query(collection(db, 'chats', roomId, 'messages'), orderBy('timestamp', 'asc')),
    (snap) => {
      onMessages(
        snap.docs.map((entry) => {
          const data = entry.data() as Record<string, unknown>;
          return {
            id: entry.id,
            senderId: String(data.senderId ?? ''),
            senderName: String(data.senderName ?? ''),
            text: String(data.text ?? ''),
            type: (data.type as ChatMessageType) ?? 'text',
            mediaUrl: String(data.mediaUrl ?? ''),
            duration: Number(data.duration ?? 0),
            timestamp: toMillis(data.timestamp),
          };
        }),
      );
    },
    onError,
  );
}

/** `listenToUserPresence()` @69031 — reads `online` and `lastSeen` off the user. */
export function watchChatPresence(
  userId: string,
  onPresence: (presence: ChatPresence) => void,
): () => void {
  const { db } = getPoseFirebase();
  return onSnapshot(
    doc(db, 'users', userId),
    (snap) => {
      const data = snap.data() as Record<string, unknown> | undefined;
      onPresence({
        online: Boolean(data?.online),
        lastSeen: toMillis(data?.lastSeen),
      });
    },
    () => onPresence({ online: false, lastSeen: 0 }),
  );
}

/** `formatLastSeen()` @69018. */
export function formatLastSeen(ms: number): string {
  const date = new Date(ms);
  const diffMins = Math.floor((Date.now() - ms) / 60000);
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
  const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (new Date().toDateString() === date.toDateString()) return `today at ${time}`;
  return `${date.toLocaleDateString([], { month: 'short', day: 'numeric' })} at ${time}`;
}

/**
 * The `lastMessage` line the room list shows. The legacy wrote emoji into the
 * document (`'📷 Photo'`); the port keeps the words and leaves the emoji out.
 */
export function chatMediaLabel(type: ChatMessageType): string {
  if (type === 'image') return 'Photo';
  if (type === 'video') return 'Video';
  if (type === 'voice') return 'Voice note';
  return 'New message';
}

type SendArgs = {
  roomId: string;
  uid: string;
  peerId: string;
  displayName: string;
  text: string;
  mediaUrl: string;
  type: ChatMessageType;
  duration?: number;
};

/**
 * `sendChatMessage()` @69053 and `sendVoiceRecording()` @69276. Both wrote the
 * message, then merged the room document with the preview, the timestamp and an
 * `unread_{peer}` bump, then left a notification for the recipient.
 */
export async function sendChatMessage(args: SendArgs): Promise<void> {
  const { db } = getPoseFirebase();
  const { roomId, uid, peerId, displayName, text, mediaUrl, type } = args;

  await addDoc(collection(db, 'chats', roomId, 'messages'), {
    senderId: uid,
    senderName: displayName || 'Unknown',
    text,
    type,
    mediaUrl,
    ...(type === 'voice' ? { duration: args.duration ?? 0 } : {}),
    timestamp: serverTimestamp(),
  });

  await setDoc(
    doc(db, 'chats', roomId),
    {
      participants: [uid, peerId],
      lastMessage: text || chatMediaLabel(type),
      lastTimestamp: serverTimestamp(),
      [`unread_${peerId}`]: increment(1),
    },
    { merge: true },
  );

  await notifyMessage({
    peerId,
    uid,
    displayName,
    preview: text || chatMediaLabel(type),
    roomId,
  });
}

/**
 * `PoseNotifications.create(peerId, 'message', …)` @78311. Fire-and-forget, like
 * the legacy, because a failed notification must not sink a message that is
 * already written.
 */
async function notifyMessage(args: {
  peerId: string;
  uid: string;
  displayName: string;
  preview: string;
  roomId: string;
}): Promise<void> {
  try {
    const { db } = getPoseFirebase();
    await addDoc(collection(db, 'notifications', args.peerId, 'items'), {
      type: 'message',
      fromUserId: args.uid,
      fromUserName: args.displayName || 'Pose User',
      preview: args.preview,
      chatRoomId: args.roomId,
      read: false,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.warn('chat notification failed:', error);
  }
}
