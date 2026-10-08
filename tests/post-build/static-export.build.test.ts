// FE-005 post-build check: every page URL the app derives landed in `out/`.
// The expected set comes from the same modules the site renders from, so the
// check cannot drift from what the app believes its pages are.

import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';
import { LOCALES, localizePath } from '../../src/lib/locale.pure';
import { EPISODE_SLUGS, episodeRoute, ROUTES } from '../../src/lib/routes';
import { exportedFile, OUT_DIR } from './exported';

// ROUTES.episodes is only a prefix; every Episode is exported under it, one per registry slug.
const PAGE_ROUTES = [ROUTES.home, ...EPISODE_SLUGS.map(episodeRoute)];
const PAGE_URLS = LOCALES.flatMap((locale) => PAGE_ROUTES.map((route) => localizePath(route, locale)));

describe('static export', () => {
  beforeAll(() => {
    if (!existsSync(OUT_DIR)) {
      throw new Error(`No out/ directory at ${OUT_DIR} — run \`npm run build\` before \`npm run test:build\`.`);
    }
  });

  it('writes a file in out/ for every page URL the app derives', () => {
    // ARRANGE
    const expectedFiles = PAGE_URLS.map(exportedFile);
    // ACT
    const missing = expectedFiles.filter((file) => !existsSync(join(OUT_DIR, file)));
    // A walk over zero pages passes silently, so the count is printed as a diagnostic.
    console.info(`static export: walked ${expectedFiles.length} pages, ${missing.length} missing`);
    // ASSERT
    expect(missing).toEqual([]);
  });
});
