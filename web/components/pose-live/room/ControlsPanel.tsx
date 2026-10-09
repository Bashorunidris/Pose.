'use client';

import { useState } from 'react';

import { initialsOf } from '@/lib/pose-live/live-sessions';
import {
  slideFileName,
  slideIcon,
  slidePlaceholder,
  type SlideType,
} from '@/lib/pose-live/room';
import type { JoinRequest, Slide } from '@/lib/pose-live/use-host-room';

type Props = {
  active: boolean;
  slide: Slide;
  slideType: SlideType;
  chatLocked: boolean;
  slowMode: boolean;
  autoMod: boolean;
  allowImages: boolean;
  allowVideos: boolean;
  privacy: 'public' | 'private';
  joinRequests: JoinRequest[];
  onSlideType: (type: SlideType) => void;
  onPushSlide: (url: string) => void;
  onClearSlide: () => void;
  onToggleLock: () => void;
  onToggleSlow: () => void;
  onSetting: (field: string, value: unknown) => void;
  onApprove: (request: JoinRequest) => void;
  onDeny: (request: JoinRequest) => void;
  onEnd: () => void;
};

function ModRow({
  tone,
  icon,
  label,
  desc,
  checked,
  onChange,
}: {
  tone: 'red' | 'gold' | 'purple' | 'green';
  icon: string;
  label: string;
  desc: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="mod-row">
      <div className={`mod-icon ${tone}`}>
        <i className={icon} />
      </div>
      <div className="mod-text">
        <div className="mod-label">{label}</div>
        <div className="mod-desc">{desc}</div>
      </div>
      <div className="toggle-wrap">
        <input type="checkbox" className="toggle" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      </div>
    </div>
  );
}

const SLIDE_TYPES: readonly SlideType[] = ['image', 'video', 'audio'];

/** `#controls-panel` @707 — media slide, moderation, join requests, end stream. */
export function ControlsPanel({
  active,
  slide,
  slideType,
  chatLocked,
  slowMode,
  autoMod,
  allowImages,
  allowVideos,
  privacy,
  joinRequests,
  onSlideType,
  onPushSlide,
  onClearSlide,
  onToggleLock,
  onToggleSlow,
  onSetting,
  onApprove,
  onDeny,
  onEnd,
}: Props) {
  const [url, setUrl] = useState('');

  return (
    <div className={`tab-panel${active ? ' active' : ''}`} id="controls-panel">
      <div className="controls-scroll">
        <div className="ctrl-section-title">
          <i className="fa-solid fa-film mr-[6px]" />
          Media Slide
        </div>
        <div className="slide-card">
          <div className="slide-preview">
            {!slide && (
              <div className="slide-preview-placeholder">
                <i className={slideIcon(slideType)} />
              </div>
            )}
            {slide?.type === 'image' && (
              // eslint-disable-next-line @next/next/no-img-element
              <img className="slide-preview-img" src={slide.url} alt="slide" />
            )}
            {slide?.type === 'video' && <video className="slide-preview-vid" src={slide.url} controls />}
            {slide?.type === 'audio' && (
              <div className="slide-preview-audio show">
                <div className="audio-wave">
                  {Array.from({ length: 7 }, (_, index) => (
                    <div className="audio-bar" key={index} />
                  ))}
                </div>
                <div className="audio-name">{slideFileName(slide.url)}</div>
              </div>
            )}
          </div>
          <div className="slide-type-row">
            {SLIDE_TYPES.map((type) => (
              <div
                key={type}
                className={`slide-type-btn${slideType === type ? ' active' : ''}`}
                onClick={() => onSlideType(type)}
              >
                <span className="stb-icon">
                  <i className={slideIcon(type)} />
                </span>
                <span className="stb-label">{type.charAt(0).toUpperCase() + type.slice(1)}</span>
              </div>
            ))}
          </div>
          <div className="slide-input-row">
            <input
              className="slide-url-input"
              type="url"
              placeholder={slidePlaceholder(slideType)}
              value={url}
              onChange={(event) => setUrl(event.target.value)}
            />
            <button
              type="button"
              className="slide-push-btn"
              onClick={() => {
                if (!url.trim()) return;
                onPushSlide(url.trim());
                setUrl('');
              }}
            >
              Push
            </button>
          </div>
          <div className="slide-input-row" style={{ paddingTop: 0 }}>
            <button type="button" className="slide-clear-btn" style={{ width: '100%' }} onClick={onClearSlide}>
              Clear Slide
            </button>
          </div>
        </div>

        <div className="ctrl-section-title">
          <i className="fa-solid fa-shield-halved mr-[6px]" />
          Moderation
        </div>
        <ModRow tone="red" icon="fa-solid fa-lock" label="Lock Chat" desc="Pause all incoming messages" checked={chatLocked} onChange={onToggleLock} />
        <ModRow tone="gold" icon="fa-solid fa-hourglass-half" label="Slow Mode" desc="Limit message frequency" checked={slowMode} onChange={onToggleSlow} />
        <ModRow tone="purple" icon="fa-solid fa-robot" label="Auto-Moderation" desc="Filter spam and toxic content" checked={autoMod} onChange={(value) => onSetting('autoMod', value)} />
        <ModRow tone="green" icon="fa-solid fa-image" label="Images in Chat" desc="Allow viewers to send images" checked={allowImages} onChange={(value) => onSetting('allowImages', value)} />
        <ModRow tone="green" icon="fa-solid fa-film" label="Videos in Chat" desc="Allow viewers to send video clips" checked={allowVideos} onChange={(value) => onSetting('allowVideos', value)} />

        {privacy === 'private' && (
          <div id="join-req-section">
            <div className="ctrl-section-title">
              <i className="fa-solid fa-lock mr-[6px]" />
              Join Requests
            </div>
            <div className="join-req-list">
              {joinRequests.length === 0 && (
                <div className="empty-mini">
                  <div className="empty-mini-icon">
                    <i className="fa-solid fa-lock" />
                  </div>
                  <div className="empty-mini-text">No pending requests</div>
                </div>
              )}
              {joinRequests.map((request) => (
                <div className="join-req-item" key={request.id}>
                  <div className="jr-av">{initialsOf(request.name)}</div>
                  <div className="jr-name">{request.name}</div>
                  <button type="button" className="jr-approve" onClick={() => onApprove(request)}>
                    Approve
                  </button>
                  <button type="button" className="jr-deny" onClick={() => onDeny(request)}>
                    Deny
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="ctrl-section-title">
          <i className="fa-solid fa-triangle-exclamation mr-[6px]" />
          Session
        </div>
        <div className="end-stream-card">
          <div className="end-stream-title">End Live Stream</div>
          <div className="end-stream-desc">
            This will close the room for all viewers. This action cannot be undone.
          </div>
          <button type="button" className="end-stream-btn" onClick={onEnd}>
            <i className="fa-solid fa-circle text-[#ef4444] mr-[6px]" />
            End Stream Now
          </button>
        </div>
      </div>
    </div>
  );
}
