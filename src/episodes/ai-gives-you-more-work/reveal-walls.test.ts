import type { Slide } from '@/episodes/components/slide-master/slide';
import { renderedInHarness } from '@/episodes/components/slide-master/slide-harness.test-support';
import { describe, expect, it } from 'vitest';
import { everyRevolutionOneCard } from './slides/every-revolution-one-card/slide';
import { practiseItTodayAtWork } from './slides/practise-it-today-at-work/slide';
import { youWerePromoted } from './slides/you-were-promoted/slide';

const REVEAL_SLIDES: readonly (readonly [string, Slide])[] = [
  ['every-revolution-one-card', everyRevolutionOneCard],
  ['practise-it-today-at-work', practiseItTodayAtWork],
  ['you-were-promoted', youWerePromoted],
];

const dimmedClaims = (under: Slide) => {
  const $ = renderedInHarness(under);
  return $('[class*="bg-primary"], [class*="border-primary"]')
    .filter((_, element) => $(element).closest('[data-reveal]').length > 0)
    .map((_, element) => $(element).text())
    .get();
};

describe('success cases', () => {
  it.each(REVEAL_SLIDES)('%s renders its reveal wall in both locales', (_slug, under) => {
    // ARRANGE
    const expected = [true, true];
    // ACT
    const walls = (['en', 'de'] as const).map((locale) => renderedInHarness(under, locale)('[data-reveal]').length > 0);
    // ASSERT
    expect(walls).toEqual(expected);
  });
});

describe('failure cases', () => {
  it.each(REVEAL_SLIDES)(
    '%s never dims a claim: an element carrying `primary` sits under no step not yet revealed',
    (_slug, under) => {
      // ARRANGE
      const expected: string[] = [];
      // ACT
      const dimmed = dimmedClaims(under);
      // ASSERT
      expect(dimmed).toEqual(expected);
    },
  );
});

describe('edge cases', () => {
  it.each(REVEAL_SLIDES)(
    '%s reveals its steps through the shared wall, so the claim check has something to inspect',
    (_slug, under) => {
      // ARRANGE
      const none = 0;
      // ACT
      const walls = renderedInHarness(under)('[data-step], [data-revealed], [data-reveal]').length;
      // ASSERT
      expect(walls).toBeGreaterThan(none);
    },
  );
});
