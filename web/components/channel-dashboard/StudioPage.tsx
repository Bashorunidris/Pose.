'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import { fmt } from '@/lib/channel-dashboard/format';
import {
  analyticsFor,
  drawAnalyticsChart,
  engagementRate,
  videoThumb,
  type StudioMetric,
} from '@/lib/channel-dashboard/studio';
import type { ChannelData, VideoDoc } from '@/lib/channel-dashboard/types';

type Props = {
  channel: ChannelData | null;
  videos: VideoDoc[];
  onBack: () => void;
  onOpenVideo: (video: VideoDoc, returnPage: string) => void;
};

const SIDEBAR_TABS: { metric: StudioMetric; label: string; path: string }[] = [
  { metric: 'views', label: 'Views', path: 'M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' },
  { metric: 'likes', label: 'Likes', path: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' },
  { metric: 'fan', label: 'Fan', path: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
  { metric: 'comments', label: 'Cmts', path: 'M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z' },
  { metric: 'engagement', label: 'Engage', path: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' },
];

const G_CLASSES = ['g1', 'g2', 'g3', 'g4', 'g5', 'g6', 'g7'];
const PERIODS = [
  { id: '24h', label: '24 hrs' },
  { id: '72h', label: '72 hrs' },
  { id: '7d', label: '7 days' },
];

function BannerCard({ video, showRevenue, index, onOpen }: { video: VideoDoc; showRevenue: boolean; index: number; onOpen: () => void }) {
  const thumb = videoThumb(video);
  const gradient = G_CLASSES[index % G_CLASSES.length] as string;
  return (
    <div className="bcard" onClick={onOpen} style={{ cursor: 'pointer' }}>
      <div
        className={`bcard-thumb ${thumb ? '' : gradient}`}
        style={thumb ? { background: '#000' } : undefined}
      >
        {thumb ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={thumb} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <i className="fas fa-film" />
        )}
        <div className="bcard-play-overlay">
          <div className="bcard-play-btn">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="#7C3AED">
              <polygon points="5,3 19,12 5,21" />
            </svg>
          </div>
        </div>
      </div>
      <div className="bcard-body">
        <div className="bcard-name">{video.title || video.name || 'Untitled'}</div>
        <div className="bcard-stats">
          <span className="bstat"><i className="fas fa-eye" /> {fmt(video.views || 0)}</span>
          <span className="bstat"><i className="fas fa-heart" /> {fmt(video.likes || 0)}</span>
          <span className="bstat"><i className="fas fa-comment" /> {fmt(video.comments || 0)}</span>
        </div>
        {showRevenue ? (
          <div className="bcard-revenue">
            <i className="fas fa-coins" /> {fmt(Number(video.revenue) || 0)} coins earned
          </div>
        ) : null}
      </div>
    </div>
  );
}

/**
 * `#page-studio` — `renderStudioData()`, `renderAnalytics()`, `drawChart()`,
 * `renderBanners()` and `renderPerfTable()`.
 *
 * Two legacy details are kept deliberately: the four banner lists are sorted by
 * views/revenue/likes/engagement, and the 24h/72h/7d tabs only swap which pill is
 * active — `renderPerfTable(period)` ignored its argument and always rendered the
 * top 10 by views.
 */
export function StudioPage({ channel, videos, onBack, onOpenVideo }: Props) {
  const [metric, setMetric] = useState<StudioMetric>('views');
  const [period, setPeriod] = useState('24h');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const view = useMemo(() => analyticsFor(metric, videos, channel), [channel, metric, videos]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const draw = () => drawAnalyticsChart(canvas, view.data, view.color);
    const initial = setTimeout(draw, 50);
    let resizeTimer: ReturnType<typeof setTimeout> | undefined;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(draw, 120);
    };
    window.addEventListener('resize', onResize);
    return () => {
      clearTimeout(initial);
      clearTimeout(resizeTimer);
      window.removeEventListener('resize', onResize);
    };
  }, [view]);

  const sorted = useMemo(() => {
    const byViews = [...videos].sort((a, b) => (Number(b.views) || 0) - (Number(a.views) || 0));
    const byRevenue = [...videos].sort((a, b) => (Number(b.revenue) || 0) - (Number(a.revenue) || 0));
    const byLikes = [...videos].sort((a, b) => (Number(b.likes) || 0) - (Number(a.likes) || 0)).slice(0, 4);
    const byEngagement = [...videos].sort((a, b) => engagementRate(b) - engagementRate(a)).slice(0, 4);
    return { byViews, byRevenue, byLikes, byEngagement };
  }, [videos]);

  // Legacy `renderPerfTable` ignored the active period and always showed this.
  const tableRows = sorted.byViews.slice(0, 10);

  return (
    <div id="page-studio" className="page active">
      <div className="studio-topbar">
        <button className="back-btn" onClick={onBack}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          Back
        </button>
        <span className="studio-title">Studio Analytics</span>
      </div>

      <div className="studio-layout">
        <div className="studio-sidebar">
          {SIDEBAR_TABS.map((tab) => (
            <div
              key={tab.metric}
              className={`sb-tab${tab.metric === metric ? ' active' : ''}`}
              onClick={() => setMetric(tab.metric)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d={tab.path} />
              </svg>
              <span className="sb-label">{tab.label}</span>
            </div>
          ))}
        </div>

        <div className="studio-content">
          <div className="card analytics-card">
            <div className="analytics-header">
              <div>
                <div className="analytics-htitle" id="aTitle">{view.title}</div>
                <div className="analytics-hsub" id="aSub">{view.sub}</div>
              </div>
              <div className="analytics-period-badge">Last 6 months</div>
            </div>
            <div className="analytics-nums" id="aNums">
              {view.numbers.map((number) => (
                <div className="anum-card" key={number.label}>
                  <div className="anum-value">{number.value || '0'}</div>
                  <div className="anum-label">{number.label}</div>
                  {number.change ? <div className="anum-change">{number.change} vs last period</div> : null}
                </div>
              ))}
            </div>
            <div className="chart-wrap">
              <canvas id="analyticsChart" ref={canvasRef} />
            </div>
          </div>

          <div className="card banner-section">
            <div className="banner-title">
              <i className="fas fa-fire" /> Most Watched Videos
              <span className="banner-badge">Top 10</span>
            </div>
            <div className="banner-scroll" id="banner-watched">
              {sorted.byViews.length === 0 ? (
                <div style={{ padding: '24px', color: 'var(--gray-400)', fontSize: '13px', textAlign: 'center', width: '100%', fontStyle: 'italic' }}>
                  No videos yet — upload your first video
                </div>
              ) : sorted.byViews.map((video, index) => (
                <BannerCard key={`watched-${index}`} video={video} showRevenue index={index} onOpen={() => onOpenVideo(video, 'page-studio')} />
              ))}
            </div>
          </div>

          <div className="card banner-section">
            <div className="banner-title">
              <i className="fas fa-coins" /> Most Paid Videos
              <span className="banner-badge">Top Earners</span>
            </div>
            <div className="banner-scroll" id="banner-paid">
              {sorted.byRevenue.length === 0 ? (
                <div style={{ padding: '24px', color: 'var(--gray-400)', fontSize: '13px', textAlign: 'center', width: '100%', fontStyle: 'italic' }}>
                  No videos yet — upload your first video
                </div>
              ) : sorted.byRevenue.map((video, index) => (
                <BannerCard key={`paid-${index}`} video={video} showRevenue index={index} onOpen={() => onOpenVideo(video, 'page-studio')} />
              ))}
            </div>
          </div>

          <div className="two-col-banners">
            <div className="card banner-section">
              <div className="banner-title"><i className="fas fa-heart" /> Most Liked</div>
              <div className="banner-scroll" id="banner-liked">
                {sorted.byLikes.length === 0 ? (
                  <div style={{ padding: '24px', color: 'var(--gray-400)', fontSize: '13px', textAlign: 'center', width: '100%', fontStyle: 'italic' }}>
                    No videos yet — upload your first video
                  </div>
                ) : sorted.byLikes.map((video, index) => (
                  <BannerCard key={`liked-${index}`} video={video} showRevenue={false} index={index} onOpen={() => onOpenVideo(video, 'page-studio')} />
                ))}
              </div>
            </div>
            <div className="card banner-section">
              <div className="banner-title"><i className="fas fa-bolt" /> Most Engaged</div>
              <div className="banner-scroll" id="banner-engaged">
                {sorted.byEngagement.length === 0 ? (
                  <div style={{ padding: '24px', color: 'var(--gray-400)', fontSize: '13px', textAlign: 'center', width: '100%', fontStyle: 'italic' }}>
                    No videos yet — upload your first video
                  </div>
                ) : sorted.byEngagement.map((video, index) => (
                  <BannerCard key={`engaged-${index}`} video={video} showRevenue={false} index={index} onOpen={() => onOpenVideo(video, 'page-studio')} />
                ))}
              </div>
            </div>
          </div>

          <div className="card table-section">
            <div className="table-header-row">
              <div className="table-title">Video Performance</div>
              <div className="period-tabs">
                {PERIODS.map((entry) => (
                  <div
                    key={entry.id}
                    className={`ptab${entry.id === period ? ' active' : ''}`}
                    onClick={() => setPeriod(entry.id)}
                  >
                    {entry.label}
                  </div>
                ))}
              </div>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Video</th>
                  <th className="c"><i className="fas fa-eye" /> Views</th>
                  <th className="c"><i className="fas fa-heart" /> Likes</th>
                  <th className="c"><i className="fas fa-comment" /> Comments</th>
                  <th className="c"><i className="fas fa-coins" /> Coins</th>
                </tr>
              </thead>
              <tbody id="perfBody">
                {tableRows.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '32px', color: 'var(--gray-400)', fontSize: '13px', fontStyle: 'italic' }}>
                      No videos yet. Upload your first video to see performance data.
                    </td>
                  </tr>
                ) : tableRows.map((video, index) => {
                  const thumb = videoThumb(video);
                  return (
                    <tr key={`row-${index}`} onClick={() => onOpenVideo(video, 'page-studio')} style={{ cursor: 'pointer' }}>
                      <td>
                        <div className="vname-cell">
                          <div
                            className={`vthumbs ${G_CLASSES[index % G_CLASSES.length]}`}
                            style={thumb ? { background: `url('${thumb}') center/cover` } : undefined}
                          />
                          <span className="vname-text">{video.title || video.name || 'Untitled'}</span>
                        </div>
                      </td>
                      <td className="c"><span className="mpill">{fmt(video.views || 0)}</span></td>
                      <td className="c"><span className="mpill">{fmt(video.likes || 0)}</span></td>
                      <td className="c"><span className="mpill">{fmt(video.comments || 0)}</span></td>
                      <td className="c"><span className="mpill"><i className="fas fa-coins" /> {fmt(Number(video.revenue) || 0)}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
