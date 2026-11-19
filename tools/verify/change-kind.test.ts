import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const CLI = path.join(import.meta.dirname, 'change-kind.ts');
const printedBy = (stdin: string): string => spawnSync('node', [CLI], { input: stdin, encoding: 'utf8' }).stdout;

describe('the change-kind CLI', () => {
  it.each([
    ['Markdown only', 'docs/a.md\nREADME.md\n', 'build=false\ndocs-only=true\n'],
    ['a .ts path', 'docs/a.md\nsrc/app/page.tsx\n', 'build=true\ndocs-only=false\n'],
    ['empty input', '', 'build=false\ndocs-only=false\n'],
  ])('prints the two lines the workflow appends to GITHUB_OUTPUT for %s', (_name, stdin, expected) => {
    // ARRANGE
    // ACT
    const printed = printedBy(stdin);
    // ASSERT
    expect(printed).toBe(expected);
  });
});
