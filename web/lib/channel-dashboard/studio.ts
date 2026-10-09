/**
 * Studio tab maths, lifted from the legacy `renderStudioData()` block:
 * the six-month buckets, the per-metric config, the canvas line chart and the
 * thumbnail picker. Nothing here touches the DOM except `drawAnalyticsChart`.
 */

import { drawLineChart } from './chart';
import { fmt } from './format';
import type { ChannelData, VideoDoc } from './types';

export type StudioMetric = 'views' | 'likes' | 'fan' | 'comments' | 'engagement';

export type AnalyticsNumber = { label: string; value: string; change: string };

export type AnalyticsView = {
  data: number[];
  color: string;
  title: string;
  sub: string;
  numbers: AnalyticsNumber[];
};

export const METRIC_CONFIG: Record<StudioMetric, { title: string; sub: string; color: string }> = {
  views: { title: 'Monthly Views', sub: 'Total views across all content · Last 6 months', color: '#7C3AED' },
  likes: { title: 'Monthly Likes', sub: 'Total likes received across all content · Last 6 months', color: '#DB2777' },
  fan: { title: 'Fan Growth', sub: 'Total fans on your channel', color: '#059669' },
  comments: { title: 'Monthly Comments', sub: 'Comments across all content · Last 6 months', color: '#D97706' },
  engagement: { title: 'Engagement Rate (%)', sub: 'Average engagement rate across all videos · Last 6 months', color: '#7C3AED' },
};

export function getLast6Months(): { key: string; label: string }[] {
  const result: { key: string; label: string }[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    result.push({
      key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
      label: date.toLocaleString('default', { month: 'short' }),
    });
  }
  return result;
}

export const MONTH_LABELS = getLast6Months().map((month) => month.label);

function toDateSafe(value: unknown): Date | null {
  if (!value) return null;
  if (typeof (value as { toDate?: unknown }).toDate === 'function') {
    return (value as { toDate: () => Date }).toDate();
  }
  const seconds = (value as { seconds?: number }).seconds;
  if (seconds != null) return new Date(seconds * 1000);
  const date = new Date(value as string | number);
  return Number.isNaN(date.getTime()) ? null : date;
}

function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export function buildMonthlyData(videos: VideoDoc[], field: string): number[] {
  const months = getLast6Months();
  const buckets: Record<string, number> = {};
  months.forEach((month) => { buckets[month.key] = 0; });
  videos.forEach((video) => {
    const date = toDateSafe(video.createdAt);
    if (!date) return;
    const key = monthKey(date);
    // Legacy accepted both `likes` and `likeCount`.
    const value = field === 'likes'
      ? Number(video.likes) || Number(video.likeCount) || 0
      : Number(video[field] || 0);
    if (buckets[key] !== undefined) buckets[key] += value;
  });
  return months.map((month) => buckets[month.key] as number);
}

export function buildEngagementData(videos: VideoDoc[]): number[] {
  const months = getLast6Months();
  const buckets: Record<string, { total: number; count: number }> = {};
  months.forEach((month) => { buckets[month.key] = { total: 0, count: 0 }; });
  videos.forEach((video) => {
    const date = toDateSafe(video.createdAt);
    if (!date || !video.views) return;
    const key = monthKey(date);
    const bucket = buckets[key];
    if (bucket) {
      const engagement = ((Number(video.likes || 0) + Number(video.comments || 0)) / Number(video.views)) * 100;
      bucket.total += engagement;
      bucket.count += 1;
    }
  });
  return months.map((month) => {
    const bucket = buckets[month.key] as { total: number; count: number };
    return bucket.count > 0 ? Math.round(bucket.total / bucket.count) : 0;
  });
}

export function analyticsFor(
  metric: StudioMetric,
  videos: VideoDoc[],
  channel: ChannelData | null,
): AnalyticsView {
  const config = METRIC_CONFIG[metric];
  let data: number[];
  let numbers: AnalyticsNumber[];

  if (metric === 'engagement') {
    data = buildEngagementData(videos);
    const current = data[data.length - 1] || 0;
    const previous = data[data.length - 2] || 0;
    const peak = Math.max(...data) || 0;
    const average = data.length ? Math.round(data.reduce((a, b) => a + b, 0) / data.length) : 0;
    const change = previous > 0 ? `${(((current - previous) / previous) * 100).toFixed(0)}%` : '—';
    numbers = [
      { label: 'Current Rate', value: `${current}%`, change },
      { label: 'Avg. Rate', value: `${average}%`, change: '' },
      { label: 'Peak Rate', value: `${peak}%`, change: '' },
    ];
  } else if (metric === 'fan') {
    const fans = channel ? Number(channel.fans) || Number(channel.subscribers) || 0 : 0;
    data = [0, 0, 0, 0, 0, fans];
    numbers = [
      { label: 'Total Fans', value: fmt(fans), change: '' },
      { label: 'Avg. Monthly', value: '0', change: '' },
      { label: 'All-time', value: fmt(fans), change: '' },
    ];
  } else {
    data = buildMonthlyData(videos, metric);
    const current = data[data.length - 1] || 0;
    const previous = data[data.length - 2] || 0;
    const peak = Math.max(...data) || 0;
    const average = Math.round(data.reduce((a, b) => a + b, 0) / data.length) || 0;
    const change = previous > 0
      ? `${current >= previous ? '+' : ''}${(((current - previous) / previous) * 100).toFixed(0)}%`
      : '—';
    numbers = [
      { label: 'This Month', value: fmt(current), change },
      { label: 'Avg. Monthly', value: fmt(average), change: '' },
      { label: 'Peak Month', value: fmt(peak), change: '' },
    ];
  }

  return { data, color: config.color, title: config.title, sub: config.sub, numbers };
}

/** `drawChart()` — Studio's 6-month line, drawn by the shared canvas chart. */
export function drawAnalyticsChart(canvas: HTMLCanvasElement, data: number[], color: string): void {
  drawLineChart(canvas, { data, labels: MONTH_LABELS, color, showPoints: true });
}

/** `getVideoThumb()` — an explicit thumbnail, else the video URL with a .jpg tail. */
export function videoThumb(video: VideoDoc): string {
  if (video.thumbnailURL) return String(video.thumbnailURL);
  if (video.videoUrl) return String(video.videoUrl).replace(/\.[^.]+$/, '.jpg');
  return '';
}

export function engagementRate(video: VideoDoc): number {
  return ((Number(video.likes || 0) + Number(video.comments || 0)) / (Number(video.views) || 1)) * 100;
}
