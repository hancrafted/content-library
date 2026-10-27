import { describe, expect, it } from 'vitest';
import { resolveMutationScope } from './mutation-scope.pure.ts';

describe('success cases', () => {
  it('includes a changed *.pure.ts module and a changed skill script', () => {
    // ARRANGE
    const changed = ['src/shared/lib/table-of-contents.pure.ts', 'skills/worktree/scripts/worktree.ts'];
    const existing = new Set(changed);
    const expected = ['skills/worktree/scripts/worktree.ts', 'src/shared/lib/table-of-contents.pure.ts'];
    // ACT
    const scope = resolveMutationScope(changed, (file) => existing.has(file));
    // ASSERT
    expect(scope).toEqual(expected);
  });

  it('maps a changed test file to its *.pure.ts or skill-script subject', () => {
    // ARRANGE
    const changed = [
      'src/shared/lib/table-of-contents.pure.test.ts',
      'src/shared/lib/url-state.test.ts',
      'skills/worktree/scripts/worktree-args.pure.test.ts',
      'skills/worktree/scripts/preflight.test.ts',
      'skills/worktree/scripts/worktree-merge.test.ts',
      'skills/visual-check/scripts/inspect-page.test.ts',
    ];
    const existing = new Set([
      'src/shared/lib/table-of-contents.pure.ts',
      'src/shared/lib/url-state.pure.ts',
      'skills/worktree/scripts/worktree-args.pure.ts',
      'skills/worktree/scripts/preflight.pure.ts',
      'skills/worktree/scripts/preflight.ts',
      'skills/worktree/scripts/worktree-merge.ts',
      'skills/visual-check/scripts/inspect-page.ts',
    ]);
    const expected = [
      'skills/visual-check/scripts/inspect-page.ts',
      'skills/worktree/scripts/preflight.pure.ts',
      'skills/worktree/scripts/worktree-args.pure.ts',
      'skills/worktree/scripts/worktree-merge.ts',
      'src/shared/lib/table-of-contents.pure.ts',
      'src/shared/lib/url-state.pure.ts',
    ];
    // ACT
    const scope = resolveMutationScope(changed, (file) => existing.has(file));
    // ASSERT
    expect(scope).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('excludes deleted source files and test files whose subject does not exist', () => {
    // ARRANGE
    const changed = [
      'src/shared/lib/removed.pure.ts',
      'skills/worktree/scripts/removed.ts',
      'src/shared/lib/orphan.pure.test.ts',
      'src/shared/lib/plain-module.test.ts',
    ];
    // ACT
    const scope = resolveMutationScope(changed, () => false);
    // ASSERT
    expect(scope).toEqual([]);
  });

  it('excludes out-of-scope components, slide copy, hooks, build/browser tests and config files', () => {
    // ARRANGE
    const changed = [
      'src/shared/page-chrome/table-of-contents/table-of-contents.client.tsx',
      'src/episodes/ai-attention-span/slides/slide-01/slide.tsx',
      'src/shared/hooks/use-table-of-contents.ts',
      'src/explorable-explanations/context/context.browser.test.ts',
      'tests/post-build/hosting.build.test.ts',
      'tests/browser/a11y.browser.test.ts',
      'skills/new-episode/scripts/spec-preview.browser.test.ts',
      '.agents/skills/worktree/scripts/worktree.ts',
      'skills/worktree/scripts/worktree.tsx',
      'tools/mutation/mutation.ts',
      'package.json',
    ];
    // ACT
    const scope = resolveMutationScope(changed, () => true);
    // ASSERT
    expect(scope).toEqual([]);
  });
});

describe('edge cases', () => {
  it('deduplicates when both a module and its test change, and returns empty for an empty change list', () => {
    // ARRANGE
    const changed = [
      'src/shared/lib/table-of-contents.pure.ts',
      'src/shared/lib/table-of-contents.pure.test.ts',
      'src/shared/lib/table-of-contents.pure.ts',
    ];
    const existing = new Set(['src/shared/lib/table-of-contents.pure.ts']);
    const expected = ['src/shared/lib/table-of-contents.pure.ts'];
    // ACT
    const deduplicated = resolveMutationScope(changed, (file) => existing.has(file));
    const empty = resolveMutationScope([], () => true);
    // ASSERT
    expect(deduplicated).toEqual(expected);
    expect(empty).toEqual([]);
  });
});
