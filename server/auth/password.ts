import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

const KEY_LEN = 64;

/** Hash password with scrypt (salt embedded in return value). */
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, KEY_LEN).toString('hex');
  return `${salt}:${hash}`;
}

/** Verify plaintext against stored hash (supports legacy plaintext during migration). */
export function verifyPassword(password: string, stored: string): boolean {
  if (!stored) return false;
  if (!stored.includes(':')) {
    return password === stored;
  }
  const [salt, hash] = stored.split(':');
  if (!salt || !hash) return false;
  const derived = scryptSync(password, salt, KEY_LEN);
  const expected = Buffer.from(hash, 'hex');
  if (derived.length !== expected.length) return false;
  return timingSafeEqual(derived, expected);
}

export function isHashedPassword(stored: string): boolean {
  return stored.includes(':') && stored.split(':').length === 2;
}
