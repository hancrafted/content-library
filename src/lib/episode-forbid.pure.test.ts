import { describe, expect, it } from 'vitest';
import { findForbidden, parseForbidden, parseSpecAssembleArgs } from './episode-forbid.pure';

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
  it.each([
    ['an empty list', ['ep', '--forbid', '']],
    ['a list of only commas', ['ep', '--forbid', ',']],
    ['another flag as the value', ['ep', '--forbid', '--x']],
    ['no value', ['ep', '--forbid']],
    ['a second positional', ['ep', 'more']],
    ['no Episode', []],
  ])('refuses %s as a usage error', (_name, argv) => {
    // ARRANGE
    const expected = 'error';
    // ACT
    const parsed = parseSpecAssembleArgs(argv);
    // ASSERT
    expect(Object.keys(parsed)).toEqual([expected]);
  });

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
  it('reads the Episode and the terms of the command line, in either order', () => {
    // ARRANGE
    const expected = { episode: 'ep', forbid: ['a', 'b'] };
    // ACT
    const after = parseSpecAssembleArgs(['ep', '--forbid', 'a, b']);
    const before = parseSpecAssembleArgs(['--forbid', 'a,b', 'ep']);
    // ASSERT
    expect(after).toEqual(expected);
    expect(before).toEqual(expected);
  });

  it('leaves forbid undefined when the flag is absent', () => {
    // ARRANGE
    const expected = { episode: 'ep', forbid: undefined };
    // ACT
    const parsed = parseSpecAssembleArgs(['ep']);
    // ASSERT
    expect(parsed).toEqual(expected);
  });

  it('reports every term on a line', () => {
    // ARRANGE
    const files = { 'a.md': 'old and older' };
    // ACT
    const hits = findForbidden(files, ['old', 'older']);
    // ASSERT
    expect(hits.map(({ term }) => term)).toEqual(['old', 'older']);
  });
});
