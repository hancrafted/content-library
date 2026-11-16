import path from 'node:path';
import { configDefaults, defineConfig } from 'vitest/config';
import { rawTextFiles } from './raw-text-files.mts';
import { currentWorkers } from './vitest-workers.mts';

const ROOT = import.meta.dirname;

/**
 * What reruns the whole suite under `--changed`: files tests read from disk rather than import, which
 * `--changed` cannot follow (ARCH-003-testing §4.4), mirroring vitest.slow.config.mts, plus the suite's own
 * config and the installed packages. A match reruns everything; the triggers are coarse by design.
 */
const TRIGGERS = [
  'vitest.config.mts',
  'package-lock.json',
  'docs/**',
  'skills/**',
  '.agents/skills/**',
  '.archgate/adrs/**',
  '.claude/rules/**',
  'AGENTS.md',
  'GLOSSARY.md',
  'markdown-harness.config.yaml',
  '.dependency-cruiser.cjs',
  '.prettierignore',
  'src/app/globals.css',
  'src/shared/design-system/legacy.json',
  'src/episodes/components/slide-master/**',
  'src/episodes/components/slide-shared/motions/**',
  'src/episodes/templates/*/slides/**',
  'src/**/*.module.css',
];

// The fast suite, run by `npm run verify` and CI. `*.build.test.ts` needs a finished
// `next build` and runs in its own lane: vitest.build.config.mts. `*.slow.test.ts` takes seconds
// and runs in the slow lane: vitest.slow.config.mts.
// `.agents/**` is the symlinked copy of `skills/`: run each file once.
export default defineConfig({
  plugins: [rawTextFiles()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  test: {
    maxWorkers: currentWorkers(),
    include: ['**/*.{test,spec}.ts'],
    exclude: [
      ...configDefaults.exclude,
      '**/*.build.test.ts',
      '**/*.slow.test.ts',
      '.worktrees/**',
      '.claude/**',
      '.agents/**',
    ],
    // `--changed` follows imports. A test that reads files from disk names them above, or a change to them skips
    // it. Vitest matches changed files by absolute path, and a `**` never crosses a dot folder such as
    // `.worktrees/`, so each trigger is anchored at the repo root.
    forceRerunTriggers: [...configDefaults.forceRerunTriggers, ...TRIGGERS.map((glob) => path.join(ROOT, glob))],
    coverage: {
      provider: 'v8',
    },
  },
});
