import path from 'node:path';
import { configDefaults, defineConfig } from 'vitest/config';
import { rawTextFiles } from './raw-text-files';

const BASE = `http://localhost:${process.env.PREVIEW_PORT ?? 4300}`;

// The browser lane: tests that drive a real headless browser, run on the developer's machine only, never in CI
// or `verify`. Run with `npm run test:browser`. Only the specs not yet ported to Playwright (`playwright.config.ts`) stay here. `.agents/**` is the symlinked copy of `skills/`: run each file once.
export default defineConfig({
  plugins: [rawTextFiles()],
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
  test: {
    env: {
      CONTEXT_WINDOW_URL: `${BASE}/episodes/slides/`,
      HITL_URL: `${BASE}/episodes/onboard-ai-every-time/`,
    },
    globalSetup: ['tests/browser/vitest-preview-server.ts'],
    include: [
      'src/components/slide-shared/context/*.browser.test.ts',
      'src/components/slide-shared/human-in-the-loop/*.browser.test.ts',
    ],
    exclude: [...configDefaults.exclude, '.worktrees/**', '.claude/**', '.agents/**'],
  },
});
