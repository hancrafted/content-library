// The Events: every old Workshop link lands on its Event, an Event's page lists its Playlist in order with the
// event-frame Episode first, each Playlist entry has a page under its Event, the header carries one Events entry,
// and an Event whose Playlist is unlisted stays out of the sitemap and the /events list.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { EVENTS } from '../../src/lib/events.pure';
import { LOCALES, localizePath, type Locale } from '../../src/lib/locale.pure';
import { resolveSiteUrl } from '../../src/lib/page-metadata.pure';
import { eventEpisodeRoute, eventEpisodes, eventRoute, ROUTES } from '../../src/lib/routes';
import { exportedPage, OUT_DIR } from './exported-pages';

const SITE_URL = resolveSiteUrl(process.env);
const FIRST = EVENTS[0];

/** Every Workshop URL that was ever published, and the Event it became. Written out: the Workshop record is gone. */
const LEGACY_WORKSHOPS = [{ workshop: 'axel-agentic-workflow-2026-10-23', event: '2026-10-23-axel-agentic-workflow' }];

const WORDS: Record<Locale, { title: string; nav: string; empty: string; frame: string }> = {
  en: {
    title: 'AXEL Seminar: Agentic Workflows',
    nav: 'Events',
    empty: 'No public Events right now.',
    frame: 'AXEL Seminar: the agenda',
  },
  de: {
    title: 'AXEL Seminar: Agentic Workflows',
    nav: 'Veranstaltungen',
    empty: 'Derzeit keine öffentlichen Veranstaltungen.',
    frame: 'AXEL-Seminar: der Ablauf',
  },
};

/** The `_redirects` rules as source, target and status, comments and blank lines dropped. */
function redirectRules(): { from: string; to: string; status: string }[] {
  return readFileSync(join(OUT_DIR, '_redirects'), 'utf8')
    .split('\n')
    .filter((line) => line.trim() !== '' && !line.startsWith('#'))
    .map((line) => {
      const [from, to, status] = line.trim().split(/\s+/);
      return { from, to, status };
    });
}

describe('old Workshop links', () => {
  it.each(LOCALES)('I open the old workshop link and land on the Event page (%s)', (locale) => {
    // ARRANGE
    const expected = [
      { from: `${localizePath('/workshops', locale)}/`, to: `${localizePath(ROUTES.events, locale)}/`, status: '301' },
      ...LEGACY_WORKSHOPS.map(({ workshop, event }) => ({
        from: `${localizePath(`/workshops/${workshop}`, locale)}/`,
        to: `${localizePath(eventRoute(event), locale)}/`,
        status: '301',
      })),
    ];
    // ACT
    const rules = redirectRules();
    // ASSERT
    expect(rules).toEqual(expect.arrayContaining(expected));
  });

  it('points every old Workshop link at an Event that exists', () => {
    // ARRANGE
    const known: readonly string[] = EVENTS.map(({ slug }) => slug);
    // ACT
    const dangling = LEGACY_WORKSHOPS.filter(({ event }) => !known.includes(event));
    // ASSERT
    expect(dangling).toEqual([]);
  });
});

describe('Event page', () => {
  it.each(LOCALES)("An Event's page lists its Episodes in the Playlist's order, event-frame first (%s)", (locale) => {
    // ARRANGE
    const episodes = eventEpisodes(FIRST.slug);
    const expected = {
      slugs: [...episodes],
      steps: episodes.map((_, index) => String(index + 1)),
      hrefs: episodes.map((episode) => `${localizePath(eventEpisodeRoute(FIRST.slug, episode), locale)}/`),
      first: WORDS[locale].frame,
    };
    const $ = exportedPage(localizePath(eventRoute(FIRST.slug), locale));
    // ACT
    const steps = $('ol[data-event-playlist] > li[data-agenda-step]');
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
      first: steps.first().find('h3').text(),
    };
    // ASSERT
    expect(seen).toEqual(expected);
  });

  it.each(LOCALES)('exports the Event with its title and date for %s', (locale) => {
    // ARRANGE
    const expected = { title: WORDS[locale].title, date: FIRST.date };
    const $ = exportedPage(localizePath(eventRoute(FIRST.slug), locale));
    // ACT
    const seen = { title: $('h1').text(), date: $('time[data-event-date]').attr('datetime') };
    // ASSERT
    expect(seen).toEqual(expected);
  });

  it.each(LOCALES)('keeps the page of an Event whose Playlist is unlisted out of search for %s', (locale) => {
    // ARRANGE
    const $ = exportedPage(localizePath(eventRoute(FIRST.slug), locale));
    // ACT
    const robots = $('meta[name="robots"]').attr('content');
    // ASSERT
    expect(robots).toContain('noindex');
  });
});

describe('Episode pages under an Event', () => {
  const PAIRS = eventEpisodes(FIRST.slug).flatMap((episode) => LOCALES.map((locale) => ({ episode, locale })));

  it.each(PAIRS)('exports $episode under its Event for $locale, as an Episode page', ({ episode, locale }) => {
    // ARRANGE
    const $ = exportedPage(localizePath(eventEpisodeRoute(FIRST.slug, episode), locale));
    // ACT
    const seen = { episode: $('[data-slot="episode-page"]').attr('data-episode'), headings: $('h1').length };
    // ASSERT
    expect(seen).toEqual({ episode, headings: 1 });
  });

  it.each(LOCALES)('gives the unlisted event-frame Episode no page of its own at /episodes/ for %s', (locale) => {
    // ARRANGE
    const frame = eventEpisodes(FIRST.slug)[0];
    // ACT
    const read = () => exportedPage(`${localizePath(`/episodes/${frame}`, locale)}`);
    // ASSERT
    expect(read).toThrow();
  });
});

describe('/events page and header', () => {
  it.each(LOCALES)('lists no Event whose Playlist is unlisted, and says there is none, for %s', (locale) => {
    // ARRANGE
    const $ = exportedPage(localizePath(ROUTES.events, locale));
    const expected = { cards: 0, empty: WORDS[locale].empty, headings: 1 };
    // ACT
    const seen = {
      cards: $('[data-event-card]').length,
      empty: $('[data-events-empty]').text(),
      headings: $('h1').length,
    };
    // ASSERT
    expect(seen).toEqual(expected);
  });

  it.each(LOCALES)('offers exactly one Events entry in the header, in the locale, for %s', (locale) => {
    // ARRANGE
    const $ = exportedPage(localizePath(ROUTES.home, locale));
    const expected = { count: 1, href: `${localizePath(ROUTES.events, locale)}/`, text: WORDS[locale].nav };
    // ACT
    const entry = $('[data-testid="site-nav"] [data-testid="nav-events"]');
    // ASSERT
    expect({ count: entry.length, href: entry.attr('href'), text: entry.text() }).toEqual(expected);
  });

  it('names the Events list in the sitemap, and no page of an unlisted Event', () => {
    // ARRANGE
    const sitemap = readFileSync(join(OUT_DIR, 'sitemap.xml'), 'utf8');
    // ACT
    const seen = {
      list: sitemap.includes(`<loc>${SITE_URL}/events/</loc>`) && sitemap.includes(`<loc>${SITE_URL}/de/events/</loc>`),
      unlisted: sitemap.includes(eventRoute(FIRST.slug)),
    };
    // ASSERT
    expect(seen).toEqual({ list: true, unlisted: false });
  });
});

describe('heading levels', () => {
  const PAGES = [
    { name: '/episodes', route: ROUTES.episodes },
    { name: '/events', route: ROUTES.events },
    { name: 'an Event page', route: eventRoute(FIRST.slug) },
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
