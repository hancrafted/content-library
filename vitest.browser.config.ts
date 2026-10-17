import { configDefaults, defineConfig } from 'vitest/config';

// The browser lane: tests that drive a real headless browser, run on the developer's machine only, never in CI
// or `verify`. Run with `npm run test:browser`. `.agents/**` is the symlinked copy of `skills/`: run each file once.
export default defineConfig({
  test: {
    include: ['**/*.browser.test.ts'],
    exclude: [...configDefaults.exclude, '.worktrees/**', '.claude/**', '.agents/**'],
  },
});
