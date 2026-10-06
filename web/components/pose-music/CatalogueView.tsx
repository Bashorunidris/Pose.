'use client';

import { REVENUE_PER_USE_USD, FALLBACK_TRACK_COVER, formatCurrency, formatNumber } from '@/lib/pose-music/data';
import { BTN, TR, SUBMIT_BTN } from './styles';
import type { Artist, Song } from '@/lib/pose-music/types';

type Props = {
  artist: Artist;
  songs: Song[];
  query: string;
  onQueryChange: (value: string) => void;
  onPin: (song: Song) => void;
  onAnalytics: (song: Song) => void;
  onUpload: () => void;
};

const SMALL_BUTTON = `${BTN} flex-1 py-[6px] px-[9px] rounded-[6px] text-[11px] font-semibold gap-[4px]`;

export function CatalogueView({ artist, songs, query, onQueryChange, onPin, onAnalytics, onUpload }: Props) {
  const uses = songs.reduce((total, song) => total + (song.useCount || 0), 0);
  const streams = songs.reduce((total, song) => total + (song.streamCount || 0), 0);
  const needle = query.toLowerCase();
  const visible = songs
    .filter((song) => song.title.toLowerCase().includes(needle) || song.genre.toLowerCase().includes(needle))
    .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));

  return (
    <>
      <div className="flex items-center justify-between mb-[22px] flex-wrap gap-[11px]">
        <h2 className="font-display text-[21px] font-bold max-[600px]:text-[17px]">
          <i className="hgi hgi-stroke hgi-folder-02 text-music-green mr-[9px]" />
          My Catalogue
        </h2>
        <div className="relative min-w-[240px]">
          <i className="hgi hgi-stroke hgi-search-01 absolute left-[10px] top-1/2 -translate-y-1/2 text-music-ink-muted text-[12px]" />
          <input
            type="text"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Search your tracks…"
            className="w-full py-[8px] pr-[11px] pl-[34px] bg-music-surface border border-music-hair rounded-music-sm text-white font-body text-[12.5px] outline-none focus:border-music-green transition-all duration-[220ms]"
          />
        </div>
      </div>

      <div className="flex gap-[11px] mb-[22px] flex-wrap">
        <div className="bg-music-card border border-music-hair rounded-music py-[14px] px-[18px] flex-1 min-w-[110px]">
          <h4 className="text-[10px] uppercase tracking-[.7px] text-music-ink-muted mb-[5px]">Total Tracks</h4>
          <p className="text-[24px] font-bold font-display">{songs.length}</p>
        </div>
        <div className="bg-music-card border border-music-hair rounded-music py-[14px] px-[18px] flex-1 min-w-[110px]">
          <h4 className="text-[10px] uppercase tracking-[.7px] text-music-ink-muted mb-[5px]">Total Streams</h4>
          <p className="text-[24px] font-bold font-display">{formatNumber(streams)}</p>
        </div>
        <div className="bg-music-card border border-music-hair rounded-music py-[14px] px-[18px] flex-1 min-w-[110px]">
          <h4 className="text-[10px] uppercase tracking-[.7px] text-music-ink-muted mb-[5px]">Total Revenue</h4>
          <p className="text-[24px] font-bold font-display">{formatCurrency(uses * REVENUE_PER_USE_USD, artist.country)}</p>
        </div>
      </div>

      {songs.length === 0 ? (
        <div className="text-center pt-[70px] pb-[70px] px-[20px]">
          <i className="hgi hgi-stroke hgi-music-note-01 text-[52px] text-music-ink-muted mb-[14px] block" />
          <h3 className="font-display mb-[7px]">No tracks yet</h3>
          <p className="text-music-ink-soft mb-[18px]">Upload your first track to get started</p>
          <button
            type="button"
            onClick={onUpload}
            className={`${SUBMIT_BTN} py-[11px] px-[22px] mt-[18px]`}
          >
            <i className="hgi hgi-stroke hgi-upload-01" /> Upload Your First Track
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(270px,1fr))] gap-[13px]">
          {visible.map((song) => {
            const revenue = formatCurrency((song.useCount || 0) * REVENUE_PER_USE_USD, artist.country);
            const collaborators = song.collaborators ?? [];
            return (
              <div
                key={song.id}
                className={`bg-music-card border rounded-music p-[14px] relative overflow-hidden ${TR} hover:bg-music-hover hover:border-music-hair-bright hover:-translate-y-px ${
                  song.pinned
                    ? 'border-[rgba(245,158,11,.35)] bg-[rgba(245,158,11,.04)]'
                    : 'border-music-hair'
                }`}
              >
                {song.pinned ? (
                  <div className="absolute top-[10px] right-[10px] bg-music-amber text-black py-[2px] px-[7px] rounded-[4px] text-[9.5px] font-bold">
                    <i className="hgi hgi-stroke hgi-information-circle" /> PINNED
                  </div>
                ) : null}

                <div className="flex gap-[11px] mb-[11px] items-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={song.coverUrl}
                    alt=""
                    className="w-[50px] h-[50px] rounded-[6px] object-cover"
                    onError={(event) => { event.currentTarget.src = FALLBACK_TRACK_COVER; }}
                  />
                  <div>
                    <h4 className="text-[13.5px] font-semibold mb-[2px]">{song.title}</h4>
                    <p className="text-[11.5px] text-music-ink-soft">{song.genre}</p>
                    <p className="text-[11px] mt-[3px] text-music-ink-muted">
                      {collaborators.length > 1 ? (
                        <>
                          <i className="hgi hgi-stroke hgi-user-multiple-02" /> {collaborators.length} collaborators
                        </>
                      ) : (
                        'Solo track'
                      )}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-[7px] mb-[11px]">
                  <div className="text-center py-[7px] px-[4px] bg-[rgba(255,255,255,.03)] rounded-[6px]">
                    <div className="text-[9px] uppercase tracking-[.5px] text-music-ink-muted mb-[3px]">Streams</div>
                    <div className="text-[14px] font-bold">{formatNumber(song.streamCount || 0)}</div>
                  </div>
                  <div className="text-center py-[7px] px-[4px] bg-[rgba(255,255,255,.03)] rounded-[6px]">
                    <div className="text-[9px] uppercase tracking-[.5px] text-music-ink-muted mb-[3px]">Uses</div>
                    <div className="text-[14px] font-bold">{formatNumber(song.useCount || 0)}</div>
                  </div>
                  <div className="text-center py-[7px] px-[4px] bg-[rgba(255,255,255,.03)] rounded-[6px]">
                    <div className="text-[9px] uppercase tracking-[.5px] text-music-ink-muted mb-[3px]">Revenue</div>
                    <div className="text-[14px] font-bold text-music-green">{revenue}</div>
                  </div>
                </div>

                <div className="flex gap-[6px]">
                  <button
                    type="button"
                    onClick={() => onPin(song)}
                    className={`${SMALL_BUTTON} ${
                      song.pinned
                        ? 'bg-music-amber text-black border-none'
                        : 'bg-[rgba(245,158,11,.1)] text-music-amber border border-[rgba(245,158,11,.18)] hover:bg-[rgba(245,158,11,.2)]'
                    }`}
                  >
                    <i className="hgi hgi-stroke hgi-information-circle" /> {song.pinned ? 'Unpin' : 'Pin'}
                  </button>
                  <button
                    type="button"
                    onClick={() => onAnalytics(song)}
                    className={`${SMALL_BUTTON} bg-[rgba(61,139,255,.1)] text-music-blue border border-[rgba(61,139,255,.18)] hover:bg-[rgba(61,139,255,.2)]`}
                  >
                    <i className="hgi hgi-stroke hgi-chart-line-data-01" /> Analytics
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
