import { describe, expect, it } from 'vitest';
import { workshopCard, type WorkshopReads } from './workshop-card.pure';

/** A hand-written stand-in for the Translation file: the keys the card reads, answered with their own words. */
const READS: WorkshopReads = {
  read: (key) => `«${key}»`,
  episodeCount: { one: '1 Episode', other: '{count} Episodes' },
};
const RECORD = {
  slug: '2026-10-23-intro',
  date: '2026-10-23',
  kind: 'workshop',
  audience: 'organization',
  playlist: 'intro',
} as const;
const PLAYLIST = { episodes: ['alpha', 'beta', 'gamma'] };

describe('success cases', () => {
  it('reads the title and description by the Event slug and routes the card to its page', () => {
    // ARRANGE
    const expected = {
      title: '«workshopsPage.items.2026-10-23-intro.title»',
      description: '«workshopsPage.items.2026-10-23-intro.description»',
      route: '/workshops/2026-10-23-intro',
    };
    // ACT
    const card = workshopCard({ event: RECORD, playlist: PLAYLIST }, 'en', READS);
    // ASSERT
    expect({ title: card.title, description: card.description, route: card.route }).toEqual(expected);
  });

  it('writes the date in the locale and keeps the machine-readable day', () => {
    // ARRANGE
    const expected = { english: 'Oct 23, 2026', german: '23. Okt. 2026', date: '2026-10-23' };
    // ACT
    const english = workshopCard({ event: RECORD, playlist: PLAYLIST }, 'en', READS);
    const german = workshopCard({ event: RECORD, playlist: PLAYLIST }, 'de', READS);
    // ASSERT
    expect({ english: english.dateLabel, german: german.dateLabel, date: english.date }).toEqual(expected);
  });

  it('counts the Episodes and says so in the plural', () => {
    // ARRANGE
    const expected = { count: 3, label: '3 Episodes' };
    // ACT
    const card = workshopCard({ event: RECORD, playlist: PLAYLIST }, 'en', READS);
    // ASSERT
    expect({ count: card.episodeCount, label: card.episodeCountLabel }).toEqual(expected);
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
    const build = () => workshopCard({ event: RECORD, playlist: PLAYLIST }, 'en', reads);
    // ASSERT
    expect(build).toThrow('Missing workshopsPage.items.2026-10-23-intro.title');
  });
});

describe('edge cases', () => {
  it('uses the singular for a Workshop of one Episode', () => {
    // ARRANGE
    const playlist = { episodes: ['alpha'] };
    const expected = '1 Episode';
    // ACT
    const card = workshopCard({ event: RECORD, playlist: playlist }, 'en', READS);
    // ASSERT
    expect(card.episodeCountLabel).toBe(expected);
  });

  it('carries the time and the location only when the record has them', () => {
    // ARRANGE
    const timed = { ...RECORD, time: '09:30', location: 'Berlin' };
    const expected = { time: '09:30', location: 'Berlin' };
    // ACT
    const withDetails = workshopCard({ event: timed, playlist: PLAYLIST }, 'en', READS);
    const without = workshopCard({ event: RECORD, playlist: PLAYLIST }, 'en', READS);
    // ASSERT
    expect({ time: withDetails.time, location: withDetails.location }).toEqual(expected);
    expect('time' in without || 'location' in without).toBe(false);
  });
});
