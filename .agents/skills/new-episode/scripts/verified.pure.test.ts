import { describe, expect, it } from 'vitest';
import { frontmatterValue } from '../../../../src/lib/staging-file.pure.ts';
import { approveText, parseApproveArgs } from './verified.pure.ts';

/*
 * The approve.ts command line and the entry it appends; the gate tiers are tested in src/lib/staging-file.pure.test.ts.
 */

const GENERATED = '2026-10-12T09:00:00Z';
const HAN = { by: 'human:han', at: '2026-10-12T09:30:00Z' };

function file(verified: string, generated = GENERATED): string {
  return `---\ntype: brief\ntitle: T\nstatus: draft\ngenerated:\n  by: claude-code/opus-5.5\n  at: ${generated}\n${verified}---\n\n# T\n`;
}

function list(...entries: { by: string; at: string }[]): string {
  return `verified:\n${entries.map(({ by, at }) => `  - by: ${by}\n    at: ${at}\n`).join('')}`;
}

describe('approveText', () => {
  it('appends the machine entry beside Han\'s without overwriting', () => {
    // ARRANGE
    const text = file(list(HAN));
    // ACT
    const result = approveText(text, 'process:markdown-harness', '2026-10-13T12:00:00Z');
    // ASSERT
    expect(frontmatterValue(result, 'verified')).toEqual([HAN, { by: 'process:markdown-harness', at: '2026-10-13T12:00:00Z' }]);
  });

  it('refuses a by that is not an actor', () => {
    // ARRANGE
    const text = file('');
    // ACT
    const act = () => approveText(text, 'han', '2026-10-13T12:00:00Z');
    // ASSERT
    expect(act).toThrow('not an actor');
  });
});

describe('parseApproveArgs', () => {
  it('defaults by to human:han and reads --by in either position', () => {
    // ARRANGE
    const args = [['a.md'], ['a.md', '--by', 'process:markdown-harness'], ['--by', 'process:markdown-harness', 'a.md']];
    // ACT
    const parsed = args.map(parseApproveArgs);
    // ASSERT
    expect(parsed).toEqual([
      { file: 'a.md', by: 'human:han' },
      { file: 'a.md', by: 'process:markdown-harness' },
      { file: 'a.md', by: 'process:markdown-harness' },
    ]);
  });

  it('returns a usage error for no file, a dangling --by, a bad actor or extra arguments', () => {
    // ARRANGE
    const args = [[], ['a.md', '--by'], ['a.md', '--by', 'han'], ['a.md', 'b.md']];
    // ACT
    const parsed = args.map(parseApproveArgs);
    // ASSERT
    expect(parsed.every((result) => typeof result === 'string')).toBe(true);
  });
});
