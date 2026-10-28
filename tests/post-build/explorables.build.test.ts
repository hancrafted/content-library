// Post-build check of the Explorable pages (spec #404): three public, indexed pages at /explorables/<slug>/ in both
// locales, each an Episode-shaped page; the overview that lists them; the redirects that keep the old
// /explorable-explanations/ links working.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { LOCALES, localizePath } from '../../src/shared/lib/locale.pure';
import { ROUTES } from '../../src/shared/lib/static-routes';
import { exportedPage, OUT_DIR, redirectRules, resolveBasePath } from './exported-pages';

const basePath = resolveBasePath();

/** The three Explorable pages and their URLs, written out: the spec's table is the expectation. */
const SLUGS = ['context-window', 'human-in-the-loop', 'ai-disciplines'] as const;
const PAGES = SLUGS.flatMap((slug) =>
  LOCALES.map((locale) => ({
    slug,
    locale,
    path: `/explorables/${slug}`,
    url: localizePath(`/explorables/${slug}`, locale),
  })),
);

describe.each(PAGES)('the Explorable page $url', ({ path, url }) => {
  it('renders its Slides in the Episode container, with a title slide', () => {
    // ARRANGE
    const $ = exportedPage(url);
    // ACT
    const slides = $('[data-slide]').length;
    // ASSERT
    expect($('[data-testid="episode-page"]').length).toBe(1);
    expect(slides).toBeGreaterThan(1);
  });

  it('is indexed and canonical at its own URL', () => {
    // ARRANGE
    const $ = exportedPage(url);
    // ACT
    const robots = $('meta[name="robots"]').attr('content') ?? '';
    const canonical = $('link[rel="canonical"]').attr('href') ?? '';
    // ASSERT
    expect(robots).not.toContain('noindex');
    expect(canonical.endsWith(`${path}/`)).toBe(true);
  });
});

describe('the Explorables overview', () => {
  it.each(LOCALES)('lists the three Explorable pages, each linking to its page, for %s', (locale) => {
    // ARRANGE
    const $ = exportedPage(localizePath(ROUTES.explorables, locale));
    const expected = SLUGS.map((slug) => `${basePath}${localizePath(`/explorables/${slug}`, locale)}/`).sort();
    // ACT
    const hrefs = $('[data-explorable-card] h2 a')
      .toArray()
      .map((link) => $(link).attr('href') ?? '')
      .sort();
    // ASSERT
    expect(hrefs).toEqual(expected);
  });

  it.each(LOCALES)('is in the sitemap with its three pages, for %s', (locale) => {
    // ARRANGE
    const sitemap = readFileSync(join(OUT_DIR, 'sitemap.xml'), 'utf8');
    const urls = [ROUTES.explorables, ...SLUGS.map((slug) => `/explorables/${slug}`)].map(
      (route) => `${localizePath(route, locale)}/`,
    );
    // ACT
    const missing = urls.filter((url) => !sitemap.includes(`${url}</loc>`));
    // ASSERT
    expect(missing).toEqual([]);
  });
});

describe('the old /explorable-explanations/ URLs', () => {
  it.each(LOCALES)('redirect with a 301 to the same page under /explorables/ for %s', (locale) => {
    // ARRANGE
    const expected = {
      from: `${localizePath('/explorable-explanations', locale)}/*`,
      to: `${localizePath('/explorables', locale)}/:splat`,
      status: '301',
    };
    // ACT
    const rules = redirectRules();
    // ASSERT
    expect(rules).toContainEqual(expected);
  });
});
