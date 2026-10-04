/**
 * Browser half of the R2 upload. Requests a presigned PUT from the server and
 * uploads to it, so no signing key ever reaches the client.
 */

type PresignResponse = {
  uploadUrl: string;
  publicUrl: string;
  key: string;
  error?: string;
};

export async function uploadToR2(
  file: Blob,
  options: {
    filename: string;
    contentType?: string;
    folder?: string;
    onProgress?: (percent: number) => void;
  },
): Promise<string> {
  const presignRes = await fetch('/api/r2-presign', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      filename: options.filename,
      contentType: options.contentType ?? file.type,
      folder: options.folder,
    }),
  });

  const presign = (await presignRes.json()) as PresignResponse;
  if (!presignRes.ok || !presign.uploadUrl) {
    throw new Error(presign.error ?? `Presign failed with status ${presignRes.status}`);
  }

  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', presign.uploadUrl, true);
    const contentType = options.contentType ?? file.type;
    if (contentType) xhr.setRequestHeader('Content-Type', contentType);
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        options.onProgress?.(Math.round((event.loaded / event.total) * 100));
      }
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new Error(`R2 upload failed: ${xhr.status} — ${xhr.responseText}`));
    };
    xhr.onerror = () => reject(new Error('R2 network error'));
    xhr.send(file);
  });

  return presign.publicUrl;
}
