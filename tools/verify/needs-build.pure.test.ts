import { describe, expect, it } from 'vitest';
import { needsBuild } from './needs-build.pure.ts';

describe('needsBuild', () => {
  describe('success cases', () => {
    it.each([
      'src/app/page.tsx',
      'public/favicon.ico',
      'next.config.ts',
      'postcss.config.mjs',
      'tsconfig.json',
      'package.json',
      'package-lock.json',
      'raw-text-files.mts',
      'tools/art/art.ts',
    ])('asks for a build when %s changed', (changed) => {
      // ARRANGE
      const docsOnly = 'docs/features/hosting.md';
      // ACT
      const needed = needsBuild([docsOnly, changed]);
      // ASSERT
      expect(needed).toBe(true);
    });
  });

  describe('failure cases', () => {
    it('skips the build for a docs-only branch', () => {
      // ARRANGE
      const changed = ['docs/features/hosting.md', 'README.md', '.archgate/adrs/ARCH-003-testing.md'];
      // ACT
      const needed = needsBuild(changed);
      // ASSERT
      expect(needed).toBe(false);
    });

    it('skips the build for a skills-only branch', () => {
      // ARRANGE
      const changed = ['skills/commit/SKILL.md', '.claude/skills/commit', '.husky/pre-push', 'tools/verify/verify.ts'];
      // ACT
      const needed = needsBuild(changed);
      // ASSERT
      expect(needed).toBe(false);
    });

    it('skips the build for an empty list', () => {
      // ARRANGE
      const changed: string[] = [];
      // ACT
      const needed = needsBuild(changed);
      // ASSERT
      expect(needed).toBe(false);
    });

    it('does not mistake a lookalike path for an export input', () => {
      // ARRANGE
      const changed = ['docs/src/notes.md', 'tools/art-notes.md', 'tools/artifacts/x.ts', 'srcs/a.ts'];
      // ACT
      const needed = needsBuild(changed);
      // ASSERT
      expect(needed).toBe(false);
    });
  });
});
