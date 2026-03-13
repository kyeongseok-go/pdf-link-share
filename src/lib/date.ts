import type { ExpiryOption } from '@/types';
import { EXPIRY_DAYS, EXPIRING_SOON_DAYS } from './constants';

/**
 * Computes the expiry Date from now + days.
 */
export function computeExpiresAt(option: ExpiryOption): Date {
  const days = EXPIRY_DAYS[option];
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

/**
 * Returns true if the document is expired.
 */
export function isExpired(expiresAt: string): boolean {
  return new Date(expiresAt) < new Date();
}

/**
 * Returns remaining milliseconds until expiry.
 */
export function getRemainingMs(expiresAt: string): number {
  return new Date(expiresAt).getTime() - Date.now();
}

/**
 * Returns true if expiring within EXPIRING_SOON_DAYS.
 */
export function isExpiringSoon(expiresAt: string): boolean {
  const remainingMs = getRemainingMs(expiresAt);
  return remainingMs > 0 && remainingMs < EXPIRING_SOON_DAYS * 24 * 60 * 60 * 1000;
}

/**
 * Formats a date string to Korean locale.
 * e.g. "2026년 3월 20일"
 */
export function formatKoreanDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Formats remaining time to Korean string.
 * e.g. "2일 14시간"
 */
export function formatRemainingTime(expiresAt: string): string {
  const ms = getRemainingMs(expiresAt);
  if (ms <= 0) return '만료됨';

  const totalHours = Math.floor(ms / (1000 * 60 * 60));
  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;

  if (days > 0) {
    return `${days}일 ${hours}시간`;
  }
  const minutes = Math.floor(ms / (1000 * 60)) % 60;
  if (totalHours > 0) {
    return `${totalHours}시간 ${minutes}분`;
  }
  return `${minutes}분`;
}

/**
 * Formats a short date for display.
 * e.g. "2026.03.20"
 */
export function formatShortDate(dateStr: string): string {
  const date = new Date(dateStr);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}.${m}.${d}`;
}

/**
 * Formats file size to human-readable string.
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}
