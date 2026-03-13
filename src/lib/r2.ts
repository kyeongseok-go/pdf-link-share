import { R2_KEY_PREFIX } from './constants';

/**
 * Builds the R2 object key for a document.
 */
export function buildR2Key(shareId: string): string {
  return `${R2_KEY_PREFIX}/${shareId}/file.pdf`;
}

/**
 * Uploads a file to R2.
 */
export async function uploadToR2(
  bucket: R2Bucket,
  shareId: string,
  data: ArrayBuffer,
  fileName: string
): Promise<string> {
  const key = buildR2Key(shareId);
  await bucket.put(key, data, {
    httpMetadata: {
      contentType: 'application/pdf',
      contentDisposition: `inline; filename*=UTF-8''${encodeURIComponent(fileName)}`,
    },
    customMetadata: {
      originalName: fileName,
      uploadedAt: new Date().toISOString(),
    },
  });
  return key;
}

/**
 * Retrieves a file from R2.
 */
export async function getFromR2(
  bucket: R2Bucket,
  key: string
): Promise<R2ObjectBody | null> {
  return bucket.get(key);
}

/**
 * Deletes a file from R2.
 */
export async function deleteFromR2(
  bucket: R2Bucket,
  key: string
): Promise<void> {
  await bucket.delete(key);
}
