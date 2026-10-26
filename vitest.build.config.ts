import path from 'node:path';
import { configDefaults, defineConfig } from 'vitest/config';

// The post-build lane: asserts over `out/`, so it runs after `next build` and
// stays off the commit path. Run with `npm run test:build`.
export default defineConfig({
  // The content store's entry and its records import through `@/`, as the app does.
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    include: ['**/*.build.test.ts'],
    exclude: [...configDefaults.exclude, '.worktrees/**', '.claude/**'],
    // Show the page-count diagnostic even when every test passes.
    silent: false,
  },
});
