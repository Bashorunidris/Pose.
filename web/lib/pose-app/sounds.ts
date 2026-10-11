/**
 * The sound library's data layer: the three reads `openSoundLibrary()` @59012
 * fired (`loadPoseMusicFromFirebase()` @58696, `loadFavouriteSounds()` @59182,
 * `loadYourMusic()` @59244), the favourite toggle `toggleFavoriteSound()` @59470
 * performed, and the attribution object `savePhotoUrlToFirebase()` @56555 and
 * `publishRecordingPostToFirebase()` @57684 both built before writing a post.
 */
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore';

import { getPoseFirebase } from '@/lib/firebase';
import type { CustomAudio } from './types';

export type SoundTab = 'favourite' | 'yourMusic' | 'poseMusic';

export type PoseSound = {
  id: string;
  title: string;
  artist: string;
  thumbnail: string;
  audioUrl: string;
  /** `3:24`, the way the legacy rows printed it. */
  duration: string;
  /** The same span in seconds, which the limiter and the attribution object want. */
  fullDuration: number;
  plays: number;
  uses: number;
  trending: boolean;
  isFavorited: boolean;
  trimStart: number;
  trimEnd: number;
  category: string;
  ownerUserId: string;
  ownerUsername: string;
  ownerName: string;
  ownerProfilePic: string;
  ownerVideoId: string;
  songId: string;
  isReusedSound: boolean;
  /** True for a `pose_songs` upload, which the sheet can show but does not own. */
  fromPmusic: boolean;
  sourceTab: SoundTab;
};

/** `sound-library-modal`'s banner ads @58646, on the same four slides. */
export const SOUND_BANNER_ADS = [
  {
    type: 'image' as const,
    url: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800',
    title: 'Trending Music',
    subtitle: 'Discover the hottest tracks',
    icon: 'fa-fire',
  },
  {
    type: 'video' as const,
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    title: 'New Releases',
    subtitle: 'Fresh sounds daily',
    icon: 'fa-bolt',
  },
  {
    type: 'image' as const,
    url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800',
    title: 'Premium Collection',
    subtitle: 'Exclusive tracks for creators',
    icon: 'fa-headphones',
  },
  {
    type: 'image' as const,
    url: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800',
    title: "Editor's Pick",
    subtitle: 'Hand-picked sounds',
    icon: 'fa-star',
  },
];

/** `formatPlayCount()` @59417. */
export function formatPlayCount(count: number): string {
  if (!count) return '0';
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
  return count.toString();
}

/** `3:04`, the format the music uploader stored and the row prints. */
export function formatDuration(seconds: number): string {
  const whole = Math.max(0, Math.floor(seconds));
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, '0')}`;
}

function text(value: unknown, fallback = ''): string {
  return typeof value === 'string' && value ? value : fallback;
}

function number(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

/**
 * One shape for the three collections the library reads, which disagree about
 * nearly every field name: `uploadedMusic` and `favouriteSounds` carry the
 * serialized sound, `songs_by_date` nests an array of them, and `pose_songs`
 * uses the music-uploader page's own names (`coverUrl`, `streamCount`).
 */
function soundFrom(id: string, data: Record<string, unknown>, sourceTab: SoundTab): PoseSound {
  const rawDuration = data['duration'];
  const seconds =
    typeof rawDuration === 'number'
      ? rawDuration
      : number(data['fullDuration'], number(data['trimDuration'], 0));
  const ownerUserId = text(data['ownerUserId']);
  return {
    id,
    title: text(data['title'], 'Unknown'),
    artist: text(data['artist'], 'Unknown Artist'),
    thumbnail: text(data['thumbnail'], text(data['imageUrl'], text(data['coverUrl']))),
    audioUrl: text(data['audioUrl'], text(data['url'])),
    duration: typeof rawDuration === 'string' && rawDuration ? rawDuration : formatDuration(seconds),
    fullDuration: seconds,
    plays: number(data['plays'], number(data['streamCount'])),
    uses: number(data['uses'], number(data['useCount'])),
    trending: Boolean(data['trending']),
    isFavorited: sourceTab === 'favourite' || Boolean(data['isFavorited']),
    trimStart: number(data['trimStart']),
    trimEnd: number(data['trimEnd']),
    category: text(data['category'], text(data['genre'], 'Music')),
    ownerUserId,
    ownerUsername: text(data['ownerUsername']),
    ownerName: text(data['ownerName']),
    ownerProfilePic: text(data['ownerProfilePic']),
    ownerVideoId: text(data['ownerVideoId']),
    songId: text(data['songId']),
    isReusedSound: Boolean(data['isReusedSound'] || data['ownerVideoId']),
    fromPmusic: Boolean(data['fromPmusic']),
    sourceTab,
  };
}

/** `loadFavouriteSounds()` @59182 — the sounds the user hearted, newest first. */
export async function loadFavouriteSounds(uid: string): Promise<PoseSound[]> {
  const { db } = getPoseFirebase();
  const snapshot = await getDocs(
    query(collection(db, 'users', uid, 'favouriteSounds'), orderBy('addedAt', 'desc'), limit(50)),
  );
  return snapshot.docs.map((entry) => soundFrom(entry.id, entry.data(), 'favourite'));
}

/**
 * `pose_songs` documents the sound library shows under a user's own name — both
 * `loadYourMusic()` @59244 and `loadPoseMusicFromFirebase()` @58696 union them in
 * over the legacy collections, and both skip one they already hold by id.
 */
async function loadOwnedPoseSongs(uid: string): Promise<PoseSound[]> {
  const { db } = getPoseFirebase();
  const snapshot = await getDocs(
    query(collection(db, 'pose_songs'), where('artistUid', '==', uid), limit(100)),
  );
  return snapshot.docs.map((entry) => ({
    ...soundFrom(entry.id, entry.data(), 'yourMusic'),
    fromPmusic: true,
  }));
}

/** `loadYourMusic()` @59244 — `users/{uid}/uploadedMusic`, plus the artist uploads. */
export async function loadYourMusic(uid: string): Promise<PoseSound[]> {
  const { db } = getPoseFirebase();
  const snapshot = await getDocs(
    query(collection(db, 'users', uid, 'uploadedMusic'), orderBy('uploadedAt', 'desc'), limit(50)),
  );
  const sounds = snapshot.docs.map((entry) => soundFrom(entry.id, entry.data(), 'yourMusic'));

  const seen = new Set(sounds.map((sound) => sound.id));
  for (const sound of await loadOwnedPoseSongs(uid)) {
    if (!seen.has(sound.id)) sounds.push(sound);
  }
  return sounds;
}

/**
 * `loadPoseMusicFromFirebase()` @58696 — the flat `songs_by_date` batches, the
 * older `songs` collection, and the artist uploads.
 *
 * Deliberate fix: the legacy re-sliced this list into a random batch of ten on a
 * five-minute timer and announced "Music library refreshed!" each time, which
 * shuffled the tab under a thumb mid-scroll. The port loads it once and leaves it
 * where it is.
 */
export async function loadPoseMusic(uid: string): Promise<PoseSound[]> {
  const { db } = getPoseFirebase();
  const sounds: PoseSound[] = [];

  const byDate = await getDocs(
    query(collection(db, 'users', uid, 'songs_by_date'), orderBy('date', 'desc'), limit(100)),
  );
  byDate.forEach((entry) => {
    const songs = entry.data()['songs'];
    if (!Array.isArray(songs)) return;
    songs.forEach((song: Record<string, unknown>, index: number) => {
      sounds.push(soundFrom(text(song['id'], `song_${sounds.length}_${index}`), song, 'poseMusic'));
    });
  });

  const legacy = await getDocs(query(collection(db, 'users', uid, 'songs'), limit(50)));
  legacy.forEach((entry) => {
    sounds.push(soundFrom(entry.id, entry.data(), 'poseMusic'));
  });

  const seen = new Set(sounds.map((sound) => sound.id));
  for (const sound of await loadOwnedPoseSongs(uid)) {
    if (!seen.has(sound.id)) sounds.push({ ...sound, sourceTab: 'poseMusic' });
  }
  return sounds;
}

/** `toggleFavoriteSound()` @59470 — heart the sound, or take the heart back off. */
export async function toggleFavouriteSound(uid: string, sound: PoseSound): Promise<boolean> {
  const { db } = getPoseFirebase();
  const ref = doc(db, 'users', uid, 'favouriteSounds', sound.id);

  if (sound.isFavorited) {
    await deleteDoc(ref);
    return false;
  }

  // The trimmed window is saved with the sound so the trimmer can restore it,
  // which is the only reason the legacy copied the whole object in.
  await setDoc(ref, {
    id: sound.id,
    title: sound.title,
    artist: sound.artist,
    thumbnail: sound.thumbnail,
    audioUrl: sound.audioUrl,
    duration: sound.duration,
    fullDuration: sound.fullDuration,
    plays: sound.plays,
    uses: sound.uses,
    trending: sound.trending,
    trimStart: sound.trimStart,
    trimEnd: sound.trimEnd,
    category: sound.category,
    ownerUserId: sound.ownerUserId,
    ownerUsername: sound.ownerUsername,
    ownerName: sound.ownerName,
    ownerProfilePic: sound.ownerProfilePic,
    ownerVideoId: sound.ownerVideoId,
    songId: sound.songId,
    isReusedSound: sound.isReusedSound,
    isFavorited: true,
    addedAt: serverTimestamp(),
  });
  return true;
}

/** `deleteYourMusic()` @61731 — only the uploaded copy; `pose_songs` is not the sheet's to drop. */
export async function deleteUploadedMusic(uid: string, soundId: string): Promise<void> {
  const { db } = getPoseFirebase();
  await deleteDoc(doc(db, 'users', uid, 'uploadedMusic', soundId));
}

export type SoundAuthor = {
  uid: string;
  name: string;
  username: string;
  profilePic: string | null;
};

/**
 * The `customAudio` block a post carries, built the way
 * `savePhotoUrlToFirebase()` @56555 and `publishRecordingPostToFirebase()`
 * @57684 built it: `credit*` names the author who used the sound, and `owner*`
 * keeps the sound's original creator when it was reused from their post, falling
 * back to the author only when the sound is genuinely theirs.
 */
export function soundAttribution(sound: PoseSound, author: SoundAuthor): CustomAudio {
  const hasOriginalOwner = Boolean(sound.ownerUserId);
  const isReused = Boolean(sound.isReusedSound || sound.ownerVideoId);
  return {
    id: sound.id,
    title: sound.title,
    artist: sound.artist,
    thumbnail: sound.thumbnail,
    url: sound.audioUrl,
    duration: sound.fullDuration,
    creditUser: author.uid,
    creditName: author.name,
    creditUsername: author.username,
    ownerUserId: hasOriginalOwner ? sound.ownerUserId : isReused ? '' : author.uid,
    ownerUsername: hasOriginalOwner
      ? sound.ownerUsername
      : isReused
        ? sound.artist
        : author.username,
    ownerName: hasOriginalOwner ? sound.ownerName : isReused ? sound.artist : author.name,
    ownerProfilePic: hasOriginalOwner
      ? sound.ownerProfilePic
      : isReused
        ? ''
        : (author.profilePic ?? ''),
    ownerVideoId: sound.ownerVideoId,
    songId: sound.songId || undefined,
    isReusedSound: isReused,
  };
}
