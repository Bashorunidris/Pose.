'use client';

import { initialsOf } from '@/lib/pose-live/live-sessions';
import { clockLabel, rankIcon } from '@/lib/pose-live/room';
import type { GiftEntry, LeaderboardRow, MoneyEntry } from '@/lib/pose-live/use-host-room';

function EmptyMini({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="empty-mini">
      <div className="empty-mini-icon">
        <i className={icon} />
      </div>
      <div className="empty-mini-text">{text}</div>
    </div>
  );
}

type Props = {
  active: boolean;
  leaderboard: LeaderboardRow[];
  gifts: GiftEntry[];
  donations: MoneyEntry[];
  subs: MoneyEntry[];
  subAmount: number;
};

/** `#gifts-panel` @667 — leaderboard, gift feed, donations and subscriptions. */
export function GiftsPanel({ active, leaderboard, gifts, donations, subs, subAmount }: Props) {
  return (
    <div className={`tab-panel${active ? ' active' : ''}`} id="gifts-panel">
      <div className="gifts-scroll">
        <div className="gifts-section-title">
          <i className="fa-solid fa-trophy mr-[6px]" />
          Top Gifters
        </div>
        <div className="leaderboard">
          {leaderboard.length === 0 && <EmptyMini icon="fa-solid fa-gift" text="No gifts yet this session" />}
          {leaderboard.map((row, index) => (
            <div className="lb-item" key={row.uid} style={{ animationDelay: `${index * 0.08}s` }}>
              <div className="lb-rank">
                <i className={rankIcon(index)} />
              </div>
              <div className="lb-av">{initialsOf(row.name)}</div>
              <div className="lb-info">
                <div className="lb-name">{row.name}</div>
                <div className="lb-gifts-breakdown">{row.breakdown}</div>
              </div>
              <div className="lb-total">
                <div className="lb-coins">{row.total} PC</div>
                <div className="lb-coin-label">PC spent</div>
              </div>
            </div>
          ))}
        </div>

        <div className="gifts-section-title">
          <i className="fa-solid fa-gift mr-[6px]" />
          Gift Feed
        </div>
        <div className="gift-feed">
          {gifts.length === 0 && <EmptyMini icon="fa-solid fa-wand-magic-sparkles" text="Gifts will appear here" />}
          {gifts.map((entry) => (
            <div className="gift-entry" key={entry.id}>
              <div className="ge-emoji">
                <i className={entry.gift.icon} />
              </div>
              <div className="ge-info">
                <div className="ge-name">{entry.name}</div>
                <div className="ge-gift">sent a {entry.gift.name}</div>
              </div>
              <div className="ge-coins">{entry.gift.coins} PC</div>
              <div className="ge-time">{clockLabel(entry.at)}</div>
            </div>
          ))}
        </div>

        <div className="gifts-section-title">
          <i className="fa-solid fa-coins mr-[6px]" />
          Donations
        </div>
        <div className="donation-feed">
          {donations.length === 0 && <EmptyMini icon="fa-solid fa-coins" text="No donations yet" />}
          {donations.map((entry) => (
            <div className="donation-entry" key={entry.id}>
              <div className="don-av">{initialsOf(entry.name)}</div>
              <div className="don-info">
                <div className="don-name">{entry.name}</div>
                <div className="don-msg">{entry.message}</div>
              </div>
              <div className="don-amount">{entry.amount} PC</div>
            </div>
          ))}
        </div>

        <div className="gifts-section-title">
          <i className="fa-solid fa-star mr-[6px]" />
          Fan Subscriptions
        </div>
        <div className="sub-feed">
          {subs.length === 0 && <EmptyMini icon="fa-solid fa-star" text="No subscribers yet" />}
          {subs.map((entry) => (
            <div className="sub-entry" key={entry.id}>
              <div className="sub-av">{initialsOf(entry.name)}</div>
              <div className="sub-info">
                <div className="sub-name">{entry.name}</div>
                <div className="sub-detail">Fan subscription · {entry.amount || subAmount} PC / mo</div>
              </div>
              <div className="sub-star-big">
                <i className="fa-solid fa-star" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
