import { type NextRequest, NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';
import {
  getDocumentByShareId,
  incrementViewCount,
  toDocumentMeta,
  softDeleteDocument,
} from '@/lib/db';
import { isExpired } from '@/lib/date';

export const runtime = 'edge';

function errorResponse(error: string, message: string, status: number) {
  return NextResponse.json({ success: false, error, message }, { status });
}

// GET /api/doc/[shareId] — fetch document metadata
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ shareId: string }> }
) {
  try {
    const { env } = getRequestContext();
    const db = env.DB as D1Database;

    const { shareId } = await params;
    if (!shareId || shareId.length > 20) {
      return errorResponse('INVALID_ID', '잘못된 요청입니다.', 400);
    }

    const doc = await getDocumentByShareId(db, shareId);
    if (!doc) {
      return errorResponse(
        'DOCUMENT_NOT_FOUND',
        '문서가 존재하지 않거나 공유 기간이 만료되었습니다.',
        404
      );
    }

    // Check expiry
    if (isExpired(doc.expires_at)) {
      return errorResponse(
        'DOCUMENT_EXPIRED',
        '문서 열람 기간이 만료되었습니다.',
        404
      );
    }

    // Increment view count (fire-and-forget)
    incrementViewCount(db, shareId).catch(console.error);

    const meta = toDocumentMeta(doc);
    return NextResponse.json({ success: true, data: meta });
  } catch (error) {
    console.error('GET doc error:', error);
    return errorResponse('SERVER_ERROR', '서버 오류가 발생했습니다.', 500);
  }
}

// DELETE /api/doc/[shareId] — soft delete (for future auth integration)
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ shareId: string }> }
) {
  try {
    const { env } = getRequestContext();
    const db = env.DB as D1Database;

    const { shareId } = await params;
    if (!shareId) {
      return errorResponse('INVALID_ID', '잘못된 요청입니다.', 400);
    }

    const doc = await getDocumentByShareId(db, shareId);
    if (!doc) {
      return errorResponse('DOCUMENT_NOT_FOUND', '문서를 찾을 수 없습니다.', 404);
    }

    await softDeleteDocument(db, shareId);

    return NextResponse.json({ success: true, message: '문서가 삭제되었습니다.' });
  } catch (error) {
    console.error('DELETE doc error:', error);
    return errorResponse('SERVER_ERROR', '서버 오류가 발생했습니다.', 500);
  }
}
