import { type NextRequest, NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { getDocumentByShareId } from '@/lib/db';
import { getFromR2 } from '@/lib/r2';
import { isExpired } from '@/lib/date';

export const runtime = 'edge';

function errorResponse(message: string, status: number) {
  return new NextResponse(message, { status });
}

// GET /api/file/[shareId] — stream the PDF file from R2
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shareId: string }> }
) {
  try {
    const { env } = getRequestContext();
    const db = env.DB as D1Database;
    const r2 = env.R2 as R2Bucket;

    const { shareId } = await params;
    if (!shareId || shareId.length > 20) {
      return errorResponse('잘못된 요청입니다.', 400);
    }

    // Fetch document metadata
    const doc = await getDocumentByShareId(db, shareId);
    if (!doc) {
      return errorResponse('문서를 찾을 수 없습니다.', 404);
    }

    // Expiry check
    if (isExpired(doc.expires_at)) {
      return errorResponse('문서 열람 기간이 만료되었습니다.', 410);
    }

    // Fetch from R2
    const object = await getFromR2(r2, doc.r2_key);
    if (!object) {
      return errorResponse('파일을 찾을 수 없습니다.', 404);
    }

    // Determine Content-Disposition
    const download = request.nextUrl.searchParams.get('download') === '1';
    const isAllowed = download && doc.allow_download === 1;

    const disposition = isAllowed
      ? `attachment; filename*=UTF-8''${encodeURIComponent(doc.file_name)}`
      : `inline; filename*=UTF-8''${encodeURIComponent(doc.file_name)}`;

    const headers = new Headers();
    headers.set('Content-Type', 'application/pdf');
    headers.set('Content-Disposition', disposition);
    headers.set('Cache-Control', 'private, max-age=3600');
    headers.set('X-Content-Type-Options', 'nosniff');

    // Stream the body
    const body = object.body;

    return new NextResponse(body, { headers });
  } catch (error) {
    console.error('GET file error:', error);
    return errorResponse('파일을 불러오는 중 오류가 발생했습니다.', 500);
  }
}
