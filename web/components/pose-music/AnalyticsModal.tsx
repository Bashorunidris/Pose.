'use client';

import { REVENUE_PER_USE_USD, formatCurrency, formatDuration, formatNumber } from '@/lib/pose-music/data';
import { TR } from './styles';
import type { Artist, Song } from '@/lib/pose-music/types';

const DETAIL_LABEL = 'text-music-ink-muted text-[10.5px] mb-[3px]';
const SECTION_TITLE = 'text-[13.5px] font-semibold mb-[11px] flex items-center gap-[7px]';

function StatCard({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="bg-music-surface p-[16px] rounded-music border border-music-hair">
      <h5 className="text-[9.5px] uppercase tracking-[.8px] text-music-ink-muted mb-[7px]">{label}</h5>
      <p className={`text-[24px] font-bold font-display ${accent ? 'text-music-green' : ''}`}>{value}</p>
    </div>
  );
}

function Placeholder({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="bg-music-surface border border-music-hair rounded-music p-[36px] text-center text-music-ink-muted text-[12.5px]">
      <i className={`fas fa-${icon} text-[34px] mb-[11px] block`} />
      <p>{text}</p>
    </div>
  );
}

type Props = {
  song: Song;
  artist: Artist;
  open: boolean;
  onClose: () => void;
};

export function AnalyticsModal({ song, artist, open, onClose }: Props) {
  if (!open) return null;

  const revenue = (song.useCount || 0) * REVENUE_PER_USE_USD;
  const engagement = song.streamCount > 0 ? `${((song.useCount / song.streamCount) * 100).toFixed(1)}%` : '0%';
  const collaborators = song.collaborators ?? [];

  return (
    <div
      onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}
      className="fixed inset-0 bg-black/[.75] z-[100] flex items-center justify-center backdrop-blur-[8px]"
    >
      <div className="bg-music-elevated border border-music-hair-bright rounded-music-lg p-[26px] max-w-[840px] w-[90%] max-h-[88vh] overflow-y-auto animate-modal-in">
        <div className="flex justify-between items-center mb-[18px]">
          <h2 className="font-display text-[19px] font-bold flex items-center gap-[9px]">
            <i className="fas fa-chart-line text-music-green" />
            <span>{song.title}</span>
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close analytics"
            className={`bg-transparent border-none text-music-ink-muted text-[19px] cursor-pointer p-[3px] ${TR} hover:text-music-ink`}
          >
            <i className="fas fa-times" />
          </button>
        </div>

        <div className="grid grid-cols-4 gap-[11px] mb-[22px] max-[600px]:grid-cols-2">
          <StatCard label="Total Streams" value={formatNumber(song.streamCount || 0)} />
          <StatCard label="Total Uses" value={formatNumber(song.useCount || 0)} />
          <StatCard label="Revenue" value={formatCurrency(revenue, artist.country)} accent />
          <StatCard label="Engagement" value={engagement} />
        </div>

        <div className="mb-[22px]">
          <h4 className={SECTION_TITLE}>
            <i className="fas fa-chart-area" /> Performance Over Time
          </h4>
          <Placeholder icon="chart-line" text="Streams and uses chart" />
        </div>

        <div className="mb-[22px]">
          <h4 className={SECTION_TITLE}>
            <i className="fas fa-globe" /> Geographic Distribution
          </h4>
          <Placeholder icon="map-marked-alt" text="Geographic breakdown" />
        </div>

        <div className="mb-[22px]">
          <h4 className={SECTION_TITLE}>
            <i className="fas fa-users" /> Collaborators &amp; Revenue Split
          </h4>
          <div>
            {collaborators.length > 0 ? (
              collaborators.map((collaborator, index) => (
                <div
                  key={`${collaborator.name}-${index}`}
                  className="flex justify-between items-center py-[9px] px-[13px] bg-music-surface rounded-music-sm mb-[5px]"
                >
                  <div>
                    <p className="font-semibold">{collaborator.name}</p>
                    <p className="text-[12px] text-music-ink-soft">{collaborator.split}% split</p>
                  </div>
                  <p className="font-bold text-music-green">
                    {formatCurrency(revenue * (collaborator.split / 100), artist.country)}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-music-ink-soft">No collaborators</p>
            )}
          </div>
        </div>

        <div>
          <h4 className={SECTION_TITLE}>
            <i className="fas fa-info-circle" /> Track Details
          </h4>
          <div className="bg-music-surface p-[16px] rounded-music grid grid-cols-2 gap-[13px] text-[13px]">
            <div>
              <p className={DETAIL_LABEL}>Genre</p>
              <p>{song.genre || '—'}</p>
            </div>
            <div>
              <p className={DETAIL_LABEL}>Duration</p>
              <p>{formatDuration(song.duration)}</p>
            </div>
            <div>
              <p className={DETAIL_LABEL}>Upload Date</p>
              <p>{song.uploadDate ? new Date(song.uploadDate).toLocaleDateString() : 'Demo track'}</p>
            </div>
            <div>
              <p className={DETAIL_LABEL}>Country</p>
              <p>{song.country || '—'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
