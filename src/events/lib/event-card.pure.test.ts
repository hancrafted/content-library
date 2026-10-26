import { describe, expect, it } from 'vitest';
import { eventCard } from './event-card.pure';

/*
 * One Event's card (design-ADR 0016, Delivery): its words from the Events area's Translation files, its date and
 * Episode count in the reader's locale. The words are the AXEL seminar's, written out by hand; an Event's words are
 * keyed by the Event registry's slugs, so the card is built for that registered Event.
 */

const SLUG = '2026-10-23-axel-agentic-workflow';
const RECORD = {
  slug: SLUG,
  date: '2026-10-23',
  playlist: { episodes: ['alpha', 'beta', 'gamma'] },
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
    const english = eventCard(RECORD, 'en');
    const german = eventCard(RECORD, 'de');
    // ASSERT
    expect({
      english: { title: english.title, description: english.description },
      german: { title: german.title, description: german.description },
      route: english.route,
    }).toEqual(expected);
  });

  it('writes the date in the locale and keeps the machine-readable day', () => {
    // ARRANGE
    const expected = { english: 'Oct 23, 2026', german: '23. Okt. 2026', date: '2026-10-23' };
    // ACT
    const english = eventCard(RECORD, 'en');
    const german = eventCard(RECORD, 'de');
    // ASSERT
    expect({ english: english.dateLabel, german: german.dateLabel, date: english.date }).toEqual(expected);
  });

  it('counts the Episodes and says so in the plural', () => {
    // ARRANGE
    const expected = { count: 3, label: '3 Episodes' };
    // ACT
    const card = eventCard(RECORD, 'en');
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
    const build = () => eventCard(unknown, 'en');
    // ASSERT
    expect(build).toThrow(expected);
  });
});

describe('edge cases', () => {
  it('uses the singular for an Event of one Episode', () => {
    // ARRANGE
    const single = { ...RECORD, playlist: { episodes: ['alpha'] } };
    const expected = '1 Episode';
    // ACT
    const card = eventCard(single, 'en');
    // ASSERT
    expect(card.episodeCountLabel).toBe(expected);
  });

  it('carries the time and the location only when the record has them', () => {
    // ARRANGE
    const timed = { ...RECORD, time: '09:30', location: 'Berlin' };
    const expected = { time: '09:30', location: 'Berlin' };
    // ACT
    const withDetails = eventCard(timed, 'en');
    const without = eventCard(RECORD, 'en');
    // ASSERT
    expect({ time: withDetails.time, location: withDetails.location }).toEqual(expected);
    expect('time' in without || 'location' in without).toBe(false);
  });
});
