'use client';

import { useRef, useState } from 'react';

import type { LiveMode } from '@/lib/pose-live/types';
import {
  BACK_BTN,
  BTN_DOT,
  BTN_SHIMMER,
  COIN_INPUT,
  COIN_PREFIX,
  COIN_WRAP,
  GO_LIVE_BTN,
  GO_LIVE_SHEEN,
  GO_LIVE_WRAP,
  LIVE_PILL,
  MODE_ICON,
  MODE_STYLE,
  PRIVACY_ICON,
  PRIVACY_LABEL,
  PRIVACY_OPT,
  PRIVACY_OPT_IDLE,
  PRIVACY_OPT_PRIVATE,
  PRIVACY_OPT_PUBLIC,
  PRIVACY_SUB,
  PULSE_DOT,
  SETTING_ICON,
  SETUP_FIELD,
  SETUP_FIELD_BODY,
  SETUP_FIELD_DESC,
  SETUP_FIELD_LABEL,
  SETUP_FIELD_ROW,
  SETUP_FOOTNOTE,
  SETUP_INPUT,
  SETUP_SCROLL,
  SETUP_SECTION_TITLE,
  SETUP_TOGGLE_INFO,
  SETUP_TOGGLE_ROW,
  TIMER_CHIP,
  TIMER_CHIP_IDLE,
  TOGGLE,
  TOPBAR,
  TOPBAR_H1_SMALL,
  TOPBAR_P,
  TOPBAR_TITLE,
  cx,
} from './styles';

export type SetupMode = Extract<LiveMode, 'voice' | 'chat'>;

export type SetupPayload = {
  mode: SetupMode;
  roomName: string;
  streamTitle: string;
  privacy: 'public' | 'private';
  allowImages: boolean;
  allowVideos: boolean;
  allowDonations: boolean;
  minDonation: string;
  subAmount: string;
  followerTarget: string;
  timer: string;
};

const MODE_LABEL: Record<SetupMode, string> = { voice: 'VOICE', chat: 'CHAT' };
const MODE_TITLE: Record<SetupMode, string> = { voice: 'Set Up Voice Live', chat: 'Set Up Chat Live' };
const TIMER_OPTIONS = [
  { value: '30m', label: '30 min' },
  { value: '1h', label: '1 hour' },
  { value: '2h', label: '2 hours' },
  { value: '3h', label: '3 hours' },
  { value: 'no-limit', label: 'No limit' },
] as const;

type Props = {
  mode: SetupMode;
  onBack: () => void;
  onLaunch: (payload: SetupPayload) => void;
  onWarn: (message: string) => void;
};

/** `#page-setup` @1406 — the pre-broadcast form. */
export function SetupPage({ mode, onBack, onLaunch, onWarn }: Props) {
  const style = MODE_STYLE[mode];
  const roomRef = useRef<HTMLInputElement | null>(null);

  const [roomName, setRoomName] = useState('');
  const [streamTitle, setStreamTitle] = useState('');
  const [privacy, setPrivacy] = useState<'public' | 'private'>('public');
  const [allowImages, setAllowImages] = useState(true);
  const [allowVideos, setAllowVideos] = useState(false);
  const [allowDonations, setAllowDonations] = useState(true);
  const [minDonation, setMinDonation] = useState('');
  const [subAmount, setSubAmount] = useState('');
  const [followerTarget, setFollowerTarget] = useState('');
  const [timer, setTimer] = useState('no-limit');

  function launch() {
    if (!roomName.trim()) {
      onWarn('Please enter a room name');
      roomRef.current?.focus();
      return;
    }
    onLaunch({
      mode,
      roomName: roomName.trim(),
      streamTitle: streamTitle.trim(),
      privacy,
      allowImages,
      allowVideos,
      allowDonations,
      minDonation: minDonation || '0',
      subAmount: subAmount || '0',
      followerTarget: followerTarget || '0',
      timer,
    });
  }

  return (
    <>
      <div className={TOPBAR}>
        <button type="button" className={BACK_BTN} onClick={onBack} title="Back to Go Live">
          <svg className="h-[22px] w-[22px] fill-none stroke-white stroke-[2.5] [stroke-linecap:round] [stroke-linejoin:round]" viewBox="0 0 24 24">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <div className={TOPBAR_TITLE}>
          <h1 className={TOPBAR_H1_SMALL}>{MODE_TITLE[mode]}</h1>
          <p className={TOPBAR_P}>Configure your session before going live</p>
        </div>
        <div className={LIVE_PILL(style)}>
          <div className={PULSE_DOT} />
          {MODE_LABEL[mode]}
        </div>
      </div>

      <div className={SETUP_SCROLL}>
        <div className={SETUP_SECTION_TITLE}>Room Info</div>

        <div className={SETUP_FIELD}>
          <div className={SETUP_FIELD_ROW}>
            <div className={cx(SETTING_ICON, style.iconBg)}>
              <i className={MODE_ICON[mode]} />
            </div>
            <div className={SETUP_FIELD_BODY}>
              <div className={SETUP_FIELD_LABEL}>Room Name</div>
              <div className={SETUP_FIELD_DESC}>What viewers will see at the top</div>
            </div>
          </div>
          <input
            ref={roomRef}
            className={SETUP_INPUT}
            type="text"
            maxLength={60}
            placeholder="e.g. Sunday Vibes with Kemi"
            value={roomName}
            onChange={(event) => setRoomName(event.target.value)}
          />
        </div>

        <div className={SETUP_FIELD}>
          <div className={SETUP_FIELD_ROW}>
            <div className={cx(SETTING_ICON, style.iconBg)}>
              <i className="fa-solid fa-pen-to-square" />
            </div>
            <div className={SETUP_FIELD_BODY}>
              <div className={SETUP_FIELD_LABEL}>Stream Title / Description</div>
              <div className={SETUP_FIELD_DESC}>Tell people what the session is about</div>
            </div>
          </div>
          <input
            className={SETUP_INPUT}
            type="text"
            maxLength={120}
            placeholder="e.g. Late night Q&A — drop your questions!"
            value={streamTitle}
            onChange={(event) => setStreamTitle(event.target.value)}
          />
        </div>

        <div className={SETUP_SECTION_TITLE}>Privacy</div>

        <div className={SETUP_FIELD}>
          <div className={SETUP_FIELD_LABEL}>Who can join?</div>
          <div className={SETUP_FIELD_DESC}>Private rooms require your approval to enter</div>
          <div className="mt-[10px] flex gap-[10px]">
            <div
              className={cx(PRIVACY_OPT, privacy === 'public' ? PRIVACY_OPT_PUBLIC : PRIVACY_OPT_IDLE)}
              role="button"
              tabIndex={0}
              onClick={() => setPrivacy('public')}
              onKeyDown={(event) => event.key === 'Enter' && setPrivacy('public')}
            >
              <div className={PRIVACY_ICON}>
                <i className="fa-solid fa-earth-africa" />
              </div>
              <div className={PRIVACY_LABEL}>Public</div>
              <div className={PRIVACY_SUB}>Anyone can join</div>
            </div>
            <div
              className={cx(PRIVACY_OPT, privacy === 'private' ? PRIVACY_OPT_PRIVATE : PRIVACY_OPT_IDLE)}
              role="button"
              tabIndex={0}
              onClick={() => setPrivacy('private')}
              onKeyDown={(event) => event.key === 'Enter' && setPrivacy('private')}
            >
              <div className={PRIVACY_ICON}>
                <i className="fa-solid fa-lock" />
              </div>
              <div className={PRIVACY_LABEL}>Private</div>
              <div className={PRIVACY_SUB}>You approve requests</div>
            </div>
          </div>
        </div>

        <div className={SETUP_SECTION_TITLE}>Chat Permissions</div>

        <div className={SETUP_FIELD}>
          <div className={SETUP_TOGGLE_ROW}>
            <div className={cx(SETTING_ICON, style.iconBg)}>
              <i className="fa-solid fa-image" />
            </div>
            <div className={SETUP_TOGGLE_INFO}>
              <div className={SETUP_FIELD_LABEL}>Images in Chat</div>
              <div className={SETUP_FIELD_DESC}>Allow viewers to send images</div>
            </div>
            <input
              type="checkbox"
              className={cx(TOGGLE, style.toggleOn)}
              checked={allowImages}
              onChange={(event) => setAllowImages(event.target.checked)}
            />
          </div>
        </div>

        <div className={SETUP_FIELD}>
          <div className={SETUP_TOGGLE_ROW}>
            <div className={cx(SETTING_ICON, style.iconBg)}>
              <i className="fa-solid fa-film" />
            </div>
            <div className={SETUP_TOGGLE_INFO}>
              <div className={SETUP_FIELD_LABEL}>Videos in Chat</div>
              <div className={SETUP_FIELD_DESC}>Allow viewers to send video clips</div>
            </div>
            <input
              type="checkbox"
              className={cx(TOGGLE, style.toggleOn)}
              checked={allowVideos}
              onChange={(event) => setAllowVideos(event.target.checked)}
            />
          </div>
        </div>

        <div className={SETUP_SECTION_TITLE}>Monetisation</div>

        <div className={SETUP_FIELD}>
          <div className={SETUP_TOGGLE_ROW}>
            <div className={cx(SETTING_ICON, style.iconBg)}>
              <i className="fa-solid fa-coins" />
            </div>
            <div className={SETUP_TOGGLE_INFO}>
              <div className={SETUP_FIELD_LABEL}>Allow Donations</div>
              <div className={SETUP_FIELD_DESC}>Viewers can send Pose Coins to you</div>
            </div>
            <input
              type="checkbox"
              className={cx(TOGGLE, style.toggleOn)}
              checked={allowDonations}
              onChange={(event) => setAllowDonations(event.target.checked)}
            />
          </div>
        </div>

        {allowDonations && (
          <div className={SETUP_FIELD}>
            <div className={SETUP_FIELD_ROW}>
              <div className={cx(SETTING_ICON, style.iconBg)}>
                <i className="fa-solid fa-coins" />
              </div>
              <div className={SETUP_FIELD_BODY}>
                <div className={SETUP_FIELD_LABEL}>Minimum Donation</div>
                <div className={SETUP_FIELD_DESC}>Least amount a viewer can donate</div>
              </div>
            </div>
            <div className={COIN_WRAP}>
              <div className={COIN_PREFIX}>PC</div>
              <input
                className={COIN_INPUT}
                type="number"
                min={1}
                placeholder="e.g. 50"
                value={minDonation}
                onChange={(event) => setMinDonation(event.target.value)}
              />
            </div>
          </div>
        )}

        <div className={SETUP_FIELD}>
          <div className={SETUP_FIELD_ROW}>
            <div className={cx(SETTING_ICON, style.iconBg)}>
              <i className="fa-solid fa-star" />
            </div>
            <div className={SETUP_FIELD_BODY}>
              <div className={SETUP_FIELD_LABEL}>Fan Subscription Amount</div>
              <div className={SETUP_FIELD_DESC}>Monthly Pose Coins fans pay to subscribe</div>
            </div>
          </div>
          <div className={COIN_WRAP}>
            <div className={COIN_PREFIX}>PC</div>
            <input
              className={COIN_INPUT}
              type="number"
              min={1}
              placeholder="e.g. 200"
              value={subAmount}
              onChange={(event) => setSubAmount(event.target.value)}
            />
          </div>
        </div>

        <div className={SETUP_SECTION_TITLE}>Goals</div>

        <div className={SETUP_FIELD}>
          <div className={SETUP_FIELD_ROW}>
            <div className={cx(SETTING_ICON, style.iconBg)}>
              <i className="fa-solid fa-user-group" />
            </div>
            <div className={SETUP_FIELD_BODY}>
              <div className={SETUP_FIELD_LABEL}>Follower Target</div>
              <div className={SETUP_FIELD_DESC}>Goal shown on your stream progress bar</div>
            </div>
          </div>
          <input
            className={SETUP_INPUT}
            type="number"
            min={1}
            placeholder="e.g. 1000"
            value={followerTarget}
            onChange={(event) => setFollowerTarget(event.target.value)}
          />
        </div>

        <div className={SETUP_SECTION_TITLE}>Session Timer</div>

        <div className={SETUP_FIELD}>
          <div className={SETUP_FIELD_LABEL}>Auto-end after</div>
          <div className={SETUP_FIELD_DESC}>Stream ends automatically when timer runs out</div>
          {/* `.timer-row` @537 — a wrap of chips, not the vertical settings list. */}
          <div className="mt-[10px] flex flex-wrap gap-[8px]">
            {TIMER_OPTIONS.map((option) => (
              <div
                key={option.value}
                className={cx(TIMER_CHIP, timer === option.value ? style.timerOn : TIMER_CHIP_IDLE)}
                role="button"
                tabIndex={0}
                onClick={() => setTimer(option.value)}
                onKeyDown={(event) => event.key === 'Enter' && setTimer(option.value)}
              >
                {option.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={GO_LIVE_WRAP}>
        <button type="button" className={cx(GO_LIVE_BTN, style.cta)} onClick={launch}>
          <div className={GO_LIVE_SHEEN} />
          <div className={BTN_SHIMMER} />
          <div className={BTN_DOT} />
          <i className={cx('relative z-[1]', MODE_ICON[mode])} />
          <span className="relative z-[1]">Go Live Now</span>
        </button>
        <div className={SETUP_FOOTNOTE}>Your room will be visible to others once you go live</div>
      </div>
    </>
  );
}
