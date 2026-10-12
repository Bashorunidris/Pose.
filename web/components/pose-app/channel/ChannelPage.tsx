'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { ChannelSeasonPanel } from './ChannelSeasonPanel';
import {
  ChannelComingSoonCard,
  ChannelFeaturedCard,
  ChannelSeasonCard,
  ChannelVideoCard,
} from './ChannelCards';
import { PosePlayer } from '../pose/PosePlayer';
import {
  channelCategoryLabel,
  channelSections,
  channelStats,
  channelTabs,
  channelTotalsFromVideos,
  fetchChannelContent,
  fetchCreatorChannels,
  isChannelFan,
  setChannelFan,
  type ChannelContent,
  type ChannelDoc,
} from '@/lib/pose-app/channel-page';
import { headerGradient } from '@/lib/pose-app/creator-profile';
import { formatCount } from '@/lib/pose-app/profile';
import type { PoseTabSeason, PoseTabVideo } from '@/lib/pose-app/pose-tab';
import type { PosePlayerVideo } from '@/lib/pose-app/pose-player';
import type { PoseEpisode } from '@/lib/pose-app/types';

type Props = {
  open: boolean;
  /** The creator whose channels this is; `openForYouChannel()` @67986. */
  ownerUid: string;
  ownerName: string;
  ownerPic: string;
  viewerUid: string | null;
  viewerName: string;
  viewerEmail: string | null;
  onClose: () => void;
  onToast: (message: string) => void;
  /** `fycOpenMessage()` @68565 opened the room with the channel's owner. */
  onMessage: (userId: string, name: string, pic: string) => void;
};

/**
 * `#forYouChannelPage` @90435 — a creator's public channel, and the one place the
 * locked channel content is browsable outside the owner's dashboard.
 *
 * The legacy page was one overlay driven by `_fycCreator`, `_fycChannels` and
 * `_fycActiveChannel` plus a five-minute content cache; here the same state is
 * the component's. Its own `PosePlayer` handles `fycPlay()` @68579 and
 * `fycPlayEpisode()` @68643, so a video and an episode both open in the ported
 * player without a trip out to the shell.
 */
export function ChannelPage({
  open,
  ownerUid,
  ownerName,
  ownerPic,
  viewerUid,
  viewerName,
  viewerEmail,
  onClose,
  onToast,
  onMessage,
}: Props) {
  const [channels, setChannels] = useState<ChannelDoc[] | null>(null);
  const [activeId, setActiveId] = useState<string>('');
  const [content, setContent] = useState<ChannelContent | null>(null);
  const [contentFailed, setContentFailed] = useState(false);
  const [tabId, setTabId] = useState('all');
  const [fanning, setFanning] = useState(false);
  const [fanBase, setFanBase] = useState<number | null>(null);
  const [season, setSeason] = useState<PoseTabSeason | null>(null);
  const [playerVideo, setPlayerVideo] = useState<PosePlayerVideo | null>(null);

  const active = useMemo(
    () => channels?.find((channel) => channel.id === activeId) ?? null,
    [channels, activeId],
  );

  // `openForYouChannel()` @67986 listed the creator's channels, then selected the
  // newest. An owner with no channel gets the same "hasn't set up" panel.
  useEffect(() => {
    if (!open || !ownerUid) return;
    let cancelled = false;
    void Promise.resolve().then(() => {
      setChannels(null);
      setActiveId('');
      setContent(null);
      setContentFailed(false);
      setTabId('all');
      setSeason(null);
      setFanBase(null);
      setFanning(false);
    });
    void fetchCreatorChannels(ownerUid)
      .then((list) => {
        if (cancelled) return;
        setChannels(list);
        setActiveId(list[0]?.id ?? '');
      })
      .catch((error) => {
        console.error('❌ openForYouChannel error:', error);
        if (!cancelled) setChannels([]);
      });
    return () => {
      cancelled = true;
    };
  }, [open, ownerUid]);

  // `selectFycChannel()` @68086 — a new channel resets the header, the tabs and
  // the content, then reads the fan document for the button state.
  useEffect(() => {
    if (!open || !active) return;
    let cancelled = false;
    void Promise.resolve().then(() => {
      setContentFailed(false);
      setTabId('all');
      setSeason(null);
      setFanning(false);
      setFanBase(null);
    });
    void fetchChannelContent(active)
      .then((next) => {
        if (!cancelled) setContent(next);
      })
      .catch((error) => {
        console.error('❌ loadFycChannelContent error:', error);
        if (!cancelled) {
          setContent(null);
          setContentFailed(true);
        }
      });
    if (viewerUid) {
      void isChannelFan(active.id, viewerUid).then((isFan) => {
        if (!cancelled) setFanning(isFan);
      });
    }
    return () => {
      cancelled = true;
    };
  }, [open, active, viewerUid]);

  const tabs = useMemo(() => channelTabs(content), [content]);
  const view = useMemo(() => channelSections(content, tabId), [content, tabId]);

  /**
   * `fycSetHeader()` @68125 preferred the stored totals and only fell back to
   * totalling the video list when the channel document had none.
   */
  const stats = useMemo(() => {
    if (!active) return { fans: 0, views: 0, likes: 0 };
    const stored = channelStats(active);
    const derived = content ? channelTotalsFromVideos(content.videos) : { views: 0, likes: 0 };
    return {
      fans: stored.fans,
      views: stored.views || derived.views,
      likes: stored.likes || derived.likes,
    };
  }, [active, content]);

  const banner = active?.bannerURL ? `url('${active.bannerURL}')` : '';
  const gradient = headerGradient(active?.ownerUid || active?.name || 'c');

  const toggleFan = useCallback(async () => {
    if (!active) return;
    if (!viewerUid) {
      onToast('Sign in to become a fan');
      return;
    }
    const next = !fanning;
    const base = fanBase ?? stats.fans;
    setFanning(next);
    setFanBase(Math.max(0, base + (next ? 1 : -1)));
    try {
      await setChannelFan(active.id, viewerUid, next);
      onToast(next ? 'Now a Fan!' : 'Unfollowed channel');
    } catch (error) {
      console.error('❌ fycToggleFan error:', error);
      setFanning(!next);
      setFanBase(base);
      onToast('Could not save. Try again.');
    }
  }, [active, fanBase, fanning, onToast, stats.fans, viewerUid]);

  const share = () => {
    const name = active?.name || 'this channel';
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({ title: name, text: `Check out ${name} on Pose!` }).catch(() => {});
      return;
    }
    onToast('Share link copied!');
  };

  const notifyMe = (video: PoseTabVideo) => {
    onToast(`You'll be notified when "${video.title ?? video.name ?? 'this'}" drops!`);
  };

  const play = (video: PoseTabVideo) => setPlayerVideo(video);
  const playEpisode = (episode: PoseEpisode) =>
    setPlayerVideo({ ...episode, channelId: season?.channelId ?? '', channel: active });

  if (!open || !ownerUid) return null;

  const avatarPic = active?.profileURL || active?.profilePic || active?.photoURL || ownerPic;
  const category = active?.category || active?.genre || '';
  const fanCount = fanBase ?? stats.fans;

  return (
    <div className="fyc-shell">
      <div className="fyc-page active" role="dialog" aria-modal="true" aria-label={active?.name ?? 'Channel'}>
        <div
          className={`fyc-banner${banner ? '' : ' fyc-no-banner'}`}
          style={banner ? { backgroundImage: banner } : { background: gradient }}
        >
          <button type="button" className="fyc-back" onClick={onClose} aria-label="Back">
            <i className="fas fa-arrow-left" />
          </button>
          <button type="button" className="fyc-banner-share" onClick={share} aria-label="Share channel">
            <i className="fas fa-share-nodes" />
          </button>
        </div>

        <div className="fyc-head">
          <div className="fyc-avatar-wrap">
            <div
              className="fyc-avatar"
              style={avatarPic ? { backgroundImage: `url('${avatarPic}')` } : undefined}
            >
              {avatarPic ? '' : (active?.name || 'C').charAt(0).toUpperCase()}
            </div>
            {active?.verified ? (
              <div className="fyc-verified-badge" style={{ display: 'flex' }}>
                <i className="fas fa-check" />
              </div>
            ) : null}
          </div>
          <div className="fyc-head-info">
            <div className="fyc-name">{active?.name || ownerName || 'Channel'}</div>
            {category ? (
              <div className="fyc-category-tag" style={{ display: 'inline-flex' }}>
                <i className="fas fa-tag" style={{ fontSize: '9px' }} />{' '}
                {channelCategoryLabel(category)}
              </div>
            ) : null}
          </div>
        </div>

        <div className="fyc-stats-bar">
          <div className="fyc-stat-item fans">
            <div className="fyc-stat-num">{formatCount(fanCount)}</div>
            <div className="fyc-stat-label">
              <i className="fas fa-heart fyc-stat-icon" />
              Fans
            </div>
          </div>
          <div className="fyc-stat-item views">
            <div className="fyc-stat-num">{formatCount(stats.views)}</div>
            <div className="fyc-stat-label">
              <i className="fas fa-eye fyc-stat-icon" />
              Views
            </div>
          </div>
          <div className="fyc-stat-item likes">
            <div className="fyc-stat-num">{formatCount(stats.likes)}</div>
            <div className="fyc-stat-label">
              <i className="fas fa-thumbs-up fyc-stat-icon" />
              Likes
            </div>
          </div>
        </div>

        <div className="fyc-desc">{active?.description ?? ''}</div>

        <div className="fyc-actions">
          <button
            type="button"
            className={`fyc-btn-fan${fanning ? ' fanning' : ''}`}
            onClick={() => void toggleFan()}
          >
            <i className={fanning ? 'fas fa-heart-crack' : 'fas fa-heart'} />
            <span>{fanning ? 'Following' : 'Become a Fan'}</span>
          </button>
          <button
            type="button"
            className="fyc-btn-msg"
            title="Message"
            aria-label="Message"
            onClick={() =>
              onMessage(active?.ownerUid || ownerUid, active?.name || ownerName, avatarPic)
            }
          >
            <i className="fas fa-paper-plane" />
          </button>
          <button
            type="button"
            className="fyc-btn-more"
            title="More"
            aria-label="More options"
            onClick={() => onToast('More options coming soon')}
          >
            <i className="fas fa-ellipsis" />
          </button>
        </div>

        {channels && channels.length > 1 ? (
          <div className="fyc-chips" style={{ display: 'flex' }}>
            {channels.map((channel) => (
              <button
                type="button"
                key={channel.id}
                className={`fyc-chip${channel.id === activeId ? ' active' : ''}`}
                onClick={() => setActiveId(channel.id)}
              >
                {channel.profileURL ? <img src={channel.profileURL} alt="" /> : null}
                <span>{channel.name || 'Channel'}</span>
              </button>
            ))}
          </div>
        ) : null}

        {tabs.length > 1 ? (
          <div className="fyc-tabs" style={{ display: 'flex' }}>
            {tabs.map((tab) => (
              <button
                type="button"
                key={tab.id}
                className={`fyc-tab${tab.tone ? ` fyc-tab-${tab.tone}` : ''}${
                  tab.id === tabId ? ' active' : ''
                }`}
                onClick={() => setTabId(tab.id)}
              >
                {tab.icon ? <i className={tab.icon} /> : null}
                {tab.label}
              </button>
            ))}
          </div>
        ) : null}

        <div>
          {channels === null ? (
            <div className="fyc-loading">
              <div className="fyc-spinner" />
            </div>
          ) : channels.length === 0 ? (
            <div className="fyc-empty">
              <i className="fas fa-video-slash" />
              <p>This creator hasn&apos;t set up a channel yet.</p>
            </div>
          ) : contentFailed ? (
            <div className="fyc-empty">
              <i className="fas fa-triangle-exclamation" />
              <p>Failed to load channel content.</p>
            </div>
          ) : content === null ? (
            <div className="fyc-loading">
              <div className="fyc-spinner" />
            </div>
          ) : view.empty ? (
            <div className="fyc-empty">
              <i className={view.empty.icon} />
              <p>{view.empty.message}</p>
            </div>
          ) : (
            view.sections.map((section) => (
              <div className="fyc-section" key={section.key}>
                <div className="fyc-section-title">
                  <i className={section.icon} />
                  {section.title}
                </div>
                <div className={section.wide ? 'fyc-featured-row' : 'fyc-row'}>
                  {section.cards.map((card) => {
                    if (card.kind === 'season') {
                      return (
                        <ChannelSeasonCard
                          key={card.season.id}
                          season={card.season}
                          onOpen={setSeason}
                        />
                      );
                    }
                    if (card.kind === 'soon') {
                      return (
                        <ChannelComingSoonCard
                          key={card.video.id}
                          video={card.video}
                          onNotify={notifyMe}
                        />
                      );
                    }
                    if (card.kind === 'featured') {
                      return (
                        <ChannelFeaturedCard key={card.video.id} video={card.video} onPlay={play} />
                      );
                    }
                    return <ChannelVideoCard key={card.video.id} video={card.video} onPlay={play} />;
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        <ChannelSeasonPanel
          season={season}
          onClose={() => setSeason(null)}
          onPlay={playEpisode}
        />
      </div>

      <PosePlayer
        open={playerVideo !== null}
        video={playerVideo}
        uid={viewerUid}
        email={viewerEmail}
        displayName={viewerName}
        onClose={() => setPlayerVideo(null)}
        onToast={onToast}
        onOpenChannel={(channelId) => {
          setPlayerVideo(null);
          if (channels?.some((channel) => channel.id === channelId)) setActiveId(channelId);
        }}
        onOpenVideo={(video) => setPlayerVideo(video)}
      />
    </div>
  );
}
