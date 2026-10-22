// The Workshops: /workshops lists one card per Workshop in both locales, each Workshop has a page,
// the header carries one Workshops entry, and the sitemap names the pages with their hreflang set.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { LOCALES, localizePath, type Locale } from '../../src/lib/locale.pure';
import { resolveSiteUrl } from '../../src/lib/page-metadata.pure';
import { ROUTES, workshopRoute } from '../../src/lib/routes';
import { WORKSHOPS } from '../../src/lib/workshops.pure';
import { exportedPage, OUT_DIR } from './exported-pages';

const SITE_URL = resolveSiteUrl(process.env);
const FIRST = WORKSHOPS[0];
const WORDS: Record<Locale, { title: string; date: string; count: string; nav: string }> = {
  en: { title: 'AI onboarding', date: 'Oct 23, 2026', count: '3 Episodes', nav: 'Workshops' },
  de: { title: 'KI-Onboarding', date: '23. Okt. 2026', count: '3 Episoden', nav: 'Workshops' },
};

describe('/workshops page', () => {
  it.each(LOCALES)('lists each Workshop as a card with name, date and Episode count for %s', (locale) => {
    // ARRANGE
    const $ = exportedPage(localizePath(ROUTES.workshops, locale));
    const expected = WORDS[locale];
    // ACT
    const cards = $('[data-workshop-list] [data-workshop-card]');
    const card = cards.filter(`[data-workshop-slug="${FIRST.slug}"]`);
    // ASSERT
    expect(cards.length).toBe(WORKSHOPS.length);
    expect(card.find('h4').text()).toBe(expected.title);
    expect(card.find('time[data-workshop-date]').attr('datetime')).toBe(FIRST.date);
    expect(card.find('time[data-workshop-date]').text()).toBe(expected.date);
    expect(card.find('[data-workshop-episode-count]').text()).toBe(expected.count);
  });

  it.each(LOCALES)('draws the Workshop card with the quiet arrow and no Tags for %s', (locale) => {
    // ARRANGE
    const $ = exportedPage(localizePath(ROUTES.workshops, locale));
    // ACT
    const card = $(`[data-workshop-card][data-workshop-slug="${FIRST.slug}"]`);
    // ASSERT
    expect(card.attr('data-card-variant')).toBe('workshop');
    expect(card.find('[data-open-cue="arrow"]').length).toBe(1);
    expect(card.find('[data-tag], [data-episode-tags]').length).toBe(0);
  });

  it.each(LOCALES)('links each card to its Workshop page in the locale for %s', (locale) => {
    // ARRANGE
    const $ = exportedPage(localizePath(ROUTES.workshops, locale));
    const expected = `${localizePath(workshopRoute(FIRST.slug), locale)}/`;
    // ACT
    const href = $(`[data-workshop-slug="${FIRST.slug}"] a[data-card-link]`).attr('href');
    // ASSERT
    expect(href).toBe(expected);
  });

  it.each(LOCALES)('has one h1 for %s', (locale) => {
    // ARRANGE
    const $ = exportedPage(localizePath(ROUTES.workshops, locale));
    const expected = 1;
    // ACT
    const headings = $('h1');
    // ASSERT
    expect(headings.length).toBe(expected);
  });
});

describe('Workshop page', () => {
  it.each(LOCALES)('exports each Workshop with its title and date for %s', (locale) => {
    // ARRANGE
    const $ = exportedPage(localizePath(workshopRoute(FIRST.slug), locale));
    const expected = WORDS[locale];
    // ACT
    const title = $('h1').text();
    const date = $('time').attr('datetime');
    // ASSERT
    expect(title).toBe(expected.title);
    expect(date).toBe(FIRST.date);
  });

  it.each(LOCALES)('links back to all Workshops in the locale for %s', (locale) => {
    // ARRANGE
    const $ = exportedPage(localizePath(workshopRoute(FIRST.slug), locale));
    const expected = `${localizePath(ROUTES.workshops, locale)}/`;
    // ACT
    const back = $('[data-testid="workshop-page"] a').first().attr('href');
    // ASSERT
    expect(back).toBe(expected);
  });
});

describe('header and sitemap', () => {
  it.each(LOCALES)('offers exactly one Workshops entry in the header, in the locale, for %s', (locale) => {
    // ARRANGE
    const $ = exportedPage(localizePath(ROUTES.home, locale));
    const expected = { count: 1, href: `${localizePath(ROUTES.workshops, locale)}/`, text: WORDS[locale].nav };
    // ACT
    const entry = $('[data-testid="site-nav"] [data-testid="nav-workshops"]');
    // ASSERT
    expect({ count: entry.length, href: entry.attr('href'), text: entry.text() }).toEqual(expected);
  });

  it('names the list and the Workshop page in both locales with their hreflang set', () => {
    // ARRANGE
    const sitemap = readFileSync(join(OUT_DIR, 'sitemap.xml'), 'utf8');
    const route = workshopRoute(FIRST.slug);
    const expected = [
      `<loc>${SITE_URL}/workshops/</loc>`,
      `<loc>${SITE_URL}/de/workshops/</loc>`,
      `<loc>${SITE_URL}${route}/</loc>`,
      `<loc>${SITE_URL}/de${route}/</loc>`,
      `hreflang="de" href="${SITE_URL}/de${route}/"`,
    ];
    // ACT
    const missing = expected.filter((fragment) => !sitemap.includes(fragment));
    // ASSERT
    expect(missing).toEqual([]);
  });
});
