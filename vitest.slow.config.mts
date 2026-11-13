import path from 'node:path';
import { configDefaults, defineConfig } from 'vitest/config';
import { rawTextFiles } from './raw-text-files.mts';

// The slow lane: `*.slow.test.ts`, tests that take seconds of real work or read the live repo from disk
// (ARCH-003-testing §4). `npm run test:slow` runs it; pre-push runs only the affected ones, with `--changed`;
// the nightly workflow runs it all. The fast suite (vitest.config.mts) excludes these files.
const ROOT = import.meta.dirname;

/**
 * What reruns the whole lane: the files the slow tests read from disk rather than import
 * (tests/docs/episode-staging.slow.test.ts and its fixture), the lane's own config and the installed packages.
 */
const TRIGGERS = [
  'vitest.slow.config.mts',
  'package-lock.json',
  'docs/episodes/**',
  'docs/llm-wiki/**',
  'skills/**',
  '.agents/skills/**',
  'GLOSSARY.md',
  'src/episodes/components/slide-master/**',
  'src/episodes/components/slide-shared/motions/**',
  'src/episodes/templates/*/slides/**',
  'markdown-harness.config.yaml',
];

export default defineConfig({
  plugins: [rawTextFiles()],
  resolve: {
    alias: {
      '@': path.resolve(ROOT, './src'),
    },
  },
  test: {
    include: ['**/*.slow.test.ts'],
    exclude: [...configDefaults.exclude, '.worktrees/**', '.claude/**', '.agents/**'],
    // Seconds of work by design, on a machine other sessions may load: the default 5 s is the fast suite's bar.
    testTimeout: 60_000,
    // `--changed` follows imports. A slow test that reads files from disk names them here, or a change to them
    // skips it: a match reruns the whole lane. Vitest matches changed files by absolute path, and a `**` never
    // crosses a dot folder such as `.worktrees/`, so each trigger is anchored at the repo root.
    forceRerunTriggers: [...configDefaults.forceRerunTriggers, ...TRIGGERS.map((glob) => path.join(ROOT, glob))],
  },
});
