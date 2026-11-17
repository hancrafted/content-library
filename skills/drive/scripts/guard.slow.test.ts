import { execFileSync, spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, realpathSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

// A commit hook exports GIT_DIR and friends, which would point these tmp repos at the real one.
for (const name of Object.keys(process.env)) if (name.startsWith('GIT_')) delete process.env[name];

const CLI = path.join(import.meta.dirname, 'drive.ts');

const git = (cwd: string, ...args: string[]): string =>
  execFileSync('git', ['-c', 'user.name=t', '-c', 'user.email=t@t', ...args], { cwd, encoding: 'utf8' }).trim();

const guard = (cwd: string, ...args: string[]) =>
  spawnSync(process.execPath, [CLI, 'guard', ...args], { cwd, encoding: 'utf8' });

const put = (root: string, file: string, text: string) => {
  mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
  writeFileSync(path.join(root, file), text);
};

/** A throwaway repo on `main` whose config guards glossaries and feature docs. */
function repo(): string {
  const root = realpathSync(mkdtempSync(path.join(tmpdir(), 'drive-guard-')));
  git(root, 'init', '-q', '-b', 'main');
  put(root, 'docs/drive/project.yml', "decisionDocs:\n  - docs/features/**\n  - '**/GLOSSARY*.md'\n");
  put(root, 'GLOSSARY.md', 'one');
  put(root, 'src/a.ts', 'a');
  git(root, 'add', '.');
  git(root, 'commit', '-qm', 'init');
  return root;
}

const stage = (root: string, file: string) => {
  put(root, file, `changed ${Math.random()}`);
  git(root, 'add', file);
};

describe('drive guard', () => {
  it('passes a staged glossary change on a decisions/* branch', () => {
    // ARRANGE
    const root = repo();
    git(root, 'checkout', '-q', '-b', 'decisions/drive');
    stage(root, 'GLOSSARY.md');
    // ACT
    const result = guard(root);
    // ASSERT
    expect(result.status).toBe(0);
  });

  it('fails a staged glossary change elsewhere, naming the file and the rule', () => {
    // ARRANGE
    const root = repo();
    git(root, 'checkout', '-q', '-b', 'feat/x');
    stage(root, 'GLOSSARY.md');
    // ACT
    const result = guard(root);
    // ASSERT
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('GLOSSARY.md is a Decision doc (decisionDocs: **/GLOSSARY*.md)');
    expect(result.stderr).toContain("this is 'feat/x'");
  });

  it('fails a staged feature-doc change elsewhere', () => {
    // ARRANGE
    const root = repo();
    git(root, 'checkout', '-q', '-b', 'feat/x');
    stage(root, 'docs/features/new.md');
    // ACT
    const result = guard(root);
    // ASSERT
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('docs/features/new.md');
  });

  it('leaves changes outside the Decision docs alone', () => {
    // ARRANGE
    const root = repo();
    git(root, 'checkout', '-q', '-b', 'feat/x');
    stage(root, 'src/a.ts');
    // ACT
    const result = guard(root);
    // ASSERT
    expect(result.status).toBe(0);
  });

  it('--against checks the commits the branch added since the base', () => {
    // ARRANGE
    const root = repo();
    git(root, 'checkout', '-q', '-b', 'feat/x');
    stage(root, 'GLOSSARY.md');
    git(root, 'commit', '-qm', 'edit glossary');
    // ACT
    const staged = guard(root);
    const branch = guard(root, '--against', 'main');
    // ASSERT
    expect(staged.status).toBe(0);
    expect(branch.status).toBe(1);
    expect(branch.stderr).toContain('GLOSSARY.md');
  });

  it('rejects an unknown argument with the usage', () => {
    // ARRANGE
    const root = repo();
    // ACT
    const result = guard(root, '--nope');
    // ASSERT
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('usage: drive guard [--against <ref>]');
  });
});
