import { describe, expect, it } from 'vitest';
import { checkResearchSources } from './research-sources.pure';

/*
 * In-memory research files: frontmatter `sources` against the `[^id]` footnotes
 * of the body, built to break exactly one direction per test.
 */

const FILE = 'research/recall/research.md';

function research(ids: readonly string[], body: string): string {
  const sources = ids.flatMap((id) => [`  - id: ${id}`, `    resource: https://example.com/${id}`, `    title: ${id}`]);
  return ['---', 'type: research', 'sources:', ...sources, '---', '', '# Why?', '', body, ''].join('\n');
}

describe('success cases', () => {
  it('finds nothing when every footnote is a source, every source is cited and every footnote is defined', () => {
    // ARRANGE
    const markdown = research(
      ['liu', 'hsieh'],
      '1. U-shaped [^liu]. Biased [^hsieh][^liu].\n\n[^liu]: Liu et al.\n[^hsieh]: Hsieh et al.',
    );
    // ACT
    const findings = checkResearchSources(FILE, markdown);
    // ASSERT
    expect(findings).toEqual([]);
  });
});

describe('failure cases', () => {
  it('names a footnote that no source has', () => {
    // ARRANGE
    const markdown = research(['liu'], 'A [^liu] and B [^ghost].\n\n[^liu]: Liu.\n[^ghost]: Ghost.');
    const expected = [{ kind: 'research-sources', file: FILE }];
    const expectedId = '[^ghost]';
    // ACT
    const findings = checkResearchSources(FILE, markdown);
    // ASSERT
    expect(findings).toMatchObject(expected);
    expect(findings[0].message).toContain(expectedId);
  });

  it('names a source that no Finding cites', () => {
    // ARRANGE
    const markdown = research(['liu', 'unused'], 'A [^liu].\n\n[^liu]: Liu.\n[^unused]: Unused.');
    const expected = [{ kind: 'research-sources', file: FILE }];
    const expectedId = 'unused';
    // ACT
    const findings = checkResearchSources(FILE, markdown);
    // ASSERT
    expect(findings).toMatchObject(expected);
    expect(findings[0].message).toContain(expectedId);
  });

  it('names a cited source whose footnote has no definition', () => {
    // ARRANGE
    const markdown = research(['liu'], 'A [^liu].');
    const expected = [{ kind: 'research-sources', file: FILE }];
    const expectedId = '[^liu]:';
    // ACT
    const findings = checkResearchSources(FILE, markdown);
    // ASSERT
    expect(findings).toMatchObject(expected);
    expect(findings[0].message).toContain(expectedId);
  });

  it('names a footnote definition that nothing cites', () => {
    // ARRANGE
    const markdown = research(['liu'], 'A [^liu].\n\n[^liu]: Liu.\n[^extra]: Extra.');
    const expected = [{ kind: 'research-sources', file: FILE }];
    const expectedId = '[^extra]';
    // ACT
    const findings = checkResearchSources(FILE, markdown);
    // ASSERT
    expect(findings).toMatchObject(expected);
    expect(findings[0].message).toContain(expectedId);
  });
});

describe('edge cases', () => {
  it('finds a footnote in a file whose frontmatter has no sources, and no uncited source', () => {
    // ARRANGE
    const markdown = ['---', 'type: research', '---', '', '# Why?', '', 'A [^liu].', '', '[^liu]: Liu.', ''].join('\n');
    const expected = [{ kind: 'research-sources', file: FILE }];
    // ACT
    const findings = checkResearchSources(FILE, markdown);
    // ASSERT
    expect(findings).toMatchObject(expected);
  });

  it('ignores a footnote-looking marker inside a code fence', () => {
    // ARRANGE
    const markdown = research(['liu'], 'A [^liu].\n\n```\n[^fake]\n```\n\n[^liu]: Liu.');
    // ACT
    const findings = checkResearchSources(FILE, markdown);
    // ASSERT
    expect(findings).toEqual([]);
  });
});
