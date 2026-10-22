import { defineConfig, devices } from '@playwright/test';
import path from 'node:path';

// The browser lane (design-ADR-0014): Playwright Test, Chromium only, against the built export `out/`, served on the
// preview port by `webServer`. Run with `npm run test:browser` after `npm run build`; local only until the nightly lands.
// Until the Context spec is ported, `vitest.browser.config.ts` still runs it.
const PORT = Number(process.env.PREVIEW_PORT ?? 4300);

export default defineConfig({
  testMatch: '**/*.browser.test.ts',
  testIgnore: [
    path.join(__dirname, '.worktrees/**'),
    '.claude/**',
    '.agents/**',
    '**/node_modules/**',
    // Not ported yet: still runs on vitest.browser.config.ts (ticket 298).
    '**/slide-shared/context/**',
  ],
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
