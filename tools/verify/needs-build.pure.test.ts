import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';
import { EXPORT_PATHS, needsBuild } from './needs-build.pure.ts';

const WORKFLOW = '.github/workflows/deploy-cloudflare.yml';

describe('needsBuild', () => {
  describe('success cases', () => {
    it.each([
      'src/app/page.tsx',
      'public/favicon.ico',
      'next.config.ts',
      'next.config.mjs',
      'next.config.js',
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

    it('does not mistake a next.config lookalike for the Next config', () => {
      // ARRANGE
      const changed = ['next.config', 'docs/next.config.ts', 'next.configuration.md'];
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

  describe('the deploy workflow', () => {
    it('filters pull requests by the same paths, minus the workflow file itself', () => {
      // ARRANGE
      const workflow = parse(readFileSync(path.join(import.meta.dirname, '../..', WORKFLOW), 'utf8')) as {
        on: { pull_request: { paths: string[] } };
      };
      // ACT
      const filter = workflow.on.pull_request.paths.filter((entry) => entry !== WORKFLOW);
      // ASSERT
      expect([...filter].sort()).toEqual([...EXPORT_PATHS].sort());
    });
  });
});
