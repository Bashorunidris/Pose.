import { NextResponse, type NextRequest } from 'next/server';

/**
 * Server-side replacement for `_doNubanLookup()` @63068, which called
 * Flutterwave's account-resolve endpoint straight from the browser with a
 * secret key embedded in index.html. That key (`_FLW_SK` @63017) is public and
 * has to be rotated; keeping the call here means only the resolved account name
 * ever reaches the client.
 *
 * A null `accountName` is a real answer: the sheet falls back to asking the
 * user to type their own name, exactly as the legacy did when the request
 * failed (CORS, network, or an unverified account).
 */

type ResolveBody = { accountNumber?: unknown; bankCode?: unknown };

export async function POST(request: NextRequest) {
  const secret = process.env['FLUTTERWAVE_SECRET_KEY'];
  if (!secret || secret.length === 0) {
    return NextResponse.json({ accountName: null, reason: 'not-configured' });
  }

  let body: ResolveBody;
  try {
    body = (await request.json()) as ResolveBody;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const accountNumber = typeof body.accountNumber === 'string' ? body.accountNumber : '';
  const bankCode = typeof body.bankCode === 'string' ? body.bankCode : '';
  if (!/^\d{10}$/.test(accountNumber) || bankCode.length === 0) {
    return NextResponse.json({ accountName: null, reason: 'invalid-input' });
  }

  try {
    const response = await fetch('https://api.flutterwave.com/v3/accounts/resolve', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secret}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ account_number: accountNumber, account_bank: bankCode }),
    });
    const json = (await response.json()) as { status?: string; data?: { account_name?: string } };
    if (json.status === 'success' && json.data?.account_name) {
      return NextResponse.json({ accountName: json.data.account_name });
    }
    return NextResponse.json({ accountName: null, reason: 'not-resolved' });
  } catch {
    return NextResponse.json({ accountName: null, reason: 'request-failed' });
  }
}
