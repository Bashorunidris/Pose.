'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { uploadToR2 } from '@/lib/r2-upload';
import {
  CHAT_VIDEO_LIMIT,
  EMOJI_LIST,
  chatRoomId,
  fetchChatPeer,
  formatLastSeen,
  sendChatMessage,
  watchChatMessages,
  watchChatPresence,
  type ChatMessage,
  type ChatPeer,
} from '@/lib/pose-app/chat';

type Props = {
  open: boolean;
  uid: string | null;
  displayName: string;
  /** Who the room is with, as the notification or the profile handed them over. */
  peer: { userId: string; name: string; pic: string } | null;
  onClose: () => void;
  onToast: (message: string) => void;
};

type PickedMedia = {
  file: File;
  type: 'image' | 'video';
  preview: string;
};

const STATUS_IDLE = { text: '...', tint: '#888' };
const STATUS_ONLINE = { text: 'Online', tint: '#4ade80' };
const STATUS_OFFLINE = { text: 'Offline', tint: '#888' };

function clockTime(ms: number): string {
  return new Date(ms).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function dayLabel(ms: number): string {
  return new Date(ms).toLocaleDateString();
}

function voiceDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * The waveform the legacy faked with `Math.random()` heights, hashed off the
 * message id so a bubble keeps the same shape across renders.
 */
function voiceBars(id: string): number[] {
  let hash = 0;
  for (let index = 0; index < id.length; index += 1) {
    hash = (hash * 31 + id.charCodeAt(index)) >>> 0;
  }
  return Array.from({ length: 20 }, () => {
    hash = (hash * 1103515245 + 12345) >>> 0;
    return 4 + (hash % 20);
  });
}

function VoiceNote({ message }: { message: ChatMessage }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
      return;
    }
    audio.currentTime = 0;
    void audio.play();
    setPlaying(true);
  };

  return (
    <div className="chat-voice-note">
      <button type="button" className="voice-play-btn" onClick={toggle} aria-label="Play voice note">
        <i className={playing ? 'fas fa-pause' : 'fas fa-play'} />
      </button>
      <div className="voice-waveform">
        {voiceBars(message.id).map((height, index) => (
          <div className="wave-bar" key={index} style={{ height: `${height}px` }} />
        ))}
      </div>
      <span className="voice-duration">{voiceDuration(message.duration)}</span>
      <audio
        ref={audioRef}
        src={message.mediaUrl}
        onEnded={() => setPlaying(false)}
        className="hidden"
      />
    </div>
  );
}

/**
 * `#chatRoomOverlay` @90506 with `openChatRoomWithUser()` @81223 and the whole
 * chat block @68876-69326: the message list with its date separators, the media
 * preview, the voice recording bar, the emoji picker, the attach menu and the
 * composer.
 *
 * Firebase Storage is gone in the port, so attachments and voice notes go
 * through `uploadToR2()` before the message is written.
 */
export function ChatRoom({ open, uid, displayName, peer, onClose, onToast }: Props) {
  const [resolved, setResolved] = useState<ChatPeer | null>(null);
  const [messages, setMessages] = useState<ChatMessage[] | null>(null);
  const [status, setStatus] = useState(STATUS_IDLE);
  const [text, setText] = useState('');
  const [media, setMedia] = useState<PickedMedia | null>(null);
  const [panel, setPanel] = useState<'emoji' | 'attach' | null>(null);
  const [recording, setRecording] = useState<number | null>(null);
  const [sending, setSending] = useState(false);

  const listRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const secondsRef = useRef(0);

  const peerId = peer?.userId ?? '';
  const roomId = uid && peerId ? chatRoomId(uid, peerId) : '';

  const clearMedia = useCallback(() => {
    setMedia((current) => {
      if (current) URL.revokeObjectURL(current.preview);
      return null;
    });
  }, []);

  const stopRecordingTimer = useCallback(() => {
    if (timerRef.current !== null) clearInterval(timerRef.current);
    timerRef.current = null;
  }, []);

  const stopTracks = useCallback(() => {
    recorderRef.current?.stream.getTracks().forEach((track) => track.stop());
    recorderRef.current = null;
    chunksRef.current = [];
    secondsRef.current = 0;
  }, []);

  // A fresh peer or a close resets everything the previous room left behind.
  useEffect(() => {
    if (!open) return;
    void Promise.resolve().then(() => {
      setMessages(null);
      setStatus(STATUS_IDLE);
      setText('');
      setMedia(null);
      setPanel(null);
      setRecording(null);
      setSending(false);
    });
  }, [open, peerId]);

  useEffect(() => {
    if (!open || !peerId) return;
    let cancelled = false;
    void fetchChatPeer(peerId, peer?.name, peer?.pic).then((next) => {
      if (!cancelled) setResolved(next);
    });
    return () => {
      cancelled = true;
    };
  }, [open, peerId, peer?.name, peer?.pic]);

  useEffect(() => {
    if (!open || !roomId) return;
    const stop = watchChatMessages(
      roomId,
      (next) => setMessages(next),
      (error) => console.error('Chat listen error:', error),
    );
    return stop;
  }, [open, roomId]);

  useEffect(() => {
    if (!open || !peerId) return;
    const stop = watchChatPresence(peerId, (presence) => {
      if (presence.online) {
        setStatus(STATUS_ONLINE);
        return;
      }
      setStatus(
        presence.lastSeen
          ? { text: `Last seen ${formatLastSeen(presence.lastSeen)}`, tint: '#888' }
          : STATUS_OFFLINE,
      );
    });
    return stop;
  }, [open, peerId]);

  useEffect(() => {
    const list = listRef.current;
    if (list) list.scrollTop = list.scrollHeight;
  }, [messages]);

  // Closing tears the recorder down; the legacy `closeChatRoom()` @68936 nulled
  // its unsubscribe pair and the port's effects do their own cleanup, but a
  // running MediaRecorder would keep the mic light on.
  useEffect(() => {
    if (open) return;
    return () => {
      stopRecordingTimer();
      if (recorderRef.current && recorderRef.current.state !== 'inactive') {
        recorderRef.current.stop();
      }
      stopTracks();
    };
  }, [open, stopRecordingTimer, stopTracks]);

  const resizeInput = useCallback(() => {
    const input = inputRef.current;
    if (!input) return;
    input.style.height = 'auto';
    input.style.height = `${Math.min(input.scrollHeight, 100)}px`;
  }, []);

  useEffect(resizeInput, [text, resizeInput]);

  const pickMedia = useCallback(
    (file: File | undefined, type: 'image' | 'video') => {
      if (!file) return;
      if (type === 'video' && file.size > CHAT_VIDEO_LIMIT) {
        onToast('Video must be under 50MB');
        return;
      }
      setMedia({ file, type, preview: type === 'image' ? URL.createObjectURL(file) : '' });
      setPanel(null);
    },
    [onToast],
  );

  const startRecording = useCallback(async () => {
    if (recording !== null) return;
    setPanel(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      secondsRef.current = 0;
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.onstop = () => stream.getTracks().forEach((track) => track.stop());
      recorder.start();
      recorderRef.current = recorder;
      setRecording(0);
      timerRef.current = setInterval(() => {
        secondsRef.current += 1;
        setRecording(secondsRef.current);
      }, 1000);
    } catch (error) {
      console.error('Mic access denied:', error);
      onToast('Microphone access denied');
    }
  }, [onToast, recording]);

  const cancelRecording = useCallback(() => {
    stopRecordingTimer();
    const recorder = recorderRef.current;
    if (recorder && recorder.state !== 'inactive') recorder.stop();
    stopTracks();
    setRecording(null);
  }, [stopRecordingTimer, stopTracks]);

  const sendRecording = useCallback(async () => {
    const recorder = recorderRef.current;
    if (!recorder || recorder.state === 'inactive' || !roomId || !uid) return;
    const duration = secondsRef.current;
    stopRecordingTimer();
    recorder.stop();
    setRecording(null);

    // `sendVoiceRecording()` @69276 waited a beat for the last chunk to land.
    await new Promise((resolve) => setTimeout(resolve, 300));
    const chunks = chunksRef.current;
    stopTracks();
    if (chunks.length === 0) return;

    try {
      const url = await uploadToR2(new Blob(chunks, { type: 'audio/webm' }), {
        filename: `voice_${Date.now()}.webm`,
        contentType: 'audio/webm',
        folder: `chat_media/${roomId}`,
      });
      await sendChatMessage({
        roomId,
        uid,
        peerId,
        displayName,
        text: '',
        mediaUrl: url,
        type: 'voice',
        duration,
      });
    } catch (error) {
      console.error('Voice send error:', error);
      onToast('Failed to send voice note');
    }
  }, [displayName, onToast, peerId, roomId, stopRecordingTimer, stopTracks, uid]);

  if (!open || !uid || !peerId) return null;

  const send = async () => {
    if (!roomId || sending) return;
    const body = text.trim();
    if (!body && !media) return;
    setSending(true);
    try {
      let mediaUrl = '';
      let type: ChatMessage['type'] = 'text';
      if (media) {
        type = media.type;
        mediaUrl = await uploadToR2(media.file, {
          filename: media.file.name,
          contentType: media.file.type,
          folder: `chat_media/${roomId}`,
        });
      }
      await sendChatMessage({
        roomId,
        uid,
        peerId,
        displayName,
        text: body,
        mediaUrl,
        type,
      });
      setText('');
      clearMedia();
      setPanel(null);
    } catch (error) {
      console.error('Error sending message:', error);
      onToast('Failed to send message');
    }
    setSending(false);
  };

  const insertEmoji = (emoji: string) => {
    const input = inputRef.current;
    if (!input) return;
    const start = input.selectionStart;
    const end = input.selectionEnd;
    const next = text.slice(0, start) + emoji + text.slice(end);
    setText(next);
    requestAnimationFrame(() => {
      input.focus();
      const caret = start + emoji.length;
      input.setSelectionRange(caret, caret);
    });
  };

  const initial = (resolved?.name || 'U').charAt(0).toUpperCase();
  const canSend = Boolean(text.trim() || media);
  const grouped = messages ?? [];

  return (
    <div className="chat-shell">
      <div className="chat-overlay active" role="dialog" aria-modal="true" aria-label="Messages">
        <div className="chat-header">
          <button type="button" className="chat-back-btn" onClick={onClose} aria-label="Back">
            <i className="fas fa-arrow-left" />
          </button>
          <div
            className="chat-user-pic"
            style={resolved?.pic ? { backgroundImage: `url('${resolved.pic}')` } : undefined}
          >
            {resolved?.pic ? '' : initial}
          </div>
          <div className="chat-user-info">
            <div className="chat-user-name">{resolved?.name || 'User'}</div>
            <div className="chat-user-status" style={{ color: status.tint }}>
              {status.text}
            </div>
          </div>
        </div>

        <div className="chat-messages" ref={listRef}>
          {messages === null ? (
            <div className="pt-10 text-center text-[#555]">Loading messages...</div>
          ) : grouped.length === 0 ? (
            <div className="pt-10 text-center text-[#555]">No messages yet. Say hello!</div>
          ) : (
            grouped.map((message, index) => {
              const previous = grouped[index - 1];
              const newDay =
                message.timestamp > 0 &&
                (!previous || dayLabel(previous.timestamp) !== dayLabel(message.timestamp));
              const mine = message.senderId === uid;
              return (
                <div key={message.id}>
                  {newDay ? (
                    <div className="chat-date-separator">
                      <span>{dayLabel(message.timestamp)}</span>
                    </div>
                  ) : null}
                  <div className={`chat-msg ${mine ? 'sent' : 'received'}`}>
                    {message.type === 'image' ? (
                      <div className="chat-msg-media">
                        <a href={message.mediaUrl} target="_blank" rel="noreferrer">
                          <img src={message.mediaUrl} alt="" />
                        </a>
                      </div>
                    ) : null}
                    {message.type === 'video' ? (
                      <div className="chat-msg-media">
                        <video src={message.mediaUrl} controls playsInline />
                      </div>
                    ) : null}
                    {message.type === 'voice' ? <VoiceNote message={message} /> : null}
                    {message.text ? <div>{message.text}</div> : null}
                    {message.timestamp > 0 ? (
                      <span className="chat-msg-time">{clockTime(message.timestamp)}</span>
                    ) : null}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className={`chat-media-preview${media ? ' active' : ''}`}>
          {media?.preview ? (
            <img className="preview-thumb" src={media.preview} alt="" />
          ) : null}
          <span className="flex-1 text-[13px] text-[#ccc]">
            {media?.file.name ?? ''}
          </span>
          <button type="button" className="preview-remove" onClick={clearMedia} aria-label="Remove attachment">
            <i className="fas fa-times" />
          </button>
        </div>

        <div className={`chat-voice-recording-bar${recording !== null ? ' active' : ''}`}>
          <div className="recording-indicator" />
          <span className="recording-time">{voiceDuration(recording ?? 0)}</span>
          <button type="button" className="recording-cancel" onClick={cancelRecording}>
            Cancel
          </button>
          <button type="button" className="recording-send" onClick={() => void sendRecording()} aria-label="Send voice note">
            <i className="fas fa-paper-plane" />
          </button>
        </div>

        <div className={`chat-emoji-picker${panel === 'emoji' ? ' active' : ''}`}>
          <div className="emoji-grid">
            {EMOJI_LIST.map((emoji) => (
              <span className="emoji-item" key={emoji} onClick={() => insertEmoji(emoji)}>
                {emoji}
              </span>
            ))}
          </div>
        </div>

        <div className={`chat-attach-menu${panel === 'attach' ? ' active' : ''}`}>
          <button type="button" onClick={() => imageInputRef.current?.click()}>
            <i className="fas fa-image" style={{ color: '#4CAF50' }} /> Photo
          </button>
          <button type="button" onClick={() => videoInputRef.current?.click()}>
            <i className="fas fa-video" style={{ color: '#2196F3' }} /> Video
          </button>
        </div>

        <div className="chat-input-area" style={recording !== null ? { display: 'none' } : undefined}>
          <button
            type="button"
            className="chat-attach-btn"
            onClick={() => setPanel(panel === 'attach' ? null : 'attach')}
            aria-label="Attach"
          >
            <i className="fas fa-plus" />
          </button>
          <button
            type="button"
            className="chat-emoji-btn"
            onClick={() => setPanel(panel === 'emoji' ? null : 'emoji')}
            aria-label="Emoji"
          >
            <i className="fas fa-smile" />
          </button>
          <textarea
            ref={inputRef}
            className="chat-text-input"
            placeholder="Type a message..."
            rows={1}
            value={text}
            onChange={(event) => setText(event.target.value)}
          />
          <button
            type="button"
            className={`chat-voice-btn${recording !== null ? ' recording' : ''}`}
            onClick={() => void startRecording()}
            aria-label="Record voice note"
          >
            <i className="fas fa-microphone" />
          </button>
          <button
            type="button"
            className="chat-send-btn"
            onClick={() => void send()}
            disabled={!canSend || sending}
            aria-label="Send"
          >
            <i className="fas fa-paper-plane" />
          </button>
        </div>

        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={(event) => {
            pickMedia(event.target.files?.[0], 'image');
            event.target.value = '';
          }}
        />
        <input
          ref={videoInputRef}
          type="file"
          accept="video/*"
          style={{ display: 'none' }}
          onChange={(event) => {
            pickMedia(event.target.files?.[0], 'video');
            event.target.value = '';
          }}
        />
      </div>
    </div>
  );
}
