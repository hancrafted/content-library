import { describe, expect, it } from 'vitest';
import { eventCard } from './event-card.pure';

/*
 * One Event's card (design-ADR 0016, Delivery): its words from the Events area's Translation files, its date and
 * Episode count in the reader's locale. The words are the AXEL seminar's, written out by hand; an Event's words are
 * keyed by the Event registry's slugs, so the card is built for that registered Event.
 */

const SLUG = '2026-10-23-axel-agentic-workflow';
/** A Playlist entry as the served Event lists it: only its Episode's slug read here, and the anchor it opens at. */
const listed = (slug: string, anchor?: string) => ({ episode: { slug }, ...(anchor === undefined ? {} : { anchor }) });
const RECORD = {
  slug: SLUG,
  date: '2026-10-23',
  tags: ['agentic-ai', 'workflow'],
  format: 'remote',
  platform: 'zoom',
  playlist: { episodes: [listed('alpha'), listed('beta'), listed('gamma')] },
} as const;
/** The Tags' names and tooltips as page assembly reads them from their Translation files, written out by hand. */
const TAG_WORDS = {
  'context-engineering': { name: 'Context engineering', tooltip: 'Right context, right time' },
  'agentic-ai': { name: 'Agentic AI', tooltip: 'AI that plans and acts' },
  markdown: { name: 'Markdown', tooltip: 'Plain-text documents' },
  cost: { name: 'Cost', tooltip: 'What AI costs' },
  sales: { name: 'Sales', tooltip: 'Winning customers' },
  workflow: { name: 'Workflow', tooltip: 'Work split into steps' },
} as const;

describe('success cases', () => {
  it("reads the title and description from the Events area's Translation files, in the locale, and routes the card to its page", () => {
    // ARRANGE
    const expected = {
      english: {
        title: 'AXEL Seminar: Agentic Workflows',
        description:
          'Working with AI agents in three Episodes: onboard them every time, manage their attention span, and see why they add management work.',
      },
      german: {
        title: 'AXEL Seminar: Agentic Workflows',
        description:
          'Mit KI-Agenten arbeiten in drei Episoden: jedes Mal neu einarbeiten, ihre Aufmerksamkeitsspanne managen und verstehen, warum sie Management-Arbeit bringen.',
      },
      route: '/events/2026-10-23-axel-agentic-workflow',
    };
    // ACT
    const english = eventCard(RECORD, 'en', TAG_WORDS);
    const german = eventCard(RECORD, 'de', TAG_WORDS);
    // ASSERT
    expect({
      english: { title: english.title, description: english.description },
      german: { title: german.title, description: german.description },
      route: english.route,
    }).toEqual(expected);
  });

  it('writes the date, its day of the month and its weekday in the locale, and keeps the machine-readable day', () => {
    // ARRANGE
    const expected = {
      english: { label: 'Oct 23, 2026', day: '23', weekday: 'Fri' },
      german: { label: '23. Okt. 2026', day: '23', weekday: 'Fr' },
      date: '2026-10-23',
    };
    // ACT
    const english = eventCard(RECORD, 'en', TAG_WORDS);
    const german = eventCard(RECORD, 'de', TAG_WORDS);
    const parts = (card: typeof english) => ({ label: card.dateLabel, day: card.day, weekday: card.weekday });
    // ASSERT
    expect({ english: parts(english), german: parts(german), date: english.date }).toEqual(expected);
  });

  it('names its Tags in their order, the first its lead Tag, with each tooltip', () => {
    // ARRANGE
    const expected = {
      leadTag: 'agentic-ai',
      tags: [
        { id: 'agentic-ai', label: 'Agentic AI', tooltip: 'AI that plans and acts' },
        { id: 'workflow', label: 'Workflow', tooltip: 'Work split into steps' },
      ],
    };
    // ACT
    const card = eventCard(RECORD, 'en', TAG_WORDS);
    // ASSERT
    expect({ leadTag: card.leadTag, tags: card.tags }).toEqual(expected);
  });

  it.each([
    { kind: 'a remote', record: RECORD, locale: 'en', expected: { format: 'remote', label: 'Remote · Zoom' } },
    { kind: 'a remote', record: RECORD, locale: 'de', expected: { format: 'remote', label: 'Online · Zoom' } },
    {
      kind: 'an onsite',
      record: { ...RECORD, format: 'onsite', venue: 'AXEL, Karlsruhe', platform: undefined },
      locale: 'en',
      expected: { format: 'onsite', label: 'AXEL, Karlsruhe' },
    },
    {
      kind: 'a hybrid',
      record: { ...RECORD, format: 'hybrid', venue: 'AXEL, Karlsruhe', platform: 'teams' },
      locale: 'en',
      expected: { format: 'hybrid', label: 'AXEL, Karlsruhe · Microsoft Teams' },
    },
  ] as const)('says where $kind Event takes place, in $locale', ({ record, locale, expected }) => {
    // ARRANGE
    const want = expected;
    // ACT
    const card = eventCard(record, locale, TAG_WORDS);
    // ASSERT
    expect(card.place).toEqual(want);
  });

  it('counts the Episodes and says so in the plural', () => {
    // ARRANGE
    const expected = { count: 3, label: '3 Episodes' };
    // ACT
    const card = eventCard(RECORD, 'en', TAG_WORDS);
    // ASSERT
    expect({ count: card.episodeCount, label: card.episodeCountLabel }).toEqual(expected);
  });

  it('counts an Episode the Playlist lists again at an anchor once', () => {
    // ARRANGE
    const record = {
      ...RECORD,
      playlist: { episodes: [listed('alpha'), listed('beta'), listed('alpha', 'check-in-1')] },
    };
    const expected = { count: 2, label: '2 Episodes' };
    // ACT
    const card = eventCard(record, 'en', TAG_WORDS);
    // ASSERT
    expect({ count: card.episodeCount, label: card.episodeCountLabel }).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('refuses an Event the registry does not hold, at type check and at build, naming it rather than drawing a blank', () => {
    // ARRANGE
    const unknown = { ...RECORD, slug: 'no-such-event' };
    const expected = 'No words name the Event "no-such-event" in en';
    // ACT
    // @ts-expect-error -- an Event's words are keyed by the registered slugs only
    const build = () => eventCard(unknown, 'en', TAG_WORDS);
    // ASSERT
    expect(build).toThrow(expected);
  });
});

describe('edge cases', () => {
  it('uses the singular for an Event of one Episode', () => {
    // ARRANGE
    const single = { ...RECORD, playlist: { episodes: [listed('alpha')] } };
    const expected = '1 Episode';
    // ACT
    const card = eventCard(single, 'en', TAG_WORDS);
    // ASSERT
    expect(card.episodeCountLabel).toBe(expected);
  });

  it('carries the time only when the record has one', () => {
    // ARRANGE
    const timed = { ...RECORD, time: '09:30' };
    const expected = '09:30';
    // ACT
    const withTime = eventCard(timed, 'en', TAG_WORDS);
    const without = eventCard(RECORD, 'en', TAG_WORDS);
    // ASSERT
    expect(withTime.time).toBe(expected);
    expect(without).not.toHaveProperty('time');
  });
});
