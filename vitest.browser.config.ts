import path from 'node:path';
import { configDefaults, defineConfig } from 'vitest/config';
import { rawTextFiles } from './raw-text-files';

// The browser lane: tests that drive a real headless browser, run on the developer's machine only, never in CI
// or `verify`. Run with `npm run test:browser`. `.agents/**` is the symlinked copy of `skills/`: run each file once.
export default defineConfig({
  plugins: [rawTextFiles()],
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
  test: {
    include: ['**/*.browser.test.ts'],
    exclude: [...configDefaults.exclude, '.worktrees/**', '.claude/**', '.agents/**'],
  },
});
