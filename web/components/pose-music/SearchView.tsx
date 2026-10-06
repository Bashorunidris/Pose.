'use client';

import { Fragment } from 'react';
import { BannerAd } from './BannerAd';
import { SongCard } from './SongCard';
import { AD_EVERY_SONGS, SONGS_PER_PAGE } from '@/lib/pose-music/data';
import { PAGE_CONTENT, TR } from './styles';
import type { Song } from '@/lib/pose-music/types';

type Props = {
  songs: Song[];
  loadingMore: boolean;
  playingId: string | null;
  playing: boolean;
  /** song id -> last preview position, kept after pause exactly like the legacy inline bar. */
  revealed: Record<string, number>;
  onTogglePlay: (song: Song) => void;
  onOpenEffects: (song: Song) => void;
  onSignup: () => void;
};

export function SearchView({
  songs,
  loadingMore,
  playingId,
  playing,
  revealed,
  onTogglePlay,
  onOpenEffects,
  onSignup,
}: Props) {
  return (
    <div className={PAGE_CONTENT}>
      <div className="flex items-baseline justify-between mb-[18px]">
        <h2 className="font-display text-[21px] font-bold max-[600px]:text-[17px]">Trending Sounds</h2>
        <span className={`text-[11.5px] text-music-ink-muted font-semibold cursor-pointer tracking-[.5px] uppercase ${TR} hover:text-music-ink`}>
          See All
        </span>
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(185px,1fr))] gap-[14px] max-[600px]:grid-cols-2">
        {songs.map((song, index) => (
          <Fragment key={song.id}>
            {index > 0 && index % AD_EVERY_SONGS === 0 ? (
              <BannerAd
                badge="POSE PLATFORM"
                title={<><i className="far fa-gem" /> Premium sound, premium creator pay</>}
                description="3–5× higher royalties per use — upload your music today"
                action="Upload Music"
                onAction={onSignup}
              />
            ) : null}
            <SongCard
              song={song}
              playing={song.id === playingId && playing}
              delayIndex={index % SONGS_PER_PAGE}
              progressSeconds={revealed[song.id] ?? 0}
              showProgress={revealed[song.id] !== undefined}
              onTogglePlay={onTogglePlay}
              onOpenEffects={onOpenEffects}
            />
          </Fragment>
        ))}
      </div>

      {loadingMore ? (
        <div className="text-center p-[36px] text-[13.5px] text-music-ink-muted">
          <i className="fas fa-spinner fa-spin" /> Loading more…
        </div>
      ) : null}

      <BannerAd
        badge="POSE CREATORS"
        title={<><i className="fas fa-rocket" /> Your music, your earnings — amplified on Pose</>}
        description="Every use pays creators directly. Earn 3–5× more than traditional platforms"
        action="Start Earning More"
        onAction={onSignup}
        className="mt-[22px]"
      />
    </div>
  );
}
