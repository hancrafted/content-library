// The Workshops, each an Event read through the content store: /workshops lists one card per Event in both locales, each Workshop has a page,
// the header carries one Workshops entry, and the sitemap names the pages with their hreflang set.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { listEvents, playlistOf } from '../../src/content-store/store';
import { LOCALES, localizePath, type Locale } from '../../src/lib/locale.pure';
import { resolveSiteUrl } from '../../src/lib/page-metadata.pure';
import { episodeRoute, isEpisodeSlug, ROUTES, workshopRoute, type EpisodeSlug } from '../../src/lib/routes';
import { exportedPage, OUT_DIR } from './exported-pages';

const SITE_URL = resolveSiteUrl(process.env);
const EVENTS = listEvents();
/** A Playlist entry as the Episode it names; the store refused any entry that names no registered Episode. */
function registered(slug: string): EpisodeSlug {
  if (!isEpisodeSlug(slug)) throw new Error(`"${slug}" is no registered Episode`);
  return slug;
}
const FIRST = { ...EVENTS[0], episodes: playlistOf(EVENTS[0]).episodes.map(registered) };
const WORDS: Record<
  Locale,
  { title: string; date: string; count: string; nav: string; start: string; reading: RegExp }
> = {
  en: {
    title: 'AXEL Seminar: Agentic Workflows',
    date: 'Oct 23, 2026',
    count: '3 Episodes',
    nav: 'Workshops',
    start: 'Start with Episode 1',
    reading: /^\d+ min total reading time$/,
  },
  de: {
    title: 'AXEL Seminar: Agentic Workflows',
    date: '23. Okt. 2026',
    count: '3 Episoden',
    nav: 'Workshops',
    start: 'Mit Episode 1 starten',
    reading: /^\d+ Min\. Lesezeit insgesamt$/,
  },
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
    expect(cards.length).toBe(EVENTS.length);
    expect(card.find('h2').text()).toBe(expected.title);
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

  it.each(LOCALES)('lists the Episodes as an ordered list in record order with text step numbers for %s', (locale) => {
    // ARRANGE
    const $ = exportedPage(localizePath(workshopRoute(FIRST.slug), locale));
    const expected = {
      slugs: [...FIRST.episodes],
      steps: FIRST.episodes.map((_, index) => String(index + 1)),
      hrefs: FIRST.episodes.map((slug) => `${localizePath(episodeRoute(slug), locale)}/`),
    };
    // ACT
    const steps = $('ol[data-workshop-agenda] > li[data-agenda-step]');
    const seen = {
      slugs: steps
        .find('[data-episode-card]')
        .map((_, card) => $(card).attr('data-episode-slug'))
        .get(),
      steps: steps
        .find('[data-step-number]')
        .map((_, step) => $(step).text())
        .get(),
      hrefs: steps
        .find('a[data-card-link]')
        .map((_, link) => $(link).attr('href'))
        .get(),
    };
    // ASSERT
    expect(seen).toEqual(expected);
  });

  it.each(LOCALES)('starts at the first linked Episode with a primary button for %s', (locale) => {
    // ARRANGE
    const $ = exportedPage(localizePath(workshopRoute(FIRST.slug), locale));
    const expected = { href: `${localizePath(episodeRoute(FIRST.episodes[0]), locale)}/`, label: WORDS[locale].start };
    // ACT
    const start = $('a[data-workshop-start]');
    // ASSERT
    expect({ href: start.attr('href'), label: start.text() }).toEqual(expected);
  });

  it.each(LOCALES)('names the Episode count and a counted reading time for %s', (locale) => {
    // ARRANGE
    const $ = exportedPage(localizePath(workshopRoute(FIRST.slug), locale));
    const expected = { count: WORDS[locale].count, reading: WORDS[locale].reading };
    // ACT
    const facts = {
      count: $('[data-workshop-episode-count]').text(),
      reading: $('[data-workshop-reading-time]').text(),
    };
    // ASSERT
    expect(facts.count).toBe(expected.count);
    expect(facts.reading).toMatch(expected.reading);
  });
});

describe('heading levels', () => {
  const PAGES = [
    { name: '/episodes', route: ROUTES.episodes },
    { name: '/workshops', route: ROUTES.workshops },
    { name: 'a Workshop page', route: workshopRoute(FIRST.slug) },
  ];

  it.each(PAGES.flatMap((page) => LOCALES.map((locale) => ({ ...page, locale }))))(
    'skips no heading level on $name for $locale',
    ({ route, locale }) => {
      // ARRANGE
      const $ = exportedPage(localizePath(route, locale));
      const expected: number[] = [];
      // ACT
      const levels = $('main :header')
        .map((_, heading) => Number(heading.tagName.slice(1)))
        .get();
      const jumps = levels.filter((level, index) => level - (levels[index - 1] ?? 0) > 1);
      // ASSERT
      expect(levels[0]).toBe(1);
      expect(jumps).toEqual(expected);
    },
  );
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
