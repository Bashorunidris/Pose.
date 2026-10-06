'use client';

import Image from 'next/image';

/**
 * Legacy `.foryou-loader` @23445 with the markup `showForYouLoader` @39740
 * injects: a shimmering dark backdrop, a purple ring that spins around a static
 * POSE logo, and the wordmark with three bouncing dots.
 */
const LOADER =
  'relative flex h-[100vh] w-full flex-col items-center justify-center gap-[22px] overflow-hidden ' +
  'bg-app-black md:h-full';

/** Two of the three `background-image` layers legacy stacks on `::before`. */
const BACKDROP =
  'absolute inset-0 bg-[#0b0b0b] bg-[linear-gradient(180deg,rgba(168,85,247,0.08),rgba(0,0,0,0)_40%)]';
const BACKDROP_TOP =
  'absolute inset-0 bg-[linear-gradient(0deg,rgba(76,29,149,0.18),rgba(0,0,0,0)_35%)]';

/** `::after` @23467: a 250%-wide highlight sweeping left, `foryouShimmer` @23479. */
const SHIMMER =
  'absolute inset-0 animate-app-foryou-shimmer bg-[linear-gradient(110deg,transparent_30%,rgba(168,85,247,0.1)_45%,rgba(168,85,247,0.18)_50%,rgba(168,85,247,0.1)_55%,transparent_70%)] bg-[size:250%_100%]';

const SPINNER = 'relative z-[2] h-[84px] w-[84px]';
const RING =
  'absolute inset-0 animate-app-foryou-spin rounded-full border-[3px] border-[rgba(168,85,247,0.18)] ' +
  'border-t-[#a855f7] border-r-[#c084fc] shadow-[0_0_24px_rgba(168,85,247,0.35)]';
const LOGO =
  'absolute left-1/2 top-1/2 h-[56px] w-[56px] -translate-x-1/2 -translate-y-1/2 rounded-full ' +
  'bg-[#0b0b0b] object-cover shadow-[0_0_12px_rgba(168,85,247,0.35)]';

/**
 * `.foryou-loader-brand` @23518. Legacy names `'Bebas Neue'` first but never
 * loads it, so Impact is what actually renders there — keep it first here.
 */
const BRAND =
  'relative z-[2] flex animate-app-foryou-pulse items-center gap-[10px] text-[22px] font-black ' +
  'tracking-[6px] text-[#a855f7] [font-family:Impact,"Arial_Black",Arial,sans-serif] ' +
  '[text-shadow:0_2px_14px_rgba(168,85,247,0.5)]';

const DOTS = 'inline-flex gap-[4px]';
const DOT = 'h-[6px] w-[6px] animate-app-foryou-dot rounded-full bg-[#a855f7]';

export function FeedLoader() {
  return (
    <div className={LOADER} role="status" aria-label="Loading videos">
      <div className={BACKDROP} aria-hidden="true" />
      <div className={BACKDROP_TOP} aria-hidden="true" />
      <div className={SHIMMER} aria-hidden="true" />
      <div className={SPINNER}>
        <div className={RING} />
        <Image src="/logo.png" alt="Pose" width={56} height={56} unoptimized className={LOGO} />
      </div>
      <div className={BRAND}>
        POSE
        <span className={DOTS}>
          <span className={DOT} />
          <span className={`${DOT} [animation-delay:150ms]`} />
          <span className={`${DOT} [animation-delay:300ms]`} />
        </span>
      </div>
    </div>
  );
}
