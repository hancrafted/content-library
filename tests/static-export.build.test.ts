// FE-005 post-build check: every page URL the app derives landed in `out/`.
// The expected set comes from the same modules the site renders from, so the
// check cannot drift from what the app believes its pages are.

import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';
import nextConfig from '../next.config';
import { LOCALES, localizePath } from '../src/lib/locale.pure';
import { ROUTES } from '../src/lib/routes';

const OUT_DIR = join(import.meta.dirname, '..', 'out');

// ROUTES.episodes is a section prefix for nav highlighting; no page is exported at it.
const PAGE_ROUTES = Object.values(ROUTES).filter((route) => route !== ROUTES.episodes);
const PAGE_URLS = LOCALES.flatMap((locale) => PAGE_ROUTES.map((route) => localizePath(route, locale)));

/** The file `next build` writes for a URL: `trailingSlash` puts `/de` at `de/index.html`, else `de.html`. */
function exportedFile(url: string): string {
  if (url === '/') return 'index.html';
  const path = url.slice(1);
  return nextConfig.trailingSlash ? join(path, 'index.html') : `${path}.html`;
}

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
