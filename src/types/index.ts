export type ExpiryOption = '1d' | '7d' | '30d' | '90d';

export interface Document {
  id: string;
  shareId: string;
  fileName: string;
  fileSize: number;
  fileType: 'pdf';
  r2Key: string;
  allowDownload: boolean;
  expiresAt: string; // ISO 8601
  uploaderIp: string | null;
  viewCount: number;
  createdAt: string;
  deletedAt: string | null;
}

export interface UploadRequest {
  file: File;
  expiresIn: ExpiryOption;
  allowDownload: boolean;
  generateQr: boolean;
}

export interface UploadResponse {
  success: true;
  shareId: string;
  shareUrl: string;
  expiresAt: string;
  fileName: string;
}

export interface UploadError {
  success: false;
  error: 'PDF_ONLY' | 'FILE_TOO_LARGE' | 'RATE_LIMITED' | 'UPLOAD_FAILED' | 'INVALID_FILE';
  message: string;
}

export type UploadResult = UploadResponse | UploadError;

export interface DocumentMeta {
  fileName: string;
  fileSize: number;
  allowDownload: boolean;
  expiresAt: string;
  createdAt: string;
  viewCount: number;
}

export interface ApiError {
  success: false;
  error: string;
  message: string;
}

export interface ApiSuccess<T = undefined> {
  success: true;
  data?: T;
  message?: string;
}

export type ApiResponse<T = undefined> = ApiSuccess<T> | ApiError;

// Rate limiting
export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
}

// D1 row type
export interface DocumentRow {
  id: string;
  share_id: string;
  file_name: string;
  file_size: number;
  file_type: string;
  r2_key: string;
  allow_download: number;
  expires_at: string;
  uploader_ip: string | null;
  view_count: number;
  created_at: string;
  deleted_at: string | null;
}
