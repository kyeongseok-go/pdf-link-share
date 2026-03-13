import { MAX_FILE_SIZE, ALLOWED_MIME_TYPES, PDF_MAGIC_BYTES } from './constants';

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validates a PDF file on the client side.
 * Checks: size, MIME type, and magic bytes.
 */
export async function validatePdfClient(file: File): Promise<ValidationResult> {
  // 1. Size check
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `파일 크기가 50MB를 초과합니다. 현재 무료 서비스로 50MB 이하 파일만 지원됩니다.`,
    };
  }

  // 2. Extension check
  const ext = file.name.split('.').pop()?.toLowerCase();
  if (ext !== 'pdf') {
    return {
      valid: false,
      error: 'PDF 파일만 업로드 가능합니다.',
    };
  }

  // 3. MIME type check
  if (!ALLOWED_MIME_TYPES.includes(file.type as 'application/pdf')) {
    return {
      valid: false,
      error: 'PDF 파일만 업로드 가능합니다.',
    };
  }

  // 4. Magic bytes check (%PDF)
  try {
    const buffer = await file.slice(0, 4).arrayBuffer();
    const bytes = new Uint8Array(buffer);
    const isPdf = PDF_MAGIC_BYTES.every((b, i) => bytes[i] === b);
    if (!isPdf) {
      return {
        valid: false,
        error: '올바른 PDF 파일이 아닙니다.',
      };
    }
  } catch {
    return {
      valid: false,
      error: '파일을 읽는 중 오류가 발생했습니다.',
    };
  }

  return { valid: true };
}

/**
 * Server-side PDF validation.
 * Used in API route to re-validate the uploaded file.
 */
export function validatePdfServer(
  buffer: ArrayBuffer,
  mimeType: string,
  fileSize: number
): ValidationResult {
  // Size check
  if (fileSize > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: '파일 크기가 50MB를 초과합니다.',
    };
  }

  // MIME type check
  if (!ALLOWED_MIME_TYPES.includes(mimeType as 'application/pdf')) {
    return {
      valid: false,
      error: 'PDF 파일만 업로드 가능합니다.',
    };
  }

  // Magic bytes check
  const bytes = new Uint8Array(buffer, 0, 4);
  const isPdf = PDF_MAGIC_BYTES.every((b, i) => bytes[i] === b);
  if (!isPdf) {
    return {
      valid: false,
      error: '올바른 PDF 파일이 아닙니다.',
    };
  }

  return { valid: true };
}
