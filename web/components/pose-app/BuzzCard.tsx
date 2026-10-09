'use client';

import { useState } from 'react';

import { cx } from './styles';
import {
  buzzAuthorName,
  buzzIsVideo,
  initials,
  interactionCount,
  normaliseTags,
  relativeTime,
  splitCaptionTokens,
} from '@/lib/pose-app/format';
import { toMillis } from '@/lib/pose-app/feed';
import type { BuzzPost } from '@/lib/pose-app/types';

type Props = {
  post: BuzzPost;
  liked: boolean;
  reposted: boolean;
  hit: boolean;
  passed: boolean;
  onToggleLike: (post: BuzzPost, next: boolean, count: number) => void;
  onToggleRepost: (post: BuzzPost, next: boolean, count: number) => void;
  onToggleHit: (post: BuzzPost, next: boolean) => void;
  onTogglePass: (post: BuzzPost, next: boolean) => void;
  /**
   * `openBuzzUserProfile()` @66368 — the author block opens their profile. The
   * legacy `.buzz-author` row carried `cursor-pointer` for exactly this.
   */
  onOpenAuthor?: (post: BuzzPost) => void;
  /** The tally `updateBuzzCommentCountInUI()` @35714 wrote onto the button. */
  commentCount?: number;
  /** `openBuzzComments()` @33961 — the shell hosts the sheet. */
  onOpenComments?: (post: BuzzPost) => void;
};

const POST = 'border-b border-[#222] bg-app-card p-[20px]';
const USER_INFO = 'mb-[12px] flex items-start justify-between';
const AUTHOR = 'flex cursor-pointer items-start gap-[10px]';
const AVATAR =
  'flex h-[48px] w-[48px] shrink-0 items-center justify-center overflow-hidden rounded-full ' +
  'bg-gradient-to-br from-[#667eea] to-[#764ba2] bg-cover bg-center text-[18px] font-bold text-white';
const USER_NAME = 'text-[15px] font-bold text-white';
const USER_HANDLE = 'text-[13px] text-app-muted';
const VOTE_GROUP =
  'flex items-center gap-[10px] rounded-[8px] border border-white/10 bg-white/5 px-[12px] py-[8px]';
const VOTE_BTN = 'flex cursor-pointer items-center gap-[4px] border-0 bg-transparent text-[13px] transition-all duration-300';
const VOTE_HIT = 'font-semibold text-pose-accent opacity-70 hover:opacity-100';
const VOTE_HIT_ON = 'font-black text-pose-accent opacity-100';
const VOTE_PASS = 'font-semibold text-[#8a5cf0] opacity-70 hover:opacity-100';
const VOTE_PASS_ON = 'font-black text-[#8a5cf0] opacity-100';
const POST_TEXT = 'mb-[12px] text-[15px] leading-[1.5] break-words text-app-sub';
const HASHTAGS = '-mt-[4px] mb-[8px] text-[14px] text-pose-purple-mid';
const TAG = 'text-[#a78bfa]';
const MEDIA_ROW = 'flex w-full items-start gap-[12px]';
const BANNER_AD =
  'flex w-[120px] shrink-0 flex-col items-center justify-center gap-[8px] self-stretch rounded-[8px] ' +
  'bg-gradient-to-br from-[#FF6B6B] to-[#FF8E72] p-[12px] text-center text-[12px] text-white ' +
  'shadow-[0_4px_12px_rgba(0,0,0,0.2)]';
const MEDIA_WRAP = 'min-w-0 flex-1';
const MEDIA = 'mx-auto block max-h-[250px] w-full rounded-[8px] bg-black object-contain';
const INTERACTIONS = 'flex gap-[16px] border-t border-[#222] py-[12px]';
// No text colour lives on BTN: two same-property utilities of equal specificity
// resolve by generated-stylesheet order, not class-attribute order, so an
// additive state class can silently lose. Idle/active must be mutually exclusive.
const BTN =
  'flex cursor-pointer items-center gap-[6px] rounded-[6px] border-0 bg-transparent px-[12px] py-[6px] ' +
  'text-[13px] transition-all duration-300 hover:scale-[1.05] hover:bg-[rgba(76,29,149,0.08)]';
const BTN_IDLE = 'text-app-muted';
const LIKE_BTN = 'text-pose-accent';
const REPOST_BTN = 'text-[#00B060]';

export function BuzzCard({
  post,
  liked,
  reposted,
  hit,
  passed,
  onToggleLike,
  onToggleRepost,
  onToggleHit,
  onTogglePass,
  onOpenAuthor,
  commentCount,
  onOpenComments,
}: Props) {
  const [playing, setPlaying] = useState(false);
  const author = buzzAuthorName(post);
  const avatar = post.userProfilePic ?? '';
  const likes = interactionCount(post.likes, post.likedBy);
  const reposts = interactionCount(post.reposts, post.repostedBy);
  const comments = commentCount ?? post.comments ?? 0;
  const hashtags = normaliseTags(post.hashtags, '#');
  const video = buzzIsVideo(post);
  const hasAudio = Boolean(post.audioUrl);

  return (
    <article className={POST}>
      <div className={USER_INFO}>
        <div
          className={cx(AUTHOR, onOpenAuthor && 'cursor-pointer')}
          onClick={
            onOpenAuthor
              ? (event) => {
                  event.stopPropagation();
                  onOpenAuthor(post);
                }
              : undefined
          }
        >
          <div
            className={AVATAR}
            style={avatar ? { backgroundImage: `url('${avatar}')` } : undefined}
          >
            {avatar ? '' : initials(author)}
          </div>
          <div className="min-w-0">
            <div className={USER_NAME}>{author}</div>
            <div className={USER_HANDLE}>
              @{post.username || 'user'} • {relativeTime(toMillis(post.createdAt))}
            </div>
          </div>
        </div>

        <div className={VOTE_GROUP}>
          <button
            type="button"
            title="Hit!"
            className={cx(VOTE_BTN, hit ? VOTE_HIT_ON : VOTE_HIT)}
            onClick={() => onToggleHit(post, !hit)}
          >
            <i className="fas fa-fire" />
            <span>{post.buzzhit ?? 0}</span>
          </button>
          <div className="h-full w-px bg-white/20" />
          <button
            type="button"
            title="Pass"
            className={cx(VOTE_BTN, passed ? VOTE_PASS_ON : VOTE_PASS)}
            onClick={() => onTogglePass(post, !passed)}
          >
            <i className="fas fa-forward" />
            <span>{post.buzzpass ?? 0}</span>
          </button>
        </div>
      </div>

      <div>
        {post.text && <p className={POST_TEXT}>{post.text}</p>}
        {hashtags && (
          <p className={HASHTAGS}>
            {splitCaptionTokens(hashtags).map((token, index) =>
              token.type === 'tag' ? (
                <span key={`${token.value}-${index}`} className={TAG}>
                  {token.value}{' '}
                </span>
              ) : (
                <span key={`t-${index}`}>{token.value}</span>
              ),
            )}
          </p>
        )}

        {(post.mediaUrl || hasAudio) && (
          <div className={MEDIA_ROW}>
            {post.allowAds && (
              <div className={BANNER_AD}>
                <i className="fas fa-rectangle-ad text-[32px]" />
                <span>BUZZ ADS</span>
                <span className="text-[10px] opacity-80">Advertise here</span>
              </div>
            )}
            <div className={MEDIA_WRAP}>
              {post.mediaUrl && video && (
                <div className="relative mt-[10px] overflow-hidden rounded-[8px] bg-black">
                  <video
                    src={post.mediaUrl}
                    className={MEDIA}
                    playsInline
                    muted={!playing}
                    loop={playing}
                    onPlay={() => setPlaying(true)}
                    onPause={() => setPlaying(false)}
                  />
                  <button
                    type="button"
                    aria-label={playing ? 'Pause' : 'Play'}
                    className={cx(
                      'absolute inset-0 flex items-center justify-center border-0 bg-black/20',
                      playing && 'pointer-events-none opacity-0',
                    )}
                    onClick={() => setPlaying(true)}
                  >
                    <i className="fas fa-play text-[48px] text-white [text-shadow:0_2px_8px_rgba(0,0,0,0.5)]" />
                  </button>
                </div>
              )}

              {post.mediaUrl && !video && !hasAudio && (
                <div className="mt-[10px] overflow-hidden rounded-[8px] bg-black">
                  <img src={post.mediaUrl} alt="Buzz media" loading="eager" className={MEDIA} />
                </div>
              )}

              {post.mediaUrl && !video && hasAudio && (
                <div className="relative mt-[10px] cursor-pointer overflow-hidden rounded-[8px] bg-black">
                  <img
                    src={post.mediaUrl}
                    alt="Buzz media"
                    loading="eager"
                    className={cx(MEDIA, 'h-auto')}
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-[12px] pb-[12px] pt-[30px]">
                    {post.audioName && (
                      <div className="mb-[8px] flex items-center gap-[6px] text-[12px] font-semibold text-white">
                        <i className="fas fa-music" />
                        {post.audioName}
                      </div>
                    )}
                    <audio controls src={post.audioUrl} className="h-[30px] w-full" />
                  </div>
                </div>
              )}

              {!post.mediaUrl && hasAudio && (
                <div className="mt-[10px] rounded-[8px] bg-gradient-to-br from-[#667eea] to-[#764ba2] p-[20px] text-center">
                  <i className="fas fa-music mb-[10px] block text-[40px] text-white" />
                  {post.audioName && (
                    <div className="mb-[12px] flex items-center justify-center gap-[6px] font-semibold text-white">
                      <i className="fas fa-music" />
                      {post.audioName}
                    </div>
                  )}
                  <audio controls src={post.audioUrl} className="mt-[10px] w-full" />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className={INTERACTIONS}>
        <button
          type="button"
          title="Like"
          className={cx(BTN, liked ? LIKE_BTN : BTN_IDLE)}
          onClick={() => onToggleLike(post, !liked, liked ? Math.max(0, likes - 1) : likes + 1)}
        >
          <i className={cx('fas fa-heart', liked && 'font-black')} />
          <span>{likes}</span>
        </button>

        {/* `buzz.allowComments` gated this button entirely in the legacy row. */}
        {onOpenComments && post.allowComments !== false && (
          <button
            type="button"
            title="Reply"
            className={cx(BTN, BTN_IDLE)}
            onClick={() => onOpenComments(post)}
          >
            <i className="fas fa-comment" />
            <span>{comments}</span>
          </button>
        )}

        <button
          type="button"
          title="Repost"
          className={cx(BTN, reposted ? REPOST_BTN : BTN_IDLE)}
          onClick={() =>
            onToggleRepost(post, !reposted, reposted ? Math.max(0, reposts - 1) : reposts + 1)
          }
        >
          <i className={cx('fas fa-retweet', reposted && 'font-black')} />
          <span>{reposts}</span>
        </button>
      </div>
    </article>
  );
}
