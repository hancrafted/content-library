import { describe, expect, it } from 'vitest';
import { unwrapPastedResult } from './pasted-result.pure';

const intent = '# Intent\n\n## Reader\nNew hires\n\n## Categories\n### Pricing\n### Support';

describe('success cases', () => {
  it('stores only the inside of a result wrapped in one fence', () => {
    // ARRANGE
    const pasted = '```markdown\n' + intent + '\n```';
    // ACT
    const stored = unwrapPastedResult(pasted);
    // ASSERT
    expect(stored).toBe(intent);
  });

  it('ignores a leading Result line and a trailing path line', () => {
    // ARRANGE
    const pasted = 'Result:\n```markdown\n' + intent + '\n```\n.scratch/task/intent.md';
    // ACT
    const stored = unwrapPastedResult(pasted);
    // ASSERT
    expect(stored).toBe(intent);
  });

  it('ignores a leading Ergebnis line, with blank lines around it', () => {
    // ARRANGE
    const pasted = 'Ergebnis:\n\n```md\n' + intent + '\n```\n\n.scratch/aufgabe/intent.md\n';
    // ACT
    const stored = unwrapPastedResult(pasted);
    // ASSERT
    expect(stored).toBe(intent);
  });

  it('keeps a fence nested inside the outer fence', () => {
    // ARRANGE
    const inner = 'Before\n```ts\nx\n```\nAfter';
    const pasted = '````markdown\n' + inner + '\n````';
    // ACT
    const stored = unwrapPastedResult(pasted);
    // ASSERT
    expect(stored).toBe(inner);
  });
});

describe('edge cases', () => {
  it('stores plain text exactly as pasted', () => {
    // ARRANGE
    const pasted = 'Result:\n' + intent + '\n';
    // ACT
    const stored = unwrapPastedResult(pasted);
    // ASSERT
    expect(stored).toBe(pasted);
  });

  it('stores text with prose around the fence exactly as pasted', () => {
    // ARRANGE
    const pasted = 'Here you go:\n```markdown\nbody\n```\nHope it helps.';
    // ACT
    const stored = unwrapPastedResult(pasted);
    // ASSERT
    expect(stored).toBe(pasted);
  });

  it('stores text with two fences exactly as pasted', () => {
    // ARRANGE
    const pasted = '```a\none\n```\n```b\ntwo\n```';
    // ACT
    const stored = unwrapPastedResult(pasted);
    // ASSERT
    expect(stored).toBe(pasted);
  });

  it('stores an unclosed fence exactly as pasted', () => {
    // ARRANGE
    const pasted = '```markdown\nbody';
    // ACT
    const stored = unwrapPastedResult(pasted);
    // ASSERT
    expect(stored).toBe(pasted);
  });

  it('stores an empty string as it is', () => {
    // ARRANGE
    const pasted = '';
    // ACT
    const stored = unwrapPastedResult(pasted);
    // ASSERT
    expect(stored).toBe(pasted);
  });
});

describe('failure cases', () => {
  it('stores text with two trailing lines after the fence exactly as pasted', () => {
    // ARRANGE
    const pasted = '```markdown\nbody\n```\nfirst line\nsecond line';
    // ACT
    const stored = unwrapPastedResult(pasted);
    // ASSERT
    expect(stored).toBe(pasted);
  });

  it('stores an empty fence exactly as pasted', () => {
    // ARRANGE
    const pasted = '```\n```';
    // ACT
    const stored = unwrapPastedResult(pasted);
    // ASSERT
    expect(stored).toBe(pasted);
  });
});
