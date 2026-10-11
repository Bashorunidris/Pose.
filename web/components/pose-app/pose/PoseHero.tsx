'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import {
  fetchChannelPicture,
  letterTile,
  poseChannelName,
  poseChannelPic,
  poseHeroRank,
  poseThumb,
  type PoseTabVideo,
} from '@/lib/pose-app/pose-tab';
import type { PoseChannel } from '@/lib/pose-app/types';

const ROTATE_MS = 17000;
const STRIP_SIZE = 14;
const VIDEO_SLIDE_MS = 2000;

type Props = {
  videos: PoseTabVideo[];
  /** `#poseTab` is kept mounted but hidden; the rotation pauses while it is. */
  active: boolean;
  onPlay: (video: PoseTabVideo) => void;
  onInfo: (video: PoseTabVideo) => void;
  onWatchLater: (video: PoseTabVideo) => void;
  onOpenChannel: (channelId: string, channel: PoseChannel | null) => void;
};

/**
 * `#ptHero` @25844 with `ptLoadHero()` @31438, `ptSetHero()` @31451 and
 * `ptStartHeroTimer()` @31562. The banner shows the thumbnail first and slides the
 * trailer over it two seconds later, then rotates through the top 14 videos every
 * 17 seconds; picking a strip thumbnail stops the rotation.
 */
export function PoseHero({ videos, active, onPlay, onInfo, onWatchLater, onOpenChannel }: Props) {
  const ranked = useMemo(() => poseHeroRank(videos), [videos]);
  const strip = useMemo(() => ranked.slice(0, STRIP_SIZE), [ranked]);

  const [index, setIndex] = useState(0);
  const [showVideo, setShowVideo] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [fetchedPic, setFetchedPic] = useState('');

  const current = strip[index] ?? ranked[0] ?? null;
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // A new slide starts on its thumbnail and the trailer fades in over it.
  useEffect(() => {
    if (!current) return;
    const trailer = current.trailerUrl ?? current.previewUrl ?? current.videoUrl ?? '';
    void Promise.resolve().then(() => {
      setShowVideo(false);
      setVideoReady(false);
    });
    if (!trailer) return;
    const timer = window.setTimeout(() => setShowVideo(true), VIDEO_SLIDE_MS);
    return () => window.clearTimeout(timer);
  }, [current]);

  useEffect(() => {
    if (!current) return;
    const pic = poseChannelPic(current);
    void Promise.resolve().then(() => setFetchedPic(''));
    if (pic) return;
    const channelId = current.channelId || current.channel?.id || '';
    if (!channelId) return;
    let cancelled = false;
    void fetchChannelPicture(channelId).then((found) => {
      // `ptSetHero()` bails if the banner has already moved on.
      if (!cancelled && found) setFetchedPic(found);
    });
    return () => {
      cancelled = true;
    };
  }, [current]);

  useEffect(() => {
    if (!active || strip.length < 2) return;
    const timer = window.setInterval(() => setIndex((value) => (value + 1) % strip.length), ROTATE_MS);
    return () => window.clearInterval(timer);
  }, [active, strip.length]);

  // `pauseAllFeedVideos()` @42636 paused every `.tab-content` clip on a tab switch.
  useEffect(() => {
    const element = videoRef.current;
    if (!element || active) return;
    element.pause();
  }, [active]);

  const trailer = current ? current.trailerUrl ?? current.previewUrl ?? current.videoUrl ?? '' : '';
  const channelName = current ? poseChannelName(current) : 'Channel';
  const channelPic = current ? poseChannelPic(current) || fetchedPic : '';

  const openChannel = () => {
    if (!current) return;
    onOpenChannel(current.channelId || current.channel?.id || '', current.channel ?? null);
  };

  return (
    <div className={`pt-hero${showVideo ? ' pt-show-vid' : ''}`} id="ptHero">
      <div
        className="pt-hero-bg g2"
        id="ptHeroBg"
        style={{ display: current && poseThumb(current) ? 'none' : undefined }}
      />

      {current && poseThumb(current) ? (
        <img className="pt-hero-thumb" id="ptHeroThumb" src={poseThumb(current)} alt="" />
      ) : null}

      <video
        className={`pt-hero-video${videoReady ? ' pt-loaded' : ''}`}
        id="ptHeroVideo"
        ref={videoRef}
        src={trailer || undefined}
        autoPlay
        muted
        loop
        playsInline
        onCanPlay={() => setVideoReady(true)}
      />
      <div className="pt-hero-overlay" />

      <div className="pt-hero-topleft">
        <span className="pt-badge-nr" id="ptHeroBadge">
          TOP {index + 1}
        </span>
      </div>

      <div className="pt-hero-topright">
        <span className="pt-hero-chname" id="ptHeroChName" role="button" tabIndex={0} onClick={openChannel} onKeyDown={openChannel}>
          {channelName}
        </span>
        <img
          className="pt-hero-chpic"
          id="ptHeroChPic"
          src={channelPic || letterTile(channelName)}
          alt=""
          role="button"
          tabIndex={0}
          onClick={openChannel}
          onKeyDown={openChannel}
        />
      </div>

      <div className="pt-hero-content">
        <div className="pt-hero-btns">
          <button type="button" className="pt-btn-play" onClick={() => current && onPlay(current)}>
            <i className="fas fa-play" style={{ fontSize: 11 }} /> Play
          </button>
          <button type="button" className="pt-btn-info" onClick={() => current && onInfo(current)}>
            <i className="fas fa-info-circle" style={{ fontSize: 11 }} /> More Info
          </button>
          <button type="button" className="pt-btn-watch" onClick={() => current && onWatchLater(current)}>
            <i className="fas fa-plus" style={{ fontSize: 11 }} /> Watch Later
          </button>
        </div>
      </div>

      <div className="pt-strip" id="ptStrip">
        {strip.map((video, position) => (
          <img
            key={`${video.id}-${position}`}
            className={`pt-strip-thumb${position === index ? ' pt-strip-active' : ''}`}
            src={poseThumb(video)}
            alt=""
            title={video.title ?? ''}
            onClick={() => setIndex(position)}
          />
        ))}
      </div>
    </div>
  );
}
