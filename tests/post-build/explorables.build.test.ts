// Post-build check of the Explorable pages (spec #404): three public, indexed pages at /explorables/<slug>/ in both
// locales, each an Episode-shaped page; the overview that lists them; the redirects that keep the old
// /explorable-explanations/ links working.

import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { LOCALES, localizePath } from '../../src/shared/lib/locale.pure';
import { ROUTES } from '../../src/shared/lib/static-routes';
import { exportedPage, OUT_DIR, redirectRules, resolveBasePath } from './exported-pages';

const basePath = resolveBasePath();

/** The three Explorable pages and their URLs, written out: the spec's table is the expectation. */
const SLUGS = ['context-window', 'human-in-the-loop', 'ai-capability'] as const;
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

describe.each(PAGES)('the Explorable page $url title slide', ({ url }) => {
  it('declares the inverse tone, so the page chrome can follow it', () => {
    // ARRANGE
    const $ = exportedPage(url);
    // ACT
    const tone = $('[data-slot="title-slide"]').attr('data-tone');
    // ASSERT
    expect(tone).toBe('inverse');
  });
});

describe('the Explorables overview', () => {
  it.each(LOCALES)("draws each card's drift as a static still, never a canvas, for %s", (locale) => {
    // ARRANGE
    const $ = exportedPage(localizePath(ROUTES.explorables, locale));
    // ACT
    const stills = $('[data-explorable-card] [data-card-media] svg[data-drift-still]').toArray();
    const canvases = $('[data-explorable-card] canvas').length;
    // ASSERT
    expect(stills.map((still) => $(still).attr('data-drift-still')).sort()).toEqual([...SLUGS].sort());
    expect(canvases).toBe(0);
  });

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

describe('the renamed /explorables/ai-disciplines/ URL', () => {
  // Renamed to ai-capability; the old path redirects so shared links keep working, and keeps its published anchor.
  it.each(LOCALES)('redirects with a 301 to /explorables/ai-capability/ for %s', (locale) => {
    // ARRANGE
    const expected = {
      from: `${localizePath('/explorables/ai-disciplines', locale)}/*`,
      to: `${localizePath('/explorables/ai-capability', locale)}/:splat`,
      status: '301',
    };
    // ACT
    const rules = redirectRules();
    // ASSERT
    expect(rules).toContainEqual(expected);
  });

  it.each(LOCALES)('exports no page of its own for %s', (locale) => {
    // ARRANGE
    const retired = 'ai-disciplines';
    const renamed = 'ai-capability';
    // ACT
    const exported = readdirSync(join(OUT_DIR, localizePath('/explorables', locale)));
    // ASSERT
    expect(exported).toContain(renamed);
    expect(exported).not.toContain(retired);
  });
});

describe('the "Explore it →" link on an Explorable shown in a Slide', () => {
  const link = (slug: string) => `[data-explore-it="${slug}"]`;

  it.each(LOCALES)('links the Context window in an Episode Slide to its page, for %s', (locale) => {
    // ARRANGE
    const $ = exportedPage(localizePath('/episodes/ai-attention-span', locale));
    const expected = `${basePath}${localizePath('/explorables/context-window', locale)}/`;
    // ACT
    const hrefs = $(link('context-window'))
      .toArray()
      .map((anchor) => $(anchor).attr('href'));
    // ASSERT
    expect(hrefs.length).toBeGreaterThan(0);
    expect(new Set(hrefs)).toEqual(new Set([expected]));
  });

  it.each(LOCALES)('shows none on the Explorable page whose primary it is, for %s', (locale) => {
    // ARRANGE
    const $ = exportedPage(localizePath('/explorables/context-window', locale));
    // ACT
    const own = $(link('context-window')).length;
    // ASSERT
    expect(own).toBe(0);
  });

  it.each(LOCALES)('still links an Explorable that is not the page primary, for %s', (locale) => {
    // ARRANGE
    const $ = exportedPage(localizePath('/explorables/ai-capability', locale));
    // ACT
    const others = $('[data-explore-it]')
      .toArray()
      .map((anchor) => $(anchor).attr('data-explore-it'));
    // ASSERT
    expect(others).not.toContain('ai-capability');
  });
});
