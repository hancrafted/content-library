import { describe, expect, it } from 'vitest';
import {
  ALL,
  browseView,
  fillCount,
  formatChoices,
  hasChoice,
  INITIAL_SELECTION,
  resultsText,
  spotlightOf,
  topicChoices,
  type BrowseSelection,
} from './episode-browse.pure';
import type { EpisodeCard } from './episode-card.pure';

function card(slug: string, over: Partial<EpisodeCard> = {}): EpisodeCard {
  const published = over.status !== 'upcoming';
  return {
    slug,
    route: published ? `/episode/${slug}` : null,
    href: published ? `/episode/${slug}` : null,
    status: published ? 'published' : 'upcoming',
    title: `Title ${slug}`,
    caption: `Caption ${slug}`,
    topic: { id: 'economics', label: 'Cost' },
    format: { id: 'foundations', label: 'Foundations' },
    featuredRank: published ? 1 : null,
    accent: 'amber',
    icon: 'coins',
    ...over,
  };
}

const MIXED: EpisodeCard[] = [
  card('p1', { topic: { id: 'ai-collaboration', label: 'AI' } }),
  card('p2', { topic: { id: 'documentation', label: 'Docs' } }),
  card('p3'),
  card('u1', {
    status: 'upcoming',
    topic: { id: 'ai-collaboration', label: 'AI' },
    format: { id: 'teardown', label: 'Teardown' },
  }),
  card('u2', { status: 'upcoming', format: { id: 'short', label: 'Short' } }),
];

const slugs = (cards: readonly EpisodeCard[]) => cards.map((entry) => entry.slug);

describe('success cases', () => {
  it('leads the spotlight with the first published card and stacks the next two beside it', () => {
    // ARRANGE
    const expected = { lead: 'p1', side: ['p2', 'p3'] };
    // ACT
    const { lead, side } = spotlightOf(MIXED);
    // ASSERT
    expect({ lead: lead?.slug, side: slugs(side) }).toEqual(expected);
  });

  it('shows every card for the default selection when they fit under the cap', () => {
    // ARRANGE
    const cap = 9;
    const expected = { matching: 5, overflow: 0, visible: ['p1', 'p2', 'p3', 'u1', 'u2'] };
    // ACT
    const view = browseView(MIXED, INITIAL_SELECTION, cap);
    // ASSERT
    expect({ matching: view.matching, overflow: view.overflow, visible: [...view.visible] }).toEqual(expected);
  });

  it('narrows the grid to one topic and counts only its cards', () => {
    // ARRANGE
    const selection: BrowseSelection = { ...INITIAL_SELECTION, topic: 'ai-collaboration' };
    const expected = ['p1', 'u1'];
    // ACT
    const view = browseView(MIXED, selection, 9);
    // ASSERT
    expect([...view.visible]).toEqual(expected);
  });

  it('narrows by topic and format together', () => {
    // ARRANGE
    const selection: BrowseSelection = { topic: 'ai-collaboration', format: 'teardown', expanded: false };
    const expected = ['u1'];
    // ACT
    const view = browseView(MIXED, selection, 9);
    // ASSERT
    expect([...view.visible]).toEqual(expected);
  });

  it('counts each topic chip against the chosen format, in vocabulary order, with the all-chip first', () => {
    // ARRANGE
    const selection: BrowseSelection = { ...INITIAL_SELECTION, format: 'foundations' };
    const expected = {
      all: 3,
      options: [
        { id: 'ai-collaboration', label: 'AI', count: 1 },
        { id: 'documentation', label: 'Docs', count: 1 },
        { id: 'economics', label: 'Cost', count: 1 },
      ],
    };
    // ACT
    const choices = topicChoices(MIXED, selection);
    // ASSERT
    expect(choices).toEqual(expected);
  });

  it('counts each format against the chosen topic', () => {
    // ARRANGE
    const selection: BrowseSelection = { ...INITIAL_SELECTION, topic: 'ai-collaboration' };
    const expected = {
      all: 2,
      options: [
        { id: 'foundations', label: 'Foundations', count: 1 },
        { id: 'teardown', label: 'Teardown', count: 1 },
        { id: 'short', label: 'Short', count: 0 },
      ],
    };
    // ACT
    const choices = formatChoices(MIXED, selection);
    // ASSERT
    expect(choices).toEqual(expected);
  });

  it('fills the count into a label template', () => {
    // ARRANGE
    const template = 'Show all {count} Episodes';
    const count = 12;
    const expected = 'Show all 12 Episodes';
    // ACT
    const text = fillCount(template, count);
    // ASSERT
    expect(text).toBe(expected);
  });

  it('words the result count for none, one and many', () => {
    // ARRANGE
    const labels = { none: 'No Episodes', one: 'One Episode', other: '{count} Episodes' };
    const expected = ['No Episodes', 'One Episode', '4 Episodes'];
    // ACT
    const texts = [0, 1, 4].map((count) => resultsText(labels, count));
    // ASSERT
    expect(texts).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('leaves the spotlight empty when no Episode is published, never promoting an upcoming one', () => {
    // ARRANGE
    const upcomingOnly = MIXED.filter((entry) => entry.status === 'upcoming');
    // ACT
    const { lead, side } = spotlightOf(upcomingOnly);
    // ASSERT
    expect({ lead, side }).toEqual({ lead: null, side: [] });
  });

  it('shows nothing and reports no match when the selection fits no card', () => {
    // ARRANGE
    const selection: BrowseSelection = { topic: 'adoption', format: ALL, expanded: false };
    // ACT
    const view = browseView(MIXED, selection, 9);
    // ASSERT
    expect({ matching: view.matching, size: view.visible.size }).toEqual({ matching: 0, size: 0 });
  });

  it('leaves a chip in place with a zero count when the other filter empties it', () => {
    // ARRANGE
    const selection: BrowseSelection = { ...INITIAL_SELECTION, format: 'short' };
    const expected = { id: 'documentation', label: 'Docs', count: 0 };
    // ACT
    const { options } = topicChoices(MIXED, selection);
    // ASSERT
    expect(options).toContainEqual(expected);
  });
});

describe('edge cases', () => {
  it('stacks a single published Episode as the lead with nothing beside it', () => {
    // ARRANGE
    const only = [MIXED[0]!, MIXED[3]!];
    // ACT
    const { lead, side } = spotlightOf(only);
    // ASSERT
    expect({ lead: lead?.slug, side }).toEqual({ lead: 'p1', side: [] });
  });

  it('gives the lead one companion when only two Episodes are published', () => {
    // ARRANGE
    const two = MIXED.filter((entry) => entry.slug !== 'p3');
    // ACT
    const { lead, side } = spotlightOf(two);
    // ASSERT
    expect({ lead: lead?.slug, side: slugs(side) }).toEqual({ lead: 'p1', side: ['p2'] });
  });

  it('caps the grid at the first cards in order and reports how many matches remain', () => {
    // ARRANGE
    const many = Array.from({ length: 12 }, (_, index) => card(`e${index}`));
    const cap = 9;
    // ACT
    const view = browseView(many, INITIAL_SELECTION, cap);
    // ASSERT
    expect({ size: view.visible.size, overflow: view.overflow, last: [...view.visible].pop() }).toEqual({
      size: cap,
      overflow: 3,
      last: 'e8',
    });
  });

  it('lifts the cap once the visitor has asked for every card', () => {
    // ARRANGE
    const many = Array.from({ length: 12 }, (_, index) => card(`e${index}`));
    const selection: BrowseSelection = { ...INITIAL_SELECTION, expanded: true };
    // ACT
    const view = browseView(many, selection, 9);
    // ASSERT
    expect({ size: view.visible.size, overflow: view.overflow }).toEqual({ size: 12, overflow: 0 });
  });

  it('does not overflow when the matches are exactly the cap', () => {
    // ARRANGE
    const exact = Array.from({ length: 9 }, (_, index) => card(`e${index}`));
    // ACT
    const view = browseView(exact, INITIAL_SELECTION, 9);
    // ASSERT
    expect({ overflow: view.overflow, foldable: view.foldable }).toEqual({ overflow: 0, foldable: false });
  });

  it('stays foldable after expanding, so the visitor can fold the tail away again', () => {
    // ARRANGE
    const many = Array.from({ length: 12 }, (_, index) => card(`e${index}`));
    const selection: BrowseSelection = { ...INITIAL_SELECTION, expanded: true };
    // ACT
    const view = browseView(many, selection, 9);
    // ASSERT
    expect({ overflow: view.overflow, foldable: view.foldable }).toEqual({ overflow: 0, foldable: true });
  });

  it('only offers a filter that has at least two values to choose between', () => {
    // ARRANGE
    const oneTopic = [card('a'), card('b')];
    // ACT
    const choices = [topicChoices(oneTopic, INITIAL_SELECTION), topicChoices(MIXED, INITIAL_SELECTION)];
    // ASSERT
    expect(choices.map(hasChoice)).toEqual([false, true]);
  });
});
