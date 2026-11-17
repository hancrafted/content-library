import { listEvents } from '@/content-store/store';
import { describe, expect, it } from 'vitest';
import de from './i18n/de.json';
import en from './i18n/en.json';

// decision: docs/adr/0016-content-data-model.md
const ALTS: Record<string, Record<string, string>> = { en: en.eventPage.imageAlt, de: de.eventPage.imageAlt };

describe('success cases', () => {
  it.each(['en', 'de'])('gives every Event with an image a non-empty alt in %s', (locale) => {
    // ARRANGE
    const slugs = listEvents()
      .filter((event) => event.image !== undefined)
      .map((event) => event.slug);
    // ACT
    const missing = slugs.filter((slug) => (ALTS[locale][slug] ?? '').trim() === '');
    // ASSERT
    expect(missing).toEqual([]);
  });
});

describe('failure cases', () => {
  it.each(['en', 'de'])('names no alt for a slug that is no Event, in %s', (locale) => {
    // ARRANGE
    const slugs = new Set(listEvents().map((event) => event.slug));
    // ACT
    const orphans = Object.keys(ALTS[locale]).filter((slug) => !slugs.has(slug as never));
    // ASSERT
    expect(orphans).toEqual([]);
  });
});

describe('edge cases', () => {
  it('has at least one Event with an image, so the check above is not vacuous', () => {
    // ARRANGE
    const events = listEvents();
    // ACT
    const withImage = events.filter((event) => event.image !== undefined);
    // ASSERT
    expect(withImage.length).toBeGreaterThan(0);
  });
});
