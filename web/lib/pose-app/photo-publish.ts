/**
 * Publishing a photo: the writes `publishPhotoPost()` @56336,
 * `saveDraftPhoto()` @56314, `postPhotoStory()` @56380 and the pipeline behind
 * them, `uploadPhotoToCloudinaryAndFirebase()` @56479 and
 * `savePhotoUrlToFirebase()` @56555, performed.
 *
 * The legacy called that pipeline "Cloudinary", but by the end it put the file in
 * R2 (`uploadPhotoToCloudinary()` @56542 was a thin wrapper over `uploadToR2`)
 * and only named the collection after a provider it no longer used.
 */
import { arrayUnion, doc, setDoc, updateDoc } from 'firebase/firestore';

import { getPoseFirebase } from '@/lib/firebase';
import { uploadToR2 } from '@/lib/r2-upload';
import { loadPostAuthor, toggleFields } from './post-author';
import { generateDocId, todayKey, type PostFields } from './publish';

/** `photos/{type}/{uid}/…` was the legacy key; the folder carries the kind. */
async function uploadPhoto(
  uid: string,
  blob: Blob,
  kind: 'post' | 'draft' | 'story',
  onProgress?: (percent: number) => void,
): Promise<string> {
  const extension = (blob.type.split('/')[1] || 'jpeg').replace('jpeg', 'jpg');
  return uploadToR2(blob, {
    filename: `${uid}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${extension}`,
    contentType: blob.type || 'image/jpeg',
    folder: `photos/${kind}`,
    onProgress,
  });
}

type PhotoKind = 'post' | 'draft' | 'story';

/**
 * `savePhotoUrlToFirebase()`'s document. The legacy wrote the cover into
 * `imageUrl` and the whole set into `images`; the For You carousel reads
 * `images`, and single-photo callers still read `imageUrl`.
 */
function photoDoc(
  fields: PostFields,
  author: Awaited<ReturnType<typeof loadPostAuthor>>,
  docId: string,
  urls: string[],
  kind: PhotoKind,
) {
  return {
    id: docId,
    userId: author.uid,
    userName: author.name,
    username: author.username,
    userProfilePic: author.profilePic,
    imageUrl: urls[0],
    images: urls,
    caption: fields.caption,
    hashtags: fields.hashtags,
    tags: fields.tags,
    privacy: fields.privacy,
    ...toggleFields(fields),
    status: kind === 'draft' ? 'draft' : 'published',
    createdAt: new Date().toISOString(),
    date: todayKey(),
    views: 0,
    likes: 0,
    comments: 0,
    shares: 0,
    reposts: 0,
    saves: 0,
    type: kind === 'story' ? 'story' : 'photo',
    customAudio: null,
    edits: {},
  };
}

/**
 * `publishPhotoPost()` @56336 — every photo the sheet holds goes up, not just the
 * one being previewed, and the post lands in three places: the day-scoped
 * `posephotosposted` collection, the `videos/{docId}` document the For You feed
 * renders (marked `isPhoto` so it draws an `<img>` instead of a `<video>`), and
 * the author's own `photos` array.
 */
export async function publishPhotoPost(options: {
  uid: string;
  photos: Blob[];
  fields: PostFields;
  onProgress?: (fraction: number) => void;
}): Promise<string> {
  const { db } = getPoseFirebase();
  const docId = generateDocId();
  const author = await loadPostAuthor(options.uid);
  const total = Math.max(1, options.photos.length);

  const urls: string[] = [];
  for (const [index, blob] of options.photos.entries()) {
    urls.push(
      await uploadPhoto(options.uid, blob, 'post', (percent) => {
        options.onProgress?.(((index + percent / 100) / total) * 0.9);
      }),
    );
  }

  const record = photoDoc(options.fields, author, docId, urls, 'post');
  await setDoc(doc(db, 'posephotosposted', todayKey(), 'posts', docId), record);

  await setDoc(doc(db, 'videos', docId), {
    ...record,
    videoUrl: urls[0],
    isPhoto: true,
    publicId: docId,
    likeCount: 0,
    likes: {},
  });

  await updateDoc(doc(db, 'users', options.uid), {
    photos: arrayUnion({
      id: docId,
      imageUrl: urls[0],
      caption: options.fields.caption,
      createdAt: record.createdAt,
      type: 'photo',
    }),
  });

  options.onProgress?.(1);
  return docId;
}

/**
 * `saveDraftPhoto()` @56314. The legacy wrote the draft into the photo
 * collection and then mirrored it into `users/{uid}/drafts`, which is the copy
 * the drafts sheet reads; both are kept.
 */
export async function savePhotoDraft(options: {
  uid: string;
  photo: Blob;
  fields: PostFields;
  onProgress?: (fraction: number) => void;
}): Promise<string> {
  const { db } = getPoseFirebase();
  const docId = generateDocId();
  const author = await loadPostAuthor(options.uid);

  const url = await uploadPhoto(options.uid, options.photo, 'draft', (percent) =>
    options.onProgress?.(percent / 100),
  );
  const record = photoDoc(options.fields, author, docId, [url], 'draft');

  await setDoc(doc(db, 'posephotosposted', todayKey(), 'posts', docId), record);
  await setDoc(doc(db, 'users', options.uid, 'drafts', docId), record);
  options.onProgress?.(1);
  return docId;
}

/**
 * `postPhotoStory()` @56380. The story goes to the photo collection with
 * `type: 'story'` — the legacy did not use `posestoriesposted` for photos, which
 * only the video path writes — and its reference is appended to the author's
 * `videos` array, which is what the profile's stories strip reads.
 */
export async function addPhotoStory(options: {
  uid: string;
  photo: Blob;
  caption: string;
  fields: PostFields;
  onProgress?: (fraction: number) => void;
}): Promise<string> {
  const { db } = getPoseFirebase();
  const docId = generateDocId();
  const author = await loadPostAuthor(options.uid);

  const url = await uploadPhoto(options.uid, options.photo, 'story', (percent) =>
    options.onProgress?.(percent / 100),
  );
  const record = photoDoc(options.fields, author, docId, [url], 'story');

  await setDoc(doc(db, 'posephotosposted', todayKey(), 'posts', docId), record);
  await updateDoc(doc(db, 'users', options.uid), {
    videos: arrayUnion({
      id: docId,
      caption: options.caption,
      type: 'story',
      imageUrl: url,
      createdAt: record.createdAt,
      likes: {},
      likeCount: 0,
    }),
  });

  options.onProgress?.(1);
  return docId;
}
