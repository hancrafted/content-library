import { checkTitleMatchesH1 } from '@/pipeline/lib/title-h1.pure';
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

/*
 * The frontmatter keys design-ADR 0005 settles, checked on the real corpus and
 * the real markdown-harness config: a title equal to the h1 on every guide and
 * the glossary (the staging files are checked in episode-staging.test.ts), and
 * a datetime that must carry its UTC offset.
 */

const ROOT = path.join(__dirname, '../..');
const MH = path.join(ROOT, 'node_modules/.bin/mh');
const CONFIG = path.join(ROOT, 'markdown-harness.config.yaml');

/** Every markdown file the `feature-guide`, `agent-guide` and `glossary` rules govern, as a repo path. */
function guides(): string[] {
  const folders = ['docs/features', 'docs/design', 'docs/agents'];
  return [
    ...folders.flatMap((folder) =>
      readdirSync(path.join(ROOT, folder))
        .filter((name) => name.endsWith('.md'))
        .map((name) => `${folder}/${name}`),
    ),
    'GLOSSARY.md',
  ];
}

const FEATURE_GUIDE = (staleAfter: string): string =>
  ['---', 'type: feature-guide', 'title: Chrome', `stale_after: ${staleAfter}`, '---', '', '# Chrome', ''].join('\n');

/** `mh check` over a throwaway root holding one feature guide, under the repo's own config. */
function checkGuide(markdown: string): { status: number | null; violations: number } {
  const root = mkdtempSync(path.join(tmpdir(), 'mh-datetime-'));
  mkdirSync(path.join(root, 'docs/features'), { recursive: true });
  writeFileSync(path.join(root, 'docs/features/chrome.md'), markdown);
  const run = spawnSync(MH, ['check', '--root', root, '--config', CONFIG], { encoding: 'utf8' });
  const report = JSON.parse(run.stdout) as { result: { summary: { totalViolations: number } } };
  return { status: run.status, violations: report.result.summary.totalViolations };
}

describe('success cases', () => {
  it('finds every guide and the glossary titled as its h1', () => {
    // ARRANGE
    const files = guides();
    // ACT
    const findings = files.flatMap((file) => checkTitleMatchesH1(file, readFileSync(path.join(ROOT, file), 'utf8')));
    // ASSERT
    expect(files.length).toBeGreaterThan(10);
    expect(findings).toEqual([]);
  });

  it('accepts a datetime with a Z offset', () => {
    // ARRANGE
    const markdown = FEATURE_GUIDE('2027-01-11T00:00:00Z');
    const expected = { status: 0, violations: 0 };
    // ACT
    const result = checkGuide(markdown);
    // ASSERT
    expect(result).toEqual(expected);
  });

  it('accepts a datetime with a numeric offset', () => {
    // ARRANGE
    const markdown = FEATURE_GUIDE('2027-01-11T00:00:00+02:00');
    const expected = { status: 0, violations: 0 };
    // ACT
    const result = checkGuide(markdown);
    // ASSERT
    expect(result).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('rejects a datetime without a UTC offset', () => {
    // ARRANGE
    const markdown = FEATURE_GUIDE('2027-01-11T00:00:00');
    const expected = { status: 1, violations: 1 };
    // ACT
    const result = checkGuide(markdown);
    // ASSERT
    expect(result).toEqual(expected);
  });

  it('rejects a date without a time', () => {
    // ARRANGE
    const markdown = FEATURE_GUIDE('2027-01-11');
    const expected = { status: 1, violations: 1 };
    // ACT
    const result = checkGuide(markdown);
    // ASSERT
    expect(result).toEqual(expected);
  });
});
