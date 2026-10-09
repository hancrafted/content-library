import path from 'node:path';
import { configDefaults, defineConfig } from 'vitest/config';

// The fast suite, run by `npm run verify`. `*.build.test.ts` needs a finished
// `next build` and runs in its own lane: vitest.build.config.ts.
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    include: ['**/*.{test,spec}.ts'],
    exclude: [...configDefaults.exclude, '**/*.build.test.ts', '.worktrees/**', '.claude/**'],
    coverage: {
      provider: 'v8',
    },
  },
});
