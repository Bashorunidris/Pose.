'use client';

import { useEffect, useState } from 'react';

import { FALLBACK_RATES, fetchExchangeRates, type ExchangeRateState } from './earnings';

const INITIAL: ExchangeRateState = {
  usdToNgn: FALLBACK_RATES['NGN']!,
  rates: { ...FALLBACK_RATES },
  live: false,
};

/**
 * One live USD rate fetch per page that needs it. The legacy page fetched on
 * entry and stashed the result in globals (`usdToNgn`, `userCurrencyRates`);
 * Earnings and All Videos both read from that, so they share this hook.
 */
export function useExchangeRates(): ExchangeRateState {
  const [state, setState] = useState<ExchangeRateState>(INITIAL);

  useEffect(() => {
    let cancelled = false;
    void fetchExchangeRates().then((next) => {
      if (!cancelled) setState(next);
    });
    return () => { cancelled = true; };
  }, []);

  return state;
}
