import { describe, expect, it } from 'vitest';
import { eventCard, type EventReads } from './event-card.pure';

/** A hand-written stand-in for the Translation file: the keys the card reads, answered with their own words. */
const READS: EventReads = {
  read: (key) => `«${key}»`,
  episodeCount: { one: '1 Episode', other: '{count} Episodes' },
};
/** An Event as the store serves it, presenting three Episodes. */
const RECORD = {
  slug: '2026-10-23-axel-agentic-workflow',
  date: '2026-10-23',
  playlist: { episodes: ['alpha', 'beta', 'gamma'] },
} as const;

describe('success cases', () => {
  it('reads the title and description by the Event slug and routes the card to its page', () => {
    // ARRANGE
    const expected = {
      title: '«eventsPage.items.2026-10-23-axel-agentic-workflow.title»',
      description: '«eventsPage.items.2026-10-23-axel-agentic-workflow.description»',
      route: '/events/2026-10-23-axel-agentic-workflow',
    };
    // ACT
    const card = eventCard(RECORD, 'en', READS);
    // ASSERT
    expect({ title: card.title, description: card.description, route: card.route }).toEqual(expected);
  });

  it('writes the date in the locale and keeps the machine-readable day', () => {
    // ARRANGE
    const expected = { english: 'Oct 23, 2026', german: '23. Okt. 2026', date: '2026-10-23' };
    // ACT
    const english = eventCard(RECORD, 'en', READS);
    const german = eventCard(RECORD, 'de', READS);
    // ASSERT
    expect({ english: english.dateLabel, german: german.dateLabel, date: english.date }).toEqual(expected);
  });

  it('counts the Episodes and says so in the plural', () => {
    // ARRANGE
    const expected = { count: 3, label: '3 Episodes' };
    // ACT
    const card = eventCard(RECORD, 'en', READS);
    // ASSERT
    expect({ count: card.episodeCount, label: card.episodeCountLabel }).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('fails the build when a Translation key is missing, rather than drawing a blank', () => {
    // ARRANGE
    const reads: EventReads = {
      ...READS,
      read: (key) => {
        throw new Error(`Missing ${key}`);
      },
    };
    // ACT
    const build = () => eventCard(RECORD, 'en', reads);
    // ASSERT
    expect(build).toThrow('Missing eventsPage.items.2026-10-23-axel-agentic-workflow.title');
  });
});

describe('edge cases', () => {
  it('uses the singular for an Event of one Episode', () => {
    // ARRANGE
    const single = { ...RECORD, playlist: { episodes: ['alpha'] } };
    const expected = '1 Episode';
    // ACT
    const card = eventCard(single, 'en', READS);
    // ASSERT
    expect(card.episodeCountLabel).toBe(expected);
  });

  it('carries the time and the location only when the record has them', () => {
    // ARRANGE
    const timed = { ...RECORD, time: '09:30', location: 'Berlin' };
    const expected = { time: '09:30', location: 'Berlin' };
    // ACT
    const withDetails = eventCard(timed, 'en', READS);
    const without = eventCard(RECORD, 'en', READS);
    // ASSERT
    expect({ time: withDetails.time, location: withDetails.location }).toEqual(expected);
    expect('time' in without || 'location' in without).toBe(false);
  });
});
