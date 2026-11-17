import { createHash } from 'node:crypto';

// decision: FE-001 §3.4
export function pairHash(english: string, german: string): string {
  return createHash('sha256').update(`${english.length}:${english}${german.length}:${german}`).digest('hex');
}
