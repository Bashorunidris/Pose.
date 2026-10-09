import { fmtViewers, initialsOf } from '@/lib/pose-live/live-sessions';
import type { LiveSession } from '@/lib/pose-live/types';
import {
  AV_CARD,
  AV_LIVE_DOT,
  AV_NAME,
  AV_RING,
  AV_RING_GLOW,
  AV_RING_GLOW_CHAT,
  AV_VIEWS,
  CARD_FEATURED,
  FEAT_BLOB,
  FEAT_CONTENT,
  FEAT_EMOJI,
  FEAT_GRID,
  FEAT_OVERLAY,
  FEAT_TOP,
  LIVE_TAG,
  LIVE_TAG_DOT,
  MODE_ICON,
  MODE_LABEL,
  MODE_STYLE,
  SC_BLOB,
  SC_BLOB_WIDE,
  SC_CONTENT,
  SC_CONTENT_WIDE,
  SC_EMOJI,
  SC_EMOJI_WIDE,
  SC_LIVE,
  SC_LIVE_ROW,
  SC_NAME,
  SC_OVERLAY,
  SC_SUB,
  SC_VIEWS,
  SECTION_BADGE,
  STREAMER_AV,
  STREAMER_INFO,
  STREAMER_NAME,
  STREAMER_TITLE,
  STREAM_CARD,
  STREAM_CARD_WIDE,
  VIEWER_PILL,
  cx,
} from './styles';

type CardProps = {
  session: LiveSession;
  onOpen: (session: LiveSession) => void;
};

function Watchers({ count }: { count: number }) {
  return (
    <span className={SC_VIEWS}>
      <i className="fa-solid fa-eye mr-[3px]" />
      {fmtViewers(count)}
    </span>
  );
}

/** `buildFeaturedCard` @1752 — first (busiest) video stream. */
export function FeaturedCard({ session, onOpen }: CardProps) {
  const style = MODE_STYLE[session.mode];
  return (
    <div
      className={cx(CARD_FEATURED, style.cardBg)}
      role="button"
      tabIndex={0}
      onClick={() => onOpen(session)}
      onKeyDown={(event) => event.key === 'Enter' && onOpen(session)}
    >
      <div className={cx(FEAT_BLOB, style.blob)} />
      <div className={FEAT_GRID} />
      <div className={FEAT_OVERLAY} />
      <i className={cx(FEAT_EMOJI, MODE_ICON[session.mode])} />
      <div className={FEAT_CONTENT}>
        <div className={FEAT_TOP}>
          <div className={LIVE_TAG}>
            <span className={LIVE_TAG_DOT} />
            LIVE
          </div>
          <div className={VIEWER_PILL}>
            <i className="fa-solid fa-eye" />
            {fmtViewers(session.viewerCount)} watching
          </div>
          <span className={cx(SECTION_BADGE, style.badge)}>{MODE_LABEL[session.mode]}</span>
        </div>
        <div className={STREAMER_INFO}>
          <div className={cx(STREAMER_AV, style.avatarBg)}>{initialsOf(session.hostName)}</div>
          <div>
            <div className={STREAMER_NAME}>{session.hostName || 'Anonymous'}</div>
            <div className={STREAMER_TITLE}>{session.title || 'Live Stream'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** `buildSmallCard` @1779 — the remaining video streams. */
export function SmallCard({ session, onOpen }: CardProps) {
  const style = MODE_STYLE[session.mode];
  return (
    <div
      className={cx(STREAM_CARD, style.cardBgShort)}
      role="button"
      tabIndex={0}
      onClick={() => onOpen(session)}
      onKeyDown={(event) => event.key === 'Enter' && onOpen(session)}
    >
      <div className={cx(SC_BLOB, style.blob)} />
      <div className={SC_OVERLAY} />
      <i className={cx(SC_EMOJI, MODE_ICON[session.mode])} />
      <div className={SC_CONTENT}>
        <div className={SC_LIVE_ROW}>
          <span className={SC_LIVE}>LIVE</span>
          <Watchers count={session.viewerCount} />
        </div>
        <div className={SC_NAME}>{session.hostName || 'User'}</div>
        <div className={SC_SUB}>{session.title || MODE_LABEL[session.mode]}</div>
      </div>
    </div>
  );
}

/** `buildAvatarCard` @1793 — voice rooms and chat sessions. */
export function AvatarCard({ session, onOpen }: CardProps) {
  const style = MODE_STYLE[session.mode];
  const isChat = session.mode === 'chat';
  return (
    <div
      className={AV_CARD}
      role="button"
      tabIndex={0}
      onClick={() => onOpen(session)}
      onKeyDown={(event) => event.key === 'Enter' && onOpen(session)}
    >
      <div
        className={cx(AV_RING, style.avatarBg, isChat ? AV_RING_GLOW_CHAT : AV_RING_GLOW)}
      >
        {initialsOf(session.hostName)}
        <div className={AV_LIVE_DOT} />
      </div>
      <div className={AV_NAME}>{session.hostName || 'User'}</div>
      <div className={AV_VIEWS}>
        <i className="fa-solid fa-eye mr-[3px]" />
        {fmtViewers(session.viewerCount)}
      </div>
    </div>
  );
}

/** `buildWideCard` @1807 — gaming streams. */
export function WideCard({ session, onOpen }: CardProps) {
  const style = MODE_STYLE[session.mode];
  return (
    <div
      className={cx(STREAM_CARD_WIDE, style.cardBgShort)}
      role="button"
      tabIndex={0}
      onClick={() => onOpen(session)}
      onKeyDown={(event) => event.key === 'Enter' && onOpen(session)}
    >
      <div className={cx(SC_BLOB_WIDE, style.blob)} />
      <div className={SC_OVERLAY} />
      <i className={cx(SC_EMOJI_WIDE, MODE_ICON.gaming)} />
      <div className={SC_CONTENT_WIDE}>
        <div className={SC_LIVE_ROW}>
          <span className={SC_LIVE}>LIVE</span>
          <Watchers count={session.viewerCount} />
        </div>
        <div className={SC_NAME}>{session.hostName || 'User'}</div>
        <div className={SC_SUB}>{session.title || 'Gaming Stream'}</div>
      </div>
    </div>
  );
}
