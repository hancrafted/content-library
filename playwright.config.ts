import { defineConfig, devices } from '@playwright/test';
import path from 'node:path';

// The browser lane (design-ADR-0014): Playwright Test, Chromium only, against the built export `out/`, served on the
// preview port by `webServer`. Run with `npm run test:browser` after `npm run build`; local only until the nightly lands.
// Until the Context and human-in-the-loop specs are ported, `vitest.browser.config.ts` still runs them.
const PORT = Number(process.env.PREVIEW_PORT ?? 4300);

export default defineConfig({
  testMatch: '**/*.browser.test.ts',
  testIgnore: [
    path.join(__dirname, '.worktrees/**'),
    '.claude/**',
    '.agents/**',
    '**/node_modules/**',
    // Not ported yet: these two still run on vitest.browser.config.ts (tickets 295 and 298).
    '**/slide-shared/context/**',
    '**/slide-shared/human-in-the-loop/**',
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
