import type { Episode } from '@/content-store/schemas/episode.schema';
import { describe, expect, it } from 'vitest';
import { leadTagOf, overviewOrder } from './episode-metadata.pure';

type Identified = Episode & { readonly id: string };

/** Five hand-placed Episodes: three published, two upcoming, each no Event owns, so its id is its slug. */
const RECORDS: readonly Episode[] = [
  {
    slug: 'never-too-early-sales',
    status: 'published',
    visibility: 'public',
    format: 'foundations',
    tags: ['sales'],
    publishedOn: '2026-10-08',
  },
  {
    slug: 'maintaining-markdown-for-ai',
    status: 'published',
    visibility: 'public',
    format: 'teardown',
    tags: ['markdown', 'sales'],
    publishedOn: '2026-10-09',
  },
  {
    slug: 'ai-token-economy',
    status: 'published',
    visibility: 'public',
    format: 'foundations',
    tags: ['cost'],
    publishedOn: '2026-10-09',
  },
  { slug: 'rolling-out-ai', status: 'upcoming', visibility: 'public', format: 'foundations', tags: ['agentic-ai'] },
  { slug: 'ai-in-code-review', status: 'upcoming', visibility: 'public', format: 'short', tags: ['workflow'] },
];
const EPISODES: readonly Identified[] = RECORDS.map((episode) => ({ ...episode, id: episode.slug }));

const slugs = (entries: readonly Episode[]) => entries.map(({ slug }) => slug);

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
  it("features an Event's copy by its Episode id, not the slug it shares with its original", () => {
    // ARRANGE
    const COPY = '2026-10-23-axel-agentic-workflow__ai-token-economy';
    const copy = { ...EPISODES[2], id: COPY, publishedOn: '2026-10-01' } as const;
    const expected = [COPY, 'ai-token-economy'];
    // ACT
    const ordered = overviewOrder([EPISODES[2], copy], [COPY]);
    // ASSERT
    expect(ordered.map(({ id }) => id)).toEqual(expected);
  });

  it('breaks a tie between published Episodes of one date by Episode id, and leaves the given list in its order', () => {
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
