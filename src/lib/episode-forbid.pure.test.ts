import { describe, expect, it } from 'vitest';
import { findForbidden, parseForbidden } from './episode-forbid.pure';

describe('success cases', () => {
  it('reports file, line and term, ignoring case', () => {
    // ARRANGE
    const files = { 'brief.md': 'a\nthe Old Name', 'b.html': 'fine' };
    const secondLine = 2;
    // ACT
    const hits = findForbidden(files, ['old name']);
    // ASSERT
    expect(hits).toEqual([{ file: 'brief.md', line: secondLine, term: 'old name' }]);
  });

  it('splits the option on commas and drops blanks', () => {
    // ARRANGE
    const value = 'R I E, old ,,';
    // ACT
    const terms = parseForbidden(value);
    // ASSERT
    expect(terms).toEqual(['R I E', 'old']);
  });
});

describe('failure cases', () => {
  it('reports nothing when no term occurs', () => {
    // ARRANGE
    const files = { 'brief.md': 'clean' };
    // ACT
    const hits = findForbidden(files, ['R I E']);
    // ASSERT
    expect(hits).toEqual([]);
  });
});

describe('edge cases', () => {
  it('reports every term on a line', () => {
    // ARRANGE
    const files = { 'a.md': 'old and older' };
    // ACT
    const hits = findForbidden(files, ['old', 'older']);
    // ASSERT
    expect(hits.map(({ term }) => term)).toEqual(['old', 'older']);
  });
});
