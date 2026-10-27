import { createHash } from 'node:crypto';

/*
 * The hash a saved run carries (FE-001 §3.4): sha256 over the English and German files together, so one run resumes in
 * either language and an edit to either file retires it. Build time only: the client gets the hex string.
 */

/** The sha256 hex of the two files; each is length-prefixed so moving text across the boundary changes the hash. */
export function pairHash(english: string, german: string): string {
  return createHash('sha256').update(`${english.length}:${english}${german.length}:${german}`).digest('hex');
}
