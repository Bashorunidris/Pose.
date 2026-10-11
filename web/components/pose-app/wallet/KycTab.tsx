'use client';

import { KYC_TIERS, type KycState } from '@/lib/pose-app/wallet';

type Props = {
  kyc: KycState | null;
  onOpenKyc: (tier: number) => void;
};

/**
 * The `kyc` tab behind `loadKycTab()` @64558. The legacy labelled the tiers with
 * the ✅📱🏦 emoji; the port uses the Font Awesome glyph named on each card.
 */
export function KycTab({ kyc, onOpenKyc }: Props) {
  const currentTier = kyc?.tier ?? 1;
  const status = kyc?.status ?? 'none';
  const pendingTier = status.startsWith('pending_') ? status.split('_')[1] : '';
  const rejectedTier = status.startsWith('rejected_') ? status.split('_')[1] : '';

  return (
    <div className="wallet-tab-content active" style={{ display: 'block' }}>
      <h3 className="wallet-tab-title"><i className="fas fa-id-card" />Identity Verification (KYC)</h3>
      <p className="wallet-tab-desc">Verify your identity to increase your withdrawal limit.</p>

      <div style={{ marginBottom: '1.2rem' }}>
        {pendingTier ? (
          <div style={{ background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.4)', borderRadius: '10px', padding: '12px 14px', color: '#fbbf24', fontSize: '13px', fontWeight: 600 }}>
            <i className="fas fa-hourglass-half" style={{ marginRight: '6px' }} />
            Tier {pendingTier} application is under review (1-24 hrs)
          </div>
        ) : rejectedTier ? (
          <div style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.4)', borderRadius: '10px', padding: '12px 14px', color: '#f87171', fontSize: '13px', fontWeight: 600 }}>
            <i className="fas fa-circle-xmark" style={{ marginRight: '6px' }} />
            Tier {rejectedTier} rejected: {kyc?.note}
          </div>
        ) : null}
      </div>

      <div>
        {KYC_TIERS.map((tier) => {
          const isActive = currentTier >= tier.tier;
          const isPending = status === `pending_${tier.tier}`;
          const isLocked = !isActive && !isPending && currentTier < tier.tier - 1;
          const className = isActive ? 'kyc-tier-card active-tier' : isPending ? 'kyc-tier-card pending-tier' : isLocked ? 'kyc-tier-card locked-tier' : 'kyc-tier-card';
          const canUpgrade = currentTier >= tier.tier - 1;
          return (
            <div key={tier.tier} className={className}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span className="kyc-tier-label" style={{ color: tier.color }}>
                  <i className={`fas fa-${tier.icon}`} style={{ marginRight: '6px' }} />
                  {tier.label}
                </span>
                {isActive ? (
                  <span style={{ color: '#22c55e', fontSize: '12px', fontWeight: 700 }}>
                    <i className="fas fa-check" style={{ marginRight: '4px' }} />ACTIVE
                  </span>
                ) : isPending ? (
                  <span style={{ color: '#fbbf24', fontSize: '12px', fontWeight: 700 }}>
                    <i className="fas fa-hourglass-half" style={{ marginRight: '4px' }} />PENDING
                  </span>
                ) : (
                  <span style={{ color: '#555', fontSize: '12px', fontWeight: 700 }}>
                    <i className="fas fa-lock" style={{ marginRight: '4px' }} />LOCKED
                  </span>
                )}
              </div>
              <div className="kyc-tier-limit">{tier.limit} max withdrawal</div>
              <div className="kyc-tier-desc">{tier.desc}</div>
              {!isActive && !isPending && tier.tier > 1 ? (
                <button type="button" className="kyc-upgrade-btn" disabled={!canUpgrade} onClick={() => onOpenKyc(tier.tier)}>
                  {canUpgrade ? `Upgrade to ${tier.label}` : `Complete Tier ${tier.tier - 1} first`}
                </button>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
