import { describe, expect, it } from 'vitest';
import { overviewOrder, topicsOf, type EpisodeMetadata } from './episode-metadata.pure';

/** Five hand-placed Episodes: three published, two upcoming, one with extra Topics. */
const EPISODES: readonly EpisodeMetadata[] = [
  {
    slug: 'never-too-early-sales',
    status: 'published',
    topic: 'sales',
    format: 'foundations',
    tags: [],
    publishedOn: '2026-10-08',
  },
  {
    slug: 'maintaining-markdown-for-ai',
    status: 'published',
    topic: 'knowledge-base',
    extraTopics: ['sales'],
    format: 'teardown',
    tags: [],
    publishedOn: '2026-10-09',
  },
  {
    slug: 'ai-token-economy',
    status: 'published',
    topic: 'cost',
    format: 'foundations',
    tags: [],
    publishedOn: '2026-10-09',
  },
  { slug: 'rolling-out-ai', status: 'upcoming', topic: 'ai-enablement', format: 'foundations', tags: [] },
  { slug: 'ai-in-code-review', status: 'upcoming', topic: 'sales', format: 'short', tags: [] },
];

const slugs = (entries: readonly EpisodeMetadata[]) => entries.map(({ slug }) => slug);

describe('success cases', () => {
  it('orders the Featured Episodes first, as listed, then other published ones newest first, then upcoming as given', () => {
    // ARRANGE
    const featured = ['ai-token-economy', 'never-too-early-sales'];
    const expected = [
      'ai-token-economy',
      'never-too-early-sales',
      'maintaining-markdown-for-ai',
      'rolling-out-ai',
      'ai-in-code-review',
    ];
    // ACT
    const ordered = overviewOrder(EPISODES, featured);
    // ASSERT
    expect(slugs(ordered)).toEqual(expected);
  });

  it('lists an Episode under its primary Topic first, then its extra Topics', () => {
    // ARRANGE
    const expected = ['knowledge-base', 'sales'];
    // ACT
    const topics = topicsOf(EPISODES[1]);
    // ASSERT
    expect(topics).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('never features an upcoming Episode, even when the list names one', () => {
    // ARRANGE
    const featured = ['rolling-out-ai'];
    const expected = [
      'ai-token-economy',
      'maintaining-markdown-for-ai',
      'never-too-early-sales',
      'rolling-out-ai',
      'ai-in-code-review',
    ];
    // ACT
    const ordered = overviewOrder(EPISODES, featured);
    // ASSERT
    expect(slugs(ordered)).toEqual(expected);
  });

  it('ignores a Featured slug no Episode holds', () => {
    // ARRANGE
    const featured = ['no-such-episode', 'never-too-early-sales'];
    const expectedFirst = 'never-too-early-sales';
    const expectedCount = 5;
    // ACT
    const ordered = overviewOrder(EPISODES, featured);
    // ASSERT
    expect(ordered[0].slug).toBe(expectedFirst);
    expect(ordered).toHaveLength(expectedCount);
  });
});

describe('edge cases', () => {
  it('names a Topic once when an Episode repeats its primary Topic among its extra ones', () => {
    // ARRANGE
    const episode: EpisodeMetadata = { ...EPISODES[0], extraTopics: ['sales', 'cost', 'cost'] };
    const expected = ['sales', 'cost'];
    // ACT
    const topics = topicsOf(episode);
    // ASSERT
    expect(topics).toEqual(expected);
  });

  it('breaks a tie between published Episodes of one date by slug, and leaves the given list in its order', () => {
    // ARRANGE
    const before = slugs(EPISODES);
    const expected = ['ai-token-economy', 'maintaining-markdown-for-ai', 'never-too-early-sales'];
    // ACT
    const ordered = overviewOrder(EPISODES, []).slice(0, 3);
    // ASSERT
    expect(slugs(ordered)).toEqual(expected);
    expect(slugs(EPISODES)).toEqual(before);
  });
});
