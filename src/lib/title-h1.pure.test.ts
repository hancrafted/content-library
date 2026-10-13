import { describe, expect, it } from 'vitest';
import { checkTitleMatchesH1 } from './title-h1.pure';

const FILE = 'docs/features/x.md';

function guide(title: string, h1: string): string {
  return ['---', 'type: feature-guide', `title: ${title}`, '---', '', h1, '', 'Body.', ''].join('\n');
}

describe('success cases', () => {
  it('finds nothing when the title equals the h1', () => {
    // ARRANGE
    const markdown = guide('Episode chrome', '# Episode chrome');
    // ACT
    const findings = checkTitleMatchesH1(FILE, markdown);
    // ASSERT
    expect(findings).toEqual([]);
  });

  it('compares a Dossier h1 without its {#slug}', () => {
    // ARRANGE
    const markdown = guide('Budget', '# Budget {#budget}');
    // ACT
    const findings = checkTitleMatchesH1(FILE, markdown);
    // ASSERT
    expect(findings).toEqual([]);
  });

  it('reads a quoted YAML title as its text', () => {
    // ARRANGE
    const markdown = guide("'Issue tracker: GitHub'", '# Issue tracker: GitHub');
    // ACT
    const findings = checkTitleMatchesH1(FILE, markdown);
    // ASSERT
    expect(findings).toEqual([]);
  });
});

describe('failure cases', () => {
  it('names a file whose title differs from its h1, with both', () => {
    // ARRANGE
    const markdown = guide('Chrome', '# Episode chrome');
    const expected = [{ kind: 'title', file: FILE }];
    // ACT
    const findings = checkTitleMatchesH1(FILE, markdown);
    // ASSERT
    expect(findings).toMatchObject(expected);
    expect(findings[0].message).toContain('Chrome');
    expect(findings[0].message).toContain('Episode chrome');
  });

  it('names a file with a title and no h1', () => {
    // ARRANGE
    const markdown = ['---', 'title: Lonely', '---', '', 'No heading.', ''].join('\n');
    const expected = [{ kind: 'title', file: FILE }];
    // ACT
    const findings = checkTitleMatchesH1(FILE, markdown);
    // ASSERT
    expect(findings).toMatchObject(expected);
  });
});

describe('edge cases', () => {
  it('ignores a "# " line inside a code fence', () => {
    // ARRANGE
    const markdown = ['---', 'title: Real', '---', '', '# Real', '', '```', '# not a heading', '```', ''].join('\n');
    // ACT
    const findings = checkTitleMatchesH1(FILE, markdown);
    // ASSERT
    expect(findings).toEqual([]);
  });

  it('yields no finding for a file with no title: markdown-harness requires the key and reports it', () => {
    // ARRANGE
    const markdown = ['---', 'type: x', '---', '', '# Heading', ''].join('\n');
    // ACT
    const findings = checkTitleMatchesH1(FILE, markdown);
    // ASSERT
    expect(findings).toEqual([]);
  });
});
