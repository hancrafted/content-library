import path from 'node:path';
import { configDefaults, defineConfig } from 'vitest/config';
import { rawTextFiles } from './raw-text-files.mts';

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
    include: ['**/*.{test,spec}.ts'],
    exclude: [
      ...configDefaults.exclude,
      '**/*.build.test.ts',
      '**/*.slow.test.ts',
      '.worktrees/**',
      '.claude/**',
      '.agents/**',
    ],
    // Twice vitest's 5 s default: this Episode Run's parallel jobs load the machine, and a test that only times out
    // under that load is no finding.
    testTimeout: 10_000,
    coverage: {
      provider: 'v8',
    },
  },
});
