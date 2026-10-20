import { describe, expect, it } from 'vitest';
import { killable, lineage, parseLsof, planSync } from './worktree-process.pure.ts';

describe('parseLsof', () => {
  it('keeps only processes whose cwd is inside the worktree', () => {
    // ARRANGE
    const out = ['p10', 'cnode', 'n/r/wt/sub', 'p11', 'cvim', 'n/r/wt-other', 'p12', 'cchrome', 'n/r/wt'].join('\n');
    // ACT
    const found = parseLsof(out, '/r/wt');
    // ASSERT
    expect(found).toEqual([
      { pid: 10, command: 'node' },
      { pid: 12, command: 'chrome' },
    ]);
  });
});

describe('killable', () => {
  it('excludes the caller and its ancestors and lists each pid once', () => {
    // ARRANGE
    const parentOf = new Map([
      [30, 20],
      [20, 1],
    ]);
    const procs = [20, 30, 40, 40, 50].map((pid) => ({ pid, command: 'x' }));
    // ACT
    const pids = killable(procs, lineage(30, parentOf)).map((p) => p.pid);
    // ASSERT
    expect(pids).toEqual([40, 50]);
  });
});

describe('lineage', () => {
  it('stops at a cycle or a missing parent', () => {
    // ARRANGE
    const parentOf = new Map([
      [3, 2],
      [2, 3],
    ]);
    // ACT
    const set = lineage(3, parentOf);
    // ASSERT
    expect([...set].sort()).toEqual([2, 3]);
  });
});

describe('planSync', () => {
  it('merges origin/main by default and the base when given', () => {
    // ARRANGE
    const clean = { branch: 'feat/x', dirty: false };
    // ACT
    const plans = [planSync({ ...clean, base: null }), planSync({ ...clean, base: 'episode/y' })];
    // ASSERT
    expect(plans).toEqual([{ target: 'origin/main' }, { target: 'episode/y' }]);
  });

  it('refuses a dirty tree, main and a detached HEAD', () => {
    // ARRANGE
    const inputs = [
      { branch: 'feat/x', base: null, dirty: true },
      { branch: 'main', base: null, dirty: false },
      { branch: '', base: null, dirty: false },
    ];
    // ACT
    const plans = inputs.map(planSync);
    // ASSERT
    expect(plans.every((plan) => 'error' in plan)).toBe(true);
  });
});
