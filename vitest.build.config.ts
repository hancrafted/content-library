import { configDefaults, defineConfig } from 'vitest/config';

// The post-build lane: asserts over `out/`, so it runs after `next build` and
// stays off the commit path. Run with `npm run test:build`.
export default defineConfig({
  test: {
    include: ['**/*.build.test.ts'],
    exclude: [...configDefaults.exclude],
    // Show the page-count diagnostic even when every test passes.
    silent: false,
  },
});
