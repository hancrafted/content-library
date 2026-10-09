import path from 'node:path';
import { configDefaults, defineConfig } from 'vitest/config';

// The fast suite, run by `npm run verify`. `*.build.test.ts` needs a finished
// `next build` and runs in its own lane: vitest.build.config.ts.
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // The real `getTranslations` needs a Next request scope; see the stand-in.
      'next-intl/server': path.resolve(__dirname, './tests/support/next-intl-server.ts'),
    },
  },
  test: {
    include: ['**/*.{test,spec}.ts'],
    exclude: [...configDefaults.exclude, '**/*.build.test.ts', '.worktrees/**'],
    coverage: {
      provider: 'v8',
    },
  },
});
