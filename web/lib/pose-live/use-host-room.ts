'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  type DocumentData,
  type Unsubscribe,
} from 'firebase/firestore';

import { getPoseFirebase } from '@/lib/firebase';
import { usePoseSession } from '@/lib/pose-app/session';
import { initialsOf } from './live-sessions';
import {
  HOST_AWAY_LIMIT_MS,
  LIVE_FEED_HREF,
  countdownLabel,
  giftOf,
  timerSecondsFor,
  type Gift,
  type RoomConfig,
  type RoomTab,
  type SlideType,
} from './room';

export type RoomMessage = {
  id: string;
  uid: string;
  name: string;
  text: string;
  isHost: boolean;
  isSub: boolean;
  imageUrl: string;
  videoUrl: string;
  at: Date;
};

export type GiftEntry = {
  id: string;
  uid: string;
  name: string;
  gift: Gift;
  at: Date;
};

export type MoneyEntry = {
  id: string;
  uid: string;
  name: string;
  amount: number;
  message: string;
  at: Date;
};

export type JoinRequest = { id: string; uid: string; name: string };

export type LeaderboardRow = {
  uid: string;
  name: string;
  total: number;
  breakdown: string;
};

export type Announcement = { id: number; text: string; amount: string };

export type Slide = { type: SlideType; url: string } | null;

type Toast = { id: number; message: string } | null;

/** `fmtTime` @1161 — Firestore timestamps, plain Dates and the demo's fake all land here. */
function toDate(value: unknown): Date {
  if (value && typeof value === 'object' && 'toDate' in value) {
    try {
      return (value as { toDate: () => Date }).toDate();
    } catch {
      return new Date();
    }
  }
  return new Date();
}

function str(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

const TOAST_MS = 2800;
const ANNOUNCE_MS = 3200;

/**
 * The host room's whole brain — `INIT` @935 through the `BOOT` @1893 block.
 *
 * Legacy drove everything through `document.getElementById`, so ordering was
 * implicit. Here each subscription owns a slice of state and the UI is a pure
 * function of it; the Firestore shape and the action names are unchanged.
 */
export function useHostRoom(config: RoomConfig) {
  const { status, user } = usePoseSession();
  const hostUid = user?.uid || config.hostUid;
  const hostName = user?.displayName || config.hostName;
  const hostPhoto = user?.photoURL || config.hostPhoto;

  const [sessionId, setSessionId] = useState<string | null>(config.sid || null);
  const [booted, setBooted] = useState(false);

  const [tab, setTab] = useState<RoomTab>('chat');
  const [messages, setMessages] = useState<RoomMessage[]>([]);
  const [localMessages, setLocalMessages] = useState<RoomMessage[]>([]);
  const [gifts, setGifts] = useState<GiftEntry[]>([]);
  const [donations, setDonations] = useState<MoneyEntry[]>([]);
  const [subs, setSubs] = useState<MoneyEntry[]>([]);
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
  const [viewerCount, setViewerCount] = useState(0);

  const [chatLocked, setChatLocked] = useState(false);
  const [slowMode, setSlowMode] = useState(false);
  const [pinned, setPinned] = useState('');
  const [slide, setSlide] = useState<Slide>(null);
  const [slideType, setSlideType] = useState<SlideType>('image');
  const [roomName, setRoomName] = useState(config.roomName);
  const [roomTitle, setRoomTitle] = useState(config.streamTitle || `${config.mode} live session`);
  const [allowImages, setAllowImages] = useState(config.allowImages);
  const [allowVideos, setAllowVideos] = useState(config.allowVideos);
  const [autoMod, setAutoMod] = useState(true);

  const [timerLeft, setTimerLeft] = useState(() => timerSecondsFor(config.timer));
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [sheetFor, setSheetFor] = useState<RoomMessage | null>(null);
  const [toast, setToast] = useState<Toast>(null);
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  /** Bumped on every new gift so the canvas can fire its animation exactly once. */
  const [giftSignal, setGiftSignal] = useState<{ seq: number; gift: Gift } | null>(null);
  const [notify, setNotify] = useState({ chat: 0, gifts: 0 });

  const unsubs = useRef<Unsubscribe[]>([]);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const awayTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const announceQueue = useRef<Announcement[]>([]);
  const announceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** Indirection so the scheduler can re-arm itself without referencing its own binding. */
  const pumpRef = useRef<() => void>(() => undefined);
  /** Lets the timer effect end the stream without depending on `endStream`'s identity. */
  const endStreamRef = useRef<() => Promise<void>>(async () => undefined);
  const seq = useRef(0);
  const tabRef = useRef<RoomTab>('chat');

  useEffect(() => {
    tabRef.current = tab;
  }, [tab]);

  const tabRefSetter = useCallback((next: RoomTab) => {
    setTab(next);
    setNotify((current) => (next === 'chat' ? { ...current, chat: 0 } : next === 'gifts' ? { ...current, gifts: 0 } : current));
  }, []);

  const showToast = useCallback((message: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ id: Date.now(), message });
    toastTimer.current = setTimeout(() => setToast(null), TOAST_MS);
  }, []);

  /** `processAnnQueue` @1514 — big gifts and donations queue one at a time. */
  useEffect(() => {
    pumpRef.current = () => {
      if (announceTimer.current) return;
      const next = announceQueue.current.shift();
      if (!next) return;
      setAnnouncement(next);
      announceTimer.current = setTimeout(() => {
        announceTimer.current = null;
        setAnnouncement(null);
        pumpRef.current();
      }, ANNOUNCE_MS);
    };
    return () => {
      if (announceTimer.current) clearTimeout(announceTimer.current);
      announceTimer.current = null;
    };
  }, []);

  /** `showAnnouncement` @1509 — below 200 coins it degrades to a toast. */
  const announce = useCallback(
    (text: string, amount: string, big: boolean) => {
      if (!big) {
        showToast(text);
        return;
      }
      announceQueue.current.push({ id: (seq.current += 1), text, amount });
      pumpRef.current();
    },
    [showToast],
  );

  const bumpGiftsNotify = useCallback(() => {
    if (tabRef.current === 'gifts') return;
    setNotify((current) => ({ ...current, gifts: Math.min(current.gifts + 1, 10) }));
  }, []);

  const updateRoomSetting = useCallback(
    (field: string, value: unknown) => {
      const sid = sessionId;
      if (!sid) return;
      updateDoc(doc(getPoseFirebase().db, 'live_sessions', sid), { [field]: value }).catch(() => undefined);
    },
    [sessionId],
  );

  /* ── session, then subscriptions ───────────────────────────────────────── */

  useEffect(() => {
    if (status === 'loading') return;
    let cancelled = false;

    const { db } = getPoseFirebase();

    function subscribe(sid: string, sessionRef: ReturnType<typeof doc>) {
      const ref = collection(db, 'live_sessions', sid, 'messages');
      unsubs.current.push(
        onSnapshot(
          query(ref, orderBy('createdAt', 'asc')),
          (snap) => {
            const added: RoomMessage[] = [];
            snap.docChanges().forEach((change) => {
              if (change.type !== 'added') return;
              const data: DocumentData = change.doc.data();
              added.push({
                id: change.doc.id,
                uid: str(data.uid),
                name: str(data.name) || 'User',
                text: str(data.text),
                isHost: !!data.isHost,
                isSub: !!data.isSub,
                imageUrl: str(data.imageUrl),
                videoUrl: str(data.videoUrl),
                at: toDate(data.createdAt),
              });
            });
            if (added.length === 0) return;
            setMessages((current) => [...current, ...added]);
            if (tabRef.current !== 'chat') {
              setNotify((n) => ({ ...n, chat: Math.min(n.chat + added.length, 10) }));
            }
          },
          (error) => console.error('messages', error),
        ),
      );

      const giftRef = collection(db, 'live_sessions', sid, 'gifts');
      unsubs.current.push(
        onSnapshot(
          query(giftRef, orderBy('createdAt', 'desc')),
          (snap) => {
            const added: GiftEntry[] = [];
            snap.docChanges().forEach((change) => {
              if (change.type !== 'added') return;
              const data = change.doc.data();
              const gift = giftOf(str(data.giftType));
              added.push({
                id: change.doc.id,
                uid: str(data.senderUid) || change.doc.id,
                name: str(data.senderName) || 'User',
                gift,
                at: toDate(data.createdAt),
              });
            });
            setGifts(snap.docs.map((entry) => {
              const data = entry.data();
              return {
                id: entry.id,
                uid: str(data.senderUid) || entry.id,
                name: str(data.senderName) || 'User',
                gift: giftOf(str(data.giftType)),
                at: toDate(data.createdAt),
              };
            }));
            added.forEach((entry) => {
              setGiftSignal((current) => ({ seq: (current?.seq ?? 0) + 1, gift: entry.gift }));
              announce(
                `${entry.name} sent a ${entry.gift.name}!`,
                `${entry.gift.coins} PC`,
                entry.gift.coins >= 200,
              );
              bumpGiftsNotify();
            });
          },
          (error) => console.error('gifts', error),
        ),
      );

      const donationRef = collection(db, 'live_sessions', sid, 'donations');
      unsubs.current.push(
        onSnapshot(
          query(donationRef, orderBy('createdAt', 'desc')),
          (snap) => {
            const rows = snap.docs.map((entry) => {
              const data = entry.data();
              return {
                id: entry.id,
                uid: str(data.senderUid),
                name: str(data.senderName) || 'User',
                amount: Number(data.amount) || 0,
                message: str(data.message),
                at: toDate(data.createdAt),
              };
            });
            setDonations(rows);
            snap.docChanges().forEach((change) => {
              if (change.type !== 'added') return;
              const data = change.doc.data();
              announce(
                `${str(data.senderName) || 'User'} donated!${data.message ? ` "${data.message}"` : ''}`,
                `${Number(data.amount) || 0} PC`,
                true,
              );
              bumpGiftsNotify();
            });
          },
          (error) => console.error('donations', error),
        ),
      );

      const subRef = collection(db, 'live_sessions', sid, 'subscriptions');
      unsubs.current.push(
        onSnapshot(
          query(subRef, orderBy('createdAt', 'desc')),
          (snap) => {
            setSubs(snap.docs.map((entry) => {
              const data = entry.data();
              return {
                id: entry.id,
                uid: str(data.senderUid),
                name: str(data.senderName) || 'User',
                amount: Number(data.amount) || config.subAmount,
                message: '',
                at: toDate(data.createdAt),
              };
            }));
            snap.docChanges().forEach((change) => {
              if (change.type !== 'added') return;
              const data = change.doc.data();
              announce(
                `${str(data.senderName) || 'User'} just subscribed!`,
                `${Number(data.amount) || config.subAmount} PC`,
                true,
              );
              bumpGiftsNotify();
            });
          },
          (error) => console.error('subs', error),
        ),
      );

      unsubs.current.push(
        onSnapshot(
          sessionRef,
          (snap) => {
            const data = snap.data();
            if (!data) return;
            if (data.roomName) setRoomName(str(data.roomName));
            if (data.title) setRoomTitle(str(data.title));
            if (typeof data.viewerCount === 'number') setViewerCount(data.viewerCount);
            if (typeof data.chatLocked === 'boolean') setChatLocked(data.chatLocked);
            if (typeof data.slowMode === 'boolean') setSlowMode(data.slowMode);
            if (typeof data.allowImages === 'boolean') setAllowImages(data.allowImages);
            if (typeof data.allowVideos === 'boolean') setAllowVideos(data.allowVideos);
            if (typeof data.autoMod === 'boolean') setAutoMod(data.autoMod);
            if (data.pinnedMessage !== undefined) setPinned(str(data.pinnedMessage));
            if (data.slide !== undefined) {
              setSlide(data.slide && data.slide.url ? { type: data.slide.type, url: data.slide.url } : null);
            }
            if (data.status === 'ended') {
              showToast('Stream ended');
              setTimeout(() => {
                window.location.href = LIVE_FEED_HREF;
              }, 1500);
            }
          },
          (error) => console.error('session', error),
        ),
      );

      if (config.privacy === 'private') {
        unsubs.current.push(
          onSnapshot(
            query(collection(db, 'live_sessions', sid, 'join_requests'), where('status', '==', 'pending')),
            (snap) => {
              setJoinRequests(
                snap.docs.map((entry) => {
                  const data = entry.data();
                  return { id: entry.id, uid: str(data.uid), name: str(data.name) || 'User' };
                }),
              );
            },
            (error) => console.error('join_requests', error),
          ),
        );
      }
    }

    (async () => {
      let sid = config.sid || null;

      // Resume an existing live session for this host (the BOOT block @1893).
      if (!sid && hostUid) {
        try {
          const existing = await getDocs(
            query(
              collection(db, 'live_sessions'),
              where('hostUid', '==', hostUid),
              where('status', '==', 'live'),
              orderBy('createdAt', 'desc'),
              limit(1),
            ),
          );
          if (!existing.empty) sid = existing.docs[0].id;
        } catch (error) {
          console.error('resume check', error);
        }
      }
      if (cancelled) return;

      if (!sid) {
        // `createSession` @945
        try {
          const created = await addDoc(collection(db, 'live_sessions'), {
            hostUid,
            hostName,
            title: config.streamTitle || config.roomName,
            roomName: config.roomName,
            mode: config.mode,
            privacy: config.privacy,
            viewerCount: 0,
            status: 'live',
            createdAt: serverTimestamp(),
          });
          sid = created.id;
        } catch (error) {
          console.error('createSession', error);
        }
      }
      if (cancelled || !sid) {
        setBooted(true);
        return;
      }

      setSessionId(sid);
      subscribe(sid, doc(db, 'live_sessions', sid));
      setBooted(true);
    })();

    return () => {
      cancelled = true;
      unsubs.current.forEach((off) => off());
      unsubs.current = [];
    };
    // Subscriptions must follow the auth identity once, not on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  /* ── timer ─────────────────────────────────────────────────────────────── */

  useEffect(() => {
    const id = setInterval(() => setTimerLeft((left) => (left > 0 ? left - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, []);

  // `startTimer` @1709 ends the stream when the clock runs out.
  useEffect(() => {
    if (timerSecondsFor(config.timer) > 0 && timerLeft === 0) void endStreamRef.current();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timerLeft]);

  /* ── actions ───────────────────────────────────────────────────────────── */

  const sendMessage = useCallback(
    async (raw: string) => {
      const text = raw.trim();
      if (!text) return;
      const local: RoomMessage = {
        id: `local-${Date.now()}`,
        uid: hostUid || 'host',
        name: hostName,
        text,
        isHost: true,
        isSub: false,
        imageUrl: '',
        videoUrl: '',
        at: new Date(),
      };
      if (!sessionId) {
        setLocalMessages((current) => [...current, local]);
        return;
      }
      try {
        await addDoc(collection(getPoseFirebase().db, 'live_sessions', sessionId, 'messages'), {
          uid: local.uid,
          name: local.name,
          text,
          isHost: true,
          isSub: false,
          createdAt: serverTimestamp(),
        });
      } catch {
        setLocalMessages((current) => [...current, local]);
      }
    },
    [hostName, hostUid, sessionId],
  );

  const pin = useCallback(
    (text: string) => {
      setPinned(text);
      updateRoomSetting('pinnedMessage', text);
    },
    [updateRoomSetting],
  );

  const unpin = useCallback(() => {
    setPinned('');
    updateRoomSetting('pinnedMessage', null);
  }, [updateRoomSetting]);

  const toggleLock = useCallback(() => {
    setChatLocked((current) => {
      updateRoomSetting('chatLocked', !current);
      return !current;
    });
  }, [updateRoomSetting]);

  const setLocked = useCallback(
    (value: boolean) => {
      setChatLocked(value);
      updateRoomSetting('chatLocked', value);
    },
    [updateRoomSetting],
  );

  const toggleSlow = useCallback(() => {
    setSlowMode((current) => {
      const next = !current;
      updateRoomSetting('slowMode', next);
      showToast(next ? 'Slow mode ON' : 'Slow mode OFF');
      return next;
    });
  }, [showToast, updateRoomSetting]);

  const setSlow = useCallback(
    (value: boolean) => {
      setSlowMode(value);
      updateRoomSetting('slowMode', value);
      showToast(value ? 'Slow mode ON' : 'Slow mode OFF');
    },
    [showToast, updateRoomSetting],
  );

  const deleteMessage = useCallback(
    async (message: RoomMessage) => {
      setMessages((current) => current.filter((entry) => entry.id !== message.id));
      setLocalMessages((current) => current.filter((entry) => entry.id !== message.id));
      if (sessionId) {
        const { db } = getPoseFirebase();
        await updateDoc(doc(db, 'live_sessions', sessionId, 'messages', message.id), {}).catch(() => undefined);
      }
      showToast('Message deleted');
    },
    [sessionId, showToast],
  );

  const muteUser = useCallback(
    (message: RoomMessage) => showToast(`${message.name} muted`),
    [showToast],
  );

  const banUser = useCallback(
    async (message: RoomMessage) => {
      if (sessionId && message.uid) {
        const { db } = getPoseFirebase();
        await setDoc(doc(db, 'live_sessions', sessionId, 'banned_users', message.uid), {
          uid: message.uid,
          name: message.name,
          bannedAt: serverTimestamp(),
        }).catch(() => undefined);
      }
      setMessages((current) => current.filter((entry) => entry.uid !== message.uid));
      showToast(`${message.name} banned`);
    },
    [sessionId, showToast],
  );

  const pushSlide = useCallback(
    (url: string) => {
      setSlide({ type: slideType, url });
      updateRoomSetting('slide', { type: slideType, url, pushedAt: Date.now() });
      showToast(`${slideType.charAt(0).toUpperCase()}${slideType.slice(1)} pushed to viewers!`);
    },
    [slideType, showToast, updateRoomSetting],
  );

  const clearSlide = useCallback(() => {
    setSlide(null);
    updateRoomSetting('slide', null);
    showToast('Slide cleared');
  }, [showToast, updateRoomSetting]);

  const approveJoin = useCallback(
    async (request: JoinRequest) => {
      if (!sessionId) return;
      const { db } = getPoseFirebase();
      await setDoc(doc(db, 'live_sessions', sessionId, 'join_requests', request.id), { status: 'approved' }, { merge: true }).catch(() => undefined);
      showToast('Join request approved');
    },
    [sessionId, showToast],
  );

  const denyJoin = useCallback(
    async (request: JoinRequest) => {
      if (!sessionId) return;
      const { db } = getPoseFirebase();
      await setDoc(doc(db, 'live_sessions', sessionId, 'join_requests', request.id), { status: 'denied' }, { merge: true }).catch(() => undefined);
      showToast('Join request denied');
    },
    [sessionId, showToast],
  );

  const endStream = useCallback(async () => {
    setConfirmOpen(false);
    if (awayTimer.current) clearTimeout(awayTimer.current);
    if (sessionId) {
      const { db } = getPoseFirebase();
      await updateDoc(doc(db, 'live_sessions', sessionId), { status: 'ended', endedAt: serverTimestamp() }).catch(() => undefined);
    }
    showToast('Stream ended. Redirecting…');
    setTimeout(() => {
      window.location.href = LIVE_FEED_HREF;
    }, 1500);
  }, [sessionId, showToast]);

  useEffect(() => {
    endStreamRef.current = endStream;
  }, [endStream]);

  /* ── host presence: auto-end after 5 minutes away ───────────────────────── */

  useEffect(() => {
    if (!sessionId) return;
    const { db } = getPoseFirebase();
    const sessionRef = doc(db, 'live_sessions', sessionId);

    async function checkAwayTimeout() {
      try {
        const snap = await getDoc(sessionRef);
        if (!snap.exists()) return;
        const data = snap.data();
        if (!data.hostLeftAt) return;
        const left = data.hostLeftAt.toDate ? data.hostLeftAt.toDate().getTime() : 0;
        if (Date.now() - left >= HOST_AWAY_LIMIT_MS) {
          showToast('Stream auto-ended (host away 5+ min)');
          void endStream();
          return;
        }
        await updateDoc(sessionRef, { hostLeftAt: null });
        showToast('Welcome back! You are still live');
      } catch (error) {
        console.error('checkAwayTimeout', error);
      }
    }

    void checkAwayTimeout();

    function onHidden(documentHidden: boolean) {
      if (documentHidden) {
        void updateDoc(sessionRef, { hostLeftAt: serverTimestamp() }).catch(() => undefined);
        awayTimer.current = setTimeout(() => void endStream(), HOST_AWAY_LIMIT_MS);
      } else {
        if (awayTimer.current) clearTimeout(awayTimer.current);
        void updateDoc(sessionRef, { hostLeftAt: null }).catch(() => undefined);
        showToast('Welcome back! You are still live');
      }
    }

    const onVisibility = () => onHidden(document.visibilityState === 'hidden');
    const onUnload = () => {
      void updateDoc(sessionRef, { hostLeftAt: serverTimestamp() }).catch(() => undefined);
    };

    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('beforeunload', onUnload);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('beforeunload', onUnload);
    };
  }, [endStream, sessionId, showToast]);

  /* ── derived ───────────────────────────────────────────────────────────── */

  const leaderboard = useMemo<LeaderboardRow[]>(() => {
    const totals = new Map<string, { name: string; total: number; breakdown: Map<string, number> }>();
    gifts.forEach((entry) => {
      const row = totals.get(entry.uid) ?? { name: entry.name, total: 0, breakdown: new Map() };
      row.total += entry.gift.coins;
      row.breakdown.set(entry.gift.name, (row.breakdown.get(entry.gift.name) ?? 0) + 1);
      totals.set(entry.uid, row);
    });
    return [...totals.entries()]
      .map(([uid, row]) => ({
        uid,
        name: row.name,
        total: row.total,
        breakdown: [...row.breakdown.entries()].map(([name, count]) => `${count}× ${name}`).join(', '),
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [gifts]);

  const allMessages = useMemo(() => [...messages, ...localMessages], [messages, localMessages]);

  const timerActive = timerSecondsFor(config.timer) > 0;

  return {
    booted,
    sessionId,
    hostPhoto,
    hostName,
    viewerCount,
    tab,
    setTab: tabRefSetter,
    notify,
    messages: allMessages,
    gifts,
    donations,
    subs,
    leaderboard,
    joinRequests,
    chatLocked,
    slowMode,
    pinned,
    slide,
    slideType,
    setSlideType,
    roomName,
    roomTitle,
    allowImages,
    allowVideos,
    autoMod,
    timerLabel: timerActive ? countdownLabel(timerLeft) : '',
    timerLow: timerActive && timerLeft <= 60,
    confirmOpen,
    setConfirmOpen,
    sheetFor,
    setSheetFor,
    toast,
    announcement,
    giftSignal,
    sendMessage,
    pin,
    unpin,
    toggleLock,
    setLocked,
    toggleSlow,
    setSlow,
    deleteMessage,
    muteUser,
    banUser,
    pushSlide,
    clearSlide,
    updateRoomSetting,
    approveJoin,
    denyJoin,
    endStream,
    showToast,
    initialsOf,
  };
}
