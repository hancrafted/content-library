import { describe, expect, it } from 'vitest';
import { episodeRef, toolingRef } from './episode-id.pure';
import type { PageRef } from './record-routes';
import { pageTreatment, type PageFacts, type PageTreatment } from './visibility.pure';

/*
 * The one visibility predicate (design-ADR 0016, Routes and visibility): a page and the facts of what it presents
 * in; whether it is exported, in the sitemap, indexed, and where its canonical points out. Expected rows are the
 * table's, written out.
 */

const EVENT = '2026-10-23-axel-agentic-workflow';

const LISTED: PageTreatment = { exported: true, inSitemap: true, index: true, listed: true, canonical: 'self' };
const HIDDEN: PageTreatment = { exported: true, inSitemap: false, index: false, listed: false, canonical: 'self' };
const ABSENT: PageTreatment = { exported: false, inSitemap: false, index: false, listed: false, canonical: 'self' };
/** A public upcoming Episode: on the site's own lists (overview, Upcoming), out of search. */
const ANNOUNCED: PageTreatment = { exported: true, inSitemap: false, index: false, listed: true, canonical: 'self' };

const PUBLISHED_PUBLIC: PageFacts = { visibility: 'public', status: 'published' };
const PUBLISHED_UNLISTED: PageFacts = { visibility: 'unlisted', status: 'published' };

const EPISODE_PAGE: PageRef = { kind: 'episode', episode: episodeRef('ai-attention-span') };
const EVENT_PAGE: PageRef = { kind: 'event', event: EVENT };
const EVENT_EPISODE_PAGE: PageRef = { kind: 'event-episode', event: EVENT, episode: episodeRef('ai-attention-span') };
/** The AXEL seminar's own copy, in its folder `by-event/<event>/ai-attention-span/`. */
const COPY = episodeRef('ai-attention-span', EVENT);
const COPY_PAGE: PageRef = { kind: 'event-episode', event: EVENT, episode: COPY };
// @ts-expect-error -- an Event's copy has no page of its own under /episodes/; the predicate still fails closed
const COPY_OWN_PAGE: PageRef = { kind: 'episode', episode: COPY };
/** Indexed and in the sitemap at its Event-scoped URL, canonical to itself, never on the site's own lists. */
const SELF_INDEXED: PageTreatment = { exported: true, inSitemap: true, index: true, listed: false, canonical: 'self' };

/** Pages whose treatment rests on what they present. */
const NEEDS_FACTS: [string, PageRef][] = [
  ['an Episode page', EPISODE_PAGE],
  ['an Event page', EVENT_PAGE],
  ['an Episode under an Event', EVENT_EPISODE_PAGE],
];

/** Facts that say nothing about visibility: none at all, or a status alone. */
const NO_VISIBILITY: [string, PageFacts][] = [
  ['no facts', {}],
  ['a status but no visibility', { status: 'published' }],
];

const TABLE: [string, PageRef, PageFacts, PageTreatment][] = [
  ['a public, published Episode', EPISODE_PAGE, PUBLISHED_PUBLIC, LISTED],
  ['an Event page whose Playlist is public', EVENT_PAGE, { visibility: 'public' }, LISTED],
  ['an Event page whose Playlist is unlisted', EVENT_PAGE, { visibility: 'unlisted' }, HIDDEN],
  ['an unlisted Episode under its Event', EVENT_EPISODE_PAGE, PUBLISHED_UNLISTED, HIDDEN],
  [
    'a public Episode under an Event',
    EVENT_EPISODE_PAGE,
    PUBLISHED_PUBLIC,
    { exported: true, inSitemap: false, index: true, listed: false, canonical: { episode: 'ai-attention-span' } },
  ],
  ['an upcoming Episode under an Event', EVENT_EPISODE_PAGE, { visibility: 'public', status: 'upcoming' }, HIDDEN],
  ['an upcoming Episode', EPISODE_PAGE, { visibility: 'public', status: 'upcoming' }, ANNOUNCED],
  ['a tooling page', { kind: 'tooling', tooling: toolingRef('slide-master') }, {}, HIDDEN],
  ["a public, published Event's copy under its Event", COPY_PAGE, { ...PUBLISHED_PUBLIC, copy: true }, SELF_INDEXED],
  ["an unlisted Event's copy under its Event", COPY_PAGE, { ...PUBLISHED_UNLISTED, copy: true }, HIDDEN],
  [
    "a public Event's copy at /episodes/, where it has no page",
    COPY_OWN_PAGE,
    { ...PUBLISHED_PUBLIC, copy: true },
    ABSENT,
  ],
];

const NO_RECORD: [string, PageRef, PageTreatment][] = [
  ['the landing page', { kind: 'home' }, LISTED],
  ['the Episode overview', { kind: 'episodes' }, LISTED],
  ['the Events list', { kind: 'events' }, LISTED],
  ['the dashboard', { kind: 'dashboard' }, HIDDEN],
];

describe('success cases', () => {
  it.each(TABLE)('treats %s as the visibility table says', (...row) => {
    // ARRANGE
    const [, page, facts, expected] = row;
    // ACT
    const treatment = pageTreatment(page, facts);
    // ASSERT
    expect(treatment).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('exports no own Episode page for an unlisted Episode, only its Event-scoped one', () => {
    // ARRANGE
    const expected = ABSENT;
    // ACT
    const treatment = pageTreatment(EPISODE_PAGE, PUBLISHED_UNLISTED);
    // ASSERT
    expect(treatment).toEqual(expected);
  });

  it.each(NEEDS_FACTS.flatMap(([name, page]) => NO_VISIBILITY.map(([given, facts]) => ({ name, given, page, facts }))))(
    'keeps $name out of search and off the site lists when handed $given',
    ({ page, facts }) => {
      // ARRANGE
      const expected = { inSitemap: false, index: false, listed: false, canonical: 'self' };
      // ACT
      const { inSitemap, index, listed, canonical } = pageTreatment(page, facts);
      // ASSERT
      expect({ inSitemap, index, listed, canonical }).toEqual(expected);
    },
  );

  it('never exports, lists or indexes a page of a kind it does not know, whatever its facts say', () => {
    // ARRANGE
    const unknown = { kind: 'webinar', episode: 'ai-attention-span' } as unknown as PageRef;
    // ACT
    const treatment = pageTreatment(unknown, PUBLISHED_PUBLIC);
    // ASSERT
    expect(treatment).toEqual(ABSENT);
  });
});

describe('edge cases', () => {
  it.each(NO_RECORD)('treats %s, which presents no record, by its kind alone', (_name, page, expected) => {
    // ARRANGE
    // ACT
    const treatment = pageTreatment(page, {});
    // ASSERT
    expect(treatment).toEqual(expected);
  });
});
