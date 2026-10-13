import { describe, expect, it } from 'vitest';
import { appendVerified, frontmatterField, frontmatterValue, gateTier, verifiedProblems } from './staging-file.pure';

/*
 * A Staging file's frontmatter, its gate tier from `verified` and `generated.at` (design-ADR 0005), and the
 * approval entry appended to it.
 */

const GENERATED = '2026-10-12T09:00:00Z';
const MACHINE = { by: 'process:markdown-harness', at: '2026-10-12T09:05:00Z' };
const HAN = { by: 'human:han', at: '2026-10-12T09:30:00Z' };
const NOW = { by: 'human:han', at: '2026-10-13T12:00:00Z' };

function file(verified: string, generated = GENERATED): string {
  return `---\ntype: brief\ntitle: T\nstatus: draft\ngenerated:\n  by: claude-code/opus-5.5\n  at: ${generated}\n${verified}---\n\n# T\n`;
}

function list(...entries: { by: string; at: string }[]): string {
  return `verified:\n${entries.map(({ by, at }) => `  - by: ${by}\n    at: ${at}\n`).join('')}`;
}

const BARE_HAN = 'verified:\n  by: human:han\n  at: 2026-10-12T09:30:00Z\n';

const DOSSIER = `---
type: dossier
title: 'Han''s budget'
quote: "a \\"spent\\" window"
generated:
  by: claude-code/opus-5.5
  at: 2026-10-12T00:00:00Z
after: top
---

# Budget {#budget}
`;

describe('success cases', () => {
  it('reads a frontmatter field as YAML does, plain, single-quoted or double-quoted', () => {
    // ARRANGE
    const expected = ['dossier', "Han's budget", 'a "spent" window'];
    // ACT
    const values = ['type', 'title', 'quote'].map((key) => frontmatterField(DOSSIER, key));
    // ASSERT
    expect(values).toEqual(expected);
  });

  it('reads a nested mapping in flow form, as OKF writes it', () => {
    // ARRANGE
    const flow = '---\ngenerated: { by: claude-code/opus-5.5, at: 2026-10-12T00:00:00Z }\n---\n';
    const expected = ['claude-code/opus-5.5', '2026-10-12T00:00:00Z'];
    // ACT
    const values = ['generated.by', 'generated.at'].map((key) => frontmatterField(flow, key));
    // ASSERT
    expect(values).toEqual(expected);
  });

  it('reads a dotted key one level into a nested mapping and stops at the next top-level key', () => {
    // ARRANGE
    const expected = ['claude-code/opus-5.5', '2026-10-12T00:00:00Z', null];
    // ACT
    const values = ['generated.by', 'generated.at', 'generated.after'].map((key) => frontmatterField(DOSSIER, key));
    // ASSERT
    expect(values).toEqual(expected);
  });

  it('reads a key at any depth and a number as its text', () => {
    // ARRANGE
    const deep = '---\na:\n  b:\n    c: 7\n---\n';
    const expected = '7';
    // ACT
    const value = frontmatterField(deep, 'a.b.c');
    // ASSERT
    expect(value).toBe(expected);
  });

  it('reads a field value of any shape', () => {
    // ARRANGE
    const expected = { by: 'claude-code/opus-5.5', at: '2026-10-12T00:00:00Z' };
    // ACT
    const value = frontmatterValue(DOSSIER, 'generated');
    // ASSERT
    expect(value).toEqual(expected);
  });

  it('reads checked for a machine entry and approved for a human entry', () => {
    // ARRANGE
    const checked = file(list(MACHINE));
    const approved = file(list(MACHINE, HAN));
    const expected = ['checked', 'approved'];
    // ACT
    const tiers = [gateTier(checked), gateTier(approved)];
    // ASSERT
    expect(tiers).toEqual(expected);
  });

  it('compares instants across UTC offsets', () => {
    // ARRANGE
    const text = file(list({ by: 'human:han', at: '2026-10-12T11:30:00+02:00' }));
    const expected = 'approved';
    // ACT
    const tier = gateTier(text);
    // ASSERT
    expect(tier).toBe(expected);
  });

  it('appends the first entry, leaving the other keys and the body as written', () => {
    // ARRANGE
    const text = file('');
    const expected = {
      verified: [NOW],
      generated: { by: 'claude-code/opus-5.5', at: GENERATED },
      tail: '---\n\n# T\n',
    };
    // ACT
    const result = appendVerified(text, NOW);
    // ASSERT
    expect(frontmatterValue(result, 'verified')).toEqual(expected.verified);
    expect(frontmatterValue(result, 'generated')).toEqual(expected.generated);
    expect(result.slice(-expected.tail.length)).toBe(expected.tail);
  });

  it('appends after the existing entries and never overwrites one', () => {
    // ARRANGE
    const text = file(list(MACHINE, HAN));
    const expected = [MACHINE, HAN, NOW];
    // ACT
    const entries = frontmatterValue(appendVerified(text, NOW), 'verified');
    // ASSERT
    expect(entries).toEqual(expected);
  });

  it('reads as approved once appended after the file was generated', () => {
    // ARRANGE
    const text = file(list(MACHINE));
    const expected = 'approved';
    // ACT
    const tier = gateTier(appendVerified(text, NOW));
    // ASSERT
    expect(tier).toBe(expected);
  });

  it('finds no problem in a list, a bare mapping or a file with no verified key', () => {
    // ARRANGE
    const texts = [file(list(MACHINE, HAN)), file(BARE_HAN), file('')];
    const expected = [[], [], []];
    // ACT
    const problems = texts.map(verifiedProblems);
    // ASSERT
    expect(problems).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('answers null for a field the frontmatter lacks, a scalar read through, a mapping, and a file with no frontmatter', () => {
    // ARRANGE
    const bare = '# Budget\n\ntype: dossier\n';
    const expected = [null, null, null, null];
    // ACT
    const values = [
      frontmatterField(DOSSIER, 'status'),
      frontmatterField(DOSSIER, 'type.x'),
      frontmatterField(DOSSIER, 'generated'),
      frontmatterField(bare, 'type'),
    ];
    // ASSERT
    expect(values).toEqual(expected);
  });

  it('reads unverified when there is no verified entry', () => {
    // ARRANGE
    const text = file('');
    const expected = 'unverified';
    // ACT
    const tier = gateTier(text);
    // ASSERT
    expect(tier).toBe(expected);
  });

  it('re-opens the gate when the file is edited after approval', () => {
    // ARRANGE
    const stale = file(list(MACHINE, HAN), '2026-10-12T10:00:00Z');
    const expected = 'unverified';
    // ACT
    const tier = gateTier(stale);
    // ASSERT
    expect(tier).toBe(expected);
  });

  it('ignores an entry by another actor, an entry without a UTC offset, and a file with no generated.at', () => {
    // ARRANGE
    const other = file(list({ by: 'human:someone', at: HAN.at }));
    const naive = file(list({ by: 'human:han', at: '2026-10-12T09:30:00' }));
    const ungenerated = `---\ntype: brief\n${BARE_HAN}---\n`;
    const none = 'no frontmatter\n';
    const expected = ['unverified', 'unverified', 'unverified', 'unverified'];
    // ACT
    const tiers = [other, naive, ungenerated, none].map(gateTier);
    // ASSERT
    expect(tiers).toEqual(expected);
  });

  it('names an entry whose actor is missing or whose datetime has no UTC offset', () => {
    // ARRANGE
    const noOffset = file(list({ by: 'human:han', at: '2026-10-12T09:30:00' }));
    const noActor = file('verified:\n  - at: 2026-10-12T09:30:00Z\n');
    const expected = [
      ['verified entry 1 needs an `at` datetime with a UTC offset.'],
      ['verified entry 1 needs an actor `by` (human:<id>, process:<id> or <producer>/<version>).'],
    ];
    // ACT
    const problems = [verifiedProblems(noOffset), verifiedProblems(noActor)];
    // ASSERT
    expect(problems).toEqual(expected);
  });

  it('names an empty verified list', () => {
    // ARRANGE
    const empty = file('verified: []\n');
    const expected = ['verified is empty; leave the key out instead.'];
    // ACT
    const problems = verifiedProblems(empty);
    // ASSERT
    expect(problems).toEqual(expected);
  });

  it('refuses to append to a file with no frontmatter', () => {
    // ARRANGE
    const text = '# Just a heading\n';
    const expected = 'no frontmatter';
    // ACT
    const act = () => appendVerified(text, NOW);
    // ASSERT
    expect(act).toThrow(expected);
  });

  it('refuses to append to a file whose frontmatter is not valid YAML', () => {
    // ARRANGE
    const broken = '---\ntype: [unclosed\n---\n# T\n';
    const expected = 'not valid YAML';
    // ACT
    const act = () => appendVerified(broken, NOW);
    // ASSERT
    expect(act).toThrow(expected);
  });
});

describe('edge cases', () => {
  it('reads a frontmatter field the same with CRLF line endings', () => {
    // ARRANGE
    const crlf = '---\r\ntype: brief\r\ngenerated:\r\n  at: 2026-10-12T09:00:00Z\r\n---\r\n\r\n# T\r\n';
    const expected = ['brief', '2026-10-12T09:00:00Z'];
    // ACT
    const values = ['type', 'generated.at'].map((key) => frontmatterField(crlf, key));
    // ASSERT
    expect(values).toEqual(expected);
  });

  it('keeps a comment line inside a nested block from ending it', () => {
    // ARRANGE
    const commented = '---\ngenerated:\n  by: human:han\n# who wrote it\n  at: 2026-10-12T00:00:00Z\n---\n';
    const expected = '2026-10-12T00:00:00Z';
    // ACT
    const value = frontmatterField(commented, 'generated.at');
    // ASSERT
    expect(value).toBe(expected);
  });

  it('reads invalid YAML frontmatter as no frontmatter, so its gate stays shut', () => {
    // ARRANGE
    const broken = `---\ntype: [unclosed\ngenerated:\n  at: ${GENERATED}\n${list(HAN)}---\n`;
    const expected = { field: null, tier: 'unverified', problems: [] };
    // ACT
    const observed = {
      field: frontmatterField(broken, 'type'),
      tier: gateTier(broken),
      problems: verifiedProblems(broken),
    };
    // ASSERT
    expect(observed).toEqual(expected);
  });

  it('reads a bare verified mapping as a one-element list, and counts an entry at the same instant as generated.at', () => {
    // ARRANGE
    const bare = file(BARE_HAN);
    const sameInstant = file(list({ by: 'human:han', at: GENERATED }));
    const expected = ['approved', 'approved'];
    // ACT
    const tiers = [gateTier(bare), gateTier(sameInstant)];
    // ASSERT
    expect(tiers).toEqual(expected);
  });

  it('keeps the checked tier when only the human entry is stale', () => {
    // ARRANGE
    const text = file(list(MACHINE, { by: 'human:han', at: '2026-10-12T08:00:00Z' }));
    const expected = 'checked';
    // ACT
    const tier = gateTier(text);
    // ASSERT
    expect(tier).toBe(expected);
  });

  it('turns a bare mapping into a list that keeps its entry when appending', () => {
    // ARRANGE
    const text = file('verified:\n  by: process:markdown-harness\n  at: 2026-10-12T09:05:00Z\n');
    const expected = [MACHINE, NOW];
    // ACT
    const entries = frontmatterValue(appendVerified(text, NOW), 'verified');
    // ASSERT
    expect(entries).toEqual(expected);
  });

  it('keeps CRLF frontmatter readable after appending', () => {
    // ARRANGE
    const crlf = file(list(MACHINE)).replaceAll('\n', '\r\n');
    const expected = 'approved';
    // ACT
    const tier = gateTier(appendVerified(crlf, NOW));
    // ASSERT
    expect(tier).toBe(expected);
  });
});
