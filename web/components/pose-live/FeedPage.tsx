import { progressPercent } from '@/lib/pose-live/live-sessions';
import { LIVE_TARGET_USERS, type LiveMode, type LiveSession } from '@/lib/pose-live/types';
import { AvatarCard, FeaturedCard, SmallCard, WideCard } from './LiveCards';
import {
  BRAND_LOGO,
  BRAND_ROW,
  BTN_DOT,
  CHIP,
  CHIP_ACTIVE,
  CHIP_IDLE,
  EMPTY_STATE,
  EMPTY_SUB,
  EMPTY_TITLE,
  FEED_SCROLL,
  FEED_SECTION,
  FEED_SECTION_HDR,
  FEED_SECTION_TITLE,
  FILTER_BAR,
  GO_LIVE_TOP_BTN,
  GO_LIVE_TOP_SHEEN,
  H_SCROLL,
  LCS_CARD,
  LCS_CTA,
  LCS_DESC,
  LCS_DESC_STRONG,
  LCS_FEAT,
  LCS_FEATURES,
  LCS_FEAT_ICON,
  LCS_GLOW,
  LCS_ICON,
  LCS_PROGRESS_BAR,
  LCS_PROGRESS_FILL,
  LCS_PROGRESS_LABEL,
  LCS_PROGRESS_WRAP,
  LCS_TITLE,
  LIVE_INDICATOR,
  MODE_ICON,
  MODE_STYLE,
  PULSE_DOT,
  SECTION_BADGE,
  SEE_ALL,
  TOPBAR,
  TOPBAR_H1,
  TOPBAR_P,
  TOPBAR_TITLE,
  cx,
} from './styles';

export type Filter = 'all' | LiveMode;

export const FILTERS: readonly Filter[] = ['all', 'video', 'voice', 'chat', 'gaming'];

const FILTER_LABEL: Record<Filter, string> = {
  all: 'All',
  video: 'Video',
  voice: 'Voice',
  chat: 'Chat',
  gaming: 'Gaming',
};

const FILTER_ICON: Record<Filter, string> = {
  all: 'fa-solid fa-fire',
  ...MODE_ICON,
};

/** `renderFeed` @1820 — one section per mode, busiest stream first. */
function groupSessions(sessions: readonly LiveSession[]) {
  const groups: Record<LiveMode, LiveSession[]> = { video: [], voice: [], chat: [], gaming: [] };
  sessions.forEach((session) => groups[session.mode].push(session));
  (Object.keys(groups) as LiveMode[]).forEach((mode) =>
    groups[mode].sort((a, b) => b.viewerCount - a.viewerCount),
  );
  return groups;
}

function SectionHeader({
  mode,
  count,
  onSeeAll,
}: {
  mode: LiveMode;
  count: number;
  onSeeAll: () => void;
}) {
  const style = MODE_STYLE[mode];
  return (
    <div className={FEED_SECTION_HDR}>
      <div className={FEED_SECTION_TITLE}>
        <i className={MODE_ICON[mode]} />
        {mode === 'video' ? 'Video Streams' : mode === 'voice' ? 'Voice Rooms' : mode === 'chat' ? 'Chat Sessions' : 'Gaming Streams'}
        <span className={cx(SECTION_BADGE, style.badge)}>{count} LIVE</span>
      </div>
      <div className={SEE_ALL} role="button" tabIndex={0} onClick={onSeeAll} onKeyDown={(e) => e.key === 'Enter' && onSeeAll()}>
        See all <i className="fa-solid fa-arrow-right" />
      </div>
    </div>
  );
}

/** `.live-coming-soon-card` @761 — the pre-launch banner, still shown while nothing is live. */
function ComingSoonCard({ totalUsers }: { totalUsers: number | null }) {
  const count = totalUsers ?? 0;
  return (
    <div className={LCS_CARD}>
      <div className={LCS_GLOW} />
      <div className={LCS_ICON}>
        <i className="fa-solid fa-rocket" />
      </div>
      <div className={LCS_TITLE}>Live is Coming Soon!</div>
      <div className={LCS_DESC}>
        We&apos;re building something incredible. The full Live experience will unlock once we hit our first{' '}
        <strong className={LCS_DESC_STRONG}>{LIVE_TARGET_USERS.toLocaleString()} users</strong>. Be part of the journey!
      </div>
      <div className={LCS_PROGRESS_WRAP}>
        <div className={LCS_PROGRESS_BAR}>
          <div className={LCS_PROGRESS_FILL} style={{ width: `${progressPercent(count)}%` }} />
        </div>
        <div className={LCS_PROGRESS_LABEL}>
          {count.toLocaleString()} / {LIVE_TARGET_USERS.toLocaleString()} users
        </div>
      </div>
      <div className={LCS_FEATURES}>
        <div className={LCS_FEAT}>
          <i className={cx(LCS_FEAT_ICON, 'fa-solid fa-comment-dots')} /> Live Chat Rooms
        </div>
        <div className={LCS_FEAT}>
          <i className={cx(LCS_FEAT_ICON, 'fa-solid fa-gift')} /> Gifts &amp; Donations
        </div>
        <div className={LCS_FEAT}>
          <i className={cx(LCS_FEAT_ICON, 'fa-solid fa-microphone-lines')} /> Voice &amp; Video
        </div>
        <div className={LCS_FEAT}>
          <i className={cx(LCS_FEAT_ICON, 'fa-solid fa-gamepad')} /> Gaming Streams
        </div>
      </div>
      <div className={LCS_CTA}>Invite friends to help us get there faster!</div>
    </div>
  );
}

type Props = {
  sessions: readonly LiveSession[];
  failed: boolean;
  loaded: boolean;
  totalUsers: number | null;
  filter: Filter;
  onFilter: (filter: Filter) => void;
  onGoLive: () => void;
  onOpen: (session: LiveSession) => void;
};

export function FeedPage({ sessions, failed, loaded, totalUsers, filter, onFilter, onGoLive, onOpen }: Props) {
  const filtered = filter === 'all' ? sessions : sessions.filter((session) => session.mode === filter);
  const total = sessions.length;
  const groups = groupSessions(filtered);

  const subtitle = failed
    ? 'Could not load streams'
    : !loaded
      ? 'Loading streams…'
      : total === 0
        ? 'No one is live right now'
        : `${total} stream${total === 1 ? '' : 's'} happening now`;

  // Nothing live at all keeps the launch banner; a filter with no matches gets the
  // per-mode empty state, which is what legacy `renderFeed` @1834 shows.
  const showComingSoon = !failed && (!loaded || total === 0);

  return (
    <>
      <div className={TOPBAR}>
        <div className={TOPBAR_TITLE}>
          <div className={BRAND_ROW}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className={BRAND_LOGO} src="/logo.png" alt="Pose" width={36} height={36} />
            <div>
              <h1 className={TOPBAR_H1}>
                Live Now <i className="fa-solid fa-fire text-[#f59e0b]" />
              </h1>
              <p className={TOPBAR_P}>{subtitle}</p>
            </div>
          </div>
        </div>
        <div className={LIVE_INDICATOR}>
          <div className={PULSE_DOT} />
          {total} LIVE
        </div>
        <button type="button" className={GO_LIVE_TOP_BTN} onClick={onGoLive}>
          <div className={GO_LIVE_TOP_SHEEN} />
          <div className={BTN_DOT} />
          Go Live
        </button>
      </div>

      <div className={FILTER_BAR}>
        {FILTERS.map((value) => (
          <button
            type="button"
            key={value}
            className={cx(
              CHIP,
              filter === value
                ? cx(CHIP_ACTIVE, MODE_STYLE[value === 'all' ? 'video' : value].chipActive)
                : CHIP_IDLE,
            )}
            onClick={() => onFilter(value)}
          >
            <i className={FILTER_ICON[value]} />
            {FILTER_LABEL[value]}
          </button>
        ))}
      </div>

      <div className={FEED_SCROLL}>
        <div>
          {showComingSoon && <ComingSoonCard totalUsers={totalUsers} />}

          {!showComingSoon && filtered.length === 0 && (
            <div className={EMPTY_STATE}>
              <div className="text-[42px] opacity-40">
                <i className="fa-solid fa-satellite-dish" />
              </div>
              <div className={EMPTY_TITLE}>
                No {filter === 'all' ? '' : `${FILTER_LABEL[filter]} `}streams live
              </div>
              <div className={EMPTY_SUB}>Be the first to go live!</div>
            </div>
          )}

          {!showComingSoon && groups.video.length > 0 && (
            <div className={FEED_SECTION}>
              <SectionHeader mode="video" count={groups.video.length} onSeeAll={() => onFilter('video')} />
              <FeaturedCard session={groups.video[0]} onOpen={onOpen} />
              {groups.video.length > 1 && (
                <div className={H_SCROLL}>
                  {groups.video.slice(1).map((session) => (
                    <SmallCard key={session.id} session={session} onOpen={onOpen} />
                  ))}
                </div>
              )}
            </div>
          )}

          {!showComingSoon && groups.voice.length > 0 && (
            <div className={FEED_SECTION}>
              <SectionHeader mode="voice" count={groups.voice.length} onSeeAll={() => onFilter('voice')} />
              <div className={H_SCROLL}>
                {groups.voice.map((session) => (
                  <AvatarCard key={session.id} session={session} onOpen={onOpen} />
                ))}
              </div>
            </div>
          )}

          {!showComingSoon && groups.chat.length > 0 && (
            <div className={FEED_SECTION}>
              <SectionHeader mode="chat" count={groups.chat.length} onSeeAll={() => onFilter('chat')} />
              <div className={H_SCROLL}>
                {groups.chat.map((session) => (
                  <AvatarCard key={session.id} session={session} onOpen={onOpen} />
                ))}
              </div>
            </div>
          )}

          {!showComingSoon && groups.gaming.length > 0 && (
            <div className={FEED_SECTION}>
              <SectionHeader mode="gaming" count={groups.gaming.length} onSeeAll={() => onFilter('gaming')} />
              <div className={H_SCROLL}>
                {groups.gaming.map((session) => (
                  <WideCard key={session.id} session={session} onOpen={onOpen} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
