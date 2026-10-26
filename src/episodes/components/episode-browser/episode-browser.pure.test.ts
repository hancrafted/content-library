import type { TagId } from '@/content-store/schemas/fields';
import {
  browseView,
  hasActiveFilters,
  INITIAL_SELECTION,
  newestFirst,
  resultsText,
  showsFormat,
  spotlightOf,
  tagChoices,
  toggleTag,
  type BrowseSelection,
} from '@/episodes/components/episode-browser/episode-browser.pure';
import type { EpisodeCard, TagLabel } from '@/episodes/components/episode-card/episode-card.pure';
import { describe, expect, it } from 'vitest';

const tag = (id: TagId, label: string): TagLabel => ({ id, label, tooltip: `About ${label}` });

function card(slug: string, over: Partial<EpisodeCard> = {}): EpisodeCard {
  const published = over.status !== 'upcoming';
  const tags = over.tags ?? [tag('cost', 'Cost')];
  const lead = tags[0]!;
  return {
    slug,
    route: published ? `/episode/${slug}` : null,
    href: published ? `/episode/${slug}` : null,
    status: published ? 'published' : 'upcoming',
    title: `Title ${slug}`,
    caption: `Caption ${slug}`,
    leadTag: { id: lead.id, label: lead.label },
    format: { id: 'foundations', label: 'Foundations' },
    tags,
    featuredRank: null,
    accent: 'amber',
    icon: 'coins',
    ...over,
  };
}

const MIXED: EpisodeCard[] = [
  card('p1', { tags: [tag('sales', 'Sales')], featuredRank: 1 }),
  card('p2', { tags: [tag('markdown', 'Markdown')], featuredRank: 2 }),
  card('p3', { featuredRank: 3 }),
  card('u1', {
    status: 'upcoming',
    tags: [tag('sales', 'Sales')],
    format: { id: 'teardown', label: 'Teardown' },
  }),
  card('u2', { status: 'upcoming', format: { id: 'short', label: 'Short' } }),
];

/** Cards that differ in one searchable field each, so a query names the field it reaches. */
const SEARCHABLE: EpisodeCard[] = [
  card('by-title', { title: 'Why sales never waits' }),
  card('by-caption', { caption: 'Revenue arrives months after the costs' }),
  card('by-second-tag', { tags: [tag('cost', 'Kosten'), tag('agentic-ai', 'KI-Befähigung')] }),
  card('by-tag', {
    tags: [{ id: 'cost', label: 'Liquidität', tooltip: 'Geld, das tatsächlich auf dem Konto ist' }],
  }),
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

  it('narrows the grid to one Tag and counts only its cards', () => {
    // ARRANGE
    const selection: BrowseSelection = { ...INITIAL_SELECTION, tags: ['sales'] };
    const expected = ['p1', 'u1'];
    // ACT
    const view = browseView(MIXED, selection, 9);
    // ASSERT
    expect([...view.visible]).toEqual(expected);
  });

  it('shows the cards with any of several chosen Tags, in card order', () => {
    // ARRANGE
    const selection: BrowseSelection = { ...INITIAL_SELECTION, tags: ['markdown', 'sales'] };
    const expected = { matching: 3, visible: ['p1', 'p2', 'u1'] };
    // ACT
    const view = browseView(MIXED, selection, 9);
    // ASSERT
    expect({ matching: view.matching, visible: [...view.visible] }).toEqual(expected);
  });

  it('counts each Tag chip in vocabulary order, whatever Tags are chosen', () => {
    // ARRANGE
    const selection: BrowseSelection = { ...INITIAL_SELECTION, tags: ['sales'] };
    const expected = [
      { id: 'markdown', label: 'Markdown', count: 1 },
      { id: 'cost', label: 'Cost', count: 2 },
      { id: 'sales', label: 'Sales', count: 2 },
    ];
    // ACT
    const options = tagChoices(MIXED, selection);
    // ASSERT
    expect(options).toEqual(expected);
  });

  it('adds a Tag to the selection and takes it out again when toggled twice', () => {
    // ARRANGE
    const once = toggleTag(INITIAL_SELECTION, 'cost');
    const twice = toggleTag(once, 'sales');
    // ACT
    const back = toggleTag(twice, 'cost');
    // ASSERT
    expect({ once: once.tags, twice: twice.tags, back: back.tags }).toEqual({
      once: ['cost'],
      twice: ['cost', 'sales'],
      back: ['sales'],
    });
  });

  it('lists published cards newest first, ties by slug, then the upcoming ones in the order given', () => {
    // ARRANGE
    const dated = [
      card('old', { publishedOn: '2026-01-05' }),
      card('u', { status: 'upcoming' }),
      card('new-b', { publishedOn: '2026-03-01' }),
      card('new-a', { publishedOn: '2026-03-01' }),
    ];
    const expected = ['new-a', 'new-b', 'old', 'u'];
    // ACT
    const ordered = newestFirst(dated);
    // ASSERT
    expect(slugs(ordered)).toEqual(expected);
  });

  it('follows the Featured rank, not the order of the cards it is given', () => {
    // ARRANGE
    const shuffled = [MIXED[2]!, MIXED[3]!, MIXED[0]!, MIXED[1]!];
    const expected = { lead: 'p1', side: ['p2', 'p3'] };
    // ACT
    const { lead, side } = spotlightOf(shuffled);
    // ASSERT
    expect({ lead: lead?.slug, side: slugs(side) }).toEqual(expected);
  });

  it('finds an Episode under each Tag it carries, and counts it under each', () => {
    // ARRANGE
    const overlapping = [...MIXED, card('x', { tags: [tag('markdown', 'Markdown'), tag('agentic-ai', 'Agentic AI')] })];
    const selection: BrowseSelection = { ...INITIAL_SELECTION, tags: ['agentic-ai'] };
    const expectedVisible = ['x'];
    const expectedCounts = [
      { id: 'agentic-ai', label: 'Agentic AI', count: 1 },
      { id: 'markdown', label: 'Markdown', count: 2 },
      { id: 'cost', label: 'Cost', count: 2 },
      { id: 'sales', label: 'Sales', count: 2 },
    ];
    // ACT
    const view = browseView(overlapping, selection, 9);
    const options = tagChoices(overlapping, INITIAL_SELECTION);
    // ASSERT
    expect([...view.visible]).toEqual(expectedVisible);
    expect(options).toEqual(expectedCounts);
  });

  it('finds a card by a word in its title, caption or any Tag name, not only the lead, ignoring case', () => {
    // ARRANGE
    const queries = ['SALES', 'revenue', 'befähigung', 'liquidität'];
    const expected = [['by-title'], ['by-caption'], ['by-second-tag'], ['by-tag']];
    // ACT
    const found = queries.map((query) => [...browseView(SEARCHABLE, { ...INITIAL_SELECTION, query }, 9).visible]);
    // ASSERT
    expect(found).toEqual(expected);
  });

  it('narrows by topic and query together, and counts each Tag chip against the query', () => {
    // ARRANGE
    const selection: BrowseSelection = { ...INITIAL_SELECTION, tags: ['sales'], query: 'Title p' };
    const expectedVisible = ['p1'];
    const expectedSales = { id: 'sales', label: 'Sales', count: 1 };
    // ACT
    const view = browseView(MIXED, selection, 9);
    const sales = tagChoices(MIXED, selection).find((option) => option.id === 'sales');
    // ASSERT
    expect([...view.visible]).toEqual(expectedVisible);
    expect(sales).toEqual(expectedSales);
  });

  it('names the Format on cards once the Episodes span two Formats', () => {
    // ARRANGE
    const expected = true;
    // ACT
    const shown = showsFormat(MIXED);
    // ASSERT
    expect(shown).toBe(expected);
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

  it('never spotlights a published card that holds no Featured slot', () => {
    // ARRANGE
    const unranked = [card('loose'), ...MIXED];
    const expected = { lead: 'p1', side: ['p2', 'p3'] };
    // ACT
    const { lead, side } = spotlightOf(unranked);
    // ASSERT
    expect({ lead: lead?.slug, side: slugs(side) }).toEqual(expected);
  });

  it('shows nothing and reports no match when the selection fits no card', () => {
    // ARRANGE
    const selection: BrowseSelection = { tags: ['agentic-ai'], expanded: false, query: '' };
    // ACT
    const view = browseView(MIXED, selection, 9);
    // ASSERT
    expect({ matching: view.matching, size: view.visible.size }).toEqual({ matching: 0, size: 0 });
  });

  it('never matches a Tag by its tooltip, which the card does not show', () => {
    // ARRANGE
    const selection: BrowseSelection = { ...INITIAL_SELECTION, query: 'Konto' };
    const expected = 0;
    // ACT
    const view = browseView(SEARCHABLE, selection, 9);
    // ASSERT
    expect(view.matching).toBe(expected);
  });

  it('leaves the Format off cards while every Episode shares one Format, as it tells the visitor nothing', () => {
    // ARRANGE
    const expected = false;
    // ACT
    const shown = showsFormat([card('a'), card('b')]);
    // ASSERT
    expect(shown).toBe(expected);
  });

  it('leaves a chip in place with a zero count when the query empties it', () => {
    // ARRANGE
    const selection: BrowseSelection = { ...INITIAL_SELECTION, query: 'Title p3' };
    const expected = { id: 'markdown', label: 'Markdown', count: 0 };
    // ACT
    const options = tagChoices(MIXED, selection);
    // ASSERT
    expect(options).toContainEqual(expected);
  });

  it('shows everything again once the selection is reset', () => {
    // ARRANGE
    const chosen: BrowseSelection = { tags: ['sales'], query: 'nothing', expanded: true };
    // ACT
    const states = [hasActiveFilters(chosen), hasActiveFilters(INITIAL_SELECTION)];
    const view = browseView(MIXED, INITIAL_SELECTION, 9);
    // ASSERT
    expect({ states, matching: view.matching }).toEqual({ states: [true, false], matching: MIXED.length });
  });
});

describe('edge cases', () => {
  it('stacks a single published Episode as the lead with nothing beside it', () => {
    // ARRANGE
    const only = [MIXED[0]!, MIXED[3]!];
    const expected = { lead: 'p1', side: [] };
    // ACT
    const { lead, side } = spotlightOf(only);
    // ASSERT
    expect({ lead: lead?.slug, side }).toEqual(expected);
  });

  it('gives the lead one companion when only two Episodes are published', () => {
    // ARRANGE
    const two = MIXED.filter((entry) => entry.slug !== 'p3');
    const expected = { lead: 'p1', side: ['p2'] };
    // ACT
    const { lead, side } = spotlightOf(two);
    // ASSERT
    expect({ lead: lead?.slug, side: slugs(side) }).toEqual(expected);
  });

  it('caps the grid at the first cards in order and reports how many matches remain', () => {
    // ARRANGE
    const many = Array.from({ length: 12 }, (_, index) => card(`e${index}`));
    const cap = 9;
    const expected = { size: cap, overflow: 3, last: 'e8' };
    // ACT
    const view = browseView(many, INITIAL_SELECTION, cap);
    // ASSERT
    expect({ size: view.visible.size, overflow: view.overflow, last: [...view.visible].pop() }).toEqual(expected);
  });

  it('lifts the cap once the visitor has asked for every card', () => {
    // ARRANGE
    const many = Array.from({ length: 12 }, (_, index) => card(`e${index}`));
    const selection: BrowseSelection = { ...INITIAL_SELECTION, expanded: true };
    const expected = { size: 12, overflow: 0 };
    // ACT
    const view = browseView(many, selection, 9);
    // ASSERT
    expect({ size: view.visible.size, overflow: view.overflow }).toEqual(expected);
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

  it('ignores accents and surrounding space, so "  befahigung " finds "KI-Befähigung"', () => {
    // ARRANGE
    const selection: BrowseSelection = { ...INITIAL_SELECTION, query: '  befahigung ' };
    const expected = ['by-second-tag'];
    // ACT
    const view = browseView(SEARCHABLE, selection, 9);
    // ASSERT
    expect([...view.visible]).toEqual(expected);
  });

  it('lifts the search for a query of only spaces', () => {
    // ARRANGE
    const selection: BrowseSelection = { ...INITIAL_SELECTION, query: '   ' };
    const expected = SEARCHABLE.length;
    // ACT
    const view = browseView(SEARCHABLE, selection, 9);
    // ASSERT
    expect(view.matching).toBe(expected);
  });

  it('leaves the Format off when there are no cards at all', () => {
    // ARRANGE
    const expected = false;
    // ACT
    const shown = showsFormat([]);
    // ASSERT
    expect(shown).toBe(expected);
  });

  it('only offers chips for Tags a card carries', () => {
    // ARRANGE
    const oneTag = [card('a'), card('b')];
    const expected = [{ id: 'cost', label: 'Cost', count: 2 }];
    // ACT
    const options = tagChoices(oneTag, INITIAL_SELECTION);
    // ASSERT
    expect(options).toEqual(expected);
  });

  it('counts a chip against a query of accents and case', () => {
    // ARRANGE
    const selection: BrowseSelection = { ...INITIAL_SELECTION, query: 'BEFAHIGUNG' };
    const expected = { id: 'agentic-ai', count: 1 };
    // ACT
    const options = tagChoices(SEARCHABLE, selection);
    // ASSERT
    expect(options.map(({ id, count }) => ({ id, count }))).toContainEqual(expected);
  });
});
