// Post-build check of the tooling pages (design-ADR 0016 decisions 12 and 13): the authoring benches keep a
// previewable page in both locales, ask search engines not to index it, stay out of the sitemap and out of every
// Episode list; `slide-layouts` is gone, with nothing linking to it.

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';
import { LOCALES, localizePath } from '../../src/lib/locale.pure';
import { ROUTES } from '../../src/lib/routes';
import { exportedFile, exportedPage, OUT_DIR } from './exported-pages';

const TOOLING = ['page-template', 'slide-master', 'slides'] as const;

const PAGES = TOOLING.flatMap((slug) =>
  LOCALES.map((locale) => ({ slug, locale, url: localizePath(`/episodes/${slug}`, locale) })),
);

/** Every exported HTML file, relative to `out/`. */
function htmlFiles(dir = OUT_DIR): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return htmlFiles(path);
    return entry.name.endsWith('.html') ? [relative(OUT_DIR, path)] : [];
  });
}

describe.each(PAGES)('the tooling page $url', ({ url }) => {
  it('still renders its Slides in the Episode page', () => {
    // ARRANGE
    const $ = exportedPage(url);
    // ACT
    const slides = $('[data-slide]').length;
    // ASSERT
    expect($('[data-testid="episode-page"]').length).toBe(1);
    expect(slides).toBeGreaterThan(1);
  });

  it('tells search engines not to index it', () => {
    // ARRANGE
    const expected = 'noindex';
    // ACT
    const robots = exportedPage(url)('meta[name="robots"]').attr('content') ?? '';
    // ASSERT
    expect(robots).toContain(expected);
  });
});

describe('the tooling pages', () => {
  it('are never in the sitemap', () => {
    // ARRANGE
    const sitemap = readFileSync(join(OUT_DIR, 'sitemap.xml'), 'utf8');
    // ACT
    const listed = TOOLING.filter((slug) => sitemap.includes(`/episodes/${slug}/`));
    // ASSERT
    expect(listed).toEqual([]);
  });

  it.each(LOCALES)('are no card in the Episode overview for %s', (locale) => {
    // ARRANGE
    const $ = exportedPage(localizePath(ROUTES.episodes, locale));
    // ACT
    const cards = $('a[href*="/episodes/"]')
      .not('[data-reference-links] a')
      .toArray()
      .map((link) => $(link).attr('href') ?? '')
      .filter((href) => TOOLING.some((slug) => href.includes(`/episodes/${slug}/`)));
    // ASSERT
    expect(cards).toEqual([]);
  });
});

describe('slide-layouts', () => {
  it.each(LOCALES)('is no longer exported for %s', (locale) => {
    // ARRANGE
    const file = join(OUT_DIR, exportedFile(localizePath('/episodes/slide-layouts', locale)));
    // ACT
    const exported = existsSync(file);
    // ASSERT
    expect(exported).toBe(false);
  });

  it('is linked from no exported page', () => {
    // ARRANGE
    const expected: string[] = [];
    // ACT
    const linking = htmlFiles().filter((file) => readFileSync(join(OUT_DIR, file), 'utf8').includes('slide-layouts'));
    // ASSERT
    expect(linking).toEqual(expected);
  });
});
