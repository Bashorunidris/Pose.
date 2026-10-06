'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { signOut } from 'firebase/auth';
import { collection, doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { POSE_SONGS_COLLECTION, getPoseFirebase } from '@/lib/firebase';
import { FALLBACK_TRACK_COVER, PREVIEW_LIMIT_SECONDS, SONGS_PER_PAGE } from '@/lib/pose-music/data';
import type { Song, ViewName } from '@/lib/pose-music/types';
import { useAudioEngine } from '@/lib/pose-music/use-audio-engine';
import { usePoseCreator } from '@/lib/pose-music/use-pose-creator';
import { usePoseSongs } from '@/lib/pose-music/use-pose-songs';
import { useToast } from '@/lib/pose-music/use-toast';
import { AnalyticsModal } from '@/components/pose-music/AnalyticsModal';
import { CatalogueView } from '@/components/pose-music/CatalogueView';
import { DashboardView } from '@/components/pose-music/DashboardView';
import { EffectsPanel } from '@/components/pose-music/EffectsPanel';
import { Filters } from '@/components/pose-music/Filters';
import { MenuDrawer } from '@/components/pose-music/MenuDrawer';
import { PlayerBar } from '@/components/pose-music/PlayerBar';
import { ProfileView, type ProfileEdits } from '@/components/pose-music/ProfileView';
import { SearchView } from '@/components/pose-music/SearchView';
import { SignupView, type Draft } from '@/components/pose-music/SignupView';
import { PAGE_CONTENT } from '@/components/pose-music/styles';
import { Toast } from '@/components/pose-music/Toast';
import { TopBar } from '@/components/pose-music/TopBar';
import { UploadView, type UploadPayload } from '@/components/pose-music/UploadView';

const INFINITE_SCROLL_THRESHOLD_PX = 400;
const INFINITE_SCROLL_DELAY_MS = 700;
const CATALOGUE_REFRESH_DELAY_MS = 1500;

const CREATOR_VIEWS: ViewName[] = ['dashboard', 'upload', 'catalogue', 'profile'];

export default function PoseMusicPage() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const engine = useAudioEngine(audioRef);
  const { artist, setArtist, createProfile, updateProfile } = usePoseCreator();
  const { songs, loadForUid, addLocal, bumpCount, togglePin } = usePoseSongs();
  const { toast, showToast } = useToast();

  const [view, setView] = useState<ViewName>('search');
  const [query, setQuery] = useState('');
  const [genre, setGenre] = useState('All');
  const [country, setCountry] = useState('All');
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const loadingMoreRef = useRef(false);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [effectsOpen, setEffectsOpen] = useState(false);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [revealed, setRevealed] = useState<Record<string, number>>({});
  const [barSong, setBarSong] = useState<Song | null>(null);
  const [playerTime, setPlayerTime] = useState(0);
  const [liked, setLiked] = useState<Set<string>>(() => new Set());
  const [catalogueQuery, setCatalogueQuery] = useState('');
  const [analyticsSong, setAnalyticsSong] = useState<Song | null>(null);

  const playingIdRef = useRef<string | null>(null);
  useEffect(() => {
    playingIdRef.current = playingId;
  }, [playingId]);

  const filtered = useMemo(() => {
    const needle = query.toLowerCase();
    return songs.filter(
      (song) =>
        (song.title.toLowerCase().includes(needle) || song.artist.toLowerCase().includes(needle)) &&
        (genre === 'All' || song.genre === genre) &&
        (country === 'All' || song.country === country),
    );
  }, [songs, query, genre, country]);

  const visibleSongs = useMemo(
    () => filtered.slice(0, page * SONGS_PER_PAGE),
    [filtered, page],
  );

  const playingSong = playingId ? songs.find((song) => song.id === playingId) ?? null : null;

  const mySongs = useMemo(
    () => (artist ? songs.filter((song) => song.artistId === artist.id) : []),
    [songs, artist],
  );

  const stopPlayback = useCallback(() => {
    const el = audioRef.current;
    if (el && !el.paused) el.pause();
    setPlayingId(null);
    setPlaying(false);
  }, []);

  const showView = useCallback(
    (next: ViewName) => {
      if (CREATOR_VIEWS.includes(next) && !artist) {
        setView('signup');
        return;
      }
      if (next === 'signup' && artist) {
        setView('dashboard');
        return;
      }
      stopPlayback();
      setEffectsOpen(false);
      setDrawerOpen(false);
      setView(next);
    },
    [artist, stopPlayback],
  );

  const startSong = useCallback(
    (song: Song) => {
      const el = audioRef.current;
      if (!el) return;
      el.src = song.audioUrl;
      el.currentTime = 0;
      el.play().catch(() => showToast('Could not play audio', 'error'));
      setPlayingId(song.id);
      setPlaying(true);
      setBarSong(song);
      setPlayerTime(0);
      setRevealed((prev) => ({ ...prev, [song.id]: 0 }));
      bumpCount(song.id, 'streamCount');
      engine.resumeGraph();
    },
    [bumpCount, engine, showToast],
  );

  const togglePlay = useCallback(
    (song: Song) => {
      const el = audioRef.current;
      if (!el) return;
      if (playingId === song.id) {
        if (el.paused) {
          el.play().catch(() => undefined);
          setPlaying(true);
        } else {
          el.pause();
          setPlaying(false);
        }
        return;
      }
      startSong(song);
    },
    [playingId, startSong],
  );

  const openEffectsForSong = useCallback(
    (song: Song) => {
      if (playingId !== song.id) startSong(song);
      setEffectsOpen(true);
    },
    [playingId, startSong],
  );

  const addSongToVideo = useCallback(
    (song: Song) => {
      bumpCount(song.id, 'useCount');
      showToast(`"${song.title}" added to your video! 🎬`, 'success');
    },
    [bumpCount, showToast],
  );

  const useCurrentSong = useCallback(() => {
    if (!playingSong) {
      showToast('Select a sound first', 'error');
      return;
    }
    addSongToVideo(playingSong);
    setEffectsOpen((open) => !open);
  }, [addSongToVideo, playingSong, showToast]);

  const mainPlayToggle = useCallback(() => {
    const el = audioRef.current;
    if (!playingId) {
      showToast('Select a sound to play', 'error');
      return;
    }
    if (!el) return;
    if (el.paused) {
      el.play().catch(() => undefined);
      setPlaying(true);
    } else {
      el.pause();
      setPlaying(false);
    }
  }, [playingId, showToast]);

  const toggleLike = useCallback(() => {
    if (!playingId) return;
    setLiked((prev) => {
      const next = new Set(prev);
      if (next.has(playingId)) {
        next.delete(playingId);
      } else {
        next.add(playingId);
        showToast('Added to liked sounds', 'success');
      }
      return next;
    });
  }, [playingId, showToast]);

  const seek = useCallback((seconds: number) => {
    const el = audioRef.current;
    if (el && playingIdRef.current) el.currentTime = seconds;
  }, []);

  const resetAllEffects = useCallback(() => {
    engine.resetEffects();
    showToast('Effects reset', 'success');
  }, [engine, showToast]);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;

    const onTimeUpdate = () => {
      const id = playingIdRef.current;
      if (!id) return;
      const time = Math.min(el.currentTime, PREVIEW_LIMIT_SECONDS);
      setPlayerTime(time);
      setRevealed((prev) => (prev[id] === undefined ? prev : { ...prev, [id]: time }));
      if (el.currentTime >= PREVIEW_LIMIT_SECONDS) {
        el.pause();
        setPlayingId(null);
        setPlaying(false);
      }
    };
    const onEnded = () => {
      if (!playingIdRef.current) return;
      setPlayingId(null);
      setPlaying(false);
    };

    el.addEventListener('timeupdate', onTimeUpdate);
    el.addEventListener('ended', onEnded);
    return () => {
      el.removeEventListener('timeupdate', onTimeUpdate);
      el.removeEventListener('ended', onEnded);
    };
  }, []);

  useEffect(() => {
    if (!artist?.id) return;
    void loadForUid(artist.id);
  }, [artist?.id, loadForUid]);

  const handleScroll = useCallback(
    (event: React.UIEvent<HTMLElement>) => {
      if (view !== 'search' || loadingMoreRef.current) return;
      const target = event.currentTarget;
      if (
        target.scrollTop + target.clientHeight >=
        target.scrollHeight - INFINITE_SCROLL_THRESHOLD_PX
      ) {
        loadingMoreRef.current = true;
        setLoadingMore(true);
        setTimeout(() => {
          setPage((current) => {
            const nextSlice = filtered.slice(current * SONGS_PER_PAGE, (current + 1) * SONGS_PER_PAGE);
            return nextSlice.length ? current + 1 : current;
          });
          loadingMoreRef.current = false;
          setLoadingMore(false);
        }, INFINITE_SCROLL_DELAY_MS);
      }
    },
    [filtered, view],
  );

  async function createArtistAccount(draft: Draft) {
    const { auth } = getPoseFirebase();
    const user = auth.currentUser;
    if (!user) {
      showToast('Please log in first', 'error');
      return;
    }
    if (!draft.name) {
      showToast('Please enter your artist name', 'error');
      return;
    }
    if (!draft.country) {
      showToast('Please select your country', 'error');
      return;
    }
    try {
      const record = await createProfile({ ...draft, email: user.email ?? undefined, isCreator: true });
      setArtist(record);
      showToast(`Welcome, ${record.name}! 🎶`, 'success');
      showView('dashboard');
    } catch (error) {
      console.error('[Pose] Creator:', error);
      showToast('Setup failed. Please try again.', 'error');
    }
  }

  async function saveProfileEdits(edits: ProfileEdits) {
    if (!artist) {
      showToast('Not logged in', 'error');
      return;
    }
    if (!edits.name) {
      showToast('Name cannot be empty', 'error');
      return;
    }
    if (!edits.country) {
      showToast('Please select a country', 'error');
      return;
    }
    try {
      await updateProfile(artist.id, edits);
      setArtist({ ...artist, ...edits });
      showToast('Profile updated ✅', 'success');
    } catch (error) {
      console.error('[Pose] Profile save:', error);
      showToast('Could not save changes', 'error');
    }
  }

  async function uploadTrack(payload: UploadPayload) {
    const { auth, db, storage } = getPoseFirebase();
    const user = auth.currentUser;
    if (!user || !artist) {
      showToast('Set up your creator profile first', 'error');
      return;
    }
    if (!payload.title) {
      showToast('Please enter a track title', 'error');
      return;
    }
    if (!payload.genre) {
      showToast('Please select a genre', 'error');
      return;
    }
    if (!payload.audioFile) {
      showToast('Please upload an audio file', 'error');
      return;
    }
    if (payload.totalSplit !== 100) {
      showToast('Revenue split must total 100%', 'error');
      return;
    }

    try {
      const songDoc = doc(collection(db, POSE_SONGS_COLLECTION));
      const base = `pose_music/${user.uid}/${songDoc.id}`;

      showToast('Uploading audio…', 'success');
      const audioUpload = await uploadBytes(
        ref(storage, `${base}/audio_${payload.audioFile.name}`),
        payload.audioFile,
      );
      const audioUrl = await getDownloadURL(audioUpload.ref);

      let coverUrl = FALLBACK_TRACK_COVER;
      if (payload.coverFile) {
        showToast('Uploading cover art…', 'success');
        const coverUpload = await uploadBytes(
          ref(storage, `${base}/cover_${payload.coverFile.name}`),
          payload.coverFile,
        );
        coverUrl = await getDownloadURL(coverUpload.ref);
      }

      const data = {
        title: payload.title,
        genre: payload.genre,
        description: payload.description,
        artist: artist.name,
        artistId: user.uid,
        country: artist.country,
        audioUrl,
        coverUrl,
        collaborators: payload.collaborators,
        duration: 0,
        streamCount: 0,
        useCount: 0,
        pinned: false,
        uploadDate: serverTimestamp(),
      };
      await setDoc(songDoc, data);
      addLocal({ ...data, id: songDoc.id, uploadDate: new Date().toISOString() } as Song);
      showToast(`"${payload.title}" uploaded! 🎵`, 'success');
      setTimeout(() => showView('catalogue'), CATALOGUE_REFRESH_DELAY_MS);
    } catch (error) {
      const failure = error as { code?: string; message?: string };
      console.error('[Pose] Upload:', failure);
      showToast(
        failure.code === 'storage/unauthorized'
          ? 'Permission denied — check Firebase Storage rules.'
          : `Upload failed: ${failure.message}`,
        'error',
      );
    }
  }

  async function handlePin(song: Song) {
    const next = await togglePin(song.id);
    if (next === null) {
      showToast('Could not save pin state', 'error');
      return;
    }
    showToast(next ? 'Song pinned' : 'Song unpinned', 'success');
  }

  async function signOutArtist() {
    const { auth } = getPoseFirebase();
    try {
      await signOut(auth);
      setArtist(null);
      showView('search');
      showToast('Signed out successfully', 'success');
    } catch {
      showToast('Sign out failed', 'error');
    }
  }

  return (
    <div className="fixed inset-0 grid grid-rows-[1fr_90px] bg-music-base text-music-ink font-body overflow-hidden leading-[normal]">
      <main
        onScroll={handleScroll}
        className="relative overflow-y-auto bg-music-base music-scroll"
      >
        <TopBar
          query={query}
          artist={artist}
          onQueryChange={(value) => {
            setQuery(value);
            setPage(1);
          }}
          onOpenDrawer={() => setDrawerOpen(true)}
          onLogoClick={() => showView('search')}
          onBack={() => {
            // /poseappdash.html is a legacy static page, not a Next route.
            // eslint-disable-next-line @next/next/no-location-assign-relative-destination
            window.location.assign('/poseappdash.html');
          }}
        />

        {view === 'search' ? (
          <>
            <Filters
              genre={genre}
              country={country}
              onGenre={(value) => {
                setGenre(value);
                setPage(1);
              }}
              onCountry={(value) => {
                setCountry(value);
                setPage(1);
              }}
            />
            <SearchView
              songs={visibleSongs}
              loadingMore={loadingMore}
              playingId={playingId}
              playing={playing}
              revealed={revealed}
              onTogglePlay={togglePlay}
              onOpenEffects={openEffectsForSong}
              onSignup={() => showView('signup')}
            />
          </>
        ) : null}

        {view === 'signup' ? (
          <div className={PAGE_CONTENT}>
            <SignupView onSubmit={createArtistAccount} />
          </div>
        ) : null}
        {view === 'profile' && artist ? (
          <div className={PAGE_CONTENT}>
            <ProfileView
              artist={artist}
              songs={mySongs}
              onSave={saveProfileEdits}
              onSignOut={signOutArtist}
            />
          </div>
        ) : null}
        {view === 'upload' && artist ? (
          <div className={PAGE_CONTENT}>
            <UploadView
              artist={artist}
              onSubmit={uploadTrack}
              onInvalid={(message) => showToast(message, 'error')}
            />
          </div>
        ) : null}
        {view === 'catalogue' && artist ? (
          <div className={PAGE_CONTENT}>
            <CatalogueView
              artist={artist}
              songs={mySongs}
              query={catalogueQuery}
              onQueryChange={setCatalogueQuery}
              onPin={handlePin}
              onAnalytics={setAnalyticsSong}
              onUpload={() => showView('upload')}
            />
          </div>
        ) : null}
        {view === 'dashboard' && artist ? (
          <div className={PAGE_CONTENT}>
            <DashboardView artist={artist} songs={mySongs} />
          </div>
        ) : null}
      </main>

      <PlayerBar
        coverUrl={barSong?.coverUrl ?? ''}
        title={barSong?.title ?? '—'}
        artist={barSong?.artist ?? 'Select a sound'}
        playing={playing}
        liked={playingId ? liked.has(playingId) : false}
        currentTime={Math.floor(playerTime)}
        volume={engine.volume}
        onTogglePlay={mainPlayToggle}
        onToggleLike={toggleLike}
        onSeek={seek}
        onVolume={engine.setVolume}
        onOpenEffects={() => setEffectsOpen((open) => !open)}
      />

      <MenuDrawer
        open={drawerOpen}
        view={view}
        artist={artist}
        onNavigate={(next) => {
          setDrawerOpen(false);
          showView(next);
        }}
        onSignOut={() => {
          setDrawerOpen(false);
          void signOutArtist();
        }}
        onClose={() => setDrawerOpen(false)}
      />

      <EffectsPanel
        open={effectsOpen}
        song={barSong}
        playing={playing}
        engine={engine}
        onClose={() => setEffectsOpen(false)}
        onUse={useCurrentSong}
        onReset={resetAllEffects}
      />

      {analyticsSong && artist ? (
        <AnalyticsModal
          song={analyticsSong}
          artist={artist}
          open
          onClose={() => setAnalyticsSong(null)}
        />
      ) : null}

      <Toast toast={toast} />
      <audio ref={audioRef} />
    </div>
  );
}
