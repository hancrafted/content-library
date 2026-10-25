// The Events, each read through the content store (design-ADR 0016, Delivery): every old Workshop link lands on its
// Event, /events lists every Event whose Playlist is public, an Event's page shows its facts line, the past notice
// above its Playlist, and the Playlist as numbered cards in order, each opening the Episode under the Event. The
// header carries one Events entry, and the sitemap names the pages with their hreflang set.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { listEvents, playlistOf } from '../../src/content-store/store';
import { isPastEvent } from '../../src/lib/events.pure';
import { LOCALES, localizePath, type Locale } from '../../src/lib/locale.pure';
import { resolveSiteUrl } from '../../src/lib/page-metadata.pure';
import { eventEpisodeRoute, eventRoute, ROUTES } from '../../src/lib/routes';
import { exportedPage, OUT_DIR } from './exported-pages';

const SITE_URL = resolveSiteUrl(process.env);
const EVENTS = listEvents();
const LISTED = EVENTS.filter((event) => playlistOf(event).visibility === 'public');
const AXEL = EVENTS.find((event) => event.slug === '2026-10-23-axel-agentic-workflow');
if (AXEL === undefined) throw new Error('The AXEL Event is missing from the content store');
const AXEL_EPISODES = playlistOf(AXEL).episodes;
const TODAY = new Date().toISOString().slice(0, 10) as `${number}-${number}-${number}`;

/** Every Workshop URL that was ever published, and the Event it became. Written out: the Workshop pages are gone. */
const LEGACY_WORKSHOPS = [
  { workshop: 'axel-agentic-workflow-2026-10-23', event: '2026-10-23-axel-agentic-workflow' },
  { workshop: '2026-10-23-axel-agentic-workflow', event: '2026-10-23-axel-agentic-workflow' },
];

const WORDS: Record<
  Locale,
  {
    title: string;
    date: string;
    count: string;
    nav: string;
    start: string;
    reading: RegExp;
    kind: string;
    audience: string;
    notice: string;
  }
> = {
  en: {
    title: 'AXEL Seminar: Agentic Workflows',
    date: 'Oct 23, 2026',
    count: '3 Episodes',
    nav: 'Events',
    start: 'Start with Episode 1',
    reading: /^\d+ min total reading time$/,
    kind: 'Workshop',
    audience: 'For organizations',
    notice:
      'This Event has already taken place. The content below is kept up to date and may differ from the recording.',
  },
  de: {
    title: 'AXEL Seminar: Agentic Workflows',
    date: '23. Okt. 2026',
    count: '3 Episoden',
    nav: 'Veranstaltungen',
    start: 'Mit Episode 1 starten',
    reading: /^\d+ Min\. Lesezeit insgesamt$/,
    kind: 'Workshop',
    audience: 'Für Unternehmen',
    notice:
      'Diese Veranstaltung hat bereits stattgefunden. Die Inhalte werden laufend aktualisiert und können von der Aufzeichnung abweichen.',
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

  it.each(LOCALES)('lands every old workshop link on an Event page that was exported (%s)', (locale) => {
    // ARRANGE
    const expected = 1;
    // ACT
    const titles = LEGACY_WORKSHOPS.map(({ event }) => exportedPage(localizePath(eventRoute(event), locale))('h1'));
    // ASSERT
    for (const title of titles) expect(title.length).toBe(expected);
  });
});

describe('/events page', () => {
  it.each(LOCALES)('lists each Event whose Playlist is public as a card with name, date and count for %s', (locale) => {
    // ARRANGE
    const $ = exportedPage(localizePath(ROUTES.events, locale));
    const expected = { cards: LISTED.length, ...WORDS[locale] };
    // ACT
    const cards = $('[data-event-list] [data-event-card]');
    const card = cards.filter(`[data-event-slug="${AXEL.slug}"]`);
    // ASSERT
    expect(cards.length).toBe(expected.cards);
    expect(card.find('h2').text()).toBe(expected.title);
    expect(card.find('time[data-event-date]').attr('datetime')).toBe(AXEL.date);
    expect(card.find('time[data-event-date]').text()).toBe(expected.date);
    expect(card.find('[data-event-episode-count]').text()).toBe(expected.count);
  });

  it.each(LOCALES)('links each card to its Event page in the locale for %s', (locale) => {
    // ARRANGE
    const $ = exportedPage(localizePath(ROUTES.events, locale));
    const expected = `${localizePath(eventRoute(AXEL.slug), locale)}/`;
    // ACT
    const href = $(`[data-event-slug="${AXEL.slug}"] a[data-card-link]`).attr('href');
    // ASSERT
    expect(href).toBe(expected);
  });

  it.each(LOCALES)('draws the Event card with the quiet arrow and no Tags for %s', (locale) => {
    // ARRANGE
    const $ = exportedPage(localizePath(ROUTES.events, locale));
    // ACT
    const card = $(`[data-event-card][data-event-slug="${AXEL.slug}"]`);
    // ASSERT
    expect(card.attr('data-card-variant')).toBe('event');
    expect(card.find('[data-open-cue="arrow"]').length).toBe(1);
    expect(card.find('[data-tag], [data-episode-tags]').length).toBe(0);
  });
});

describe('Event page', () => {
  it.each(LOCALES)("An Event's page lists its Episodes in the Playlist's order (%s)", (locale) => {
    // ARRANGE
    const $ = exportedPage(localizePath(eventRoute(AXEL.slug), locale));
    const expected = {
      slugs: [...AXEL_EPISODES],
      steps: AXEL_EPISODES.map((_, index) => String(index + 1)),
      hrefs: AXEL_EPISODES.map((episode) => `${localizePath(eventEpisodeRoute(AXEL.slug, episode), locale)}/`),
    };
    // ACT
    const steps = $('ol[data-event-playlist] > li[data-playlist-step]');
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

  it.each(LOCALES)('emphasises the first Episode of the Playlist, and only it, for %s', (locale) => {
    // ARRANGE
    const $ = exportedPage(localizePath(eventRoute(AXEL.slug), locale));
    const expected = [0];
    // ACT
    const emphasised = $('ol[data-event-playlist] > li[data-playlist-step]')
      .map((index, step) => ($(step).is('[data-playlist-first]') ? index : null))
      .get();
    // ASSERT
    expect(emphasised).toEqual(expected);
  });

  it.each(LOCALES)('exports the Event with its title and date for %s', (locale) => {
    // ARRANGE
    const $ = exportedPage(localizePath(eventRoute(AXEL.slug), locale));
    const expected = { title: WORDS[locale].title, date: AXEL.date };
    // ACT
    const seen = { title: $('h1').text(), date: $('[data-event-facts] time[data-event-date]').attr('datetime') };
    // ASSERT
    expect(seen).toEqual(expected);
  });

  it.each(LOCALES)('names kind, Audience, Episode count and reading time on the facts line for %s', (locale) => {
    // ARRANGE
    const $ = exportedPage(localizePath(eventRoute(AXEL.slug), locale));
    const expected = WORDS[locale];
    // ACT
    const facts = $('[data-event-facts]');
    const seen = {
      kind: facts.find('[data-event-kind]').text(),
      audience: facts.find('[data-event-audience]').text(),
      count: facts.find('[data-event-episode-count]').text(),
    };
    // ASSERT
    expect(seen).toEqual({ kind: expected.kind, audience: expected.audience, count: expected.count });
    expect(facts.find('[data-event-reading-time]').text()).toMatch(expected.reading);
  });

  it.each(LOCALES)('starts at the first Episode under the Event with a primary button for %s', (locale) => {
    // ARRANGE
    const $ = exportedPage(localizePath(eventRoute(AXEL.slug), locale));
    const expected = {
      href: `${localizePath(eventEpisodeRoute(AXEL.slug, AXEL_EPISODES[0]), locale)}/`,
      label: WORDS[locale].start,
    };
    // ACT
    const start = $('a[data-event-start]');
    // ASSERT
    expect({ href: start.attr('href'), label: start.text() }).toEqual(expected);
  });

  it.each(LOCALES)('leads back up to all Events through the breadcrumb for %s', (locale) => {
    // ARRANGE
    const $ = exportedPage(localizePath(eventRoute(AXEL.slug), locale));
    const expected = { href: `${localizePath(ROUTES.events, locale)}/`, current: WORDS[locale].title };
    // ACT
    const trail = $('nav[data-event-breadcrumb]');
    const seen = { href: trail.find('a').first().attr('href'), current: trail.find('[aria-current="page"]').text() };
    // ASSERT
    expect(seen).toEqual(expected);
  });

  it.each(LOCALES)('A past Event says its content may differ from the recording, above its Playlist (%s)', (locale) => {
    // ARRANGE
    const $ = exportedPage(localizePath(eventRoute(AXEL.slug), locale));
    const expected = { past: true, notice: WORDS[locale].notice, role: 'note', abovePlaylist: 1 };
    // ACT
    const notice = $('[data-past-notice]');
    const seen = {
      past: isPastEvent(AXEL.date, TODAY),
      notice: notice.text(),
      role: notice.attr('role'),
      abovePlaylist: $('[data-past-notice] ~ section ol[data-event-playlist]').length,
    };
    // ASSERT
    expect(seen).toEqual(expected);
  });
});

describe('heading levels', () => {
  const PAGES = [
    { name: '/episodes', route: ROUTES.episodes },
    { name: '/events', route: ROUTES.events },
    { name: 'an Event page', route: eventRoute(AXEL.slug) },
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
  it.each(LOCALES)('offers exactly one Events entry in the header, in the locale, for %s', (locale) => {
    // ARRANGE
    const $ = exportedPage(localizePath(ROUTES.home, locale));
    const expected = { count: 1, href: `${localizePath(ROUTES.events, locale)}/`, text: WORDS[locale].nav };
    // ACT
    const entry = $('[data-testid="site-nav"] [data-testid="nav-events"]');
    // ASSERT
    expect({ count: entry.length, href: entry.attr('href'), text: entry.text() }).toEqual(expected);
  });

  it('names the Events list and the Event page in both locales with their hreflang set, and no Workshop page', () => {
    // ARRANGE
    const sitemap = readFileSync(join(OUT_DIR, 'sitemap.xml'), 'utf8');
    const route = eventRoute(AXEL.slug);
    const expected = {
      missing: [],
      workshops: false,
    };
    const fragments = [
      `<loc>${SITE_URL}/events/</loc>`,
      `<loc>${SITE_URL}/de/events/</loc>`,
      `<loc>${SITE_URL}${route}/</loc>`,
      `<loc>${SITE_URL}/de${route}/</loc>`,
      `hreflang="de" href="${SITE_URL}/de${route}/"`,
    ];
    // ACT
    const seen = {
      missing: fragments.filter((fragment) => !sitemap.includes(fragment)),
      workshops: sitemap.includes('/workshops'),
    };
    // ASSERT
    expect(seen).toEqual(expected);
  });
});
