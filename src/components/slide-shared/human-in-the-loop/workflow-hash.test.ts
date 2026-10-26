import { pairHash } from '@/lib/pair-hash.pure';
import { describe, expect, it } from 'vitest';
import { WORKFLOW_IDS, hashFor } from './workflow-data';

const SHA256_HEX = /^[0-9a-f]{64}$/;

describe('success cases', () => {
  it('is a sha256 of the English and German files together', () => {
    // ARRANGE
    const english = 'id: a';
    const german = 'id: a # de';
    // ACT
    const hash = pairHash(english, german);
    // ASSERT
    expect(hash).toMatch(SHA256_HEX);
  });

  it('changes after an edit to either file', () => {
    // ARRANGE
    const before = pairHash('en', 'de');
    // ACT
    const afterEnglish = pairHash('en!', 'de');
    const afterGerman = pairHash('en', 'de!');
    // ASSERT
    expect(afterEnglish).not.toBe(before);
    expect(afterGerman).not.toBe(before);
  });

  it.each(WORKFLOW_IDS)('is one value for %s, the same whichever language the page shows', (id) => {
    // ARRANGE
    const first = hashFor(id);
    // ACT
    const second = hashFor(id);
    // ASSERT
    expect(first).toBe(second);
    expect(first).toMatch(SHA256_HEX);
  });
});

describe('failure cases', () => {
  it('tells a text moved from one file to the other from the original', () => {
    // ARRANGE
    const original = pairHash('a', 'b');
    // ACT
    const swapped = pairHash('b', 'a');
    // ASSERT
    expect(swapped).not.toBe(original);
  });
});

describe('edge cases', () => {
  it('tells "ab" + "c" from "a" + "bc"', () => {
    // ARRANGE
    const left = pairHash('ab', 'c');
    // ACT
    const right = pairHash('a', 'bc');
    // ASSERT
    expect(right).not.toBe(left);
  });

  it('hashes two empty files', () => {
    // ARRANGE
    const empty = '';
    // ACT
    const hash = pairHash(empty, empty);
    // ASSERT
    expect(hash).toMatch(SHA256_HEX);
  });
});
