import { NextResponse, type NextRequest } from 'next/server';

/**
 * Server-side replacement for the legacy `functions/api/r2-presign.js` Pages
 * Function. Three legacy pages (index.html, channeldashboard.html,
 * channelintro.html) instead embedded the R2 secret access key in browser JS
 * and signed AWS4 requests client-side, exposing it to every visitor. Signing
 * here keeps the key in `process.env` and returns only a short-lived PUT URL.
 */

const EXPIRES_IN_SECONDS = 3600;
const REGION = 'auto';

type PresignBody = {
  filename?: unknown;
  contentType?: unknown;
  folder?: unknown;
};

function env(name: string): string | undefined {
  const value = process.env[name];
  return value && value.length > 0 ? value : undefined;
}

async function sha256Hex(message: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(message));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function hmacRaw(
  key: Uint8Array<ArrayBuffer> | string,
  message: string,
): Promise<Uint8Array<ArrayBuffer>> {
  const material = typeof key === 'string' ? new TextEncoder().encode(key) : key;
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    material,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, new TextEncoder().encode(message));
  return new Uint8Array(signature);
}

function toHex(bytes: Uint8Array): string {
  return [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function encodePart(part: string): string {
  return encodeURIComponent(part).replace(/[!'()*]/g, (c) =>
    `%${c.charCodeAt(0).toString(16).toUpperCase()}`,
  );
}

export async function POST(request: NextRequest) {
  const accountId = env('R2_ACCOUNT_ID');
  const bucket = env('R2_BUCKET_NAME');
  const accessKeyId = env('R2_ACCESS_KEY_ID');
  const secretAccessKey = env('R2_SECRET_ACCESS_KEY');
  const publicDomain = env('R2_PUBLIC_DOMAIN');

  if (!accountId || !bucket || !accessKeyId || !secretAccessKey) {
    return NextResponse.json(
      {
        error: 'R2 credentials not configured',
        missing: {
          accountId: !accountId,
          bucket: !bucket,
          accessKeyId: !accessKeyId,
          secretAccessKey: !secretAccessKey,
        },
      },
      { status: 500 },
    );
  }

  let body: PresignBody;
  try {
    body = (await request.json()) as PresignBody;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { filename, contentType, folder } = body;
  if (typeof filename !== 'string' || filename.length === 0) {
    return NextResponse.json({ error: 'Missing filename' }, { status: 400 });
  }

  const resolvedContentType =
    typeof contentType === 'string' && contentType.length > 0 ? contentType : 'application/octet-stream';
  const resolvedFolder =
    typeof folder === 'string' && folder.length > 0 ? folder : 'general';

  const uniqueId = toHex(crypto.getRandomValues(new Uint8Array(8)));
  const cleanFilename = filename.replace(/[^a-zA-Z0-9.\-_]/g, '_');
  const key = `${resolvedFolder}/${Date.now()}_${uniqueId}_${cleanFilename}`;

  const host = `${accountId}.r2.cloudflarestorage.com`;
  const canonicalUri = `/${[bucket, ...key.split('/')].map(encodePart).join('/')}`;

  const now = new Date();
  const datetime = `${now.toISOString().replace(/[:-]/g, '').split('.')[0]}Z`;
  const date = datetime.slice(0, 8);
  const credentialScope = `${date}/${REGION}/s3/aws4_request`;

  const queryParams: Record<string, string> = {
    'X-Amz-Algorithm': 'AWS4-HMAC-SHA256',
    'X-Amz-Credential': `${accessKeyId}/${credentialScope}`,
    'X-Amz-Date': datetime,
    'X-Amz-Expires': String(EXPIRES_IN_SECONDS),
    'X-Amz-SignedHeaders': 'host',
  };

  const sortedQueryString = Object.keys(queryParams)
    .sort()
    .map((q) => `${encodeURIComponent(q)}=${encodeURIComponent(queryParams[q] as string)}`)
    .join('&');

  const canonicalRequest = [
    'PUT',
    canonicalUri,
    sortedQueryString,
    `host:${host}\n`,
    'host',
    'UNSIGNED-PAYLOAD',
  ].join('\n');

  const stringToSign = [
    'AWS4-HMAC-SHA256',
    datetime,
    credentialScope,
    await sha256Hex(canonicalRequest),
  ].join('\n');

  const kDate = await hmacRaw(`AWS4${secretAccessKey}`, date);
  const kRegion = await hmacRaw(kDate, REGION);
  const kService = await hmacRaw(kRegion, 's3');
  const kSigning = await hmacRaw(kService, 'aws4_request');
  const signature = toHex(await hmacRaw(kSigning, stringToSign));

  const uploadUrl = `https://${host}${canonicalUri}?${sortedQueryString}&X-Amz-Signature=${signature}`;
  const basePublicDomain = publicDomain
    ? publicDomain.replace(/^https?:\/\//, '')
    : `${bucket}.${accountId}.r2.dev`;

  return NextResponse.json({
    uploadUrl,
    publicUrl: `https://${basePublicDomain}/${key}`,
    key,
  });
}
