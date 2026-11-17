import { execFileSync } from 'node:child_process';
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';
import { dropGitEnvironment } from '../../tools/load/git-environment.fixture.ts';

const REPO = path.resolve(import.meta.dirname, '../..');
const ARCHGATE = path.join(REPO, 'node_modules/.bin/archgate');
const ADR = '.archgate/adrs/GEN-006-comments.md';
const RULES = '.archgate/adrs/GEN-006-comments.rules.ts';
const PROBE_SCOPE = "files: ['src/**/*']";
const roots: string[] = [];

interface Violation {
  message: string;
  file?: string;
  line?: number;
}

const write = (root: string, file: string, text: string) => {
  mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
  writeFileSync(path.join(root, file), text);
};

const envOutsideAnyGitHook: NodeJS.ProcessEnv = { ...process.env };
dropGitEnvironment(envOutsideAnyGitHook);

const git = (root: string, ...args: string[]) =>
  execFileSync('git', ['-c', 'user.name=probe', '-c', 'user.email=probe@example.com', ...args], {
    cwd: root,
    env: envOutsideAnyGitHook,
  });

function projectWithGen006(): string {
  const root = mkdtempSync(path.join(tmpdir(), 'gen006-'));
  roots.push(root);
  cpSync(path.join(REPO, RULES), path.join(root, RULES));
  const adr = readFileSync(path.join(REPO, ADR), 'utf8').replace(/^files: \[.*\]$/m, PROBE_SCOPE);
  write(root, ADR, adr);
  write(root, '.archgate/config.json', '{"domains":{},"baseBranch":"main"}\n');
  git(root, 'init', '-q', '-b', 'main');
  write(root, 'src/staged.ts', 'export const a = 1;\n');
  git(root, 'add', '-A');
  git(root, 'commit', '-q', '-m', 'init');
  return root;
}

function checkStaged(root: string): Violation[] {
  let out: string;
  try {
    out = execFileSync(ARCHGATE, ['check', '--staged', '--adr', 'GEN-006', '--output', 'json'], {
      cwd: root,
      env: envOutsideAnyGitHook,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
  } catch (error) {
    out = (error as { stdout: string }).stdout;
  }
  return (JSON.parse(out) as { results: { violations: Violation[] }[] }).results.flatMap((r) => r.violations);
}

afterAll(() => roots.forEach((root) => rmSync(root, { recursive: true, force: true })));

describe('archgate check --staged through the real CLI', () => {
  it('checks only staged files, and reads a partly staged file from the working copy, unstaged hunks included', () => {
    // ARRANGE
    const root = projectWithGen006();
    write(root, 'src/staged.ts', 'export const a = 2;\n');
    git(root, 'add', 'src/staged.ts');
    write(root, 'src/staged.ts', 'export const a = 2;\n// unstaged working note\n');
    write(root, 'src/untracked.ts', '// untracked working note\nexport const b = 1;\n');
    const expected = [{ file: 'src/staged.ts', line: 2 }];
    // ACT
    const violations = checkStaged(root);
    // ASSERT
    expect(violations.map(({ file, line }) => ({ file, line }))).toEqual(expected);
  });
});
