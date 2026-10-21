import path from 'node:path';
import { configDefaults, defineConfig } from 'vitest/config';
import { rawTextFiles } from './raw-text-files';

// The fast suite, run by `npm run verify` and CI. `*.build.test.ts` needs a finished
// `next build` and runs in its own lane: vitest.build.config.ts. `*.browser.test.ts`
// drives a real browser and runs only locally: vitest.browser.config.ts. `.agents/**` is the symlinked copy of
// `skills/`: run each file once.
export default defineConfig({
  plugins: [rawTextFiles()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    include: ['**/*.{test,spec}.ts'],
    exclude: [
      ...configDefaults.exclude,
      '**/*.build.test.ts',
      '**/*.browser.test.ts',
      '.worktrees/**',
      '.claude/**',
      '.agents/**',
    ],
    coverage: {
      provider: 'v8',
    },
  },
});
