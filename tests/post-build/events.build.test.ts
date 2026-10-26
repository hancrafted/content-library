// The Events, each read through the content store (design-ADR 0016, Delivery): every old Workshop link lands on its
// Event, /events lists every Event whose Playlist is public, an Event's page shows its facts line, the past notice
// above its Playlist, and the Playlist as numbered cards in order, each opening the Episode under the Event. The
// header carries one Events entry, and the sitemap names the pages with their hreflang set. Each Episode an Event
// presents has a page under the Event: its place in the Playlist, the walk to its neighbours and back to the Event,
// the past notice above the title, and a canonical to its own /episodes/ page when it is public. An Event's copy lives
// only under its Event: a public copy is its own canonical, and an unlisted one is never indexed.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { episodeRef, matchEpisode, type EpisodeRef } from '../../src/content-store/catalogue/episode-id.pure';
import {
  episodeRoute,
  eventEpisodeRoute,
  eventRoute,
  type EpisodeId,
  type EventSlug,
} from '../../src/content-store/catalogue/record-routes';
import { listEvents } from '../../src/content-store/store';
import { isPastEvent } from '../../src/events/lib/events.pure';
import { LOCALES, localizePath, type Locale } from '../../src/shared/lib/locale.pure';
import { resolveSiteUrl } from '../../src/shared/lib/site-url.pure';
import { ROUTES } from '../../src/shared/lib/static-routes';
import { exportedPage, OUT_DIR, redirectRules } from './exported-pages';

const SITE_URL = resolveSiteUrl(process.env);
const EVENTS = listEvents();
const LISTED = EVENTS.filter((event) => event.playlist.visibility === 'public');
const AXEL = EVENTS.find((event) => event.slug === '2026-10-23-axel-agentic-workflow');
if (AXEL === undefined) throw new Error('The AXEL Event is missing from the content store');
/** A Playlist entry the test expects a page for: a registered Episode's ref, or the test file is wrong. */
const registered = ({ episode, page }: (typeof AXEL.playlist.episodes)[number]): EpisodeRef<EpisodeId> => {
  if (page === undefined) throw new Error(`"${episode.ref.id}" is no registered Episode`);
  return page;
};
const AXEL_EPISODES = AXEL.playlist.episodes.map(registered);
/** The slugs AXEL's cards carry, in the order it taught them: its copies' folder names. Written out: the store is not the oracle. */
const AXEL_SLUGS = ['onboard-ai-every-time', 'ai-attention-span', 'ai-gives-you-more-work'];
const TODAY = new Date().toISOString().slice(0, 10) as `${number}-${number}-${number}`;

/** Every Workshop URL that was ever published, and the Event it became. Written out: the Workshop pages are gone. */
const LEGACY_WORKSHOPS: readonly { workshop: string; event: EventSlug }[] = [
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
    position: (position: number, count: number) => string;
    previous: string;
    next: string;
    back: string;
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
    position: (position, count) => `Episode ${position} of ${count}`,
    previous: 'Previous Episode',
    next: 'Next Episode',
    back: 'Back to the Event',
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
    position: (position, count) => `Episode ${position} von ${count}`,
    previous: 'Vorherige Episode',
    next: 'Nächste Episode',
    back: 'Zurück zur Veranstaltung',
  },
};

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
      slugs: AXEL_SLUGS,
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

describe('the 2026-10-28 Event', () => {
  const CYBERFORUM = '2026-10-28-cyberforum-akademie-intro-agentic-workflow' satisfies EventSlug;
  /** The Workshop template's copy, then the three Episodes AXEL taught, copied unedited. Written out: the store is not the oracle. */
  const SLUGS = ['intro', 'onboard-ai-every-time', 'ai-attention-span', 'ai-gives-you-more-work'] as const;
  /** Each copy, the Event's own: its folder name under the Event's folder. */
  const EPISODES = SLUGS.map((slug) => episodeRef(slug, CYBERFORUM)) satisfies readonly EpisodeRef<EpisodeId>[];
  const FACTS = {
    en: { kind: 'Webinar', audience: 'For individuals', time: ' · 17:00–19:00 CET', location: 'remote' },
    de: { kind: 'Webinar', audience: 'Für Einzelpersonen', time: ' · 17:00–19:00 CET', location: 'remote' },
  } as const;

  it.each(LOCALES)(
    'The 2026-10-28 Event page lists the Workshop template copy first, then the three copies (%s)',
    (locale) => {
      // ARRANGE
      const $ = exportedPage(localizePath(eventRoute(CYBERFORUM), locale));
      const expected = {
        slugs: SLUGS,
        hrefs: EPISODES.map((episode) => `${localizePath(eventEpisodeRoute(CYBERFORUM, episode), locale)}/`),
      };
      // ACT
      const steps = $('ol[data-event-playlist] > li[data-playlist-step]');
      const seen = {
        slugs: steps
          .find('[data-episode-card]')
          .map((_, card) => $(card).attr('data-episode-slug'))
          .get(),
        hrefs: steps
          .find('a[data-card-link]')
          .map((_, link) => $(link).attr('href'))
          .get(),
      };
      // ASSERT
      expect(seen).toEqual(expected);
    },
  );

  it.each(LOCALES)('names the webinar, its Audience, time and location on the facts line (%s)', (locale) => {
    // ARRANGE
    const $ = exportedPage(localizePath(eventRoute(CYBERFORUM), locale));
    const expected = FACTS[locale];
    // ACT
    const facts = $('[data-event-facts]');
    const seen = {
      kind: facts.find('[data-event-kind]').text(),
      audience: facts.find('[data-event-audience]').text(),
      time: facts.find('[data-event-time]').text(),
      location: facts.find('[data-event-location]').text(),
    };
    // ASSERT
    expect(seen).toEqual(expected);
  });
});

describe('Episode pages under an Event', () => {
  /**
   * Every Episode of every Event's Playlist that has a page, in each locale: the closed set the route exports, each with
   * the record the served Event lists it by.
   */
  const PAGES_UNDER_EVENTS = EVENTS.flatMap((event) =>
    event.playlist.episodes
      .flatMap(({ episode: record, page }) => (page === undefined ? [] : [{ record, episode: page }]))
      .flatMap(({ record, episode }) => LOCALES.map((locale) => ({ event: event.slug, episode, record, locale }))),
  );
  const urlOf = (event: EventSlug, episode: EpisodeRef<EpisodeId>, locale: Locale) =>
    localizePath(eventEpisodeRoute(event, episode), locale);

  it.each(PAGES_UNDER_EVENTS)(
    'exports $episode.id under $event for $locale as the Episode page',
    ({ event, episode, locale }) => {
      // ARRANGE
      const expected = { episode: episode.id, headings: 1 };
      const $ = exportedPage(urlOf(event, episode, locale));
      // ACT
      const seen = { episode: $('[data-slot="episode-page"]').attr('data-episode'), headings: $('h1').length };
      // ASSERT
      expect(seen).toEqual(expected);
    },
  );

  it.each(LOCALES)(
    'An Event-scoped page shows "Episode n of m", previous and next in Playlist order, and a link back to the Event on the last one (%s)',
    (locale) => {
      // ARRANGE
      const count = AXEL_EPISODES.length;
      const hrefOf = (episode: EpisodeRef<EpisodeId> | undefined) =>
        episode === undefined ? undefined : `${urlOf(AXEL.slug, episode, locale)}/`;
      const expected = AXEL_EPISODES.map((episode, index) => ({
        position: WORDS[locale].position(AXEL_EPISODES.indexOf(episode) + 1, count),
        previous: hrefOf(AXEL_EPISODES[index - 1]),
        next: hrefOf(AXEL_EPISODES[index + 1]),
        back: index === AXEL_EPISODES.length - 1 ? `${localizePath(eventRoute(AXEL.slug), locale)}/` : undefined,
      }));
      // ACT
      const seen = AXEL_EPISODES.map((episode) => {
        const $ = exportedPage(urlOf(AXEL.slug, episode, locale));
        const nav = $('nav[data-playlist-nav]');
        return {
          position: $('[data-slot="title-slide"] [data-playlist-position]').text(),
          previous: nav.find('a[data-playlist-previous]').attr('href'),
          next: nav.find('a[data-playlist-next]').attr('href'),
          back: nav.find('a[data-playlist-back]').attr('href'),
        };
      });
      // ASSERT
      expect(seen).toEqual(expected);
    },
  );

  it.each(LOCALES)('names each step of the walk in the locale for %s', (locale) => {
    // ARRANGE
    const [first] = AXEL_EPISODES;
    const last = AXEL_EPISODES.at(-1) ?? first;
    const expected = { next: WORDS[locale].next, previous: WORDS[locale].previous, back: WORDS[locale].back };
    // ACT
    const seen = {
      next: exportedPage(urlOf(AXEL.slug, first, locale))('a[data-playlist-next] [data-playlist-cue]').text(),
      previous: exportedPage(urlOf(AXEL.slug, last, locale))('a[data-playlist-previous] [data-playlist-cue]').text(),
      back: exportedPage(urlOf(AXEL.slug, last, locale))('a[data-playlist-back] [data-playlist-cue]').text(),
    };
    // ASSERT
    expect(seen).toEqual(expected);
  });

  it.each(PAGES_UNDER_EVENTS)(
    'leads from $episode.id back up to its Event and to all Events through the breadcrumb for $locale',
    ({ event, episode, locale }) => {
      // ARRANGE
      const $ = exportedPage(urlOf(event, episode, locale));
      const expected = {
        hrefs: [`${localizePath(ROUTES.events, locale)}/`, `${localizePath(eventRoute(event), locale)}/`],
        current: $('h1 .sr-only').first().text() || $('h1').text(),
      };
      // ACT
      const trail = $('nav[data-event-breadcrumb]');
      const seen = {
        hrefs: trail
          .find('a')
          .map((_, link) => $(link).attr('href'))
          .get(),
        current: trail.find('[aria-current="page"]').text(),
      };
      // ASSERT
      expect(seen).toEqual(expected);
    },
  );

  it.each(PAGES_UNDER_EVENTS)(
    'A public Episode under an Event carries a canonical to its own /episodes/ page, a public Event copy to itself ($episode.id, $locale)',
    ({ event, episode, record, locale }) => {
      // ARRANGE
      const own = `${SITE_URL}${localizePath(episodeRoute(episode.id), locale)}/`;
      const self = `${SITE_URL}${urlOf(event, episode, locale)}/`;
      const indexable = record.visibility === 'public' && record.status === 'published';
      const copy = matchEpisode(episode, { standalone: () => false, 'event-copy': () => true });
      const expected = !indexable
        ? { canonical: self, noindex: true, hreflang: 3, card: self }
        : copy
          ? { canonical: self, noindex: false, hreflang: 3, card: self }
          : { canonical: own, noindex: false, hreflang: 0, card: own };
      const $ = exportedPage(urlOf(event, episode, locale));
      // ACT
      const seen = {
        canonical: $('link[rel="canonical"]').attr('href'),
        noindex: ($('meta[name="robots"]').attr('content') ?? '').includes('noindex'),
        hreflang: $('link[rel="alternate"][hreflang]').length,
        card: $('meta[property="og:url"]').attr('content'),
      };
      // ASSERT
      expect(seen).toEqual(expected);
    },
  );

  it.each(PAGES_UNDER_EVENTS)(
    'leaves the structured data on the Episode’s own page, not on $episode.id under its Event, for $locale',
    ({ event, episode, locale }) => {
      // ARRANGE
      const $ = exportedPage(urlOf(event, episode, locale));
      // ACT
      const scripts = $('script[type="application/ld+json"]').length;
      // ASSERT
      expect(scripts).toBe(0);
    },
  );

  it.each(PAGES_UNDER_EVENTS)(
    'links the table of contents of $episode.id to the page under its Event for $locale',
    ({ event, episode, locale }) => {
      // ARRANGE
      const $ = exportedPage(urlOf(event, episode, locale));
      const prefix = `${urlOf(event, episode, locale)}/#`;
      // ACT
      const elsewhere = $('[data-slot="toc"] a[href*="#"]')
        .map((_, link) => $(link).attr('href'))
        .get()
        .filter((href) => !href.startsWith(prefix));
      // ASSERT
      expect(elsewhere).toEqual([]);
    },
  );

  it.each(LOCALES)('The past notice shows on a past Event’s Episode pages, above the title (%s)', (locale) => {
    // ARRANGE
    const expected = AXEL_EPISODES.map(() => ({ past: true, notice: WORDS[locale].notice, beforeTitle: true }));
    // ACT
    const seen = AXEL_EPISODES.map((episode) => {
      const $ = exportedPage(urlOf(AXEL.slug, episode, locale));
      const order = $('[data-past-notice], h1')
        .map((_, element) => (element.tagName === 'h1' ? 'title' : 'notice'))
        .get();
      return {
        past: isPastEvent(AXEL.date, TODAY),
        notice: $('[data-past-notice]').text(),
        beforeTitle: order.join() === 'notice,title',
      };
    });
    // ASSERT
    expect(seen).toEqual(expected);
  });

  it.each(LOCALES)('opens every linked card of the Event page on an exported page (%s)', (locale) => {
    // ARRANGE
    const $ = exportedPage(localizePath(eventRoute(AXEL.slug), locale));
    // ACT
    const missing = $('ol[data-event-playlist] a[data-card-link]')
      .map((_, link) => $(link).attr('href') ?? '')
      .get()
      .filter((href) => {
        try {
          exportedPage(href.replace(/\/$/, ''));
          return false;
        } catch {
          return true;
        }
      });
    // ASSERT
    expect(missing).toEqual([]);
  });

  it('lists no Episode page under an Event in the sitemap', () => {
    // ARRANGE
    const sitemap = readFileSync(join(OUT_DIR, 'sitemap.xml'), 'utf8');
    // ACT
    const underEvents = sitemap.match(/<loc>[^<]*\/events\/[^<]*\/episodes\/[^<]*<\/loc>/g) ?? [];
    // ASSERT
    expect(underEvents).toEqual([]);
  });
});

describe('heading levels', () => {
  const PAGES = [
    { name: '/episodes', route: ROUTES.episodes },
    { name: '/events', route: ROUTES.events },
    { name: 'an Event page', route: eventRoute(AXEL.slug) },
    { name: 'an Episode page under an Event', route: eventEpisodeRoute(AXEL.slug, AXEL_EPISODES[0]) },
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
