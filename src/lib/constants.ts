import type { ExpiryOption } from '@/types';

export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB in bytes

export const EXPIRY_OPTIONS: Array<{
  value: ExpiryOption;
  label: string;
  days: number;
  description: string;
}> = [
  { value: '1d', label: '1일', days: 1, description: '하루' },
  { value: '7d', label: '7일', days: 7, description: '일주일' },
  { value: '30d', label: '30일', days: 30, description: '한 달' },
  { value: '90d', label: '90일', days: 90, description: '석 달' },
];

export const DEFAULT_EXPIRY: ExpiryOption = '7d';

export const ALLOWED_MIME_TYPES = ['application/pdf'] as const;

export const PDF_MAGIC_BYTES = [0x25, 0x50, 0x44, 0x46] as const; // %PDF

export const RATE_LIMIT = {
  UPLOADS_PER_HOUR: 10,
  UPLOADS_PER_DAY: 50,
} as const;

export const R2_KEY_PREFIX = 'docs';

export const EXPIRY_DAYS: Record<ExpiryOption, number> = {
  '1d': 1,
  '7d': 7,
  '30d': 30,
  '90d': 90,
};

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://pdfweblink.pages.dev';

export const SITE_NAME = 'PDF 링크공유기';

export const EXPIRING_SOON_DAYS = 3; // Warning banner when < 3 days left
