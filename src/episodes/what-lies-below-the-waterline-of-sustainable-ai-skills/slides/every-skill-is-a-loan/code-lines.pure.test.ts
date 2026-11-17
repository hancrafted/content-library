import { describe, expect, it } from 'vitest';
import { keyedLines } from './code-lines.pure';

describe('success cases', () => {
  it('keeps every line and its order', () => {
    // ARRANGE
    const lines = ['---', 'name: a', '---'];
    // ACT
    const shown = keyedLines(lines).map(({ line }) => line);
    // ASSERT
    expect(shown).toEqual(['---', 'name: a', '---']);
  });
});

describe('failure cases', () => {
  it('keys the two equal front matter fences apart, so no two lines share a key', () => {
    // ARRANGE
    const lines = ['---', 'name: collect-sediment-sample', '---'];
    const distinct = lines.length;
    // ACT
    const keys = keyedLines(lines).map(({ key }) => key);
    // ASSERT
    expect(new Set(keys).size).toBe(distinct);
  });
});

describe('edge cases', () => {
  it('keys a line by its text and how often it came before, so a line keeps its key when lines are added after it', () => {
    // ARRANGE
    const before = keyedLines(['---', 'name: a', '---']);
    // ACT
    const after = keyedLines(['---', 'name: a', '---', 'body']);
    // ASSERT
    expect(after.slice(0, before.length)).toEqual(before);
  });
});
