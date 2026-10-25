import { describe, expect, it } from 'vitest';
import { episodeConceptProblems, lookOf, overviewOrder, type EpisodeMetadata } from './episode-metadata.pure';

/** Five hand-placed Episodes: three published, two upcoming. */
const EPISODES: readonly EpisodeMetadata[] = [
  {
    slug: 'never-too-early-sales',
    status: 'published',
    format: 'foundations',
    concepts: ['sales'],
    applyThemeFromConcept: 'sales',
    publishedOn: '2026-10-08',
  },
  {
    slug: 'maintaining-markdown-for-ai',
    status: 'published',
    format: 'teardown',
    concepts: ['markdown-documentation', 'sales'],
    applyThemeFromConcept: 'markdown-documentation',
    publishedOn: '2026-10-09',
  },
  {
    slug: 'ai-token-economy',
    status: 'published',
    format: 'foundations',
    concepts: ['ai-cost'],
    applyThemeFromConcept: 'ai-cost',
    publishedOn: '2026-10-09',
  },
  {
    slug: 'rolling-out-ai',
    status: 'upcoming',
    format: 'foundations',
    concepts: ['agentic-ai'],
    applyThemeFromConcept: 'agentic-ai',
  },
  {
    slug: 'ai-in-code-review',
    status: 'upcoming',
    format: 'short',
    concepts: ['ai-adoption'],
    applyThemeFromConcept: 'ai-adoption',
  },
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

  it('draws the look of the Concept named in applyThemeFromConcept, not of the first Concept listed', () => {
    // ARRANGE
    const expected = { icon: 'file-text', accent: 'rose' };
    // ACT
    const look = lookOf(EPISODES[1]);
    // ASSERT
    expect(look).toEqual(expected);
  });

  it('finds no problem in Episodes themed by top Concepts they list', () => {
    // ARRANGE
    const expected: string[] = [];
    const top = ['sales', 'markdown-documentation', 'ai-cost', 'agentic-ai', 'ai-adoption'];
    // ACT
    const problems = episodeConceptProblems(EPISODES, top);
    // ASSERT
    expect(problems).toEqual(expected);
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

  it('rejects an Episode that lists a Concept that is not a top Concept', () => {
    // ARRANGE
    const episodes = [{ slug: 'ai-token-economy', concepts: ['ai-cost', 'tokens'], applyThemeFromConcept: 'ai-cost' }];
    const expected = ['ai-token-economy: concepts names tokens, which is not one of the top Concepts'];
    // ACT
    const problems = episodeConceptProblems(episodes, ['ai-cost']);
    // ASSERT
    expect(problems).toEqual(expected);
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
  it('names a Concept once the Episode lists it twice', () => {
    // ARRANGE
    const episodes = [{ slug: 'ai-token-economy', concepts: ['ai-cost', 'ai-cost'], applyThemeFromConcept: 'ai-cost' }];
    const expected = ['ai-token-economy: lists the Concept ai-cost twice'];
    // ACT
    const problems = episodeConceptProblems(episodes, ['ai-cost']);
    // ASSERT
    expect(problems).toEqual(expected);
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
