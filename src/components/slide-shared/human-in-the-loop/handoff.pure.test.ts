import { describe, expect, it } from 'vitest';
import { HANDOFF_KINDS, handoffBlocks, handoffProblems, parseHandoff } from './handoff.pure';

const fence = (body: string) => '```handoff\n' + body + '\n```';

describe('success cases', () => {
  it('reads every kind from its own small shape', () => {
    // ARRANGE
    const bodies = [
      'kind: text\ntext: hello',
      'kind: requirements\nitems: [200 guests]',
      'kind: spec\ngoal: g\nrequirements: [r]\noutOfScope: [o]\nslices: [s]',
      'kind: tickets\ntickets:\n  - {id: a, title: A, acceptance: [x], blockedBy: []}',
      'kind: research\nsubject: s\nsummary: m\nfacts: [f]',
      'kind: comparison\ncriteria: [c]\nranking:\n  - {name: n, why: w}',
    ];
    // ACT
    const kinds = bodies.map((body) => {
      const read = parseHandoff(body);
      return 'handoff' in read ? read.handoff.kind : read.problem;
    });
    // ASSERT
    expect(kinds).toEqual([...HANDOFF_KINDS]);
  });

  it('finds the fenced handoff blocks of a chat text in order', () => {
    // ARRANGE
    const first = 'kind: text\ntext: one';
    const second = 'kind: text\ntext: two';
    const text = `intro\n${fence(first)}\nbetween\n${fence(second)}\n`;
    // ACT
    const blocks = handoffBlocks(text);
    // ASSERT
    expect(blocks).toEqual([first, second]);
  });

  it('accepts blocks whose kinds are the ones expected', () => {
    // ARRANGE
    const text = fence('kind: requirements\nitems: [a]');
    // ACT
    const problems = handoffProblems(text, ['requirements']);
    // ASSERT
    expect(problems).toEqual([]);
  });
});

describe('failure cases', () => {
  it('says why a block is not a handoff', () => {
    // ARRANGE
    const unknown = 'kind: poem\ntext: x';
    const noKind = 'text: x';
    const broken = 'kind: [';
    // ACT
    const problems = [unknown, noKind, broken].map((body) => {
      const read = parseHandoff(body);
      return 'problem' in read ? read.problem : '';
    });
    // ASSERT
    expect(problems.every((problem) => problem.length > 0)).toBe(true);
    expect(problems[0]).toContain('poem');
  });

  it('names the field a kind is missing', () => {
    // ARRANGE
    const body = 'kind: spec\ngoal: g\nrequirements: [r]\noutOfScope: [o]';
    // ACT
    const read = parseHandoff(body);
    // ASSERT
    expect('problem' in read && read.problem).toContain('slices');
  });

  it('rejects a ticket blocked by an unknown ticket', () => {
    // ARRANGE
    const body = 'kind: tickets\ntickets:\n  - {id: a, title: A, acceptance: [x], blockedBy: [ghost]}';
    // ACT
    const read = parseHandoff(body);
    // ASSERT
    expect('problem' in read && read.problem).toContain('ghost');
  });

  it('reports a missing block and a block of the wrong kind', () => {
    // ARRANGE
    const text = fence('kind: text\ntext: x');
    // ACT
    const wrongKind = handoffProblems(text, ['spec']);
    const missing = handoffProblems('no block here', ['spec']);
    // ASSERT
    expect(wrongKind).toHaveLength(1);
    expect(wrongKind[0]).toContain('spec');
    expect(missing).toHaveLength(1);
  });
});

describe('edge cases', () => {
  it('expects no block when no kind is expected, and flags a surplus block', () => {
    // ARRANGE
    const text = fence('kind: text\ntext: x');
    // ACT
    const none = handoffProblems('', []);
    const surplus = handoffProblems(text, []);
    // ASSERT
    expect(none).toEqual([]);
    expect(surplus).toHaveLength(1);
  });
});
