import { defineConfig, devices } from '@playwright/test';
import path from 'node:path';

// The browser lane (design-ADR-0014): Playwright Test, Chromium only, against the built export `out/`, served on the
// preview port by `webServer`. Run with `npm run test:browser` after `npm run build`; local only until the nightly lands.
const PORT = Number(process.env.PREVIEW_PORT ?? 4300);

export default defineConfig({
  testMatch: '**/*.browser.test.ts',
  testIgnore: [path.join(__dirname, '.worktrees/**'), '.claude/**', '.agents/**', '**/node_modules/**'],
  fullyParallel: true,
  reporter: 'list',
  use: { baseURL: `http://localhost:${PORT}`, ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
  projects: [{ name: 'chromium' }],
  webServer: {
    command: 'node skills/visual-check/scripts/preview.ts',
    url: `http://localhost:${PORT}/`,
    reuseExistingServer: true,
  },
});
