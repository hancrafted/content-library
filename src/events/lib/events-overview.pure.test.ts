import { describe, expect, it } from 'vitest';
import { eventTagChoices, groupEventsByMonth, matchingEvents } from './events-overview.pure';

/*
 * The Events overview's sections and filter (design-ADR Events overview): Upcoming from the build day on, oldest
 * first, Past before it, newest first, each grouped by month; the search and Tag chips narrow both sections at once.
 * Dates, words and the build day are written out by hand.
 */

const BUILD_DAY = '2026-10-27';
const card = (slug: string, date: string) => ({ slug, date });

/** A card as the filter reads it: its title, description and Tags in the reader's locale. */
interface Words {
  readonly title: string;
  readonly description: string;
  readonly tags: readonly (readonly [string, string])[];
}
const filterable = (slug: string, { title, description, tags }: Words) => ({
  slug,
  title,
  description,
  tags: tags.map(([id, label]) => ({ id, label })),
});
const WEBINAR = filterable('webinar', {
  title: 'Intro to Agentic Workflows',
  description: 'Onboarding agents',
  tags: [
    ['agentic-ai', 'Agentic AI'],
    ['workflow', 'Workflow'],
  ],
});
const SEMINAR = filterable('seminar', {
  title: 'AXEL Seminar',
  description: 'Attention span',
  tags: [['agentic-ai', 'Agentic AI']],
});
const SALES = filterable('sales', {
  title: 'Selling early',
  description: 'Customers first',
  tags: [['sales', 'Sales']],
});
const ALL = [WEBINAR, SEMINAR, SALES];

describe('success cases', () => {
  it('puts the Events from the build day on under Upcoming, oldest first, and the earlier ones under Past, newest first', () => {
    // ARRANGE
    const cards = [
      card('sep', '2026-09-10'),
      card('dec', '2026-12-01'),
      card('oct-past', '2026-10-23'),
      card('oct-next', '2026-10-28'),
      card('nov', '2026-11-05'),
    ];
    const expected = {
      upcoming: [
        { month: '2026-10', label: 'October 2026', items: ['oct-next'] },
        { month: '2026-11', label: 'November 2026', items: ['nov'] },
        { month: '2026-12', label: 'December 2026', items: ['dec'] },
      ],
      past: [
        { month: '2026-10', label: 'October 2026', items: ['oct-past'] },
        { month: '2026-09', label: 'September 2026', items: ['sep'] },
      ],
    };
    // ACT
    const sections = groupEventsByMonth(cards, BUILD_DAY, 'en');
    const slugs = (groups: typeof sections.upcoming) =>
      groups.map(({ month, label, items }) => ({ month, label, items: items.map((item) => item.slug) }));
    // ASSERT
    expect({ upcoming: slugs(sections.upcoming), past: slugs(sections.past) }).toEqual(expected);
  });

  it('names the month in the reader locale', () => {
    // ARRANGE
    const expected = 'Oktober 2026';
    // ACT
    const [group] = groupEventsByMonth([card('oct', '2026-10-28')], BUILD_DAY, 'de').upcoming;
    // ASSERT
    expect(group.label).toBe(expected);
  });

  it('matches a search in the title, the description or a Tag name, ignoring case', () => {
    // ARRANGE
    const expected = { title: ['seminar'], description: ['sales'], tag: ['webinar'] };
    // ACT
    const title = matchingEvents(ALL, { query: 'axel', tags: [] });
    const description = matchingEvents(ALL, { query: 'CUSTOMERS', tags: [] });
    const tag = matchingEvents(ALL, { query: 'workflow', tags: [] });
    // ASSERT
    expect({ title: [...title], description: [...description], tag: [...tag] }).toEqual(expected);
  });

  it('offers a chip for each Tag a listed Event carries, in vocabulary order, with its count', () => {
    // ARRANGE
    const expected = [
      { id: 'agentic-ai', label: 'Agentic AI', count: 2 },
      { id: 'sales', label: 'Sales', count: 1 },
      { id: 'workflow', label: 'Workflow', count: 1 },
    ];
    // ACT
    const chips = eventTagChoices(ALL, ['context-engineering', 'agentic-ai', 'markdown', 'cost', 'sales', 'workflow']);
    // ASSERT
    expect(chips).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('matches nothing when no Event holds the search', () => {
    // ARRANGE
    const expected: string[] = [];
    // ACT
    const matches = matchingEvents(ALL, { query: 'kubernetes', tags: [] });
    // ASSERT
    expect([...matches]).toEqual(expected);
  });

  it('leaves a section empty when every Event lies on the other side of the build day', () => {
    // ARRANGE
    const expected: unknown[] = [];
    // ACT
    const sections = groupEventsByMonth([card('next', '2026-11-01')], BUILD_DAY, 'en');
    // ASSERT
    expect(sections.past).toEqual(expected);
  });
});

describe('edge cases', () => {
  it('counts an Event on the build day itself as upcoming, as its page does', () => {
    // ARRANGE
    const expected = ['today'];
    // ACT
    const sections = groupEventsByMonth([card('today', BUILD_DAY)], BUILD_DAY, 'en');
    // ASSERT
    expect(sections.upcoming.flatMap((group) => group.items.map((item) => item.slug))).toEqual(expected);
  });

  it('keeps an Event that carries any chosen Tag, and every Event when none is chosen', () => {
    // ARRANGE
    const expected = { chosen: ['webinar', 'sales'], none: ['webinar', 'seminar', 'sales'] };
    // ACT
    const chosen = matchingEvents(ALL, { query: '', tags: ['workflow', 'sales'] });
    const none = matchingEvents(ALL, { query: '  ', tags: [] });
    // ASSERT
    expect({ chosen: [...chosen], none: [...none] }).toEqual(expected);
  });

  it('keeps an Event only when it matches both the search and a chosen Tag', () => {
    // ARRANGE
    const expected = ['seminar'];
    // ACT
    const matches = matchingEvents(ALL, { query: 'attention', tags: ['agentic-ai'] });
    // ASSERT
    expect([...matches]).toEqual(expected);
  });
});
