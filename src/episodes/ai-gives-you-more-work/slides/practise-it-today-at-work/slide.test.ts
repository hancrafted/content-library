import { renderedInHarness } from '@/episodes/components/slide-master/slide-harness';
import { describe, expect, it } from 'vitest';
import { practiseItTodayAtWork } from './slide';

const dimmedClaims = () => {
  const $ = renderedInHarness(practiseItTodayAtWork);
  return $('[class*="bg-primary"], [class*="border-primary"]')
    .filter((_, element) => $(element).closest('[data-reveal]').length > 0)
    .map((_, element) => $(element).text())
    .get();
};

describe('success cases', () => {
  it('renders its reveal wall in both locales', () => {
    // ARRANGE
    const expected = [true, true];
    // ACT
    const walls = (['en', 'de'] as const).map(
      (locale) => renderedInHarness(practiseItTodayAtWork, locale)('[data-reveal]').length > 0,
    );
    // ASSERT
    expect(walls).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('never dims a claim: an element carrying `primary` sits under no step not yet revealed', () => {
    // ARRANGE
    const expected: string[] = [];
    // ACT
    const dimmed = dimmedClaims();
    // ASSERT
    expect(dimmed).toEqual(expected);
  });
});

describe('edge cases', () => {
  it('reveals its steps through the shared wall, so the claim check has something to inspect', () => {
    // ARRANGE
    const none = 0;
    // ACT
    const walls = renderedInHarness(practiseItTodayAtWork)('[data-step], [data-revealed], [data-reveal]').length;
    // ASSERT
    expect(walls).toBeGreaterThan(none);
  });
});
