'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import { drawLineChart } from '@/lib/channel-dashboard/chart';
import {
  COIN_LOGO_URL,
  FALLBACK_RATES,
  fetchExchangeRates,
  fmtCurr,
  getPaidBreakdown,
  getTimelineEntries,
  getWithdrawableBalance,
  PAID_VIEW_COPY,
  rateNoteText,
  totalSubtitle,
  trendSeries,
  type EarnCurrency,
} from '@/lib/channel-dashboard/earnings';
import type { ChannelData, EarningsSummary, VideoDoc } from '@/lib/channel-dashboard/types';

import { PaymentMethodPopup, type PayMethod } from './PaymentMethodPopup';
import { WithdrawPopup } from './WithdrawPopup';

const PERIODS = [
  { id: '24h', label: '24 hrs' },
  { id: '72h', label: '72 hrs' },
  { id: '7d', label: '7 days' },
  { id: '30d', label: '30 days' },
];

const CURRENCIES: { id: EarnCurrency; label: string; icon: string }[] = [
  { id: 'NGN', label: 'NGN', icon: '' },
  { id: 'COIN', label: 'Coin', icon: 'fas fa-coins' },
  { id: 'USER', label: 'Local', icon: 'fas fa-globe' },
];

type Props = {
  channelId: string;
  channel: ChannelData | null;
  videos: VideoDoc[];
  earnings: EarningsSummary;
  onBack: () => void;
  onToast: (message: string) => void;
};

/**
 * `#page-earnings` — `renderEarningsSummary()`, `renderEarningsChart()`,
 * `renderEligibilityBanner()`, `renderTimeline()` and the currency switch.
 *
 * The legacy page read the live USD rate on open and kept the creator's
 * selection in module state; both live here now. The paid-view pool breakdown
 * is the only source of balances — free videos are never monetised.
 */
export function EarningsPage({ channelId, channel, videos, earnings, onBack, onToast }: Props) {
  const [currency, setCurrency] = useState<EarnCurrency>('NGN');
  const [period, setPeriod] = useState('24h');
  const [rates, setRates] = useState<Record<string, number>>({ ...FALLBACK_RATES });
  const [usdToNgn, setUsdToNgn] = useState(FALLBACK_RATES['NGN']!);
  const [live, setLive] = useState(false);
  // `null` until the creator picks one in the popup — the channel doc's saved
  // method is the default, so no effect is needed to seed it.
  const [payMethodOverride, setPayMethodOverride] = useState<PayMethod | null>(null);
  const [showPayMethod, setShowPayMethod] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const savedMethod = channel?.paymentMethod;
  const payMethod: PayMethod = payMethodOverride
    ?? (savedMethod === 'auto' || savedMethod === 'manual' ? savedMethod : 'auto');

  const paid = useMemo(() => getPaidBreakdown(videos, earnings), [earnings, videos]);
  const withdrawable = getWithdrawableBalance(earnings);
  const direct = Number(earnings?.directRevenue) || 0;
  const trend = useMemo(() => trendSeries(earnings), [earnings]);
  const timeline = useMemo(() => getTimelineEntries(earnings, period), [earnings, period]);
  const rate = useMemo(() => ({ usdToNgn, rates, live }), [live, rates, usdToNgn]);

  useEffect(() => {
    let cancelled = false;
    void fetchExchangeRates().then((state) => {
      if (cancelled) return;
      setRates(state.rates);
      setUsdToNgn(state.usdToNgn);
      setLive(state.live);
    });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const draw = () => drawLineChart(canvas, {
      data: trend.data,
      labels: trend.labels,
      color: '#7C3AED',
      fillAlpha: '22',
      lineWidth: 3,
      gridColor: '#f3f4f6',
    });

    const initial = setTimeout(draw, 50);
    let resizeTimer: ReturnType<typeof setTimeout> | undefined;
    const onResize = () => {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(draw, 120);
    };
    window.addEventListener('resize', onResize);
    return () => {
      clearTimeout(initial);
      if (resizeTimer) clearTimeout(resizeTimer);
      window.removeEventListener('resize', onResize);
    };
  }, [trend]);

  const showCurrency = (value: number) => fmtCurr(value, currency, channel?.country, rates);

  return (
    <div id="page-earnings" className="page active">
      <div className="studio-topbar">
        <button className="back-btn" onClick={onBack}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          Back
        </button>
        <span className="studio-title">Earnings</span>
      </div>

      <div style={{ padding: '16px 18px 0' }}>
        <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '.6px' }}>Paid Views Earnings</div>
      </div>

      <div style={{ padding: '16px 18px' }}>
        <div className="card" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
            <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--gray-500)' }}>Revenue Summary</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 0, background: 'var(--gray-100)', borderRadius: '9px', padding: '3px', border: '1px solid var(--gray-200)' }}>
              {CURRENCIES.map((option) => (
                <div
                  key={option.id}
                  className={`curr-btn${currency === option.id ? ' active' : ''}`}
                  onClick={() => setCurrency(option.id)}
                >
                  {option.icon ? <i className={option.icon} style={{ marginRight: '4px' }} /> : null}
                  {option.id === 'NGN' ? '₦ ' : ''}{option.label}
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid var(--gray-100)' }}>
            <div>
              <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '.7px', color: 'var(--gray-400)', fontWeight: 600 }}>Paid Views Revenue</div>
              <div style={{ fontSize: '12px', color: 'var(--gray-500)', marginTop: '3px' }}>Pose Coin pay-per-view purchases</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div id="directRevDisplay" style={{ fontFamily: "'Playfair Display',serif", fontSize: '22px', fontWeight: 700, color: 'var(--purple-deep)' }}>
                {direct > 0 ? showCurrency(direct) : '—'}
              </div>
              <div id="directRevChange" style={{ fontSize: '11px', color: 'var(--green)', fontWeight: 600, marginTop: '2px' }}>
                {earnings?.directChange || '—'}
              </div>
            </div>
          </div>

          <div style={{ marginTop: '18px', background: 'var(--purple-ghost)', border: '1.5px solid var(--purple-pale)', borderRadius: '14px', padding: '18px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '.9px', fontWeight: 700, color: 'var(--purple-mid)', marginBottom: '8px' }}>Total Take-Home</div>
            <div
              id="totalRevDisplay"
              style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, color: 'var(--purple-deep)', lineHeight: 1, fontSize: currency === 'NGN' ? '32px' : '42px' }}
            >
              {currency === 'COIN' ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={COIN_LOGO_URL} className="coin-logo" alt="" />
              ) : null}
              {showCurrency(paid.total)}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--gray-500)', marginTop: '8px' }}>
              {totalSubtitle(paid.total, currency, channel, rates)}
            </div>
          </div>

          <div style={{ marginTop: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--gray-900)' }}>Revenue Trends</span>
              <span style={{ fontSize: '11px', color: 'var(--purple-main)', fontWeight: 600 }}>Last 7 Days</span>
            </div>
            <div style={{ background: 'white', border: '1px solid var(--gray-100)', borderRadius: '16px', padding: '16px', height: '220px', marginBottom: '20px' }}>
              <canvas id="earningsTrendChart" ref={canvasRef} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
              <div style={{ background: 'var(--gray-50)', border: '1px solid var(--gray-200)', borderRadius: '14px', padding: '14px' }}>
                <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--gray-400)', fontWeight: 700, letterSpacing: '0.5px' }}>Avg. Daily</div>
                <div id="avgDailyRev" style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-main)', marginTop: '4px' }}>{showCurrency(paid.total / 30)}</div>
                <div style={{ fontSize: '10px', color: 'var(--green)', fontWeight: 600, marginTop: '2px' }}>Stable</div>
              </div>
              <div style={{ background: 'var(--gray-50)', border: '1px solid var(--gray-200)', borderRadius: '14px', padding: '14px' }}>
                <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--gray-400)', fontWeight: 700, letterSpacing: '0.5px' }}>Est. Monthly</div>
                <div id="estMonthlyRev" style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-main)', marginTop: '4px' }}>{showCurrency(paid.total)}</div>
                <div style={{ fontSize: '10px', color: 'var(--purple-main)', fontWeight: 600, marginTop: '2px' }}>Projected</div>
              </div>
            </div>
          </div>

          {paid.released + paid.locked > 0 ? (
            <div style={{ display: 'grid', marginTop: '14px', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '12px', padding: '12px' }}>
                <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '.7px', fontWeight: 700, color: '#047857' }}>Available</div>
                <div id="availAmount" style={{ fontFamily: "'Playfair Display',serif", fontSize: '20px', fontWeight: 700, color: '#065F46', marginTop: '4px' }}>{showCurrency(paid.released)}</div>
                <div style={{ fontSize: '10.5px', color: '#047857', marginTop: '2px' }}>Withdrawable now</div>
              </div>
              <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '12px', padding: '12px' }}>
                <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '.7px', fontWeight: 700, color: '#B45309' }}>Locked</div>
                <div id="lockedAmount" style={{ fontFamily: "'Playfair Display',serif", fontSize: '20px', fontWeight: 700, color: '#78350F', marginTop: '4px' }}>{showCurrency(paid.locked)}</div>
                <div style={{ fontSize: '10.5px', color: '#92400E', marginTop: '2px' }}>Releases as views build up</div>
              </div>
            </div>
          ) : null}

          <div style={{ marginTop: '14px', background: 'linear-gradient(135deg,#FFFBEB,#FEF3C7)', border: '1px solid #FDE68A', borderRadius: '12px', padding: '12px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <i className="fas fa-shield-halved" style={{ color: '#D97706' }} />
              <span style={{ fontSize: '12.5px', fontWeight: 800, color: '#78350F' }}>Withdrawal Requirements</span>
            </div>
            <div style={{ fontSize: '11.5px', color: '#92400E', lineHeight: 1.55, marginBottom: '8px' }}>
              <b>Paid Videos:</b> each paid video needs <b>{PAID_VIEW_COPY} total views</b> to start earning — after that, earnings release every <b>5 hours</b> for however many views it got.
            </div>

            <div style={{ background: '#fff', border: '1px solid #FDE68A', borderRadius: '10px', padding: '10px 12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', fontWeight: 700, color: '#78350F', marginBottom: '4px' }}>
                <span><i className="fas fa-coins" style={{ marginRight: '4px' }} />Paid Video Pool</span>
                <span id="paidEligStatus">{paidStatusLabel(paid)}</span>
              </div>
              <div id="paidEligText" style={{ fontSize: '10.5px', color: '#92400E', marginTop: '2px', lineHeight: 1.5 }}>
                {paidEligibilityText(paid)}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '12px' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--gray-400)" strokeWidth="2">
              <circle cx="12" cy="12" r="10" /><path d="M12 8v4m0 4h.01" />
            </svg>
            <span id="rateNoteText" style={{ fontSize: '11px', color: 'var(--gray-400)' }}>
              {live ? rateNoteText(channel?.country, rate) : 'Rate unavailable — using fallback rates'}
            </span>
          </div>
        </div>
      </div>

      <div style={{ padding: '0 18px 12px', display: 'flex', gap: '8px' }}>
        <button onClick={() => setShowPayMethod(true)} style={{ flex: 1, padding: '13px 8px', borderRadius: '13px', background: 'linear-gradient(135deg,var(--purple-deep),var(--purple-main))', color: 'white', fontSize: '12px', fontWeight: 700, border: 'none', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", boxShadow: '0 4px 14px rgba(124,58,237,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
          <i className="fas fa-building-columns" /> Payment
        </button>
        <button onClick={() => setShowWithdraw(true)} style={{ flex: 1, padding: '13px 8px', borderRadius: '13px', background: 'linear-gradient(135deg,#059669,#10B981)', color: 'white', fontSize: '12px', fontWeight: 700, border: 'none', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", boxShadow: '0 4px 14px rgba(5,150,105,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
          <i className="fas fa-wallet" /> Withdraw
        </button>
        <button onClick={() => onToast('Transaction history is the next screen to be ported')} style={{ flex: 1, padding: '13px 8px', borderRadius: '13px', background: 'linear-gradient(135deg,#1E40AF,#3B82F6)', color: 'white', fontSize: '12px', fontWeight: 700, border: 'none', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", boxShadow: '0 4px 14px rgba(59,130,246,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
          <i className="fas fa-clock-rotate-left" /> History
        </button>
      </div>

      <div style={{ padding: '0 18px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '10px', padding: '10px 14px' }}>
          <i className="fas fa-clock" style={{ color: '#D97706', fontSize: '12px' }} />
          <span style={{ fontSize: '11px', color: '#92400E', lineHeight: 1.4 }}>Withdrawals are processed <b>9 AM – 12 AM daily</b> · Takes <b>15 min to 1 hour</b></span>
        </div>
      </div>

      <div style={{ padding: '0 18px 30px' }}>
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: '15.5px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '16px' }}>
            <i className="fas fa-calendar-days" style={{ marginRight: '6px' }} /> Revenue Timeline
          </div>
          <div style={{ display: 'flex', gap: '6px', marginBottom: '18px', flexWrap: 'wrap' }}>
            {PERIODS.map((option) => (
              <div
                key={option.id}
                className={`tl-pill${period === option.id ? ' active' : ''}`}
                onClick={() => setPeriod(option.id)}
              >
                {option.label}
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {timeline.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '26px 12px', color: 'var(--gray-400)', fontSize: '12.5px' }}>
                No transactions yet for this period — released pool earnings show up here.
              </div>
            ) : timeline.map((entry, index) => (
              <div
                key={`${entry.label}-${index}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px',
                  borderRadius: '14px',
                  background: entry.diff ? 'var(--purple-ghost)' : 'white',
                  border: `1.5px solid ${entry.diff ? 'var(--purple-pale)' : 'var(--gray-100)'}`,
                  boxShadow: entry.diff ? 'none' : 'var(--shadow-xs)',
                }}
              >
                <div>
                  <div style={{ fontSize: '14px', fontWeight: entry.diff ? 700 : 600, color: entry.diff ? 'var(--purple-deep)' : 'var(--text-main)' }}>{entry.label}</div>
                  <div style={{ fontSize: '11px', color: entry.diff ? 'var(--purple-mid)' : 'var(--gray-400)', marginTop: '4px', fontWeight: entry.diff ? 500 : 400 }}>
                    {entry.diff ? 'Recent Update' : 'Recorded Transaction'}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: "'Playfair Display',serif", fontSize: entry.diff ? '22px' : '19px', fontWeight: 700, color: entry.diff ? 'var(--purple-deep)' : 'var(--gray-900)' }}>
                    {entry.diff && (entry.ngn ?? 0) > 0 ? '+' : ''}{showCurrency(entry.ngn ?? 0)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showPayMethod ? (
        <PaymentMethodPopup
          channelId={channelId}
          channel={channel}
          method={payMethod}
          onMethodChange={setPayMethodOverride}
          onClose={() => setShowPayMethod(false)}
          onSaved={() => onToast('Payment details saved')}
        />
      ) : null}

      {showWithdraw ? (
        <WithdrawPopup
          channelId={channelId}
          channel={channel}
          balance={withdrawable}
          paid={paid}
          payMethod={payMethod}
          onClose={() => setShowWithdraw(false)}
          onSubmitted={() => onToast('Withdrawal request submitted')}
          onToast={onToast}
        />
      ) : null}
    </div>
  );
}

function paidStatusLabel(paid: { videoCount: number; released: number; locked: number }): string {
  if (paid.videoCount === 0) return '— No paid videos';
  if (paid.released > 0 || paid.locked > 0) {
    return `${Math.round(paid.released).toLocaleString('en-NG')} released · ${Math.round(paid.locked).toLocaleString('en-NG')} locked`;
  }
  return `0 / ${PAID_VIEW_COPY}`;
}

function paidEligibilityText(paid: { videoCount: number; released: number; locked: number; releasedViews: number; lockedViews: number }): string {
  if (paid.videoCount === 0) return 'You have no paid videos. Upload one to earn per-view directly.';
  if (paid.released > 0 || paid.locked > 0) {
    return `A video needs ${PAID_VIEW_COPY} total views to start earning — after that, every view releases each 5-hour cycle. `
      + `${paid.releasedViews.toLocaleString('en-NG')} view${paid.releasedViews === 1 ? '' : 's'} have released so far · `
      + `${paid.lockedViews.toLocaleString('en-NG')} view${paid.lockedViews === 1 ? '' : 's'} still below the minimum.`;
  }
  return `A video needs ${PAID_VIEW_COPY} total views to start earning. No paid views yet.`;
}
