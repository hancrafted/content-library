import path from 'node:path';
import { configDefaults, defineConfig } from 'vitest/config';
import { rawTextFiles } from './raw-text-files.mts';
import { currentLoad } from './tools/load/workers.ts';

// The slow lane: `*.slow.test.ts`, tests that take seconds of real work or read the live repo from disk
// (ARCH-003-testing §4). `npm run test:slow` runs it; pre-push runs only the affected ones, with `--changed`;
// the nightly workflow runs it all. The fast suite (vitest.config.mts) excludes these files.
const ROOT = import.meta.dirname;

/**
 * What reruns the whole lane: the files the slow tests read from disk rather than import
 * (the Spec tests' staging folders, skills and templates; the scenery's CSS modules that
 * src/episodes/components/slide-shared/iceberg/scenery/*.slow.test.ts read), the FE-013 and GEN-006 rules the archgate CLI
 * tests copy, the lane's own config and the installed packages. tools/art/art-parallel.slow.test.ts spawns
 * `npm run art`'s real entry, which `--changed` cannot follow: it reruns when the branch changes the bake
 * (`tools/art/**`) or the loader it uses (`raw-text-files.mts`). A change to the pages it renders is the nightly
 * run's to catch.
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
  'tools/art/**',
  'raw-text-files.mts',
  'src/episodes/components/slide-shared/iceberg/scenery/*.module.css',
  'src/episodes/components/slide-shared/deep-sea-expedition/ship.module.css',
  // What tools/codegen/registry.slow.test.ts reads: every Episode record, Section, i18n and override file, the content
  // store and the generated files it compares byte for byte.
  'src/episodes/**/episode.ts',
  'src/episodes/**/episode-metadata.ts',
  'src/episodes/**/sections/*.ts',
  'src/episodes/**/i18n/*.json',
  'src/episodes/**/overrides/*.json',
  'src/content-store/**',
  'src/**/*.generated.*',
  // The FE-013 and GEN-006 rules the archgate CLI tests copy into their fixture projects.
  '.archgate/config.json',
  '.archgate/adrs/FE-013-content-store.*',
  '.archgate/adrs/GEN-006-comments.*',
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
