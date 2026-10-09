/**
 * Number/currency formatting shared by the dashboard pages, lifted from
 * `fmt()` / `CURRENCY_MAP` / `getUserCurrency()` in the legacy script.
 */

const CURRENCY_MAP: Record<string, { code: string; symbol: string; name: string }> = {
  Nigeria: { code: 'NGN', symbol: '₦', name: 'NGN' },
  'United States': { code: 'USD', symbol: '$', name: 'USD' },
  'United Kingdom': { code: 'GBP', symbol: '£', name: 'GBP' },
  Ghana: { code: 'GHS', symbol: 'GH₵', name: 'GHS' },
  Kenya: { code: 'KES', symbol: 'KSh', name: 'KES' },
  'South Africa': { code: 'ZAR', symbol: 'R', name: 'ZAR' },
  Canada: { code: 'CAD', symbol: 'CA$', name: 'CAD' },
  Australia: { code: 'AUD', symbol: 'A$', name: 'AUD' },
  India: { code: 'INR', symbol: '₹', name: 'INR' },
  Germany: { code: 'EUR', symbol: '€', name: 'EUR' },
  France: { code: 'EUR', symbol: '€', name: 'EUR' },
  Italy: { code: 'EUR', symbol: '€', name: 'EUR' },
  Spain: { code: 'EUR', symbol: '€', name: 'EUR' },
  Netherlands: { code: 'EUR', symbol: '€', name: 'EUR' },
  Brazil: { code: 'BRL', symbol: 'R$', name: 'BRL' },
  Mexico: { code: 'MXN', symbol: 'MX$', name: 'MXN' },
  UAE: { code: 'AED', symbol: 'AED', name: 'AED' },
  'Saudi Arabia': { code: 'SAR', symbol: 'SAR', name: 'SAR' },
  Egypt: { code: 'EGP', symbol: 'E£', name: 'EGP' },
  Tanzania: { code: 'TZS', symbol: 'TSh', name: 'TZS' },
  Uganda: { code: 'UGX', symbol: 'USh', name: 'UGX' },
  Rwanda: { code: 'RWF', symbol: 'RF', name: 'RWF' },
  Cameroon: { code: 'XAF', symbol: 'FCFA', name: 'XAF' },
  Senegal: { code: 'XOF', symbol: 'CFA', name: 'XOF' },
  'Ivory Coast': { code: 'XOF', symbol: 'CFA', name: 'XOF' },
  Ethiopia: { code: 'ETB', symbol: 'Br', name: 'ETB' },
  Zimbabwe: { code: 'USD', symbol: '$', name: 'USD' },
  Zambia: { code: 'ZMW', symbol: 'ZK', name: 'ZMW' },
};

export function fmt(value: unknown): string {
  const n = Number(value) || 0;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`;
  return n.toString();
}

export function formatNgn(value: unknown): string {
  const n = Number(value) || 0;
  return `₦${Math.round(n).toLocaleString('en-NG', { maximumFractionDigits: 0 })}`;
}

export function channelSlug(name?: string): string {
  return (name || 'channel').toLowerCase().replace(/\s+/g, '');
}

export function userCurrency(country?: string) {
  return CURRENCY_MAP[country || ''] ?? { code: 'USD', symbol: '$', name: 'USD' };
}
