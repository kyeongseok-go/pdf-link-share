import { type NextRequest, NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { validatePdfServer } from '@/lib/validation';
import { uploadToR2 } from '@/lib/r2';
import { insertDocument, countRecentUploads } from '@/lib/db';
import { generateDocumentId, generateShareId } from '@/lib/nanoid';
import { computeExpiresAt } from '@/lib/date';
import { RATE_LIMIT } from '@/lib/constants';
import type { ExpiryOption } from '@/types';

export const runtime = 'edge';

function errorResponse(error: string, message: string, status: number) {
  return NextResponse.json({ success: false, error, message }, { status });
}

function getClientIp(request: NextRequest): string | null {
  return (
    request.headers.get('cf-connecting-ip') ??
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    null
  );
}

export async function POST(request: NextRequest) {
  try {
    const { env } = getRequestContext();
    const db = env.DB as D1Database;
    const r2 = env.R2 as R2Bucket;

    // Parse multipart form data
    let formData: FormData;
    try {
      formData = await request.formData();
    } catch {
      return errorResponse('INVALID_REQUEST', '요청 형식이 올바르지 않습니다.', 400);
    }

    const file = formData.get('file');
    if (!file || !(file instanceof File)) {
      return errorResponse('NO_FILE', '파일이 필요합니다.', 400);
    }

    const expiresIn = (formData.get('expiresIn') ?? '7d') as ExpiryOption;
    const allowDownload = formData.get('allowDownload') !== '0';

    // Validate expiry option
    const validExpiries: ExpiryOption[] = ['1d', '7d', '30d', '90d'];
    if (!validExpiries.includes(expiresIn)) {
      return errorResponse('INVALID_EXPIRY', '올바른 공유 기간을 선택해주세요.', 400);
    }

    // Rate limiting by IP
    const ip = getClientIp(request);
    if (ip && db) {
      const hourlyCount = await countRecentUploads(db, ip, 1);
      if (hourlyCount >= RATE_LIMIT.UPLOADS_PER_HOUR) {
        return errorResponse(
          'RATE_LIMITED',
          '업로드 한도를 초과했습니다. 잠시 후 다시 시도해주세요.',
          429
        );
      }
      const dailyCount = await countRecentUploads(db, ip, 24);
      if (dailyCount >= RATE_LIMIT.UPLOADS_PER_DAY) {
        return errorResponse(
          'RATE_LIMITED',
          '일일 업로드 한도를 초과했습니다. 내일 다시 시도해주세요.',
          429
        );
      }
    }

    // Read file buffer
    const buffer = await file.arrayBuffer();

    // Server-side validation
    const validation = validatePdfServer(buffer, file.type, file.size);
    if (!validation.valid) {
      return errorResponse('INVALID_FILE', validation.error ?? '파일 검증 실패.', 400);
    }

    // Generate IDs
    const id = generateDocumentId();
    const shareId = generateShareId();

    // Compute expiry
    const expiresAt = computeExpiresAt(expiresIn).toISOString();

    // Upload to R2
    const r2Key = await uploadToR2(r2, shareId, buffer, file.name);

    // Store metadata in D1
    await insertDocument(db, {
      id,
      shareId,
      fileName: file.name,
      fileSize: file.size,
      r2Key,
      allowDownload,
      expiresAt,
      uploaderIp: ip,
    });

    const origin = new URL(request.url).origin;
    const shareUrl = `${origin}/v/${shareId}`;

    return NextResponse.json({
      success: true,
      shareId,
      shareUrl,
      expiresAt,
      fileName: file.name,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return errorResponse(
      'UPLOAD_FAILED',
      '업로드 중 오류가 발생했습니다. 다시 시도해주세요.',
      500
    );
  }
}
