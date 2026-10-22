import { defineConfig, devices } from '@playwright/test';
import path from 'node:path';

// The browser lane (design-ADR-0014): Playwright Test, Chromium only, against the built export `out/`, served on the
// preview port by `webServer`. Run with `npm run test:browser` after `npm run build`. CI runs it only in the nightly
// (.github/workflows/browser-nightly.yml), never on pull requests.
const CI = Boolean(process.env.CI);
const PORT = Number(process.env.PREVIEW_PORT ?? 4300);

export default defineConfig({
  testMatch: '**/*.browser.test.ts',
  testIgnore: [path.join(__dirname, '.worktrees/**'), '.claude/**', '.agents/**', '**/node_modules/**'],
  fullyParallel: true,
  // A stray `test.only` would silently shrink the nightly to one test.
  forbidOnly: CI,
  // No retries, locally or in CI: a retry would hide the flakiness the nightly exists to show.
  retries: 0,
  // The HTML report carries the traces the nightly uploads when it fails.
  reporter: CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    trace: 'retain-on-failure',
    baseURL: `http://localhost:${PORT}`,
    ...devices['Desktop Chrome'],
    viewport: { width: 1440, height: 900 },
  },
  projects: [{ name: 'chromium' }],
  webServer: {
    command: 'node skills/visual-check/scripts/preview.ts',
    url: `http://localhost:${PORT}/`,
    reuseExistingServer: true,
  },
});
