import type { LiveMode } from '@/lib/pose-live/types';
import {
  HERO_BLOB,
  HERO_BLOB_2,
  HERO_CONTENT,
  HERO_GRID,
  HERO_ICON_BIG,
  HERO_SUB,
  HERO_TAG,
  HERO_TITLE,
  MODE_ICON,
  MODE_STYLE,
  PANEL,
  PANEL_ACTIVE,
  PANEL_EXIT_LEFT,
  PANEL_HERO,
  PANEL_IDLE,
  SECTION_LABEL,
  SETTINGS_LIST,
  SETTING_DESC,
  SETTING_ICON,
  SETTING_LABEL,
  SETTING_ROW,
  SETTING_SELECT,
  SETTING_TEXT,
  STATS_ROW,
  STAT_CARD,
  STAT_LBL,
  STAT_VAL,
  TOGGLE,
  cx,
} from './styles';

type Stat = { label: string; value?: string; icon?: string };

type SettingBase = { icon: string; label: string; desc: string };
type Setting =
  | (SettingBase & { kind: 'toggle'; on: boolean })
  | (SettingBase & { kind: 'select'; options: readonly string[] });

type PanelCopy = {
  tag: string;
  title: string;
  sub: string;
  section: string;
  stats: readonly Stat[];
  settings: readonly Setting[];
};

const PANEL_COPY: Record<LiveMode, PanelCopy> = {
  video: {
    tag: 'Live Stream',
    title: 'Video Broadcast',
    sub: 'Camera · Audio · HD Quality',
    section: 'Stream Settings',
    stats: [{ label: 'Viewers', value: '0' }, { label: 'Followers', value: '—' }, { label: 'Quality', value: 'HD' }],
    settings: [
      { kind: 'toggle', on: true, icon: 'fa-camera-retro', label: 'Front Camera', desc: 'Selfie camera for face-cam streaming' },
      { kind: 'toggle', on: true, icon: 'fa-microphone', label: 'Microphone', desc: 'Enable audio for your stream' },
      { kind: 'toggle', on: false, icon: 'fa-wand-magic-sparkles', label: 'Beauty Filter', desc: 'Auto-enhance your appearance' },
      { kind: 'select', icon: 'fa-signal', label: 'Stream Quality', desc: 'Higher quality uses more data', options: ['1080p HD', '720p', '480p'] },
      { kind: 'toggle', on: true, icon: 'fa-gift', label: 'Gift Alerts', desc: 'Show on-screen when you receive gifts' },
    ],
  },
  voice: {
    tag: 'Voice Stream',
    title: 'Audio Broadcast',
    sub: 'No camera · Low data · Podcast-style',
    section: 'Audio Settings',
    stats: [{ label: 'Listeners', value: '0' }, { label: 'Audio Only', icon: 'fa-microphone' }, { label: 'Data Use', value: 'LOW' }],
    settings: [
      { kind: 'toggle', on: true, icon: 'fa-microphone', label: 'Microphone', desc: 'Primary audio source' },
      { kind: 'toggle', on: true, icon: 'fa-volume-xmark', label: 'Noise Cancellation', desc: 'Filter background noise out' },
      { kind: 'toggle', on: false, icon: 'fa-headphones', label: 'Background Music', desc: 'Play music behind your voice' },
      { kind: 'select', icon: 'fa-bullhorn', label: 'Audio Quality', desc: 'Higher = better sound, more data', options: ['High (320kbps)', 'Medium (128kbps)', 'Low (64kbps)'] },
      { kind: 'toggle', on: true, icon: 'fa-user-group', label: 'Co-host Invite', desc: 'Allow others to speak on air' },
    ],
  },
  chat: {
    tag: 'Live Chat',
    title: 'Chat Session',
    sub: 'Text-only · Interactive · Polls & Q&A',
    section: 'Chat Settings',
    stats: [{ label: 'Chatters', value: '0' }, { label: 'Text Only', icon: 'fa-comment-dots' }, { label: 'Response', value: 'FAST' }],
    settings: [
      { kind: 'toggle', on: true, icon: 'fa-chart-simple', label: 'Live Polls', desc: 'Let your audience vote in real-time' },
      { kind: 'toggle', on: true, icon: 'fa-circle-question', label: 'Q&A Mode', desc: 'Audience can submit questions' },
      { kind: 'toggle', on: false, icon: 'fa-ban', label: 'Slow Mode', desc: 'Limit messages to one per interval' },
      { kind: 'select', icon: 'fa-clock', label: 'Slow Mode Interval', desc: 'Time between user messages', options: ['3 seconds', '5 seconds', '10 seconds', '30 seconds'] },
      { kind: 'toggle', on: true, icon: 'fa-robot', label: 'Auto-Moderation', desc: 'Filter spam and toxic messages' },
    ],
  },
  gaming: {
    tag: 'Live Gaming',
    title: 'Game Broadcast',
    sub: 'Screen share · Commentary · Leaderboard',
    section: 'Gaming Settings',
    stats: [{ label: 'Viewers', value: '0' }, { label: 'Ranked', icon: 'fa-trophy' }, { label: 'Target', value: '60fps' }],
    settings: [
      { kind: 'toggle', on: true, icon: 'fa-mobile-screen', label: 'Screen Share', desc: 'Broadcast your game screen live' },
      { kind: 'toggle', on: true, icon: 'fa-microphone', label: 'Commentary Mic', desc: 'Your voice over the gameplay' },
      { kind: 'toggle', on: true, icon: 'fa-trophy', label: 'Leaderboard', desc: 'Show top viewer scores on-stream' },
      { kind: 'select', icon: 'fa-bolt', label: 'Frame Rate', desc: 'Higher fps needs stronger connection', options: ['60 fps', '30 fps', '24 fps'] },
      { kind: 'toggle', on: true, icon: 'fa-gift', label: 'In-game Gifts', desc: 'Viewers send gifts during gameplay' },
    ],
  },
};

type Props = {
  mode: LiveMode;
  /** `active`, `exit-left` and the idle state from `switchTab` @1648. */
  state: 'active' | 'idle' | 'exit';
  followers: string;
};

/** One `.panel` @536. */
export function ModePanel({ mode, state, followers }: Props) {
  const style = MODE_STYLE[mode];
  const copy = PANEL_COPY[mode];
  const stateClass = state === 'active' ? PANEL_ACTIVE : state === 'exit' ? PANEL_EXIT_LEFT : PANEL_IDLE;

  return (
    <div className={cx(PANEL, stateClass)} aria-hidden={state !== 'active'}>
      <div className={cx(PANEL_HERO, style.cardBg)}>
        <div className={cx(HERO_BLOB, style.blob)} />
        <div className={cx(HERO_BLOB_2, style.blobSoft)} />
        <div className={HERO_GRID} />
        <i className={cx(HERO_ICON_BIG, MODE_ICON[mode])} />
        <div className={HERO_CONTENT}>
          <div className={cx(HERO_TAG, style.heroTag)}>
            <i className={MODE_ICON[mode]} />
            {copy.tag}
          </div>
          <div className={HERO_TITLE}>{copy.title}</div>
          <div className={HERO_SUB}>{copy.sub}</div>
        </div>
      </div>

      <div className={STATS_ROW}>
        {copy.stats.map((stat, index) => (
          <div className={STAT_CARD} key={stat.label}>
            <div className={STAT_VAL}>
              {stat.icon ? <i className={stat.icon} /> : index === 1 && mode === 'video' ? followers : stat.value}
            </div>
            <div className={STAT_LBL}>{stat.label}</div>
          </div>
        ))}
      </div>

      <div className={SECTION_LABEL}>{copy.section}</div>
      <div className={SETTINGS_LIST}>
        {copy.settings.map((setting) => (
          <div className={SETTING_ROW} key={setting.label}>
            <div className={cx(SETTING_ICON, style.iconBg)}>
              <i className={setting.icon} />
            </div>
            <div className={SETTING_TEXT}>
              <div className={SETTING_LABEL}>{setting.label}</div>
              <div className={SETTING_DESC}>{setting.desc}</div>
            </div>
            {setting.kind === 'toggle' ? (
              <input type="checkbox" className={cx(TOGGLE, style.toggleOn)} defaultChecked={setting.on} />
            ) : (
              <select className={SETTING_SELECT} defaultValue={setting.options[0]}>
                {setting.options.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
