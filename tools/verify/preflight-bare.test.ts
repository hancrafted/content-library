import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, realpathSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { coreBareIsTrue } from './preflight-bare.ts';

function dropGitVariablesACommitHookExports(): void {
  for (const name of Object.keys(process.env)) if (name.startsWith('GIT_')) delete process.env[name];
}
dropGitVariablesACommitHookExports();

function repo(): string {
  const root = realpathSync(mkdtempSync(path.join(tmpdir(), 'preflight-bare-')));
  execFileSync('git', ['init', '-q', '-b', 'main', root]);
  return root;
}

describe('coreBareIsTrue', () => {
  it('reports a main checkout whose config says core.bare=true', () => {
    // ARRANGE
    const root = repo();
    execFileSync('git', ['config', 'core.bare', 'true'], { cwd: root });
    // ACT
    const bare = coreBareIsTrue(root);
    // ASSERT
    expect(bare).toBe(true);
  });

  it('passes a normal checkout', () => {
    // ARRANGE
    const root = repo();
    // ACT
    const bare = coreBareIsTrue(root);
    // ASSERT
    expect(bare).toBe(false);
  });

  it('reports [core-bare] from the script itself on a main checkout whose --show-toplevel is fatal', () => {
    // ARRANGE
    const root = repo();
    execFileSync('git', ['config', 'core.bare', 'true'], { cwd: root });
    const script = path.resolve(import.meta.dirname, 'preflight.ts');
    const expected = 'preflight [core-bare]';
    // ACT
    const ran = spawnSync('node', [script], { cwd: root, encoding: 'utf8' });
    // ASSERT
    expect(ran.status).toBe(1);
    expect(ran.stderr).toContain(expected);
  });
});
