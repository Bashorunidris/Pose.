'use client';

import { SPONSORED_BADGE, TR } from './styles';

type Props = {
  badge: string;
  title: string;
  description: string;
  action: string;
  onAction: () => void;
  className?: string;
};

export function BannerAd({ badge, title, description, action, onAction, className = '' }: Props) {
  return (
    <div
      className={`[grid-column:1/-1] bg-gradient-to-br from-[#0d2219] to-[#0a1a12] border border-[rgba(29,185,84,.18)] rounded-music-lg py-[18px] px-[22px] flex items-center justify-between gap-[14px] ${className}`}
    >
      <div className="flex items-center gap-[13px]">
        <span className={SPONSORED_BADGE}>{badge}</span>
        <div>
          <h4 className="text-[14.5px] font-semibold mb-[2px]">{title}</h4>
          <p className="text-[11.5px] text-music-ink-soft">{description}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={onAction}
        className={`bg-music-green text-black border-none py-[8px] px-[18px] rounded-[40px] font-bold text-[12px] cursor-pointer font-body whitespace-nowrap ${TR} hover:bg-music-green-bright hover:scale-[1.03]`}
      >
        {action}
      </button>
    </div>
  );
}
