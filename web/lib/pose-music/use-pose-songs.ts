'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { POSE_SONGS_COLLECTION, getPoseFirebase } from '@/lib/firebase';
import { DEMO_SONGS } from './data';
import type { Song } from './types';

export type SongCountField = 'streamCount' | 'useCount';

/**
 * Legacy pages shipped twelve hard-coded demo tracks whose ids are `s1..s12`.
 * `startsWith('s')` was the original test for "do not write this to Firestore";
 * kept so demo plays never touch the database.
 */
function isDemoSong(id: string): boolean {
  return id.startsWith('s');
}

export function usePoseSongs() {
  const [songs, setSongs] = useState<Song[]>(DEMO_SONGS);
  const songsRef = useRef(songs);
  useEffect(() => {
    songsRef.current = songs;
  }, [songs]);

  const loadForUid = useCallback(async (uid: string) => {
    const { db } = getPoseFirebase();
    try {
      const snapshot = await getDocs(
        query(
          collection(db, POSE_SONGS_COLLECTION),
          where('artistId', '==', uid),
          orderBy('uploadDate', 'desc'),
        ),
      );
      const loaded: Song[] = snapshot.docs.map((entry) => ({
        ...(entry.data() as Omit<Song, 'id'>),
        id: entry.id,
      }));
      setSongs((prev) => {
        const byId = new Map(prev.map((s) => [s.id, s]));
        loaded.forEach((s) => byId.set(s.id, s));
        return [...byId.values()];
      });
      return loaded;
    } catch (error) {
      console.error('[Pose] Load songs:', error);
      return [];
    }
  }, []);

  const addLocal = useCallback((song: Song) => {
    setSongs((prev) => [...prev.filter((s) => s.id !== song.id), song]);
  }, []);

  const bumpCount = useCallback(
    (id: string, field: SongCountField) => {
      const song = songsRef.current.find((s) => s.id === id);
      if (!song) return;
      const value = (song[field] ?? 0) + 1;
      setSongs((prev) => prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
      if (isDemoSong(id)) return;
      const { db } = getPoseFirebase();
      updateDoc(doc(db, POSE_SONGS_COLLECTION, id), {
        [field]: value,
        updatedAt: serverTimestamp(),
      }).catch(() => {
        /* stat counters are best-effort, same as legacy */
      });
    },
    [],
  );

  /** Returns the new pinned flag, or null when the track is unknown. */
  const togglePin = useCallback(async (id: string): Promise<boolean | null> => {
    const song = songsRef.current.find((s) => s.id === id);
    if (!song) return null;
    const next = !song.pinned;
    setSongs((prev) => prev.map((s) => (s.id === id ? { ...s, pinned: next } : s)));
    if (isDemoSong(id)) return next;
    try {
      const { db } = getPoseFirebase();
      await updateDoc(doc(db, POSE_SONGS_COLLECTION, id), {
        pinned: next,
        updatedAt: serverTimestamp(),
      });
      return next;
    } catch (error) {
      console.error('[Pose] Pin:', error);
      setSongs((prev) => prev.map((s) => (s.id === id ? { ...s, pinned: !next } : s)));
      return null;
    }
  }, []);

  return { songs, loadForUid, addLocal, bumpCount, togglePin };
}
