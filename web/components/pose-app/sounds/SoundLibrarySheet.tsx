'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import {
  deleteUploadedMusic,
  loadFavouriteSounds,
  loadPoseMusic,
  loadYourMusic,
  toggleFavouriteSound,
  type PoseSound,
  type SoundTab,
} from '@/lib/pose-app/sounds';

import { ConfirmModal } from '../profile/ConfirmModal';
import { SoundBanner } from './SoundBanner';
import { SoundRow } from './SoundRow';

type SheetTab = SoundTab | 'voiceOver';
type LoadStatus = 'loading' | 'ready' | 'error';

type Props = {
  uid: string | null;
  onClose: () => void;
  onToast: (message: string) => void;
  /** `selectSound()` @59531 — the chosen sound goes back to the recorder. */
  onSelect: (sound: PoseSound) => void;
};

const TABS: { id: SheetTab; label: string; icon: string }[] = [
  { id: 'favourite', label: 'Favourite', icon: 'fa-star' },
  { id: 'yourMusic', label: 'Your Music', icon: 'fa-headphones' },
  { id: 'poseMusic', label: 'Pose Music', icon: 'fa-music' },
  { id: 'voiceOver', label: 'Voice Over', icon: 'fa-microphone' },
];

const SOUND_TABS: SoundTab[] = ['favourite', 'yourMusic', 'poseMusic'];

const EMPTY: Record<SoundTab, { icon: string; title: string; text: string }> = {
  favourite: {
    icon: 'fa-star',
    title: 'No favourites yet',
    text: 'Tap the heart on a Pose Music track to keep it here',
  },
  yourMusic: {
    icon: 'fa-headphones',
    title: 'No music uploaded',
    text: 'Tracks you publish under your name show up here',
  },
  poseMusic: {
    icon: 'fa-music',
    title: 'No sounds available',
    text: 'Check back soon for new music',
  },
};

function EmptyState({ icon, title, text }: { icon: string; title: string; text: string }) {
  return (
    <div className="sound-empty">
      <div className="sound-empty-icon">
        <i className={`fas ${icon}`} />
      </div>
      <div className="sound-empty-title">{title}</div>
      <div className="sound-empty-text">{text}</div>
    </div>
  );
}

/**
 * `#soundLibraryModal` @26278 with `openSoundLibrary()` @59012 behind it: the
 * banner slider, the four tabs, and the three reads that fill them.
 *
 * The search box is a client-side filter over the loaded list. The legacy wired
 * `searchSounds()` @61050 to `applySearchFilters()` @61028, which called
 * `searchSounds()` again — so the Pose Music search re-entered its own debounce
 * on every keystroke and the Favourite and Your Music boxes filtered nothing.
 *
 * Two tabs are shells for now, because what they need is a slice of its own:
 * Voice Over records through `MediaRecorder` (`startVoiceRecording()` @61384)
 * and Your Music's "Add Music from Device" uploads a local file through
 * `handleMusicFileUpload()` @61662.
 */
export function SoundLibrarySheet({ uid, onClose, onToast, onSelect }: Props) {
  const [tab, setTab] = useState<SheetTab>('favourite');
  const [lists, setLists] = useState<Record<SoundTab, PoseSound[]>>({
    favourite: [],
    yourMusic: [],
    poseMusic: [],
  });
  const [status, setStatus] = useState<Record<SoundTab, LoadStatus>>({
    favourite: 'loading',
    yourMusic: 'loading',
    poseMusic: 'loading',
  });
  const [query, setQuery] = useState<Record<SoundTab, string>>({
    favourite: '',
    yourMusic: '',
    poseMusic: '',
  });
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<PoseSound | null>(null);
  const [deleting, setDeleting] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const load = useCallback(
    async (which: SoundTab) => {
      if (!uid) {
        setStatus((current) => ({ ...current, [which]: 'ready' }));
        return;
      }
      setStatus((current) => ({ ...current, [which]: 'loading' }));
      try {
        const sounds =
          which === 'favourite'
            ? await loadFavouriteSounds(uid)
            : which === 'yourMusic'
              ? await loadYourMusic(uid)
              : await loadPoseMusic(uid);
        setLists((current) => ({ ...current, [which]: sounds }));
        setStatus((current) => ({ ...current, [which]: 'ready' }));
      } catch (cause) {
        console.error('❌ loading the sound library:', cause);
        setStatus((current) => ({ ...current, [which]: 'error' }));
      }
    },
    [uid],
  );

  useEffect(() => {
    void Promise.resolve().then(() => {
      SOUND_TABS.forEach((which) => void load(which));
    });
  }, [load]);

  // `closeSoundLibrary()` @59047 stopped whatever was playing; unmounting is this
  // sheet's close, so the preview is stopped on the way out.
  useEffect(() => () => audioRef.current?.pause(), []);

  // The modal is a full-screen scroll container, so the page behind it holds still.
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  const stopPreview = useCallback(() => {
    audioRef.current?.pause();
    audioRef.current = null;
    setPlayingId(null);
  }, []);

  /** `toggleSoundPlay()` @59429 — one preview at a time, stopped by `stopCurrentAudio()` @59458. */
  const togglePlay = useCallback(
    (sound: PoseSound) => {
      if (!sound.audioUrl) {
        onToast('That sound has no audio to preview');
        return;
      }
      if (playingId === sound.id) {
        stopPreview();
        return;
      }
      stopPreview();
      const audio = new Audio(sound.audioUrl);
      audio.onended = () => {
        audioRef.current = null;
        setPlayingId(null);
      };
      void audio.play().catch(() => {
        audioRef.current = null;
        setPlayingId(null);
        onToast('That preview would not play');
      });
      audioRef.current = audio;
      setPlayingId(sound.id);
    },
    [onToast, playingId, stopPreview],
  );

  const toggleFavourite = useCallback(
    async (sound: PoseSound) => {
      if (!uid) {
        onToast('Sign in to save favourite sounds');
        return;
      }
      try {
        const added = await toggleFavouriteSound(uid, sound);
        setLists((current) => {
          const sameId = (entry: PoseSound) => entry.id === sound.id;
          const mark = (entry: PoseSound) => (sameId(entry) ? { ...entry, isFavorited: added } : entry);
          const favourite = added
            ? current.favourite.some(sameId)
              ? current.favourite.map(mark)
              : [{ ...sound, isFavorited: true, sourceTab: 'favourite' as SoundTab }, ...current.favourite]
            : current.favourite.filter((entry) => !sameId(entry));
          return {
            favourite,
            yourMusic: current.yourMusic.map(mark),
            poseMusic: current.poseMusic.map(mark),
          };
        });
        onToast(added ? 'Added to favourites' : 'Removed from favourites');
      } catch (cause) {
        console.error('❌ saving the favourite:', cause);
        onToast('Could not save that favourite');
      }
    },
    [onToast, uid],
  );

  /** `deleteYourMusic()` @61731, with the sheet's own dialog in place of `confirm()`. */
  const confirmDelete = async () => {
    if (!pendingDelete || !uid) return;
    setDeleting(true);
    try {
      await deleteUploadedMusic(uid, pendingDelete.id);
      setLists((current) => ({
        ...current,
        yourMusic: current.yourMusic.filter((entry) => entry.id !== pendingDelete.id),
      }));
      onToast('Track deleted');
      setPendingDelete(null);
    } catch (cause) {
      console.error('❌ deleting the track:', cause);
      onToast('Could not delete that track');
    } finally {
      setDeleting(false);
    }
  };

  const visible = (which: SoundTab): PoseSound[] => {
    const needle = query[which].trim().toLowerCase();
    if (!needle) return lists[which];
    return lists[which].filter((sound) =>
      `${sound.title} ${sound.artist}`.toLowerCase().includes(needle),
    );
  };

  const renderList = (which: SoundTab) => {
    if (!uid) {
      return <EmptyState icon="fa-lock" title="Login to save your sounds" text="Your sounds and favourites appear here once you sign in" />;
    }
    if (status[which] === 'loading') {
      return (
        <div className="sound-loading">
          <div className="sound-loading-spinner" />
          <p>Loading…</p>
        </div>
      );
    }
    if (status[which] === 'error') {
      return (
        <EmptyState
          icon="fa-triangle-exclamation"
          title="Could not load sounds"
          text="Close the library and open it again to retry"
        />
      );
    }
    const sounds = visible(which);
    if (!sounds.length) {
      if (query[which].trim()) {
        return (
          <EmptyState
            icon="fa-magnifying-glass"
            title="No matches"
            text={`Nothing here matches "${query[which].trim()}"`}
          />
        );
      }
      return <EmptyState {...EMPTY[which]} />;
    }
    return sounds.map((sound) => (
      <SoundRow
        key={`${which}-${sound.id}`}
        sound={sound}
        playing={playingId === sound.id}
        onPlay={togglePlay}
        onFavourite={toggleFavourite}
        onUse={onSelect}
        onDelete={which === 'yourMusic' && !sound.fromPmusic ? setPendingDelete : undefined}
      />
    ));
  };

  const searchRow = (which: SoundTab, placeholder: string) => (
    <div className="sound-search">
      <input
        type="text"
        className="sound-search-input"
        placeholder={placeholder}
        value={query[which]}
        onChange={(event) => setQuery((current) => ({ ...current, [which]: event.target.value }))}
      />
      <span className="search-icon">
        <i className="fas fa-magnifying-glass" />
      </span>
    </div>
  );

  return (
    <div className="sounds-shell">
      <div className="sound-library-modal active">
        <div className="sound-library-header">
          <h2>
            <i className="fas fa-music" /> Add Sound
          </h2>
          <button type="button" className="sound-library-close" onClick={onClose} title="Close">
            <i className="fas fa-xmark" />
          </button>
        </div>

        <SoundBanner />

        <div className="sound-tabs">
          {TABS.map((entry) => (
            <button
              type="button"
              key={entry.id}
              className={`sound-tab${tab === entry.id ? ' active' : ''}`}
              onClick={() => {
                stopPreview();
                setTab(entry.id);
              }}
            >
              <i className={`fas ${entry.icon}`} /> {entry.label}
            </button>
          ))}
        </div>

        <div className={`sound-tab-content${tab === 'favourite' ? ' active' : ''}`}>
          {searchRow('favourite', 'Search favourite sounds…')}
          <div className="sound-list">{renderList('favourite')}</div>
        </div>

        <div className={`sound-tab-content${tab === 'yourMusic' ? ' active' : ''}`}>
          <div className="p-[15px] pb-0">
            <button
              type="button"
              className="w-full rounded-[6px] border-none bg-[linear-gradient(135deg,#22c55e_0%,#16a34a_100%)] p-[12px] text-[14px] font-semibold text-white"
              onClick={() => onToast('Uploading tracks from your device is coming soon')}
            >
              <i className="fas fa-upload" /> Add Music from Device
            </button>
          </div>
          {searchRow('yourMusic', 'Search your music…')}
          <div className="sound-list">{renderList('yourMusic')}</div>
        </div>

        <div className={`sound-tab-content${tab === 'poseMusic' ? ' active' : ''}`}>
          <div className="p-[15px] pb-0">
            <button
              type="button"
              className="w-full rounded-[6px] border border-[#444] bg-[linear-gradient(135deg,#1a1a1a_0%,#0a0a0a_100%)] p-[12px] text-[14px] font-semibold text-white"
              onClick={() => onToast('Searching the iTunes catalogue is coming soon')}
            >
              <i className="fas fa-globe" /> Search the iTunes catalogue
            </button>
          </div>
          {searchRow('poseMusic', 'Search Pose Music…')}
          <div className="sound-list">{renderList('poseMusic')}</div>
        </div>

        <div className={`sound-tab-content${tab === 'voiceOver' ? ' active' : ''}`}>
          <div className="voice-recorder">
            <div className="voice-visualizer">
              <span className="voice-icon">
                <i className="fas fa-microphone" />
              </span>
            </div>
            <div className="voice-timer">00:00</div>
            <div className="voice-controls">
              <button
                type="button"
                className="voice-btn record"
                title="Voice over recording is coming soon"
                onClick={() => onToast('Voice over recording is coming soon')}
              >
                <i className="fas fa-microphone-lines" />
              </button>
            </div>
            <p className="mt-[20px] text-center text-[13px] text-[#888]">
              Voice over recording is coming soon
            </p>
          </div>
        </div>
      </div>

      {pendingDelete ? (
        // The library modal sits at z-index 999999, the same layer the legacy put
        // `#soundLibraryModal` on, so the dialog needs a layer of its own above it.
        <div className="fixed inset-0 z-[1000000]">
          <ConfirmModal
            variant="danger"
            title="Delete this track?"
            message={`"${pendingDelete.title}" will be removed from your music.`}
            confirmLabel="Delete"
            busy={deleting}
            onConfirm={() => void confirmDelete()}
            onCancel={() => setPendingDelete(null)}
          />
        </div>
      ) : null}
    </div>
  );
}
