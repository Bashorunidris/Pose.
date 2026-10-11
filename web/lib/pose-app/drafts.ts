/**
 * The drafts sheet's data layer: the read `_fetchAndRenderDrafts()` @45706 made,
 * the delete `deleteDraft()` @45789 performed, and the two helpers `_buildDraftCard()`
 * @45659 used to decide what a draft is and how to date it.
 *
 * The sheet reads `users/{uid}/drafts`, which is the copy both publish paths
 * mirror into — `saveRecordingDraftToFirebase()` @57594 for video and
 * `savePhotoUrlToFirebase()` @56555 for photos. The video path also writes a
 * top-level `drafts/{docId}`, so a delete clears that too, best-effort.
 */
import { collection, deleteDoc, doc, getDocs } from 'firebase/firestore';

import { getPoseFirebase } from '@/lib/firebase';

export type DraftItem = {
  id: string;
  type: string;
  caption: string;
  videoUrl: string | null;
  imageUrl: string | null;
  /** A Firestore timestamp on old drafts, an ISO string on the ones the port writes. */
  createdAt: unknown;
  status: string | null;
};

function readString(value: unknown): string | null {
  return typeof value === 'string' && value ? value : null;
}

/** `_buildDraftCard()` @45659 — a draft is video if it says so, or if it only carries a video. */
export function draftIsVideo(draft: DraftItem): boolean {
  return draft.type === 'video' || (Boolean(draft.videoUrl) && !draft.imageUrl);
}

/** The cover the card shows: a video's `videoUrl`, a photo's `imageUrl`. */
export function draftCover(draft: DraftItem): string {
  return (draftIsVideo(draft) ? draft.videoUrl : draft.imageUrl) ?? draft.imageUrl ?? draft.videoUrl ?? '';
}

function toDate(value: unknown): Date {
  if (
    value &&
    typeof value === 'object' &&
    'toDate' in value &&
    typeof (value as { toDate: unknown }).toDate === 'function'
  ) {
    return (value as { toDate: () => Date }).toDate();
  }
  return new Date(value as string | number);
}

/** `formatDraftDate()` @45651 — "10 Oct", and nothing at all when it will not parse. */
export function formatDraftDate(value: unknown): string {
  try {
    const date = toDate(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  } catch {
    return '';
  }
}

/** `_fetchAndRenderDrafts()` @45706 — newest first, the sort it applied after loading. */
export async function loadDrafts(uid: string): Promise<DraftItem[]> {
  const { db } = getPoseFirebase();
  const snapshot = await getDocs(collection(db, 'users', uid, 'drafts'));

  const drafts = snapshot.docs.map((entry) => {
    const data = entry.data();
    return {
      id: entry.id,
      type: (data['type'] as string) || '',
      caption: (data['caption'] as string) || '',
      videoUrl: readString(data['videoUrl']),
      imageUrl: readString(data['imageUrl']),
      createdAt: data['createdAt'],
      status: readString(data['status']),
    } satisfies DraftItem;
  });

  return drafts.sort(
    (left, right) => toDate(right.createdAt).getTime() - toDate(left.createdAt).getTime(),
  );
}

/** `deleteDraft()` @45789 — the author's copy, then the top-level mirror it does not own. */
export async function deleteDraft(uid: string, draftId: string): Promise<void> {
  const { db } = getPoseFirebase();
  await deleteDoc(doc(db, 'users', uid, 'drafts', draftId));
  await deleteDoc(doc(db, 'drafts', draftId)).catch(() => undefined);
}

/**
 * `postDraft()` @45807's first half: pull the draft's video down so the editor
 * gets a local blob it can cut and re-upload, exactly like a gallery upload.
 */
export async function fetchDraftClip(url: string): Promise<Blob> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.blob();
}
