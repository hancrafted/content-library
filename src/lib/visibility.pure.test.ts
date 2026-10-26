import { describe, expect, it } from 'vitest';
import type { PageRef } from './routes';
import { pageTreatment, type PageFacts, type PageTreatment } from './visibility.pure';

/*
 * The one visibility predicate (design-ADR 0016, Routes and visibility): a page and the facts of what it presents
 * in; whether it is exported, in the sitemap, indexed, and where its canonical points out. Expected rows are the
 * table's, written out.
 */

const EVENT = '2026-10-23-axel-agentic-workflow';

const LISTED: PageTreatment = { exported: true, inSitemap: true, index: true, canonical: 'self' };
const HIDDEN: PageTreatment = { exported: true, inSitemap: false, index: false, canonical: 'self' };
const ABSENT: PageTreatment = { exported: false, inSitemap: false, index: false, canonical: 'self' };

const PUBLISHED_PUBLIC: PageFacts = { visibility: 'public', status: 'published' };
const PUBLISHED_UNLISTED: PageFacts = { visibility: 'unlisted', status: 'published' };

/** Pages whose treatment rests on what they present. */
const NEEDS_FACTS: [string, PageRef][] = [
  ['an Episode page', { episode: 'ai-attention-span' }],
  ['an Event page', { event: EVENT }],
  ['an Episode under an Event', { event: EVENT, episode: 'ai-attention-span' }],
];

describe('success cases', () => {
  it.each<[string, PageRef, PageFacts, PageTreatment]>([
    ['a public, published Episode', { episode: 'ai-attention-span' }, PUBLISHED_PUBLIC, LISTED],
    ['an Event page whose Playlist is public', { event: EVENT }, { visibility: 'public' }, LISTED],
    ['an Event page whose Playlist is unlisted', { event: EVENT }, { visibility: 'unlisted' }, HIDDEN],
    ['an unlisted Episode under its Event', { event: EVENT, episode: 'ai-attention-span' }, PUBLISHED_UNLISTED, HIDDEN],
    [
      'a public Episode under an Event',
      { event: EVENT, episode: 'ai-attention-span' },
      PUBLISHED_PUBLIC,
      { exported: true, inSitemap: false, index: true, canonical: { episode: 'ai-attention-span' } },
    ],
    [
      'an upcoming Episode under an Event',
      { event: EVENT, episode: 'ai-attention-span' },
      { visibility: 'public', status: 'upcoming' },
      HIDDEN,
    ],
    ['an upcoming Episode', { episode: 'ai-attention-span' }, { visibility: 'public', status: 'upcoming' }, HIDDEN],
    ['a tooling page', { tooling: 'slide-master' }, {}, HIDDEN],
  ])('treats %s as the visibility table says', (...row) => {
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
    const treatment = pageTreatment({ episode: 'ai-attention-span' }, PUBLISHED_UNLISTED);
    // ASSERT
    expect(treatment).toEqual(expected);
  });

  it.each(NEEDS_FACTS)('keeps %s out of search when no visibility is handed in', (_name, page) => {
    // ARRANGE
    const expected = { inSitemap: false, index: false, canonical: 'self' };
    // ACT
    const { inSitemap, index, canonical } = pageTreatment(page, { status: 'published' });
    // ASSERT
    expect({ inSitemap, index, canonical }).toEqual(expected);
  });
});

describe('edge cases', () => {
  it.each<[string, PageRef, PageTreatment]>([
    ['the landing page', 'home', LISTED],
    ['the Episode overview', 'episodes', LISTED],
    ['the Events list', 'events', LISTED],
    ['the dashboard', 'dashboard', HIDDEN],
  ])('treats %s, which presents no record, by its kind alone', (_name, page, expected) => {
    // ARRANGE
    // ACT
    const treatment = pageTreatment(page, {});
    // ASSERT
    expect(treatment).toEqual(expected);
  });
});
