'use client';

import { arrayUnion, doc, setDoc, updateDoc } from 'firebase/firestore';

import { getPoseFirebase } from '@/lib/firebase';
import { uploadToR2 } from '@/lib/r2-upload';
import { loadPostAuthor, toggleFields, type PostAuthor } from './post-author';

/**
 * Publishing a recording: the write `publishRecordingPostToFirebase()` @57684,
 * `saveRecordingDraftToFirebase()` @57594 and `addVideoToStoryFirebase()` @58074
 * performed, plus the canvas pass `applyEffectToVideo()` @57904 ran over the blob
 * first.
 */

/** `generateDocId()` @57385. */
export function generateDocId(): string {
  return `post_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

/** `getTodayDate()` @57377 — the `YYYY-MM-DD` key the day-scoped collections use. */
export function todayKey(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

export type VideoEffectName = 'Normal' | 'Sepia' | 'B&W' | 'Cool' | 'Warm' | 'Vintage';

/**
 * `v2SelectEffect()` @76246's table. The legacy did not re-render the file when
 * an effect was applied — it only painted the preview and stashed the name — and
 * then baked it in at publish time with `applyEffectToVideo()` @57904.
 */
export const VIDEO_EFFECTS: { name: VideoEffectName; filter: string }[] = [
  { name: 'Normal', filter: 'none' },
  { name: 'Sepia', filter: 'sepia(1)' },
  { name: 'B&W', filter: 'grayscale(1)' },
  { name: 'Cool', filter: 'hue-rotate(200deg) saturate(1.2)' },
  { name: 'Warm', filter: 'hue-rotate(-20deg) saturate(1.3)' },
  { name: 'Vintage', filter: 'sepia(0.5) hue-rotate(-10deg) brightness(1.1)' },
];

export function effectFilter(name: VideoEffectName): string {
  return VIDEO_EFFECTS.find((entry) => entry.name === name)?.filter ?? 'none';
}

/** `#screen4CategoryList` @25596 — the categories the post sheet suggests. */
export const POST_CATEGORIES = [
  'Comedy',
  'Dance',
  'Music',
  'Movies',
  'TV Shows',
  'Anime',
  'Nollywood / Drama',
  'Documentary',
  'Education / Tutorial',
  'Lifestyle / Vlog',
  'Fashion / Beauty',
  'Food / Cooking',
  'Sports / Fitness',
  'Gaming',
  'Tech',
  'News / Politics',
  'Travel / Adventure',
  'Kids / Family',
  'Health',
  'Motivation / Self-Help',
];

export const POST_PRIVACY = ['Everyone', 'Friends', 'Only me'] as const;
export type PostPrivacy = (typeof POST_PRIVACY)[number];

export const CAPTION_LIMIT = 300;

/**
 * The seven switches `#screen4` @25583 carries, in order, with the field each one
 * writes. The legacy read them back with `querySelectorAll('input[type=checkbox]
 * :nth-of-type(n)')`, which silently reorders if a switch is ever added, and
 * defaulted Allow Download to off with the rest on.
 */
export const POST_TOGGLES: {
  field: string;
  label: string;
  icon: string;
  enabledByDefault: boolean;
}[] = [
  { field: 'allowComments', label: 'Allow Comments', icon: 'fa-comment', enabledByDefault: true },
  { field: 'allowDuet', label: 'Allow Duet', icon: 'fa-user-group', enabledByDefault: true },
  { field: 'allowStitch', label: 'Allow Stitch', icon: 'fa-scissors', enabledByDefault: true },
  { field: 'allowSoundReuse', label: 'Allow Sound Reuse', icon: 'fa-music', enabledByDefault: true },
  { field: 'allowDownload', label: 'Allow Download', icon: 'fa-download', enabledByDefault: false },
  { field: 'allowMusicUsage', label: 'Allow Music Usage', icon: 'fa-headphones', enabledByDefault: true },
  { field: 'allowAds', label: 'Allow Ads Over Video', icon: 'fa-ad', enabledByDefault: true },
];

export type PostFields = {
  caption: string;
  category: string;
  hashtags: string;
  tags: string;
  privacy: PostPrivacy;
  /** The permission switches, keyed by the field each one writes. */
  toggles: Record<string, boolean>;
};

export type VideoEdit = {
  effect: VideoEffectName;
  trimStart: number;
  trimEnd: number;
  /** Recorded clips are mirrored like every other selfie camera; uploads are not. */
  mirrored: boolean;
};

/**
 * The canvas pass the legacy ran only when an effect was chosen. The port also
 * uses it for the trim window, which the legacy stored as metadata no reader ever
 * looked at, and for the mirror of a recorded clip, which the legacy showed in
 * the editor and then did not publish.
 *
 * It re-encodes in real time, so a 30s clip takes 30s. Anything that throws
 * falls back to the untouched blob, which is what the legacy did when its own
 * bake failed ("Continuing without effect...").
 */
export async function renderClip(
  blob: Blob,
  edit: VideoEdit,
  onProgress?: (fraction: number) => void,
): Promise<Blob> {
  const filter = effectFilter(edit.effect);
  const needsTrim = edit.trimStart > 0.05 || edit.trimEnd > 0;
  if (filter === 'none' && !needsTrim && !edit.mirrored) return blob;

  const source = document.createElement('video');
  const url = URL.createObjectURL(blob);
  source.src = url;
  source.playsInline = true;
  source.preload = 'metadata';

  try {
    await new Promise<void>((resolve, reject) => {
      source.onloadedmetadata = () => resolve();
      source.onerror = () => reject(new Error('Could not read the recording back'));
    });

    const width = source.videoWidth || 720;
    const height = source.videoHeight || 1280;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('No 2D canvas context');

    const end = edit.trimEnd > 0 ? Math.min(edit.trimEnd, source.duration) : source.duration;
    const start = Math.max(0, Math.min(edit.trimStart, end - 0.2));

    const stream = canvas.captureStream(30);
    // The clip's own audio: routed through the graph rather than to the speakers,
    // so baking is silent without muting the recording itself.
    const audioContext = new AudioContext();
    // A new AudioContext starts suspended unless it was built inside a gesture,
    // and a suspended one records silence — so the clip would be published with
    // no sound at all.
    if (audioContext.state === 'suspended') await audioContext.resume();
    const audioSource = audioContext.createMediaElementSource(source);
    const destination = audioContext.createMediaStreamDestination();
    audioSource.connect(destination);
    destination.stream.getAudioTracks().forEach((track) => stream.addTrack(track));

    const chunks: Blob[] = [];
    const recorder = new MediaRecorder(stream, {
      mimeType: MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
        ? 'video/webm;codecs=vp9,opus'
        : 'video/webm',
      videoBitsPerSecond: 3500000,
      audioBitsPerSecond: 128000,
    });

    const finished = new Promise<Blob>((resolve, reject) => {
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunks.push(event.data);
      };
      recorder.onstop = () => resolve(new Blob(chunks, { type: 'video/webm' }));
      recorder.onerror = () => reject(new Error('The recording could not be re-encoded'));
    });

    const draw = () => {
      if (source.ended || source.currentTime >= end) {
        source.pause();
        if (recorder.state !== 'inactive') recorder.stop();
        return;
      }
      context.filter = filter;
      context.save();
      if (edit.mirrored) {
        context.translate(width, 0);
        context.scale(-1, 1);
      }
      context.drawImage(source, 0, 0, width, height);
      context.restore();
      context.filter = 'none';
      onProgress?.(Math.min(0.99, (source.currentTime - start) / (end - start)));
      requestAnimationFrame(draw);
    };

    source.currentTime = start;
    recorder.start(100);
    await source.play();
    draw();

    const rendered = await finished;
    await audioContext.close();
    return rendered.size > 0 ? rendered : blob;
  } catch (error) {
    console.error('Could not bake the edit into the recording:', error);
    return blob;
  } finally {
    URL.revokeObjectURL(url);
  }
}

/**
 * The fields every video document shares. `toggleFields()` and the author lookup
 * moved to `post-author.ts`, which the photo slice writes with too.
 */
function commonFields(fields: PostFields, author: PostAuthor, extra: Record<string, unknown> = {}) {
  return {
    id: extra['id'],
    userId: author.uid,
    userName: author.name,
    username: author.username,
    userProfilePic: author.profilePic,
    caption: fields.caption,
    category: fields.category,
    hashtags: fields.hashtags,
    tags: fields.tags,
    privacy: fields.privacy,
    ...toggleFields(fields),
    createdAt: new Date().toISOString(),
    type: 'video',
  };
}

/** `publishRecordingPostToFirebase()` @57684 — one `videos/{docId}` document. */
export async function publishVideoPost(options: {
  uid: string;
  blob: Blob;
  fields: PostFields;
  edit: VideoEdit;
  onProgress?: (fraction: number) => void;
}): Promise<string> {
  const { db } = getPoseFirebase();
  const docId = generateDocId();
  const author = await loadPostAuthor(options.uid);

  const rendered = await renderClip(options.blob, options.edit, (fraction) =>
    options.onProgress?.(fraction * 0.4),
  );
  const videoUrl = await uploadToR2(rendered, {
    filename: `${docId}.webm`,
    contentType: rendered.type || 'video/webm',
    folder: 'posts',
    onProgress: (percent) => options.onProgress?.(0.4 + (percent / 100) * 0.6),
  });

  await setDoc(doc(db, 'videos', docId), {
    ...commonFields(options.fields, author, { id: docId }),
    videoUrl,
    publicId: docId,
    effectApplied: options.edit.effect,
    customAudio: null,
    isUploadedFile: false,
    status: 'published',
    views: 0,
    likes: {},
    likeCount: 0,
    comments: 0,
    shares: 0,
    reposts: 0,
    saves: 0,
  });

  return docId;
}

/**
 * `saveRecordingDraftToFirebase()` @57594 wrote the draft twice: under the
 * author and in a top-level `drafts` collection. The drafts sheet reads the
 * top-level one, the profile reads the author's, so both are kept.
 */
export async function saveVideoDraft(options: {
  uid: string;
  blob: Blob;
  fields: PostFields;
  edit: VideoEdit;
  onProgress?: (fraction: number) => void;
}): Promise<string> {
  const { db } = getPoseFirebase();
  const docId = generateDocId();
  const author = await loadPostAuthor(options.uid);

  const rendered = await renderClip(options.blob, options.edit);
  const videoUrl = await uploadToR2(rendered, {
    filename: `${docId}.webm`,
    contentType: rendered.type || 'video/webm',
    folder: 'drafts',
    onProgress: options.onProgress,
  });

  const draft = {
    ...commonFields(options.fields, author, { id: docId }),
    videoUrl,
    publicId: docId,
    status: 'draft',
  };

  await setDoc(doc(db, 'users', options.uid, 'drafts', docId), draft);
  await setDoc(doc(db, 'drafts', docId), draft);
  return docId;
}

/**
 * `addVideoToStoryFirebase()` @58074 — `posestoriesposted/{date}/posts/{docId}`
 * plus the reference the profile's stories grid reads off the user document.
 *
 * Deliberate fix: the legacy built that reference with `cloudinaryResult.url`,
 * a name that does not exist in that scope, so the reference threw and was
 * swallowed by its own try/catch — every story was written to the day collection
 * and never showed up on the author's profile.
 */
export async function addVideoStory(options: {
  uid: string;
  blob: Blob;
  caption: string;
  edit: VideoEdit;
  onProgress?: (fraction: number) => void;
}): Promise<string> {
  const { db } = getPoseFirebase();
  const docId = generateDocId();
  const date = todayKey();
  const author = await loadPostAuthor(options.uid);

  const rendered = await renderClip(options.blob, options.edit);
  const videoUrl = await uploadToR2(rendered, {
    filename: `${docId}.webm`,
    contentType: rendered.type || 'video/webm',
    folder: 'stories',
    onProgress: options.onProgress,
  });

  const createdAt = new Date().toISOString();
  await setDoc(doc(db, 'posestoriesposted', date, 'posts', docId), {
    id: docId,
    userId: author.uid,
    userName: author.name,
    username: author.username,
    userProfilePic: author.profilePic,
    videoUrl,
    publicId: docId,
    caption: options.caption,
    type: 'story',
    createdAt,
    date,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    views: 0,
    viewers: [],
  });

  await updateDoc(doc(db, 'users', options.uid), {
    videos: arrayUnion({
      id: docId,
      caption: options.caption,
      type: 'story',
      videoUrl,
      createdAt,
    }),
  });

  return docId;
}
