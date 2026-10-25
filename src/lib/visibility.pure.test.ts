import { describe, expect, it } from 'vitest';
import type { PageRef } from './routes';
import { pageTreatment, type PageFacts, type PageTreatment } from './visibility.pure';

const EVENT = '2026-10-23-axel-agentic-workflow';
const FRAME = 'axel-agentic-workflow-agenda';

const indexed = (canonical: PageTreatment['canonical'] = 'self'): PageTreatment => ({
  inSitemap: false,
  index: true,
  canonical,
});
const listed: PageTreatment = { inSitemap: true, index: true, canonical: 'self' };
const hidden: PageTreatment = { inSitemap: false, index: false, canonical: 'self' };

/** One row per line of the visibility table (design-ADR 0016, Delivery contract): page, its facts, its treatment. */
const TABLE: [string, PageRef, PageFacts, PageTreatment][] = [
  [
    'a public, published Episode at /episodes/<slug>/',
    { episode: 'ai-attention-span' },
    { visibility: 'public', status: 'published' },
    listed,
  ],
  ['an Event page whose Playlist is public', { event: EVENT }, { visibility: 'public' }, listed],
  ['an Event page whose Playlist is unlisted', { event: EVENT }, { visibility: 'unlisted' }, hidden],
  [
    'an unlisted Episode under an Event, no public original',
    { event: EVENT, episode: FRAME },
    { visibility: 'unlisted', status: 'published' },
    hidden,
  ],
  [
    'an unlisted Episode that declares canonicalEpisode',
    { event: EVENT, episode: FRAME },
    { visibility: 'unlisted', status: 'published', canonicalEpisode: 'onboard-ai-every-time' },
    indexed({ episode: 'onboard-ai-every-time' }),
  ],
  [
    'a public Event whose Playlist holds unlisted Episodes: the Event page',
    { event: EVENT },
    { visibility: 'public' },
    listed,
  ],
  [
    'a public Event whose Playlist holds unlisted Episodes: an unlisted Episode page',
    { event: EVENT, episode: FRAME },
    { visibility: 'unlisted', status: 'published' },
    hidden,
  ],
  [
    'a public Event whose Playlist holds unlisted Episodes: an unlisted Episode page that declares a canonical',
    { event: EVENT, episode: FRAME },
    { visibility: 'unlisted', status: 'published', canonicalEpisode: 'ai-attention-span' },
    indexed({ episode: 'ai-attention-span' }),
  ],
  ['a tooling page', { tooling: 'slide-master' }, {}, hidden],
  [
    'a public Episode viewed at an Event-scoped URL',
    { event: EVENT, episode: 'ai-token-economy' },
    { visibility: 'public', status: 'published' },
    indexed({ episode: 'ai-token-economy' }),
  ],
  [
    'an upcoming Episode (public only)',
    { episode: 'ai-attention-span' },
    { visibility: 'public', status: 'upcoming' },
    hidden,
  ],
];

describe('success cases', () => {
  it.each(TABLE)('treats %s as the table says', (...row) => {
    // ARRANGE
    const [, page, facts, expected] = row;
    // ACT
    const treatment = pageTreatment(page, facts);
    // ASSERT
    expect(treatment).toEqual(expected);
  });
});

describe('edge cases', () => {
  it.each<[string, PageRef, PageTreatment]>([
    ['the home page', 'home', listed],
    ['the Episode overview', 'episodes', listed],
    ['the Events list', 'events', listed],
    ['a Concept page', { concept: 'agentic-ai' }, listed],
    ['the dashboard', 'dashboard', hidden],
  ])('treats %s as before', (_name, page, expected) => {
    // ARRANGE
    // ACT
    const treatment = pageTreatment(page, {});
    // ASSERT
    expect(treatment).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('keeps an Event page out of search when nothing says its Playlist is public', () => {
    // ARRANGE
    const page: PageRef = { event: EVENT };
    // ACT
    const treatment = pageTreatment(page, {});
    // ASSERT
    expect(treatment).toEqual(hidden);
  });
});
