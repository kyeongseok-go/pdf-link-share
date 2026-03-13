import { type NextRequest, NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';
import {
  getExpiredDocuments,
  getStaleDeletedDocuments,
  softDeleteDocument,
  hardDeleteDocument,
} from '@/lib/db';
import { deleteFromR2 } from '@/lib/r2';

export const runtime = 'edge';

/**
 * Cron job: cleans up expired documents.
 * Triggered by Cloudflare Cron Trigger every hour.
 * Also accessible via GET for manual triggering (protected by a secret).
 */
export async function GET(request: NextRequest) {
  // Basic auth via secret header or query param for manual trigger
  const secret = request.headers.get('x-cron-secret') ?? request.nextUrl.searchParams.get('secret');
  const expectedSecret = process.env.CRON_SECRET;

  if (expectedSecret && secret !== expectedSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { env } = getRequestContext();
    const db = env.DB as D1Database;
    const r2 = env.R2 as R2Bucket;

    let softDeleted = 0;
    let hardDeleted = 0;
    const errors: string[] = [];

    // Step 1: Soft-delete expired documents and delete from R2
    const expiredDocs = await getExpiredDocuments(db);
    for (const doc of expiredDocs) {
      try {
        await deleteFromR2(r2, doc.r2_key);
        await softDeleteDocument(db, doc.share_id);
        softDeleted++;
      } catch (err) {
        errors.push(`Failed to delete ${doc.share_id}: ${String(err)}`);
      }
    }

    // Step 2: Hard-delete stale soft-deleted records (30+ days old)
    const staleDocs = await getStaleDeletedDocuments(db);
    for (const doc of staleDocs) {
      try {
        await hardDeleteDocument(db, doc.share_id);
        hardDeleted++;
      } catch (err) {
        errors.push(`Failed to hard-delete ${doc.share_id}: ${String(err)}`);
      }
    }

    return NextResponse.json({
      success: true,
      softDeleted,
      hardDeleted,
      errors: errors.length > 0 ? errors : undefined,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Cron cleanup error:', error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}

// Also handle Cloudflare Cron Trigger (called as scheduled event)
export async function POST(request: NextRequest) {
  return GET(request);
}
