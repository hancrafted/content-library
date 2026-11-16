import path from 'node:path';
import { configDefaults, defineConfig } from 'vitest/config';
import { rawTextFiles } from './raw-text-files.mts';
import { currentWorkers } from './tools/verify/workers.ts';

const ROOT = import.meta.dirname;

/**
 * What reruns the whole suite under `--changed`: the files fast tests read from disk or hand to a child process,
 * which the import graph `--changed` follows cannot see (ARCH-003-testing §4.4), plus the suite's own config and
 * the installed packages. A match reruns everything, so each entry names a file a fast test really reads and no
 * more: an edit to any other doc, ADR or skill file leaves the quick loop alone. Found by tracing the disk reads
 * of every fast test, not by grep. A new fast test that reads another path adds it here.
 *
 * Not listed: the `.ts` and `.tsx` files that scanner tests walk (no-daisyui, source-tree, the codegen registry,
 * factory-model-seam, slide-folders). Listing `src/**` would turn every edit into a full rerun; the full suite at
 * pre-push and in CI covers them.
 */
const TRIGGERS = [
  // The suite itself, and the plugin that turns `.yml` and `.jsonl` imports into text.
  'vitest.config.mts',
  'package-lock.json',
  'raw-text-files.mts',
  // Tool config that tests read: oxfmt, dependency-cruiser, tsconfig, the Claude hooks, markdown-harness and the deploy filter.
  '.oxfmtrc.jsonc',
  '.dependency-cruiser.cjs',
  'tsconfig.json',
  '.claude/settings.json',
  'markdown-harness.config.yaml',
  '.github/workflows/deploy-cloudflare.yml',
  '.archgate/adrs/FE-007-module-layering.md',
  // Documents under markdown-harness checks: frontmatter-keys, slide-library, episode-staging, verified-corpus and the Explorable's guide.
  'GLOSSARY.md',
  'docs/agents/*.md',
  'docs/design/*.md',
  'docs/features/*.md',
  'docs/features/explorables/agentic-workflow.md',
  'docs/episodes/**',
  'docs/llm-wiki/**',
  // Skills: SKILL.md frontmatter, the references and assets the staging tests read, the decision-page fixtures, and the scripts tests spawn.
  'skills/*/SKILL.md',
  '.agents/skills/*/SKILL.md',
  'skills/*/references/*.md',
  'skills/*/assets/**',
  'skills/to-decision-html/scripts/fixtures/**',
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
    maxWorkers: await currentWorkers(),
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
