import path from 'node:path';
import { configDefaults, defineConfig } from 'vitest/config';
import { rawTextFiles } from './raw-text-files.mts';
import { SlowTestsLog } from './tools/load/slow-tests.mts';
import { currentLoad } from './tools/load/workers.ts';

const ROOT = import.meta.dirname;

/**
 * What reruns the whole suite under `--changed`: the files fast tests read from disk or hand to a child process,
 * which the import graph `--changed` follows cannot see (ARCH-003-testing §4.4), plus the suite's own config and
 * the installed packages. A match reruns everything, so each entry names a file a fast test really reads and no
 * more: an edit to any other doc, ADR or skill file leaves the quick loop alone. Found by tracing the disk reads
 * of every fast test, not by grep. A new fast test that reads another path adds it here.
 *
 * Not listed: the `.ts` and `.tsx` files that scanner tests walk (no-daisyui, source-tree, factory-model-seam). Listing `src/**` would turn every edit into a full rerun; the full suite at pre-push and in CI
 * covers them. The Episode-level and Run-level checks need no trigger: each page folder's `episode-checks.test.ts` and
 * each Run's `run-checks.test.ts` import their folder's files through `import.meta.glob`, which `--changed` follows
 * (ARCH-003 §4.7).
 */
const TRIGGERS = [
  // The suite itself, and the plugin that turns `.yml` and `.jsonl` imports into text.
  'vitest.config.mts',
  'package-lock.json',
  'raw-text-files.mts',
  // Tool config that tests read: oxfmt, dependency-cruiser, tsconfig, the Claude hooks, markdown-harness, the CI triggers and the deploy filter.
  '.oxfmtrc.jsonc',
  '.dependency-cruiser.cjs',
  'tsconfig.json',
  '.claude/settings.json',
  'markdown-harness.config.yaml',
  '.github/workflows/ci.yml',
  '.github/workflows/deploy-cloudflare.yml',
  '.archgate/adrs/FE-007-module-layering.md',
  // The files the FE-013 CLI test copies into its fixture project root and hands to `archgate check`.
  '.archgate/config.json',
  '.archgate/adrs/FE-013-content-store.md',
  '.archgate/adrs/FE-013-content-store.rules.ts',
  // Documents under markdown-harness checks: frontmatter-keys, slide-library, episode-staging and the Explorable's guide.
  // A Run's staging files need none: its `run-checks.test.ts` imports them through `import.meta.glob` (ARCH-003 §4.7).
  'GLOSSARY.md',
  'docs/agents/*.md',
  'docs/design/*.md',
  'docs/features/*.md',
  'docs/features/explorables/agentic-workflow.md',
  'docs/episodes/runs.csv',
  'docs/llm-wiki/**',
  // Skills: SKILL.md frontmatter, the references and assets the staging tests read, the decision-page fixtures, and the scripts tests spawn.
  'skills/*/SKILL.md',
  '.agents/skills/*/SKILL.md',
  'skills/*/references/*.md',
  'skills/*/assets/**',
  'skills/author-hitl-workflow/scripts/*.ts',
  'skills/new-episode/scripts/claude-adapter.ts',
  'skills/new-episode/scripts/spec-assemble.ts',
  // Source that tests read as text: every stylesheet (globals.css, CSS modules, palettes), Markdown (AGENTS.md, briefs), the design-token legacy list,
  // Explorable data files, published anchors, and the recording and i18n files the YouTube tests read.
  'src/**/*.css',
  'src/**/*.md',
  'src/shared/design-system/legacy.json',
  'src/**/published-anchors.json',
  'src/**/recording/*',
  'src/episodes/**/i18n/*.json',
  'src/explorables/**/*.yml',
  'src/episodes/components/slide-master/**',
  'src/episodes/templates/*/slides/**',
  // Fixtures.
  'tests/fixtures/**',
];

// Workers and the test timeout both follow the load measured now: 5 s idle, up to 20 s on a loaded machine, 5 s on
// CI (tools/load/workers.ts). Printed so a run slowed by load reads differently from a regression. stderr keeps a JSON
// reporter's stdout clean.
const load = await currentLoad();
console.error(
  `vitest: test timeout ${(load.testTimeout / 1000).toFixed(1)} s at load factor ${load.loadFactor.toFixed(1)} (${load.workers} workers)`,
);

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
    maxWorkers: load.workers,
    testTimeout: load.testTimeout,
    // Vitest's own default reporters, plus the log of every test over 750 ms with its load factor, which
    // `verify` and `wt:done` print (tools/load/slow-tests.mts).
    reporters: [...configDefaults.reporters, new SlowTestsLog({ loadFactor: load.loadFactor })],
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
