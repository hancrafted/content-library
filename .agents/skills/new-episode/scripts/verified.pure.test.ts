import { describe, expect, it } from 'vitest';
import { appendVerified, approveText, gateTier, parseApproveArgs, verifiedEntries, verifiedProblems } from './verified.pure.ts';

/*
 * A staging file's gate tier from `verified` and `generated.at`, and the approval entry appended to it.
 */

const GENERATED = '2026-10-12T09:00:00Z';
const MACHINE = { by: 'process:markdown-harness', at: '2026-10-12T09:05:00Z' };
const HAN = { by: 'human:han', at: '2026-10-12T09:30:00Z' };

function file(verified: string, generated = GENERATED): string {
  return `---\ntype: brief\ntitle: T\nstatus: draft\ngenerated:\n  by: claude-code/opus-5.5\n  at: ${generated}\n${verified}---\n\n# T\n`;
}

function list(...entries: { by: string; at: string }[]): string {
  return `verified:\n${entries.map(({ by, at }) => `  - by: ${by}\n    at: ${at}\n`).join('')}`;
}

describe('gateTier', () => {
  it('reads unverified when there is no verified entry', () => {
    // ARRANGE
    const text = file('');
    // ACT
    const tier = gateTier(text);
    // ASSERT
    expect(tier).toBe('unverified');
  });

  it('reads checked for a machine entry and approved for a human entry', () => {
    // ARRANGE
    const checked = file(list(MACHINE));
    const approved = file(list(MACHINE, HAN));
    // ACT
    const tiers = [gateTier(checked), gateTier(approved)];
    // ASSERT
    expect(tiers).toEqual(['checked', 'approved']);
  });

  it('reads a bare mapping as a one-element list', () => {
    // ARRANGE
    const text = file('verified:\n  by: human:han\n  at: 2026-10-12T09:30:00Z\n');
    // ACT
    const tier = gateTier(text);
    // ASSERT
    expect(tier).toBe('approved');
  });

  it('counts an entry written at the same instant as generated.at', () => {
    // ARRANGE
    const text = file(list({ by: 'human:han', at: GENERATED }));
    // ACT
    const tier = gateTier(text);
    // ASSERT
    expect(tier).toBe('approved');
  });

  it('compares instants across UTC offsets', () => {
    // ARRANGE
    const text = file(list({ by: 'human:han', at: '2026-10-12T11:30:00+02:00' }));
    // ACT
    const tier = gateTier(text);
    // ASSERT
    expect(tier).toBe('approved');
  });

  it('re-opens the gate when the file is edited after approval', () => {
    // ARRANGE
    const stale = file(list(MACHINE, HAN), '2026-10-12T10:00:00Z');
    // ACT
    const tier = gateTier(stale);
    // ASSERT
    expect(tier).toBe('unverified');
  });

  it('keeps the checked tier when only the human entry is stale', () => {
    // ARRANGE
    const text = file(list(MACHINE, { by: 'human:han', at: '2026-10-12T08:00:00Z' }), '2026-10-12T09:00:00Z');
    // ACT
    const tier = gateTier(text);
    // ASSERT
    expect(tier).toBe('checked');
  });

  it('ignores an entry by another actor, an entry without a UTC offset, and a file with no generated.at', () => {
    // ARRANGE
    const other = file(list({ by: 'human:someone', at: HAN.at }));
    const naive = file(list({ by: 'human:han', at: '2026-10-12T09:30:00' }));
    const ungenerated = '---\ntype: brief\nverified:\n  by: human:han\n  at: 2026-10-12T09:30:00Z\n---\n';
    const none = 'no frontmatter\n';
    // ACT
    const tiers = [other, naive, ungenerated, none].map(gateTier);
    // ASSERT
    expect(tiers).toEqual(['unverified', 'unverified', 'unverified', 'unverified']);
  });
});

describe('verifiedEntries', () => {
  it('returns the list entries, or the one bare mapping, in order', () => {
    // ARRANGE
    const listed = file(list(MACHINE, HAN));
    const bare = file('verified:\n  by: human:han\n  at: 2026-10-12T09:30:00Z\n');
    // ACT
    const entries = [verifiedEntries(listed), verifiedEntries(bare)];
    // ASSERT
    expect(entries).toEqual([[MACHINE, HAN], [HAN]]);
  });
});

describe('appendVerified', () => {
  const NOW = { by: 'human:han', at: '2026-10-13T12:00:00Z' };

  it('adds the first entry when the file has none, leaving the other keys and the body', () => {
    // ARRANGE
    const text = file('');
    // ACT
    const result = appendVerified(text, NOW);
    // ASSERT
    expect(verifiedEntries(result)).toEqual([NOW]);
    expect(result).toContain('status: draft');
    expect(result).toContain('generated:\n  by: claude-code/opus-5.5\n  at: 2026-10-12T09:00:00Z');
    expect(result.endsWith('---\n\n# T\n')).toBe(true);
  });

  it('appends after the existing entries and never overwrites one', () => {
    // ARRANGE
    const text = file(list(MACHINE, HAN));
    // ACT
    const result = appendVerified(text, NOW);
    // ASSERT
    expect(verifiedEntries(result)).toEqual([MACHINE, HAN, NOW]);
  });

  it('turns a bare mapping into a list that keeps its entry', () => {
    // ARRANGE
    const text = file('verified:\n  by: process:markdown-harness\n  at: 2026-10-12T09:05:00Z\n');
    // ACT
    const result = appendVerified(text, NOW);
    // ASSERT
    expect(verifiedEntries(result)).toEqual([MACHINE, NOW]);
    expect(result).toContain('verified:\n  - by:');
  });

  it('reads as approved once appended after the file was generated', () => {
    // ARRANGE
    const text = file(list(MACHINE));
    // ACT
    const tier = gateTier(appendVerified(text, NOW));
    // ASSERT
    expect(tier).toBe('approved');
  });

  it('refuses a file with no frontmatter', () => {
    // ARRANGE
    const text = '# Just a heading\n';
    // ACT
    const act = () => appendVerified(text, NOW);
    // ASSERT
    expect(act).toThrow('no frontmatter');
  });
});

describe('verifiedProblems', () => {
  it('accepts a list, a bare mapping and a file with no verified key', () => {
    // ARRANGE
    const texts = [file(list(MACHINE, HAN)), file('verified:\n  by: human:han\n  at: 2026-10-12T09:30:00Z\n'), file('')];
    // ACT
    const problems = texts.map(verifiedProblems);
    // ASSERT
    expect(problems).toEqual([[], [], []]);
  });

  it('names an entry whose actor is missing or whose datetime has no UTC offset', () => {
    // ARRANGE
    const noOffset = file(list({ by: 'human:han', at: '2026-10-12T09:30:00' }));
    const noActor = file('verified:\n  - at: 2026-10-12T09:30:00Z\n');
    // ACT
    const problems = [verifiedProblems(noOffset), verifiedProblems(noActor)];
    // ASSERT
    expect(problems).toEqual([
      ['verified entry 1 needs an `at` datetime with a UTC offset.'],
      ['verified entry 1 needs an actor `by` (human:<id>, process:<id> or <producer>/<version>).'],
    ]);
  });
});

describe('approveText', () => {
  it('appends the machine entry beside Han\'s without overwriting', () => {
    // ARRANGE
    const text = file(list(HAN));
    // ACT
    const result = approveText(text, 'process:markdown-harness', '2026-10-13T12:00:00Z');
    // ASSERT
    expect(verifiedEntries(result)).toEqual([HAN, { by: 'process:markdown-harness', at: '2026-10-13T12:00:00Z' }]);
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
