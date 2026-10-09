'use client';

import { useCallback, useEffect, useState } from 'react';

import type { PoseVideo } from '@/lib/pose-app/types';
import {
  PLAYBACK_SPEEDS,
  REPORT_REASONS,
  blockContent,
  blockUser,
  downloadVideo,
  loadShareFriends,
  markNotInterested,
  sendVideoToFriend,
  shareTargetUrl,
  submitVideoReport,
  videoShareLink,
  type ReportTarget,
  type ShareFriend,
} from '@/lib/pose-app/video-actions';

/** `#shareMenu` @72942 and the four TikTok-style sheets @73040. */
type Sheet = 'share' | 'block' | 'speed' | 'report' | 'reasons' | 'friends';

type Props = {
  open: boolean;
  video: PoseVideo;
  uid: string | null;
  email: string | null;
  displayName: string;
  /** The card's live playback rate, so the sheet can tick the current row. */
  rate: number;
  onRateChange: (rate: number) => void;
  onClose: () => void;
  onToast: (message: string) => void;
  /** Drops the post from the feed after a block or a "not interested". */
  onHide: () => void;
};

const OVERLAY =
  'fixed inset-0 z-[1100] bg-black/55';
/** `.action-sheet` @12056 — slides up 0.28s; `app-slide-up` is the same motion. */
const SHEET =
  'fixed inset-x-0 bottom-0 z-[1101] max-h-[80vh] overflow-y-auto rounded-t-[18px] bg-[#1a1a1a] px-[16px] pb-[24px] pt-[8px] animate-app-slide-up';
const SHARE_MENU =
  'fixed inset-x-0 bottom-0 z-[10002] max-h-[80vh] overflow-y-auto rounded-t-[20px] bg-black animate-app-slide-up';
const SHARE_ITEM = 'flex cursor-pointer flex-col items-center gap-[8px] text-white transition-all duration-200 hover:opacity-80';
const SHARE_ICON =
  'flex h-[50px] w-[50px] items-center justify-center rounded-full border-2 text-[24px] transition-all duration-200';
const SHEET_BTN =
  'mb-[10px] flex w-full cursor-pointer items-center gap-[14px] rounded-[12px] border-none bg-[#262626] px-[16px] py-[14px] text-left text-white transition-colors duration-150 hover:bg-[#333]';
const SHEET_CANCEL =
  'mt-[8px] block w-full cursor-pointer rounded-[12px] border-none bg-[#262626] px-[16px] py-[14px] text-[15px] font-semibold text-white transition-colors duration-150 hover:bg-[#333]';

const ICONS: Record<string, string> = {
  whatsapp: 'bg-[#25D366]/20 border-[#25D366]/30 text-[#25D366]',
  telegram: 'bg-[#0088cc]/20 border-[#0088cc]/30 text-[#0088cc]',
  twitter: 'bg-[#1DA1F2]/20 border-[#1DA1F2]/30 text-[#1DA1F2]',
  facebook: 'bg-[#3b5998]/20 border-[#3b5998]/30 text-[#3b5998]',
  copy: 'bg-[#64b5f6]/20 border-[#64b5f6]/30 text-[#64b5f6]',
  save: 'bg-[#FFC107]/20 border-[#FFC107]/30 text-[#FFC107]',
  friends: 'bg-[#9c27b0]/20 border-[#9c27b0]/30 text-[#9c27b0]',
  block: 'bg-[#f44336]/20 border-[#f44336]/30 text-[#f44336]',
  speed: 'bg-[#2196f3]/20 border-[#2196f3]/30 text-[#2196f3]',
  report: 'bg-[#f44336]/20 border-[#f44336]/30 text-[#f44336]',
  notInterested: 'bg-[#9e9e9e]/20 border-[#9e9e9e]/30 text-[#bdbdbd]',
};

/**
 * `openShareMenu()` @65504 plus the Block, Playback Speed, Report and
 * Report-Reasons sheets that hang off it.
 *
 * The legacy page kept one share menu and one copy of each sheet in the DOM and
 * pointed them at `currentVideoToShare`; each card carries its own here, which is
 * what makes the playback rate per-clip rather than global.
 */
export function VideoActionSheets({
  open,
  video,
  uid,
  email,
  displayName,
  rate,
  onRateChange,
  onClose,
  onToast,
  onHide,
}: Props) {
  const [sheet, setSheet] = useState<Sheet>('share');
  const [reportTarget, setReportTarget] = useState<ReportTarget>('video');
  const [friends, setFriends] = useState<ShareFriend[] | null>(null);

  // Opening the menu always lands on the share root, not on the sheet that was
  // left open last time.
  useEffect(() => {
    if (!open) return;
    void Promise.resolve().then(() => {
      setSheet('share');
      setFriends(null);
    });
  }, [open]);

  const loadFriends = useCallback(async () => {
    if (!uid) return;
    try {
      setFriends(await loadShareFriends(uid));
    } catch (error) {
      console.error('❌ loading the friends list:', error);
      setFriends([]);
    }
  }, [uid]);

  useEffect(() => {
    if (!open || sheet !== 'friends') return;
    void Promise.resolve().then(() => loadFriends());
  }, [open, sheet, loadFriends]);

  if (!open) return null;

  const link = videoShareLink(video.caption, video.id);

  const shareTo = (target: 'whatsapp' | 'telegram' | 'twitter' | 'facebook') => {
    window.open(shareTargetUrl(target, link), '_blank');
    onClose();
  };

  /** `copyShareLink()` @65847. */
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(link);
      onToast('Video link copied to clipboard!');
      onClose();
    } catch {
      onToast('Failed to copy link');
    }
  };

  /** `saveVideo()` @65913 — the bookmark icon downloads the clip with the watermark. */
  const save = async () => {
    if (!uid) {
      onToast('Please login to save videos');
      return;
    }
    if (!video.videoUrl) {
      onToast('Video not found');
      return;
    }
    onToast('Preparing download...');
    onClose();
    try {
      await downloadVideo(video);
      onToast('Video downloaded!');
    } catch (error) {
      console.error('❌ downloading the video:', error);
      onToast('Failed to download video');
    }
  };

  const confirmBlockUser = async () => {
    if (!uid) {
      onToast('Please sign in first');
      return;
    }
    try {
      const isNew = await blockUser(uid, video);
      onToast(isNew ? "User blocked. You won't see their videos again." : 'User is already blocked');
      onClose();
      onHide();
    } catch (error) {
      console.error('❌ blocking the user:', error);
      onToast('Unable to block user');
    }
  };

  const confirmBlockContent = async () => {
    if (!uid) {
      onToast('Please sign in first');
      return;
    }
    try {
      const isNew = await blockContent(uid, video);
      onToast(isNew ? "Content blocked. It won't appear again." : 'Content already blocked');
      onClose();
      onHide();
    } catch (error) {
      console.error('❌ blocking the content:', error);
      onToast('Unable to block content');
    }
  };

  const notInterested = async () => {
    if (!uid) {
      onToast('Please sign in first');
      return;
    }
    try {
      const isNew = await markNotInterested(uid, video);
      onToast(isNew ? "Got it. We'll show you fewer videos like this." : 'Already marked as not interested');
      onClose();
      onHide();
    } catch (error) {
      console.error('❌ marking not interested:', error);
      onToast('Could not save that');
    }
  };

  const report = async (reason: string) => {
    try {
      await submitVideoReport({ uid, email }, reportTarget, video, reason);
      onToast('Thanks for letting us know. Our team will review.');
    } catch (error) {
      console.error('❌ submitting the report:', error);
      onToast('Could not submit the report');
    }
    onClose();
  };

  const sendToFriend = async (friend: ShareFriend) => {
    if (!uid) return;
    try {
      await sendVideoToFriend({ uid, displayName }, video, friend);
      onToast('Shared!');
    } catch (error) {
      console.error('❌ sharing with a friend:', error);
      onToast('Failed to send. Try again.');
    }
    onClose();
  };

  return (
    <>
      {sheet === 'share' ? (
        <div className={SHARE_MENU}>
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-black px-[20px] py-[15px]">
            <h4 className="m-0 text-[16px] font-semibold text-white">Share to</h4>
            <button
              type="button"
              className="flex h-[30px] w-[30px] cursor-pointer items-center justify-center border-none bg-none p-0 text-[20px] text-white hover:opacity-70"
              onClick={onClose}
              aria-label="Close"
            >
              <i className="fas fa-times" />
            </button>
          </div>

          <div className="p-[20px]">
            <div className="mb-[30px] grid grid-cols-4 gap-[20px]">
              <button type="button" className={SHARE_ITEM} onClick={() => shareTo('whatsapp')}>
                <span className={`${SHARE_ICON} ${ICONS.whatsapp}`}><i className="fab fa-whatsapp" /></span>
                <span className="text-[12px]">WhatsApp</span>
              </button>
              <button type="button" className={SHARE_ITEM} onClick={() => shareTo('telegram')}>
                <span className={`${SHARE_ICON} ${ICONS.telegram}`}><i className="fab fa-telegram" /></span>
                <span className="text-[12px]">Telegram</span>
              </button>
              <button type="button" className={SHARE_ITEM} onClick={() => shareTo('twitter')}>
                <span className={`${SHARE_ICON} ${ICONS.twitter}`}><i className="fab fa-twitter" /></span>
                <span className="text-[12px]">Twitter</span>
              </button>
              <button type="button" className={SHARE_ITEM} onClick={() => shareTo('facebook')}>
                <span className={`${SHARE_ICON} ${ICONS.facebook}`}><i className="fab fa-facebook" /></span>
                <span className="text-[12px]">Facebook</span>
              </button>
            </div>

            <div className="mb-[30px] grid grid-cols-4 gap-[20px]">
              <button type="button" className={SHARE_ITEM} onClick={() => void copyLink()}>
                <span className={`${SHARE_ICON} ${ICONS.copy}`}><i className="fas fa-link" /></span>
                <span className="text-[12px]">Copy Link</span>
              </button>
              <button type="button" className={SHARE_ITEM} onClick={() => void save()}>
                <span className={`${SHARE_ICON} ${ICONS.save}`}><i className="fas fa-bookmark" /></span>
                <span className="text-[12px]">Save</span>
              </button>
              <button type="button" className={SHARE_ITEM} onClick={() => setSheet('friends')}>
                <span className={`${SHARE_ICON} ${ICONS.friends}`}><i className="fas fa-users" /></span>
                <span className="text-[12px]">Friends</span>
              </button>
            </div>

            <div className="grid grid-cols-4 gap-[20px]">
              <button type="button" className={SHARE_ITEM} onClick={() => setSheet('block')}>
                <span className={`${SHARE_ICON} ${ICONS.block}`}><i className="fas fa-ban" /></span>
                <span className="text-[12px]">Block</span>
              </button>
              <button type="button" className={SHARE_ITEM} onClick={() => setSheet('speed')}>
                <span className={`${SHARE_ICON} ${ICONS.speed}`}><i className="fas fa-tachometer-alt" /></span>
                <span className="text-[12px]">Playback</span>
              </button>
              <button type="button" className={SHARE_ITEM} onClick={() => setSheet('report')}>
                <span className={`${SHARE_ICON} ${ICONS.report}`}><i className="fas fa-flag" /></span>
                <span className="text-[12px]">Report</span>
              </button>
              <button type="button" className={SHARE_ITEM} onClick={() => void notInterested()}>
                <span className={`${SHARE_ICON} ${ICONS.notInterested}`}><i className="fas fa-thumbs-down" /></span>
                <span className="text-[12px]">Not Interested</span>
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {sheet === 'block' ? (
        <>
          <div className={OVERLAY} onClick={onClose} />
          <div className={SHEET}>
            <div className="mx-auto mb-[12px] mt-[6px] h-[4px] w-[40px] rounded-[4px] bg-white/25" />
            <div className="mb-[4px] text-center text-[18px] font-bold text-white">Block</div>
            <div className="mb-[16px] text-center text-[13px] text-white/60">What would you like to block?</div>
            <button type="button" className={SHEET_BTN} onClick={() => void confirmBlockUser()}>
              <i className="fas fa-user-slash w-[28px] shrink-0 text-center text-[22px] text-[#f44336]" />
              <div className="min-w-0 flex-1">
                <div className="text-[15px] font-semibold text-white">Block this user</div>
                <div className="mt-[2px] text-[12px] leading-[1.3] text-white/60">
                  Their videos won&apos;t appear on your For You page.
                </div>
              </div>
            </button>
            <button type="button" className={SHEET_BTN} onClick={() => void confirmBlockContent()}>
              <i className="fas fa-eye-slash w-[28px] shrink-0 text-center text-[22px] text-[#bb86fc]" />
              <div className="min-w-0 flex-1">
                <div className="text-[15px] font-semibold text-white">Block this content</div>
                <div className="mt-[2px] text-[12px] leading-[1.3] text-white/60">
                  This video won&apos;t appear on your For You page again.
                </div>
              </div>
            </button>
            <button type="button" className={SHEET_CANCEL} onClick={onClose}>Cancel</button>
          </div>
        </>
      ) : null}

      {sheet === 'speed' ? (
        <>
          <div className={OVERLAY} onClick={onClose} />
          <div className={SHEET}>
            <div className="mx-auto mb-[12px] mt-[6px] h-[4px] w-[40px] rounded-[4px] bg-white/25" />
            <div className="mb-[4px] text-center text-[18px] font-bold text-white">Playback Speed</div>
            <div className="mb-[16px]" />
            {PLAYBACK_SPEEDS.map((option) => (
              <button
                key={option.rate}
                type="button"
                className={`w-full cursor-pointer border-b border-white/[0.06] bg-transparent px-[8px] py-[14px] text-center text-[16px] font-medium transition-colors duration-150 last:border-b-0 hover:bg-white/5 ${
                  option.rate === rate ? 'font-bold text-[#bb86fc]' : 'text-white'
                }`}
                onClick={() => {
                  onRateChange(option.rate);
                  onToast(`Playback speed: ${option.rate}x`);
                  onClose();
                }}
              >
                {option.label}
              </button>
            ))}
            <button type="button" className={SHEET_CANCEL} onClick={onClose}>Cancel</button>
          </div>
        </>
      ) : null}

      {sheet === 'report' ? (
        <>
          <div className={OVERLAY} onClick={onClose} />
          <div className={SHEET}>
            <div className="mx-auto mb-[12px] mt-[6px] h-[4px] w-[40px] rounded-[4px] bg-white/25" />
            <div className="mb-[4px] text-center text-[18px] font-bold text-white">Report</div>
            <div className="mb-[16px] text-center text-[13px] text-white/60">What are you reporting?</div>
            <button
              type="button"
              className={SHEET_BTN}
              onClick={() => {
                setReportTarget('video');
                setSheet('reasons');
              }}
            >
              <i className="fas fa-video w-[28px] shrink-0 text-center text-[22px] text-[#bb86fc]" />
              <div className="min-w-0 flex-1">
                <div className="text-[15px] font-semibold text-white">Report this video</div>
                <div className="mt-[2px] text-[12px] leading-[1.3] text-white/60">
                  Inappropriate, misleading or harmful content.
                </div>
              </div>
            </button>
            <button
              type="button"
              className={SHEET_BTN}
              onClick={() => {
                setReportTarget('user');
                setSheet('reasons');
              }}
            >
              <i className="fas fa-user-shield w-[28px] shrink-0 text-center text-[22px] text-[#bb86fc]" />
              <div className="min-w-0 flex-1">
                <div className="text-[15px] font-semibold text-white">Report this user</div>
                <div className="mt-[2px] text-[12px] leading-[1.3] text-white/60">
                  Account-level violations or impersonation.
                </div>
              </div>
            </button>
            <button type="button" className={SHEET_CANCEL} onClick={onClose}>Cancel</button>
          </div>
        </>
      ) : null}

      {sheet === 'reasons' ? (
        <>
          <div className={OVERLAY} onClick={onClose} />
          <div className={SHEET}>
            <div className="mx-auto mb-[12px] mt-[6px] h-[4px] w-[40px] rounded-[4px] bg-white/25" />
            <div className="mb-[4px] text-center text-[18px] font-bold text-white">
              {reportTarget === 'user' ? 'Report user' : 'Report video'}
            </div>
            <div className="mb-[16px] text-center text-[13px] text-white/60">
              Choose a reason. Reports are anonymous.
            </div>
            {REPORT_REASONS.map((reason) => (
              <button
                key={reason}
                type="button"
                className="flex w-full cursor-pointer items-center justify-between border-b border-white/[0.06] bg-transparent px-[4px] py-[14px] text-left text-[15px] text-white transition-colors duration-150 last:border-b-0 hover:bg-white/[0.04]"
                onClick={() => void report(reason)}
              >
                {reason}
                <i className="fas fa-chevron-right text-[12px] text-white/40" />
              </button>
            ))}
            <button type="button" className={SHEET_CANCEL} onClick={onClose}>Cancel</button>
          </div>
        </>
      ) : null}

      {sheet === 'friends' ? (
        <>
          <div className={OVERLAY} onClick={onClose} />
          <div className={`${SHEET} flex flex-col`}>
            <div className="mx-auto mb-[12px] mt-[6px] h-[4px] w-[40px] rounded-[4px] bg-white/25" />
            <div className="mb-[8px] flex items-center justify-between border-b border-white/[0.07] px-[6px] pb-[8px]">
              <span className="text-[15px] font-bold text-white">Send to Friends</span>
              <button
                type="button"
                className="cursor-pointer border-none bg-none p-[4px] text-[18px] leading-none text-[#777]"
                onClick={onClose}
                aria-label="Close"
              >
                <i className="fas fa-times" />
              </button>
            </div>
            <div className="min-h-[120px] overflow-y-auto p-[8px_4px_16px]">
              {!uid ? (
                <div className="p-[28px] text-center text-[13px] text-[#555]">
                  Log in to share with friends
                </div>
              ) : friends === null ? (
                <div className="p-[28px] text-center text-[#555]">
                  <i className="fas fa-spinner fa-spin" />
                </div>
              ) : friends.length === 0 ? (
                <div className="p-[36px_20px] text-center text-[13px] leading-[1.6] text-[#555]">
                  No recent conversations.
                  <br />
                  Message someone from their profile first!
                </div>
              ) : (
                friends.map((friend) => (
                  <div
                    key={friend.uid}
                    className="flex cursor-pointer items-center gap-[12px] rounded-[12px] p-[10px_6px] transition-colors duration-150 hover:bg-white/5"
                  >
                    {friend.pic ? (
                      <span
                        className="h-[44px] w-[44px] shrink-0 rounded-full bg-cover bg-center"
                        style={{ backgroundImage: `url('${friend.pic}')` }}
                      />
                    ) : (
                      <span className="flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-full bg-[#3a1d6e] text-[18px] font-bold text-[#bb86fc]">
                        {(friend.name[0] || 'U').toUpperCase()}
                      </span>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="mb-[2px] text-[14px] font-semibold text-white">{friend.name}</div>
                      {friend.lastMessage ? (
                        <span className="block max-w-[180px] truncate text-[11px] text-[#555]">
                          {friend.lastMessage}
                        </span>
                      ) : null}
                    </div>
                    <button
                      type="button"
                      className="shrink-0 cursor-pointer rounded-[20px] border-none bg-gradient-to-br from-[#a855f7] to-[#7c3aed] px-[18px] py-[7px] text-[12px] font-bold text-white transition-opacity duration-200"
                      onClick={() => void sendToFriend(friend)}
                    >
                      Send
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      ) : null}
    </>
  );
}
