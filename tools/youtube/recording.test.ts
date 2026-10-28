import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { allRecordingViolations } from './recording-disk.ts';

const ROOT = path.resolve(__dirname, '../..');

describe('success cases', () => {
  it('finds no violation in any Recording folder of the Episode folders (else fix the file named, or re-run /episode-match-slide-starts)', () => {
    // ARRANGE
    const expected: unknown[] = [];
    // ACT
    const broken = allRecordingViolations(ROOT);
    // ASSERT
    expect(broken).toEqual(expected);
  });
});
