// Post-build check of the Guides (design-ADR 0019 as amended by #450): the overview at /guides/ in both locales,
// indexed, in the sitemap and reached from the Learn group; every Guide the catalogue builds is an Episode-shaped page
// at /guides/<slug>/, indexed and canonical at its own URL, and listed on the overview.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { routeOf } from '../../src/content-store/catalogue/record-routes';
import { PAGES } from '../../src/content-store/store';
import { LOCALES, localizePath } from '../../src/shared/lib/locale.pure';
import { ROUTES } from '../../src/shared/lib/static-routes';
import { exportedPage, OUT_DIR, resolveBasePath } from './exported-pages';

const basePath = resolveBasePath();

/** Every public Guide the catalogue lists, by route: none until the first Guide is scaffolded. */
const LISTED_GUIDES = PAGES.filter(({ page, treatment }) => page.kind === 'guide' && treatment.listed).map(({ page }) =>
  routeOf(page),
);

describe.each(LOCALES)('the Guides overview in %s', (locale) => {
  const url = localizePath(ROUTES.guides, locale);

  it('is indexed, canonical at its own URL and in the sitemap', () => {
    // ARRANGE
    const $ = exportedPage(url);
    const sitemap = readFileSync(join(OUT_DIR, 'sitemap.xml'), 'utf8');
    // ACT
    const robots = $('meta[name="robots"]').attr('content') ?? '';
    const canonical = $('link[rel="canonical"]').attr('href') ?? '';
    // ASSERT
    expect($('[data-testid="guides-index-page"]').length).toBe(1);
    expect(robots).not.toContain('noindex');
    expect(canonical.endsWith(`${url}/`)).toBe(true);
    expect(sitemap).toContain(`${url}/</loc>`);
  });

  it('links every listed Guide, and each Guide renders in the Episode container, indexed', () => {
    // ARRANGE
    const $ = exportedPage(url);
    const expected = LISTED_GUIDES.map((route) => `${basePath}${localizePath(route, locale)}/`).sort();
    // ACT
    const hrefs = $('[data-guide-card] h2 a')
      .toArray()
      .map((link) => $(link).attr('href') ?? '')
      .sort();
    const broken = LISTED_GUIDES.filter((route) => {
      const page = exportedPage(localizePath(route, locale));
      const robots = page('meta[name="robots"]').attr('content') ?? '';
      return page('[data-testid="episode-page"]').length !== 1 || robots.includes('noindex');
    });
    // ASSERT
    expect(hrefs).toEqual(expected);
    expect(broken).toEqual([]);
  });
});
