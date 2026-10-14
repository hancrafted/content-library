import { describe, expect, it } from 'vitest';
import { checkResearchSources } from './research-sources.pure';

/*
 * In-memory research files: frontmatter `sources` against the `[n]` citations and
 * `[n]: <url> "title"` definitions of the body, built to break one rule per test.
 */

const FILE = 'research/recall/research.md';

interface Source {
  id: number | string;
  url: string;
}

function source(id: number, url = `https://example.com/${id}`): Source {
  return { id, url };
}

function research(sources: readonly Source[], body: string): string {
  const entries = sources.flatMap(({ id, url }) => [
    `  - id: ${id}`,
    `    resource: ${url}`,
    `    title: Source ${id}`,
  ]);
  return ['---', 'type: research', 'sources:', ...entries, '---', '', '# Why?', '', body, ''].join('\n');
}

function definition(id: number, url = `https://example.com/${id}`): string {
  return `[${id}]: <${url}> "Source ${id}"`;
}

describe('success cases', () => {
  it('finds nothing when ids run 1..n, every citation is defined and every definition URL is the resource', () => {
    // ARRANGE
    const markdown = research(
      [source(1), source(2)],
      `1. U-shaped [1]. Biased [2][1].\n\n${definition(1)}\n${definition(2)}`,
    );
    // ACT
    const findings = checkResearchSources(FILE, markdown);
    // ASSERT
    expect(findings).toEqual([]);
  });
});

describe('failure cases', () => {
  it('names a citation that has no definition', () => {
    // ARRANGE
    const markdown = research([source(1)], 'A [1].');
    const expected = [{ kind: 'research-sources', file: FILE }];
    const expectedId = '[1]';
    // ACT
    const findings = checkResearchSources(FILE, markdown);
    // ASSERT
    expect(findings).toMatchObject(expected);
    expect(findings[0].message).toContain(expectedId);
  });

  it('names a definition whose URL differs from the source resource', () => {
    // ARRANGE
    const markdown = research([source(1)], `A [1].\n\n${definition(1, 'https://example.com/other')}`);
    const expected = [{ kind: 'research-sources', file: FILE }];
    const expectedUrl = 'https://example.com/other';
    // ACT
    const findings = checkResearchSources(FILE, markdown);
    // ASSERT
    expect(findings).toMatchObject(expected);
    expect(findings[0].message).toContain(expectedUrl);
  });

  it('names a citation that no source has', () => {
    // ARRANGE
    const markdown = research([source(1)], `A [1] and B [2].\n\n${definition(1)}\n${definition(2)}`);
    const expected = [{ kind: 'research-sources', file: FILE }];
    const expectedId = '[2]';
    // ACT
    const findings = checkResearchSources(FILE, markdown);
    // ASSERT
    expect(findings).toMatchObject(expected);
    expect(findings[0].message).toContain(expectedId);
  });

  it('names a source that no Finding cites', () => {
    // ARRANGE
    const markdown = research([source(1), source(2)], `A [1].\n\n${definition(1)}\n${definition(2)}`);
    const expected = [{ kind: 'research-sources', file: FILE }];
    const expectedId = '[2]';
    // ACT
    const findings = checkResearchSources(FILE, markdown);
    // ASSERT
    expect(findings).toMatchObject(expected);
    expect(findings[0].message).toContain(expectedId);
  });

  it('names ids that are not contiguous from 1', () => {
    // ARRANGE
    const markdown = research([source(1), source(3)], `A [1][3].\n\n${definition(1)}\n${definition(3)}`);
    const expected = [{ kind: 'research-sources', file: FILE }];
    const expectedMessage = '1..2';
    // ACT
    const findings = checkResearchSources(FILE, markdown);
    // ASSERT
    expect(findings).toMatchObject(expected);
    expect(findings[0].message).toContain(expectedMessage);
  });

  it('names a slug id, which is not numeric', () => {
    // ARRANGE
    const markdown = research([{ id: 'liu', url: 'https://example.com/liu' }], 'A [1].');
    // ACT
    const findings = checkResearchSources(FILE, markdown);
    // ASSERT
    expect(findings[0]).toMatchObject({ kind: 'research-sources', file: FILE });
    expect(findings[0].message).toContain('"liu"');
  });

  it('names a leftover footnote', () => {
    // ARRANGE
    const markdown = research([source(1)], `A [1][^old].\n\n${definition(1)}\n[^old]: Old.`);
    const expected = [{ kind: 'research-sources', file: FILE }];
    const expectedId = '[^old]';
    // ACT
    const findings = checkResearchSources(FILE, markdown);
    // ASSERT
    expect(findings).toMatchObject(expected);
    expect(findings[0].message).toContain(expectedId);
  });
});

describe('edge cases', () => {
  it('finds a citation in a file whose frontmatter has no sources', () => {
    // ARRANGE
    const markdown = ['---', 'type: research', '---', '', '# Why?', '', 'A [1].', '', definition(1), ''].join('\n');
    const expected = [{ kind: 'research-sources', file: FILE }];
    // ACT
    const findings = checkResearchSources(FILE, markdown);
    // ASSERT
    expect(findings).toMatchObject(expected);
  });

  it('ignores a citation-looking marker inside a code fence or inline code', () => {
    // ARRANGE
    const markdown = research([source(1)], `A [1] and \`[7]\`.\n\n\`\`\`\n[9]\n\`\`\`\n\n${definition(1)}`);
    // ACT
    const findings = checkResearchSources(FILE, markdown);
    // ASSERT
    expect(findings).toEqual([]);
  });

  it('accepts a definition without a title', () => {
    // ARRANGE
    const markdown = research([source(1)], 'A [1].\n\n[1]: <https://example.com/1>');
    // ACT
    const findings = checkResearchSources(FILE, markdown);
    // ASSERT
    expect(findings).toEqual([]);
  });
});
