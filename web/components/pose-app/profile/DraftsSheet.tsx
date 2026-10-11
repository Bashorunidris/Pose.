'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import {
  deleteDraft,
  draftCover,
  draftIsVideo,
  fetchDraftClip,
  formatDraftDate,
  loadDrafts,
  type DraftItem,
} from '@/lib/pose-app/drafts';

import { ConfirmModal } from './ConfirmModal';

type Props = {
  uid: string;
  onClose: () => void;
  onToast: (message: string) => void;
  /** `postDraft()` @45807 — the draft's video, on its way into the editor. */
  onEditDraft: (clip: { url: string; blob: Blob; seconds: number }) => void;
};

/** `.draft-card` @17613 and the two-column grid `_fetchAndRenderDrafts()` @45706 built. */
const CARD = 'flex flex-col overflow-hidden rounded-[10px] bg-[#111]';
const ACTION =
  'flex cursor-pointer items-center justify-center gap-[6px] rounded-[8px] border-none p-[9px_6px] text-[13px] font-semibold';

/**
 * `#draftsModal` @24115 with `draftProfile()` @45615 behind it: the loading
 * spinner, the empty state, the counted grid of `_buildDraftCard()` @45659 cards,
 * the full-screen preview `openDraft()` @45776 opened, and `deleteDraft()` @45789.
 *
 * The card's "Post" button is `postDraft()` @45807, which pulls the draft's video
 * into a blob and hands it to the editor — the same route a gallery upload takes,
 * so the draft can be cut, posted or saved again.
 */
export function DraftsSheet({ uid, onClose, onToast, onEditDraft }: Props) {
  const [drafts, setDrafts] = useState<DraftItem[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [preview, setPreview] = useState<DraftItem | null>(null);
  const [pendingDelete, setPendingDelete] = useState<DraftItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setFailed(false);
    setDrafts(null);
    try {
      setDrafts(await loadDrafts(uid));
    } catch (cause) {
      console.error('❌ loading drafts:', cause);
      setFailed(true);
    }
  }, [uid]);

  useEffect(() => {
    void Promise.resolve().then(() => load());
  }, [load]);

  const remove = async (draft: DraftItem) => {
    setDeleting(true);
    try {
      await deleteDraft(uid, draft.id);
      onToast('Draft deleted');
      setPendingDelete(null);
      await load();
    } catch (cause) {
      console.error('❌ deleting the draft:', cause);
      onToast('Could not delete draft');
    } finally {
      setDeleting(false);
    }
  };

  /** `postDraft()` @45807 — fetch the file, then hand it to the editor as a clip. */
  const openInEditor = async (draft: DraftItem) => {
    const url = draft.videoUrl;
    if (!url) {
      onToast('This draft has no video to post');
      return;
    }
    onToast('Loading draft into editor...');
    try {
      const blob = await fetchDraftClip(url);
      // `duration: 0` in the legacy's clip object too — the editor reads the real
      // length off the element once the file loads.
      onEditDraft({ url: URL.createObjectURL(blob), blob, seconds: 0 });
      onClose();
    } catch (cause) {
      console.error('❌ fetching the draft video:', cause);
      onToast('Could not open draft');
    }
  };

  const count = drafts?.length ?? 0;

  return (
    <div className="fixed inset-0 z-[2147483640] flex h-[100dvh] w-screen flex-col bg-[#0c0c0c]">
      <div className="flex items-center border-b border-[#2a2a2a] bg-[#111] px-[16px] py-[14px]">
        <button
          type="button"
          className="mr-[12px] cursor-pointer border-none bg-none text-[22px] text-white"
          onClick={onClose}
          aria-label="Back"
        >
          &larr;
        </button>
        <h1 className="m-0 flex-1 text-[18px] text-white">Drafts</h1>
      </div>

      <div className="flex-1 overflow-auto bg-black p-[12px]">
        {failed ? (
          <div className="flex flex-col items-center justify-center gap-[12px] p-[80px_20px] text-center text-[#888]">
            <i className="fas fa-exclamation-triangle text-[44px] text-[#444]" />
            <p className="m-0 text-[14px]">Could not load drafts</p>
            <button
              type="button"
              className="mt-[10px] cursor-pointer rounded-[8px] border-none bg-[#ff2d55] px-[16px] py-[8px] text-white"
              onClick={() => void load()}
            >
              Retry
            </button>
          </div>
        ) : drafts === null ? (
          <div className="flex flex-col items-center justify-center gap-[12px] p-[80px_20px] text-center text-[#888]">
            <i className="fas fa-spinner fa-spin text-[28px] text-[#ff2d55]" />
            <p className="m-0 text-[14px]">Loading drafts...</p>
          </div>
        ) : count === 0 ? (
          <div className="flex flex-col items-center justify-center gap-[12px] p-[80px_20px] text-center text-[#888]">
            <i className="fas fa-folder-open text-[44px] text-[#444]" />
            <p className="m-0 text-[14px]">No drafts yet</p>
            <p className="m-0 text-[12px] opacity-70">Saved drafts will appear here</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between p-[4px_4px_12px] text-[13px] text-[#ccc]">
              <span>{count === 1 ? '1 draft' : `${count} drafts`}</span>
            </div>
            <div className="grid grid-cols-2 gap-[10px]">
              {drafts.map((draft) => (
                <DraftCard
                  key={draft.id}
                  draft={draft}
                  onOpen={() => setPreview(draft)}
                  onPost={() => void openInEditor(draft)}
                  onDelete={() => setPendingDelete(draft)}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* `openDraft()` @45776 built the same black overlay with the caption under it. */}
      {preview ? (
        <div
          className="fixed inset-0 z-[3000] flex flex-col items-center justify-center bg-black/95"
          onClick={(event) => {
            if (event.target === event.currentTarget) setPreview(null);
          }}
        >
          <button
            type="button"
            className="absolute right-[16px] top-[16px] h-[40px] w-[40px] cursor-pointer rounded-full border-none bg-white/15 text-[18px] text-white"
            onClick={() => setPreview(null)}
            aria-label="Close"
          >
            &times;
          </button>
          {draftIsVideo(preview) ? (
            <video
              src={preview.videoUrl ?? ''}
              controls
              autoPlay
              playsInline
              className="max-h-[80vh] max-w-full"
            />
          ) : (
            <img
              src={draftCover(preview)}
              alt="Draft"
              className="max-h-[80vh] max-w-full object-contain"
            />
          )}
          {preview.caption ? (
            <p className="mt-[16px] max-w-[600px] px-[20px] text-center text-white">{preview.caption}</p>
          ) : null}
        </div>
      ) : null}

      {pendingDelete ? (
        <ConfirmModal
          variant="danger"
          title="Delete draft?"
          message="This cannot be undone."
          confirmLabel="Delete"
          busy={deleting}
          onConfirm={() => void remove(pendingDelete)}
          onCancel={() => setPendingDelete(null)}
        />
      ) : null}
    </div>
  );
}

/**
 * One `_buildDraftCard()` @45659. The thumbnail is `_initDraftVideoLazyLoad()`
 * @45691: a video's source is only attached once the card scrolls into view, so
 * a long draft list does not pull every file down at once.
 */
function DraftCard({
  draft,
  onOpen,
  onPost,
  onDelete,
}: {
  draft: DraftItem;
  onOpen: () => void;
  onPost: () => void;
  onDelete: () => void;
}) {
  const video = draftIsVideo(draft);
  const date = formatDraftDate(draft.createdAt);

  return (
    <div className={CARD}>
      <div className="relative aspect-[9/16] cursor-pointer bg-black" onClick={onOpen}>
        {video ? <LazyVideo src={draft.videoUrl ?? ''} /> : <img src={draftCover(draft)} alt="Draft" loading="lazy" className="block h-full w-full object-cover" />}

        {video ? (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-[30px] text-white/85 [text-shadow:0_2px_8px_rgba(0,0,0,0.6)]">
            <i className="fas fa-play-circle" />
          </div>
        ) : null}

        <span className="absolute left-[6px] top-[6px] flex items-center gap-[4px] rounded-[6px] bg-black/65 px-[7px] py-[3px] text-[11px] text-white">
          <i className={video ? 'fas fa-video' : 'fas fa-image'} /> {video ? 'Video' : 'Photo'}
        </span>

        {date ? (
          <span className="absolute right-[6px] top-[6px] rounded-[6px] bg-black/60 px-[6px] py-[2px] text-[10px] text-[#eee]">
            {date}
          </span>
        ) : null}

        {draft.caption ? (
          <div className="absolute inset-x-0 bottom-0 overflow-hidden text-ellipsis whitespace-nowrap bg-gradient-to-t from-black/85 to-transparent p-[18px_8px_6px] text-[11px] text-white">
            {draft.caption}
          </div>
        ) : null}
      </div>

      <div className="flex gap-[6px] p-[8px]">
        {video ? (
          <button type="button" className={`${ACTION} flex-1 bg-[#ff2d55] text-white`} onClick={onPost}>
            <i className="fas fa-paper-plane" /> Post
          </button>
        ) : (
          <button type="button" className={`${ACTION} flex-1 bg-[#ff2d55] text-white`} onClick={onOpen}>
            <i className="fas fa-eye" /> View
          </button>
        )}
        <button
          type="button"
          className={`${ACTION} w-[44px] bg-[#2a2a2a] text-[#ff6b6b]`}
          onClick={onDelete}
          title="Delete draft"
        >
          <i className="fas fa-trash" />
        </button>
      </div>
    </div>
  );
}

function LazyVideo({ src }: { src: string }) {
  const elementRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          element.src = `${src}#t=0.1`;
          element.preload = 'metadata';
          observer.unobserve(element);
        });
      },
      { rootMargin: '120px' },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [src]);

  return <video ref={elementRef} muted playsInline preload="none" className="block h-full w-full object-cover" />;
}
