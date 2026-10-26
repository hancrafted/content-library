import { EVENT_SLUGS } from '@/content-store/catalogue/record-routes';
import { describe, expect, it } from 'vitest';
import { eventCard } from './event-card.pure';
import de from './i18n/de.json';
import en from './i18n/en.json';

/** Any registered Event, as the store serves it, presenting three Episodes: the words come from its Translation keys. */
const SLUG = EVENT_SLUGS[0];
const RECORD = {
  slug: SLUG,
  date: '2026-10-23',
  playlist: { episodes: ['alpha', 'beta', 'gamma'] },
} as const;

describe('success cases', () => {
  it("reads the title and description from the Events area's Translation files, in the locale, and routes the card to its page", () => {
    // ARRANGE
    const expected = {
      english: { title: en.events.items[SLUG].title, description: en.events.items[SLUG].description },
      german: { title: de.events.items[SLUG].title, description: de.events.items[SLUG].description },
      route: `/events/${SLUG}`,
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
  it('refuses an Event the registry does not hold, at type check and at build, rather than drawing a blank', () => {
    // ARRANGE
    const unknown = { ...RECORD, slug: 'no-such-event' };
    // ACT
    // @ts-expect-error -- an Event's words are keyed by the registered slugs only
    const build = () => eventCard(unknown, 'en');
    // ASSERT
    expect(build).toThrow(TypeError);
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
