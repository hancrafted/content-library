import { describe, expect, it } from 'vitest';
import { leadTagOf, overviewOrder, tagProblems, type EpisodeMetadata } from './episode-metadata.pure';

/** Five hand-placed Episodes: three published, two upcoming. */
const EPISODES: readonly EpisodeMetadata[] = [
  {
    slug: 'never-too-early-sales',
    status: 'published',
    format: 'foundations',
    tags: ['sales'],
    publishedOn: '2026-10-08',
  },
  {
    slug: 'maintaining-markdown-for-ai',
    status: 'published',
    format: 'teardown',
    tags: ['markdown', 'sales'],
    publishedOn: '2026-10-09',
  },
  {
    slug: 'ai-token-economy',
    status: 'published',
    format: 'foundations',
    tags: ['cost'],
    publishedOn: '2026-10-09',
  },
  { slug: 'rolling-out-ai', status: 'upcoming', format: 'foundations', tags: ['agentic-ai'] },
  { slug: 'ai-in-code-review', status: 'upcoming', format: 'short', tags: ['workflow'] },
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

  it("takes an Episode's first Tag as its lead Tag", () => {
    // ARRANGE
    const expected = 'markdown';
    // ACT
    const lead = leadTagOf(EPISODES[1]);
    // ASSERT
    expect(lead).toBe(expected);
  });

  it('finds no problem in Episodes whose Tags are all in the vocabulary', () => {
    // ARRANGE
    const expected: string[] = [];
    // ACT
    const problems = tagProblems(EPISODES);
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

  it('rejects an Episode with a Tag outside the vocabulary', () => {
    // ARRANGE
    const episodes = [{ slug: 'ai-token-economy', tags: ['cost', 'tokens'] }];
    const expected = ['ai-token-economy: unknown Tag tokens'];
    // ACT
    const problems = tagProblems(episodes);
    // ASSERT
    expect(problems).toEqual(expected);
  });

  it('rejects an Episode with no Tag, since its lead Tag gives its card its look', () => {
    // ARRANGE
    const episodes = [{ slug: 'ai-token-economy', tags: [] }];
    const expected = ['ai-token-economy: has no Tag'];
    // ACT
    const problems = tagProblems(episodes);
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
  it('names a Tag once the Episode lists it twice', () => {
    // ARRANGE
    const episodes = [{ slug: 'ai-token-economy', tags: ['cost', 'cost'] }];
    const expected = ['ai-token-economy: lists the Tag cost twice'];
    // ACT
    const problems = tagProblems(episodes);
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
