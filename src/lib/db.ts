import type { DocumentRow, DocumentMeta } from '@/types';

/**
 * Inserts a new document record into D1.
 */
export async function insertDocument(
  db: D1Database,
  params: {
    id: string;
    shareId: string;
    fileName: string;
    fileSize: number;
    r2Key: string;
    allowDownload: boolean;
    expiresAt: string;
    uploaderIp: string | null;
  }
): Promise<void> {
  await db
    .prepare(
      `INSERT INTO documents (id, share_id, file_name, file_size, file_type, r2_key, allow_download, expires_at, uploader_ip)
       VALUES (?, ?, ?, ?, 'pdf', ?, ?, ?, ?)`
    )
    .bind(
      params.id,
      params.shareId,
      params.fileName,
      params.fileSize,
      params.r2Key,
      params.allowDownload ? 1 : 0,
      params.expiresAt,
      params.uploaderIp
    )
    .run();
}

/**
 * Retrieves a document by shareId (only non-deleted, non-expired).
 */
export async function getDocumentByShareId(
  db: D1Database,
  shareId: string
): Promise<DocumentRow | null> {
  const result = await db
    .prepare(
      `SELECT * FROM documents
       WHERE share_id = ?
         AND deleted_at IS NULL`
    )
    .bind(shareId)
    .first<DocumentRow>();
  return result ?? null;
}

/**
 * Increments view count for a document.
 */
export async function incrementViewCount(
  db: D1Database,
  shareId: string
): Promise<void> {
  await db
    .prepare(`UPDATE documents SET view_count = view_count + 1 WHERE share_id = ?`)
    .bind(shareId)
    .run();
}

/**
 * Converts a DocumentRow to DocumentMeta.
 */
export function toDocumentMeta(row: DocumentRow): DocumentMeta {
  return {
    fileName: row.file_name,
    fileSize: row.file_size,
    allowDownload: row.allow_download === 1,
    expiresAt: row.expires_at,
    createdAt: row.created_at,
    viewCount: row.view_count,
  };
}

/**
 * Soft deletes a document.
 */
export async function softDeleteDocument(
  db: D1Database,
  shareId: string
): Promise<void> {
  await db
    .prepare(`UPDATE documents SET deleted_at = datetime('now') WHERE share_id = ?`)
    .bind(shareId)
    .run();
}

/**
 * Returns all expired documents that haven't been soft-deleted.
 */
export async function getExpiredDocuments(
  db: D1Database
): Promise<DocumentRow[]> {
  const result = await db
    .prepare(
      `SELECT * FROM documents
       WHERE expires_at < datetime('now')
         AND deleted_at IS NULL`
    )
    .all<DocumentRow>();
  return result.results ?? [];
}

/**
 * Returns documents that were soft-deleted more than 30 days ago.
 */
export async function getStaleDeletedDocuments(
  db: D1Database
): Promise<DocumentRow[]> {
  const result = await db
    .prepare(
      `SELECT * FROM documents
       WHERE deleted_at IS NOT NULL
         AND deleted_at < datetime('now', '-30 days')`
    )
    .all<DocumentRow>();
  return result.results ?? [];
}

/**
 * Permanently deletes a document record.
 */
export async function hardDeleteDocument(
  db: D1Database,
  shareId: string
): Promise<void> {
  await db
    .prepare(`DELETE FROM documents WHERE share_id = ?`)
    .bind(shareId)
    .run();
}

/**
 * Rate limiting: counts uploads by IP in the last hour.
 */
export async function countRecentUploads(
  db: D1Database,
  ip: string,
  windowHours: number
): Promise<number> {
  const result = await db
    .prepare(
      `SELECT COUNT(*) as cnt FROM documents
       WHERE uploader_ip = ?
         AND created_at > datetime('now', ?)
         AND deleted_at IS NULL`
    )
    .bind(ip, `-${windowHours} hours`)
    .first<{ cnt: number }>();
  return result?.cnt ?? 0;
}
