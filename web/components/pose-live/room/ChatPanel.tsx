'use client';

import { useEffect, useRef, useState } from 'react';

import { initialsOf } from '@/lib/pose-live/live-sessions';
import { clockLabel } from '@/lib/pose-live/room';
import type { RoomMessage } from '@/lib/pose-live/use-host-room';

type Props = {
  active: boolean;
  messages: RoomMessage[];
  chatLocked: boolean;
  slowMode: boolean;
  pinned: string;
  allowImages: boolean;
  allowVideos: boolean;
  hostPhoto: string;
  onSend: (text: string) => void;
  onToggleLock: () => void;
  onToggleSlow: () => void;
  onQuickPin: (text: string) => void;
  onUnpin: () => void;
  onOpenSheet: (message: RoomMessage) => void;
};

/** `#chat-panel` @634 — the message list, pinned bar and host input. */
export function ChatPanel({
  active,
  messages,
  chatLocked,
  slowMode,
  pinned,
  allowImages,
  allowVideos,
  hostPhoto,
  onSend,
  onToggleLock,
  onToggleSlow,
  onQuickPin,
  onUnpin,
  onOpenSheet,
}: Props) {
  const [draft, setDraft] = useState('');
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages.length]);

  function submit() {
    if (!draft.trim()) return;
    onSend(draft);
    setDraft('');
  }

  return (
    <div className={`tab-panel${active ? ' active' : ''}`} id="chat-panel">
      <div id="pinned-bar" className={pinned ? 'visible' : ''}>
        <span className="pin-icon">
          <i className="fa-solid fa-thumbtack" />
        </span>
        <span className="pin-text">{pinned}</span>
        <span className="pin-close" onClick={onUnpin}>
          <i className="fa-solid fa-xmark" />
        </span>
      </div>

      <div id="lock-bar" className={chatLocked ? 'visible' : ''}>
        <span className="lock-bar-text">
          <i className="fa-solid fa-lock" /> Chat is locked — viewers cannot send messages
        </span>
      </div>

      <div id="messages-area">
        {messages.map((message) => {
          const isHost = message.isHost;
          const isSub = message.isSub;
          const avatar = isHost && hostPhoto ? hostPhoto : '';
          return (
            <div
              key={message.id}
              className={`msg-wrap${isHost ? ' host-msg' : ''}`}
              onClick={() => onOpenSheet(message)}
            >
              <div className={`msg-av${isHost ? ' host-av' : isSub ? ' sub-av' : ''}`}>
                {avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatar} alt="" className="h-full w-full rounded-full object-cover" />
                ) : (
                  initialsOf(message.name)
                )}
              </div>
              <div className="msg-body">
                <div className="msg-meta">
                  <span className={`msg-name${isHost ? ' host-name' : isSub ? ' sub-name' : ''}`}>
                    {isHost && <i className="host-crown fa-solid fa-crown mr-[3px]" />}
                    {isSub && <i className="sub-star fa-solid fa-star mr-[3px]" />}
                    {message.name}
                  </span>
                  {isHost && <span className="msg-badge host-badge">HOST</span>}
                  {!isHost && isSub && <span className="msg-badge sub-badge">SUB</span>}
                  <span className="msg-time">{clockLabel(message.at)}</span>
                </div>
                <div className="msg-text">{message.text}</div>
                {message.imageUrl && allowImages && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img className="msg-img" src={message.imageUrl} alt="img" />
                )}
                {message.videoUrl && allowVideos && (
                  <video className="msg-vid" src={message.videoUrl} controls />
                )}
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      <div id="chat-input-bar">
        <div className="chat-controls">
          <div
            id="lock-btn"
            className={`ctrl-btn${chatLocked ? ' active-lock' : ''}`}
            onClick={onToggleLock}
            title="Lock chat"
          >
            <i className={`fa-solid ${chatLocked ? 'fa-lock' : 'fa-lock-open'}`} />
          </div>
          <div
            id="slow-btn"
            className={`ctrl-btn${slowMode ? ' active-slow' : ''}`}
            onClick={onToggleSlow}
            title="Slow mode"
          >
            <i className="fa-solid fa-hourglass-half" />
          </div>
          <div className="ctrl-btn" onClick={() => onQuickPin(draft)} title="Quick pin">
            <i className="fa-solid fa-thumbtack" />
          </div>
        </div>
        <div id="chat-input-wrap">
          <input
            id="chat-input"
            type="text"
            maxLength={300}
            placeholder="Say something as host…"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => event.key === 'Enter' && submit()}
          />
        </div>
        <button type="button" className="send-btn" onClick={submit}>
          <i className="fa-solid fa-paper-plane" />
        </button>
      </div>
    </div>
  );
}
