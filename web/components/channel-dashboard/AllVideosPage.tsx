'use client';

import { useEffect, useMemo, useState } from 'react';

import { fmt } from '@/lib/channel-dashboard/format';
import {
  applyAvSort,
  avGradient,
  AV_SEASON_TOTAL_DIVISOR,
  coinsFromUsd,
  formatAvDate,
  loadEpisodes,
  loadSeasons,
  ratingBadge,
  releasedCoins,
  RATING_TONE_STYLE,
  seasonPriceBadge,
  seasonThumb,
  type AvSort,
} from '@/lib/channel-dashboard/all-videos';
import { getPckToNgnRate } from '@/lib/channel-dashboard/earnings';
import { getPoseFirebase } from '@/lib/firebase';
import { useExchangeRates } from '@/lib/channel-dashboard/use-exchange-rates';
import type { ChannelData, SeasonDoc, VideoDoc } from '@/lib/channel-dashboard/types';

type Tab = 'single' | 'season';

type Props = {
  channelId: string;
  channel: ChannelData | null;
  videos: VideoDoc[];
  onBack: () => void;
  onUpload: () => void;
  onOpenVideo: (video: VideoDoc, seasonId?: string) => void;
  onToast: (message: string) => void;
};

const SORTS: { id: AvSort; label: string }[] = [
  { id: 'newest', label: 'Newest First' },
  { id: 'oldest', label: 'Oldest First' },
  { id: 'views', label: 'Most Viewed' },
  { id: 'revenue', label: 'Top Earning' },
];

/**
 * `#page-allvideos` — `openAllVideos()`, `renderAvSingle()`, `loadAvSeasons()`,
 * `renderAvSeasons()`, `toggleAvSeason()` and `renderAvEpisodes()`.
 *
 * The legacy page rendered every one of these panels from an empty container, so
 * this is markup-for-markup the same cards; only the delegated `[data-vd-id]`
 * click listener became an ordinary React handler.
 */
export function AllVideosPage({ channelId, channel, videos, onBack, onUpload, onOpenVideo, onToast }: Props) {
  const [tab, setTab] = useState<Tab>('single');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<AvSort>('newest');
  const [seasons, setSeasons] = useState<SeasonDoc[] | null>(null);
  const [seasonsError, setSeasonsError] = useState('');
  const [episodes, setEpisodes] = useState<Record<string, VideoDoc[]>>({});
  const [openSeason, setOpenSeason] = useState<string | null>(null);
  const [episodeErrors, setEpisodeErrors] = useState<Record<string, string>>({});
  const rate = useExchangeRates();

  const query = search.toLowerCase().trim();
  const pckToNgn = getPckToNgnRate(channel?.country);

  // `openAllVideos()` reset the search and sort on every entry, and always
  // started on the Single Videos tab.
  useEffect(() => {
    setSearch('');
    setSort('newest');
    setTab('single');
    setOpenSeason(null);
  }, []);

  useEffect(() => {
    let cancelled = false;
    loadSeasons(getPoseFirebase().db, channelId)
      .then((list) => { if (!cancelled) setSeasons(list); })
      .catch((error: Error) => { if (!cancelled) setSeasonsError(error.message); });
    return () => { cancelled = true; };
  }, [channelId]);

  const matchingSingles = useMemo(() => {
    const filtered = videos.filter((video) => {
      if (!query) return true;
      return String(video.title ?? '').toLowerCase().includes(query)
        || String(video.description ?? '').toLowerCase().includes(query);
    });
    return applyAvSort(filtered, sort);
  }, [query, sort, videos]);

  const matchingSeasons = useMemo(() => {
    const list = (seasons ?? []).filter((season) => !query || String(season.title ?? '').toLowerCase().includes(query));
    return applyAvSort(list, sort);
  }, [query, seasons, sort]);

  async function toggleSeason(seasonId: string) {
    if (openSeason === seasonId) {
      setOpenSeason(null);
      return;
    }
    setOpenSeason(seasonId);
    if (episodes[seasonId]) return;

    try {
      const list = await loadEpisodes(getPoseFirebase().db, channelId, seasonId);
      setEpisodes((prev) => ({ ...prev, [seasonId]: list }));
    } catch (error) {
      setEpisodeErrors((prev) => ({ ...prev, [seasonId]: (error as Error).message }));
    }
  }

  return (
    <div id="page-allvideos" className="page active">
      <div className="av-topbar">
        <div className="av-topbar-row1">
          <button className="back-btn" onClick={onBack}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            Back
          </button>
          <div className="av-search-wrap">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              className="av-search-input"
              id="avSearchInput"
              placeholder="Search videos, seasons, episodes…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
        </div>
        <div className="av-tabs">
          <div className={`av-tab${tab === 'single' ? ' active' : ''}`} id="avTabSingle" onClick={() => setTab('single')}>
            <i className="fas fa-film" /> Single Videos
            <span className="av-tab-count" id="avCountSingle">{matchingSingles.length}</span>
          </div>
          <div className={`av-tab${tab === 'season' ? ' active' : ''}`} id="avTabSeason" onClick={() => setTab('season')}>
            <i className="fas fa-layer-group" /> Seasons &amp; Episodes
            <span className="av-tab-count" id="avCountSeason">{seasons?.length ?? 0}</span>
          </div>
        </div>
      </div>

      <div className="av-content">
        <div className="av-sort-row">
          <span className="av-sort-label" id="avSortLabel">
            Showing {matchingSingles.length} {matchingSingles.length === 1 ? 'video' : 'videos'}
            {query ? ` matching "${query}"` : ''}
          </span>
          <select
            className="av-sort-select"
            id="avSortSelect"
            value={sort}
            onChange={(event) => setSort(event.target.value as AvSort)}
          >
            {SORTS.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
          </select>
        </div>

        {tab === 'single' ? (
          <div id="avPanelSingle">
            {matchingSingles.length === 0 ? (
              <div className="av-empty">
                <div className="av-empty-icon"><i className="fas fa-film" /></div>
                <div className="av-empty-title">{query ? 'No results found' : 'No Videos Yet'}</div>
                <div className="av-empty-sub">
                  {query ? 'Try a different search term' : 'Upload your first video to get started'}
                </div>
                {query ? null : (
                  <button className="btn btn-purple btn-lg" style={{ margin: '0 auto', display: 'inline-flex' }} onClick={onUpload}>
                    <i className="fas fa-upload" style={{ marginRight: '7px' }} />Upload Now
                  </button>
                )}
              </div>
            ) : matchingSingles.map((video, index) => (
              <SingleVideoCard
                key={video.id}
                video={video}
                index={index}
                pckToNgn={pckToNgn}
                onOpen={() => onOpenVideo(video)}
              />
            ))}
          </div>
        ) : (
          <div id="avPanelSeason">
            {seasonsError ? (
              <div style={{ padding: '30px', textAlign: 'center', color: 'var(--red)', fontSize: '13px' }}>
                Failed to load seasons: {seasonsError}
              </div>
            ) : seasons === null ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--gray-400)' }}>
                <div className="dash-spinner" style={{ margin: '0 auto 12px' }} />
                Loading seasons…
              </div>
            ) : matchingSeasons.length === 0 ? (
              <div className="av-empty">
                <div className="av-empty-icon"><i className="fas fa-layer-group" /></div>
                <div className="av-empty-title">{query ? 'No seasons found' : 'No Seasons Yet'}</div>
                <div className="av-empty-sub">
                  {query ? 'Try a different search term' : 'Start a season from the Upload tab'}
                </div>
              </div>
            ) : matchingSeasons.map((season, index) => (
              <SeasonCard
                key={season.id}
                season={season}
                index={index}
                usdToNgn={rate.usdToNgn}
                open={openSeason === season.id}
                episodes={episodes[season.id]}
                error={episodeErrors[season.id]}
                onToggle={() => void toggleSeason(season.id)}
                onOpenEpisode={(episode) => onOpenVideo(episode, season.id)}
                onDeleteSeason={() => onToast('Deleting a season is the next screen to be ported')}
                onDeleteEpisode={() => onToast('Deleting an episode is the next screen to be ported')}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SingleVideoCard({ video, index, pckToNgn, onOpen }: {
  video: VideoDoc;
  index: number;
  pckToNgn: number;
  onOpen: () => void;
}) {
  const thumb = String(video.thumbnailURL ?? '');
  const paid = video.priceMode === 'paid';
  const coins = Number(video.coinPrice) || 0;
  const scheduled = Boolean(video.isScheduled && video.scheduleDate);
  const badge = ratingBadge(video.ageRating);
  const earned = releasedCoins(video, pckToNgn);

  return (
    <div className="av-vcard" data-vd-id={video.id} style={{ cursor: 'pointer' }} onClick={onOpen}>
      <div className="av-vcard-inner">
        <div
          className={`av-vcard-thumb ${thumb ? '' : avGradient(index)}`}
          style={thumb ? { background: '#000' } : undefined}
        >
          {thumb
            // eslint-disable-next-line @next/next/no-img-element
            ? <img src={thumb} alt={String(video.title ?? '')} />
            : <i className="fas fa-film" />}
        </div>
        <div className="av-vcard-body">
          <div className="av-vcard-title" title={String(video.title ?? 'Untitled')}>{String(video.title ?? 'Untitled')}</div>
          <div className="av-vcard-meta">
            <span className="av-vmeta-item"><i className="fas fa-eye" /> {fmt(video.views || 0)}</span>
            <span className="av-vmeta-item"><i className="fas fa-heart" /> {fmt(video.likes || 0)}</span>
            <span className="av-vmeta-item"><i className="fas fa-comment" /> {fmt(video.comments || 0)}</span>
            {paid ? <span className="av-vmeta-item"><i className="fas fa-rotate" /> {fmt(video.replays || 0)}</span> : null}
          </div>
          <div className="av-vcard-badges">
            {paid ? (
              <span className="av-badge av-badge-paid"><i className="fas fa-coins" /> {coins} PCK</span>
            ) : (
              <span className="av-badge av-badge-free"><i className="fas fa-rectangle-ad" /> Ad-Supported</span>
            )}
            {scheduled ? <span className="av-badge av-badge-sched"><i className="fas fa-clock" /> Scheduled</span> : null}
            {badge ? (
              <span className="av-badge" style={RATING_TONE_STYLE[badge.tone]}>
                {badge.icon ? <i className={badge.icon} style={{ marginRight: '4px' }} /> : null}{badge.label}
              </span>
            ) : null}
          </div>
          {paid && earned > 0 ? (
            <div className="av-vcard-revenue"><i className="fas fa-coins" /> {earned.toLocaleString()} PCK earned</div>
          ) : null}
          <div className="av-vcard-date">
            <i className="fas fa-calendar" style={{ marginRight: '4px', opacity: 0.5 }} />{formatAvDate(video.createdAt)}
          </div>
        </div>
      </div>
    </div>
  );
}

function SeasonCard({ season, index, usdToNgn, open, episodes, error, onToggle, onOpenEpisode, onDeleteSeason, onDeleteEpisode }: {
  season: SeasonDoc;
  index: number;
  usdToNgn: number;
  open: boolean;
  episodes: VideoDoc[] | undefined;
  error: string | undefined;
  onToggle: () => void;
  onOpenEpisode: (episode: VideoDoc) => void;
  onDeleteSeason: () => void;
  onDeleteEpisode: (episode: VideoDoc) => void;
}) {
  const thumb = seasonThumb(season);
  const revenue = Number(season.totalRevenue) || 0;
  const price = seasonPriceBadge(season.priceMode);
  const badge = ratingBadge(season.ageRating);
  const episodeCount = Number(season.episodeCount) || 0;
  const missingForDraft = Math.max(0, 2 - episodeCount);

  return (
    <div className={`av-season-card${open ? ' open' : ''}`} id={`avSea-${season.id}`}>
      <div className="av-season-header" onClick={onToggle}>
        <div
          className={`av-season-thumb ${thumb ? '' : avGradient(index)}`}
          style={thumb ? { background: '#000' } : undefined}
        >
          {thumb
            // eslint-disable-next-line @next/next/no-img-element
            ? <img src={thumb} alt={String(season.title ?? '')} />
            : <i className="fas fa-layer-group" />}
        </div>
        <div className="av-season-info">
          <div className="av-season-title">{String(season.title ?? 'Untitled Season')}</div>
          <div className="av-season-sub">
            Season {Number(season.seasonNumber) || 1} · {episodeCount}
            {season.plannedEpisodeCount ? ` of ${season.plannedEpisodeCount}` : ''} episodes
          </div>
          <div className="av-season-stats">
            {season.status === 'draft' ? (
              <span className="av-badge" style={{ background: '#FEF3C7', color: '#92400E' }}>
                <i className="fas fa-eye-slash" /> Draft — needs {missingForDraft} more ep.
              </span>
            ) : null}
            <span className={`av-badge ${price.paid ? 'av-badge-paid' : 'av-badge-free'}`}>
              <i className={price.icon} /> {price.label}
            </span>
            {badge ? (
              <span className="av-badge" style={RATING_TONE_STYLE[badge.tone]}>
                {badge.icon ? <i className={badge.icon} style={{ marginRight: '4px' }} /> : null}{badge.label}
              </span>
            ) : null}
          </div>
          {revenue > 0 ? (
            <div className="av-season-rev">
              <i className="fas fa-coins" /> {coinsFromUsd(revenue, usdToNgn).toLocaleString()} earned
            </div>
          ) : null}
        </div>
        <button
          className="av-season-delete"
          title="Delete season"
          onClick={(event) => { event.stopPropagation(); onDeleteSeason(); }}
        >
          <i className="fas fa-trash" />
        </button>
        <svg className="av-season-chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </div>

      {open ? (
        <div className="av-ep-list" id={`avEpList-${season.id}`}>
          {error ? (
            <div style={{ padding: '16px', color: 'var(--red)', fontSize: '13px' }}>Failed to load episodes: {error}</div>
          ) : !episodes ? (
            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--gray-400)', fontSize: '13px' }}>
              <div className="dash-spinner" style={{ margin: '0 auto 8px', width: '28px', height: '28px', borderWidth: '2px' }} />
              Loading episodes…
            </div>
          ) : episodes.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--gray-400)', fontSize: '13px', fontStyle: 'italic' }}>
              No episodes uploaded yet.
            </div>
          ) : (
            <>
              <EpisodeSummary episodes={episodes} usdToNgn={usdToNgn} />
              {episodes.map((episode, episodeIndex) => (
                <EpisodeRow
                  key={episode.id}
                  episode={episode}
                  index={episodeIndex}
                  usdToNgn={usdToNgn}
                  onOpen={() => onOpenEpisode(episode)}
                  onDelete={() => onDeleteEpisode(episode)}
                />
              ))}
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}

function EpisodeSummary({ episodes, usdToNgn }: { episodes: VideoDoc[]; usdToNgn: number }) {
  const totalViews = episodes.reduce((sum, episode) => sum + (Number(episode.views) || 0), 0);
  const totalLikes = episodes.reduce((sum, episode) => sum + (Number(episode.likes) || 0), 0);
  const totalRevenue = episodes.reduce((sum, episode) => sum + (Number(episode.revenue) || 0), 0);
  const totalCoins = coinsFromUsd(totalRevenue, usdToNgn, AV_SEASON_TOTAL_DIVISOR);

  const tile = (value: string, label: string, earned = false) => (
    <div
      key={label}
      style={{
        flex: 1,
        minWidth: '80px',
        background: earned ? 'linear-gradient(135deg,#EDE9FE,#DDD6FE)' : 'var(--purple-ghost)',
        border: '1px solid var(--purple-pale)',
        borderRadius: '10px',
        padding: '10px',
        textAlign: 'center',
      }}
    >
      <div style={{ fontFamily: "'Playfair Display',serif", fontSize: earned ? '16px' : '18px', fontWeight: 700, color: 'var(--purple-deep)' }}>{value}</div>
      <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '.5px', color: 'var(--gray-400)', marginTop: '2px' }}>{label}</div>
    </div>
  );

  return (
    <>
      <div style={{ display: 'flex', gap: '8px', padding: '12px 11px 8px', flexWrap: 'wrap' }}>
        {tile(fmt(totalViews), 'Total Views')}
        {tile(fmt(totalLikes), 'Total Likes')}
        {totalRevenue > 0 ? tile(`${totalCoins.toLocaleString()} PCK`, 'Season Earned', true) : null}
      </div>
      <div style={{ height: '1px', background: 'var(--gray-200)', margin: '0 11px 8px' }} />
    </>
  );
}

function EpisodeRow({ episode, index, usdToNgn, onOpen, onDelete }: {
  episode: VideoDoc;
  index: number;
  usdToNgn: number;
  onOpen: () => void;
  onDelete: () => void;
}) {
  const thumb = String(episode.thumbnailURL ?? '');
  const paid = episode.priceMode === 'paid';
  const coins = Number(episode.coinPrice) || 0;
  const revenue = Number(episode.revenue) || 0;
  const earned = coinsFromUsd(revenue, usdToNgn);

  return (
    <div className="av-ep-row" style={{ cursor: 'pointer' }} onClick={onOpen}>
      <div className="av-ep-num">{Number(episode.episodeNumber) || index + 1}</div>
      <div
        className={`av-ep-thumb ${thumb ? '' : avGradient(index)}`}
        style={thumb ? { background: '#000' } : undefined}
      >
        {thumb
          // eslint-disable-next-line @next/next/no-img-element
          ? <img src={thumb} alt={String(episode.title ?? '')} />
          : <i className="fas fa-film" />}
      </div>
      <div className="av-ep-info">
        <div className="av-ep-title">{String(episode.title ?? 'Untitled Episode')}</div>
        <div className="av-ep-meta">
          <span className="av-vmeta-item" style={{ fontSize: '10.5px' }}><i className="fas fa-eye" /> {fmt(episode.views || 0)}</span>
          <span className="av-vmeta-item" style={{ fontSize: '10.5px' }}><i className="fas fa-heart" /> {fmt(episode.likes || 0)}</span>
          <span className="av-vmeta-item" style={{ fontSize: '10.5px' }}><i className="fas fa-comment" /> {fmt(episode.comments || 0)}</span>
          {paid ? <span className="av-vmeta-item" style={{ fontSize: '10.5px' }}><i className="fas fa-rotate" /> {fmt(episode.replays || 0)}</span> : null}
          {episode.isScheduled ? (
            <span className="av-badge av-badge-sched" style={{ fontSize: '9px' }}><i className="fas fa-clock" /> Scheduled</span>
          ) : null}
        </div>
      </div>
      <div className="av-ep-right">
        {paid
          ? <div className="av-ep-price"><i className="fas fa-coins" /> {coins}</div>
          : <div className="av-ep-price" style={{ color: 'var(--green)' }}>Free</div>}
        {revenue > 0 ? (
          <div className="av-ep-rev"><i className="fas fa-coins" /> {earned.toLocaleString()} earned</div>
        ) : null}
      </div>
      <button
        className="av-ep-delete"
        title="Delete episode"
        onClick={(event) => { event.stopPropagation(); onDelete(); }}
      >
        <i className="fas fa-trash" />
      </button>
    </div>
  );
}
