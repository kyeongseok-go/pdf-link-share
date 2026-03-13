/**
 * Generates a random ID using the Web Crypto API.
 * Compatible with Edge Runtime (Cloudflare Workers).
 */
const ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

export function generateId(size: number = 12): string {
  const bytes = new Uint8Array(size);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => ALPHABET[b % ALPHABET.length])
    .join('');
}

export function generateShareId(): string {
  return generateId(8);
}

export function generateDocumentId(): string {
  return generateId(12);
}
