import path from 'node:path';
import { configDefaults, defineConfig } from 'vitest/config';
import { rawTextFiles } from './raw-text-files.mts';
import { currentLoad } from './tools/load/workers.mts';

// The slow lane: `*.slow.test.ts`, tests that take seconds of real work or read the live repo from disk
// (ARCH-003-testing §4). `npm run test:slow` runs it; pre-push runs only the affected ones, with `--changed`;
// the nightly workflow runs it all. The fast suite (vitest.config.mts) excludes these files.
const ROOT = import.meta.dirname;

/**
 * What reruns the whole lane: the files the slow tests read from disk rather than import
 * (the Spec tests' staging folders, skills and templates; the scenery's CSS modules that
 * src/episodes/components/slide-shared/iceberg/scenery/*.slow.test.ts read), the FE-013 rule the archgate CLI test
 * copies, the lane's own config and the installed packages.
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
  'src/episodes/components/slide-shared/iceberg/scenery/*.module.css',
  'src/episodes/components/slide-shared/deep-sea-expedition/ship.module.css',
  // The FE-013 rule the archgate CLI test copies into its fixture project.
  '.archgate/config.json',
  '.archgate/adrs/FE-013-content-store.*',
];

export default defineConfig({
  plugins: [rawTextFiles()],
  resolve: {
    alias: {
      '@': path.resolve(ROOT, './src'),
    },
  },
  test: {
    maxWorkers: (await currentLoad()).workers,
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
