'use client';

import { useState } from 'react';

import { channelSlug, fmt } from '@/lib/channel-dashboard/format';
import type { ModalId } from '@/lib/channel-dashboard/modal-templates';
import type { ChannelData } from '@/lib/channel-dashboard/types';

export type HomeTab = 'home' | 'studio' | 'earnings' | 'legibility';

type Props = {
  channel: ChannelData | null;
  contentCount: number;
  inboxCount: number;
  onTab: (tab: HomeTab) => void;
  onOpenModal: (id: ModalId) => void;
  onViewImage: (url: string | undefined, label: string) => void;
  onOpenInbox: () => void;
  onOpenSettings: () => void;
  onLeave: () => void;
  onUpload: () => void;
  onAllVideos: () => void;
};

const TABS: { id: HomeTab; icon: string; label: string }[] = [
  { id: 'home', icon: 'fa-house', label: 'Home' },
  { id: 'studio', icon: 'fa-film', label: 'Studio' },
  { id: 'earnings', icon: 'fa-coins', label: 'Earnings' },
  { id: 'legibility', icon: 'fa-clipboard-list', label: 'Legibility' },
];

/**
 * The legacy channel banner falls back to a gradient derived from the owner uid
 * whenever the uploaded banner fails to load (`_applyBannerGradient`).
 */
function bannerGradient(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash &= hash;
  }
  const hue = Math.abs(hash) % 360;
  return `linear-gradient(135deg, hsl(${hue},75%,40%) 0%, hsl(${hue},75%,22%) 100%)`;
}

export function HomePage({
  channel,
  contentCount,
  inboxCount,
  onTab,
  onOpenModal,
  onViewImage,
  onOpenInbox,
  onOpenSettings,
  onLeave,
  onUpload,
  onAllVideos,
}: Props) {
  const [failedBanner, setFailedBanner] = useState<string | null>(null);
  const seed = channel?.ownerUid ?? 'pose';
  const bannerUrl = channel?.bannerURL;

  // Legacy probed the image first: a broken bannerURL falls back to the gradient.
  const bannerStyle = bannerUrl && failedBanner !== bannerUrl
    ? { backgroundImage: `url('${bannerUrl}')`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }
    : { background: bannerGradient(seed) };

  const name = channel?.name || 'My Channel';
  const fans = Number(channel?.fans) || Number(channel?.subscribers) || 0;
  const hasTotalViews = channel?.totalViews != null;
  const hasTotalLikes = channel?.totalLikes != null;

  const stats = [
    { id: 'statViews', icon: 'fa-eye', color: undefined, value: hasTotalViews ? fmt(channel?.totalViews) : '—', label: 'Total Views' },
    { id: 'statLikes', icon: 'fa-thumbs-up', color: '#f472b6', value: hasTotalLikes ? fmt(channel?.totalLikes) : '—', label: 'Total Likes' },
    { id: 'statVideos', icon: 'fa-film', color: undefined, value: fmt(contentCount), label: 'Videos' },
    { id: 'statFans', icon: 'fa-heart', color: '#f87171', value: fmt(fans), label: 'Fans' },
  ];

  return (
    <div id="page-home" className="page active">
      <div className="topbar">
        <div className="topbar-brand" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt="Pose"
            width={32}
            height={32}
            style={{ width: '32px', height: '32px', borderRadius: '8px', objectFit: 'cover', flexShrink: '0' }}
          />
          <span>
            Pose <em>Channel</em>
          </span>
        </div>
        <div className="topbar-actions">
          <button className="btn btn-ghost" style={{ position: 'relative' }} onClick={onOpenInbox}>
            <i className="fas fa-inbox" />
            Inbox
            <span
              id="inboxBadge"
              style={{
                display: inboxCount > 0 ? 'flex' : 'none',
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                background: '#DC2626',
                color: '#fff',
                fontSize: '10px',
                fontWeight: '700',
                minWidth: '16px',
                height: '16px',
                borderRadius: '99px',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0 4px',
              }}
            >
              {inboxCount}
            </span>
          </button>
          <button className="btn btn-ghost" onClick={onOpenSettings}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z">
                <circle cx="12" cy="12" r="3" />
              </path>
            </svg>
            Settings
          </button>
          <button className="btn btn-purple" onClick={onLeave}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            Go Back to Pose
          </button>
        </div>
      </div>

      <div className="tabs-bar">
        {TABS.map((tab) => (
          <div
            key={tab.id}
            className={`tab-item${tab.id === 'home' ? ' active' : ''}`}
            data-tab={tab.id}
            onClick={() => onTab(tab.id)}
          >
            <i className={`fas ${tab.icon}`} /> {tab.label}
          </div>
        ))}
      </div>

      <div className="channel-banner" style={bannerStyle} onClick={() => onViewImage(bannerUrl, 'Channel Banner')}>
        <div className="banner-upload-hint" onClick={(event) => { event.stopPropagation(); onOpenModal('bannerModal'); }} style={{ cursor: 'pointer' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          Edit banner
        </div>
        <div
          className="channel-avatar-wrap"
          title="View channel photo"
          onClick={(event) => { event.stopPropagation(); onViewImage(channel?.profileURL, 'Channel Photo'); }}
          style={{ cursor: 'pointer' }}
        >
          {channel?.profileURL ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={channel.profileURL}
              alt={name}
              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
            />
          ) : (
            <span className="channel-avatar-initials">{name.charAt(0).toUpperCase()}</span>
          )}
        </div>
        <div className="avatar-edit-btn" title="Change channel photo" onClick={(event) => { event.stopPropagation(); onOpenModal('photoModal'); }}>
          <i className="fa-solid fa-camera" />
        </div>
      </div>

      <div className="channel-info">
        <div className="channel-name">{name}</div>
        <div className="channel-handle">
          @{channelSlug(channel?.name)} · {channel?.country || 'Creator'} · {fmt(fans)} Fans
        </div>
        <span className="channel-badge">
          <i className="fas fa-circle-check" /> Verified Creator
        </span>
      </div>

      <div className="stats-container">
        {stats.map((stat) => (
          <div className="stat-card" key={stat.id}>
            <div className="stat-icon" style={stat.color ? { color: stat.color } : undefined}>
              <i className={`fas ${stat.icon}`} />
            </div>
            <div className="stat-value" id={stat.id}>
              {stat.value}
            </div>
            <div className="stat-label">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Channel-wide payout requirement strip (always visible on home) */}
      <div
        id="homeEligStrip"
        onClick={() => onTab('earnings')}
        style={{
          cursor: 'pointer',
          margin: '0 16px 14px',
          padding: '11px 14px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg,#FFFBEB,#FEF3C7)',
          border: '1px solid #FDE68A',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}
      >
        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#F59E0B', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: '0' }}>
          <i className="fas fa-shield-halved" />
        </div>
        <div style={{ flex: '1', minWidth: '0' }}>
          <div style={{ fontSize: '12.5px', fontWeight: '800', color: '#78350F', lineHeight: '1.3' }}>Payout Requirements</div>
          <div id="homeEligText" style={{ fontSize: '11px', color: '#92400E', lineHeight: '1.4', marginTop: '2px' }}>
            Paid videos need <b>10 views</b> to start earning, then release every <b>5 hours</b> · <b id="homeSlotsRemaining">5</b> pricing slots left this month.
          </div>
        </div>
        <i className="fas fa-chevron-right" style={{ color: '#92400E', fontSize: '11px', flexShrink: '0' }} />
      </div>

      <div className="cta-row">
        <button className="btn btn-purple btn-lg" onClick={onUpload}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          Upload Video
        </button>
        <button className="btn btn-outline-purple btn-lg" onClick={onAllVideos}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          See All Videos
        </button>
      </div>

      {bannerUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img alt="" src={bannerUrl} style={{ display: 'none' }} onError={() => setFailedBanner(bannerUrl ?? null)} />
      ) : null}
    </div>
  );
}

export { bannerGradient };
