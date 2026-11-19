import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { changeKind } from './change-kind.pure.ts';

describe('changeKind', () => {
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
      const { build } = changeKind([docsOnly, changed]);
      // ASSERT
      expect(build).toBe(true);
    });

    it('calls a branch of Markdown only a docs lane that needs no build', () => {
      // ARRANGE
      const changed = ['docs/features/hosting.md', 'README.md', '.archgate/adrs/ARCH-003-testing.md'];
      // ACT
      const kind = changeKind(changed);
      // ASSERT
      expect(kind).toEqual({ build: false, docsOnly: true });
    });

    it('treats Markdown under src/ as no export input, so a recording description gets no preview', () => {
      // ARRANGE
      const changed = ['src/episodes/x/recording/youtube.de.md', 'src/readme.md'];
      // ACT
      const kind = changeKind(changed);
      // ASSERT
      expect(kind).toEqual({ build: false, docsOnly: true });
    });

    it('still builds when Markdown under src/ sits beside a source file', () => {
      // ARRANGE
      const changed = ['src/episodes/x/recording/youtube.de.md', 'src/app/page.tsx'];
      // ACT
      const kind = changeKind(changed);
      // ASSERT
      expect(kind).toEqual({ build: true, docsOnly: false });
    });
  });

  describe('failure cases', () => {
    it('skips the build, and is no docs lane, for a skills-and-tooling branch', () => {
      // ARRANGE
      const changed = ['skills/commit/SKILL.md', '.claude/skills/commit', '.husky/pre-push', 'tools/verify/verify.ts'];
      // ACT
      const kind = changeKind(changed);
      // ASSERT
      expect(kind).toEqual({ build: false, docsOnly: false });
    });

    it('takes the full run when markdown-harness.config.yaml changed, since it changes what check:docs reads', () => {
      // ARRANGE
      const changed = ['docs/features/hosting.md', 'markdown-harness.config.yaml'];
      // ACT
      const { docsOnly } = changeKind(changed);
      // ASSERT
      expect(docsOnly).toBe(false);
    });

    it('takes the full run for an empty diff', () => {
      // ARRANGE
      const changed: string[] = [];
      // ACT
      const kind = changeKind(changed);
      // ASSERT
      expect(kind).toEqual({ build: false, docsOnly: false });
    });

    it('takes the full run when any path is not Markdown', () => {
      // ARRANGE
      const changed = ['docs/features/hosting.md', 'tools/verify/verify.ts'];
      // ACT
      const { docsOnly } = changeKind(changed);
      // ASSERT
      expect(docsOnly).toBe(false);
    });

    it('does not mistake a next.config lookalike for the Next config', () => {
      // ARRANGE
      const changed = ['next.config', 'docs/next.config.ts', 'next.configuration.md'];
      // ACT
      const { build } = changeKind(changed);
      // ASSERT
      expect(build).toBe(false);
    });

    it('does not mistake a lookalike path for an export input', () => {
      // ARRANGE
      const changed = ['docs/src/notes.md', 'tools/art-notes.md', 'tools/artifacts/x.ts', 'srcs/a.ts'];
      // ACT
      const { build } = changeKind(changed);
      // ASSERT
      expect(build).toBe(false);
    });

    it('does not mistake a Markdown lookalike for Markdown', () => {
      // ARRANGE
      const changed = ['docs/notes.md.ts', 'docs/notes.mdx', 'docs/md'];
      // ACT
      const { docsOnly } = changeKind(changed);
      // ASSERT
      expect(docsOnly).toBe(false);
    });
  });

  describe('the Next config', () => {
    it('has no Turbopack rule and no import for Markdown, which is why Markdown under src/ needs no build', async () => {
      // ARRANGE
      const { default: nextConfig } = await import('../../next.config');
      const source = readFileSync(path.join(import.meta.dirname, '../../next.config.ts'), 'utf8');
      // ACT
      const rules = Object.keys(nextConfig.turbopack?.rules ?? {});
      // ASSERT
      expect(rules.filter((rule) => /\bmd\b/.test(rule))).toEqual([]);
      expect(source).not.toMatch(/\.md['"`]/);
    });
  });
});
