import { describe, expect, it } from 'vitest';
import { workshopCard, type WorkshopReads } from './workshop-card.pure';

/** A hand-written stand-in for the Translation file: the keys the card reads, answered with their own words. */
const READS: WorkshopReads = {
  read: (key) => `«${key}»`,
  episodeCount: { one: '1 Episode', other: '{count} Episodes' },
};
const RECORD = {
  slug: 'intro-2026-10-23',
  date: '2026-10-23',
  episodes: ['alpha', 'beta', 'gamma'],
} as const;

describe('success cases', () => {
  it('reads the title and description by the Workshop slug and links the card to its page', () => {
    // ARRANGE
    const expected = {
      title: '«workshopsPage.items.intro-2026-10-23.title»',
      description: '«workshopsPage.items.intro-2026-10-23.description»',
      route: '/workshops/intro-2026-10-23',
      href: '/workshops/intro-2026-10-23',
    };
    // ACT
    const card = workshopCard(RECORD, 'en', READS);
    // ASSERT
    expect({ title: card.title, description: card.description, route: card.route, href: card.href }).toEqual(expected);
  });

  it('writes the date in the locale and keeps the machine-readable day', () => {
    // ARRANGE
    const expected = { english: 'Oct 23, 2026', german: '23. Okt. 2026', date: '2026-10-23' };
    // ACT
    const english = workshopCard(RECORD, 'en', READS);
    const german = workshopCard(RECORD, 'de', READS);
    // ASSERT
    expect({ english: english.dateLabel, german: german.dateLabel, date: english.date }).toEqual(expected);
  });

  it('counts the Episodes and says so in the plural', () => {
    // ARRANGE
    const expected = { count: 3, label: '3 Episodes' };
    // ACT
    const card = workshopCard(RECORD, 'en', READS);
    // ASSERT
    expect({ count: card.episodeCount, label: card.episodeCountLabel }).toEqual(expected);
  });

  it('localizes the link for the German page', () => {
    // ARRANGE
    const expected = '/de/workshops/intro-2026-10-23';
    // ACT
    const card = workshopCard(RECORD, 'de', READS);
    // ASSERT
    expect(card.href).toBe(expected);
  });
});

describe('failure cases', () => {
  it('fails the build when a Translation key is missing, rather than drawing a blank', () => {
    // ARRANGE
    const reads: WorkshopReads = {
      ...READS,
      read: (key) => {
        throw new Error(`Missing ${key}`);
      },
    };
    // ACT
    const build = () => workshopCard(RECORD, 'en', reads);
    // ASSERT
    expect(build).toThrow('Missing workshopsPage.items.intro-2026-10-23.title');
  });
});

describe('edge cases', () => {
  it('uses the singular for a Workshop of one Episode', () => {
    // ARRANGE
    const record = { ...RECORD, episodes: ['alpha'] };
    const expected = '1 Episode';
    // ACT
    const card = workshopCard(record, 'en', READS);
    // ASSERT
    expect(card.episodeCountLabel).toBe(expected);
  });

  it('carries the time and the location only when the record has them', () => {
    // ARRANGE
    const timed = { ...RECORD, time: '09:30', location: 'Berlin' };
    const expected = { time: '09:30', location: 'Berlin' };
    // ACT
    const withDetails = workshopCard(timed, 'en', READS);
    const without = workshopCard(RECORD, 'en', READS);
    // ASSERT
    expect({ time: withDetails.time, location: withDetails.location }).toEqual(expected);
    expect('time' in without || 'location' in without).toBe(false);
  });
});
