import { describe, expect, it } from 'vitest';
import { hasReadingTime, remainingLabel, segmentSpans, wholeMinutes, wordsIn } from './speaking-time.pure';

const REMAINING = { one: '{count} min left', other: '{count} mins left' };

describe('success cases', () => {
  it('counts the words of a spoken sentence', () => {
    // ARRANGE
    const text = 'The model keeps nothing between requests.';
    const expected = 6;
    // ACT
    const words = wordsIn(text);
    // ASSERT
    expect(words).toBe(expected);
  });

  it('counts the words inside rich-text tags, not the tags', () => {
    // ARRANGE
    const text = 'Write it <em>down</em>, then <ref>check</ref> it.';
    const expected = 6;
    // ACT
    const words = wordsIn(text);
    // ASSERT
    expect(words).toBe(expected);
  });

  it('spans each segment after the last, at 140 English words a minute', () => {
    // ARRANGE
    const segments = [{ script: words(70) }, { script: words(140) }];
    const expected = [
      { from: 0, to: 0.5 },
      { from: 0.5, to: 1.5 },
    ];
    // ACT
    const spans = segmentSpans(segments, 'en');
    // ASSERT
    expect(spans).toEqual(expected);
  });

  it('reads German at 120 words a minute', () => {
    // ARRANGE
    const segments = [{ script: words(120) }];
    const expected = [{ from: 0, to: 1 }];
    // ACT
    const spans = segmentSpans(segments, 'de');
    // ASSERT
    expect(spans).toEqual(expected);
  });

  it('counts a bridge as part of its segment', () => {
    // ARRANGE
    const segments = [{ script: words(100), bridge: words(40) }];
    const expected = [{ from: 0, to: 1 }];
    // ACT
    const spans = segmentSpans(segments, 'en');
    // ASSERT
    expect(spans).toEqual(expected);
  });

  it('rounds a reading time up to whole minutes', () => {
    // ARRANGE
    const minutes = [0.2, 2, 2.01];
    const expected = [1, 2, 3];
    // ACT
    const whole = minutes.map(wholeMinutes);
    // ASSERT
    expect(whole).toEqual(expected);
  });

  it('has a reading time once any spoken minute is counted', () => {
    // ARRANGE
    const totals = [0.01, 12];
    const expected = [true, true];
    // ACT
    const shown = totals.map(hasReadingTime);
    // ASSERT
    expect(shown).toEqual(expected);
  });

  it('labels the time left in whole minutes, picking the plural form', () => {
    // ARRANGE
    const minutes = [0.4, 11.2];
    const expected = ['1 min left', '12 mins left'];
    // ACT
    const labels = minutes.map((left) => remainingLabel(REMAINING, 'en', left));
    // ASSERT
    expect(labels).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('counts no words in blank text or bare punctuation', () => {
    // ARRANGE
    const texts = ['', '   ', ' — … '];
    const expected = [0, 0, 0];
    // ACT
    const counts = texts.map(wordsIn);
    // ASSERT
    expect(counts).toEqual(expected);
  });

  it('spans nothing for a Slide without a Voice script', () => {
    // ARRANGE
    const expected: unknown[] = [];
    // ACT
    const spans = segmentSpans([], 'en');
    // ASSERT
    expect(spans).toEqual(expected);
  });

  it('has no reading time when nothing is spoken', () => {
    // ARRANGE
    const total = 0;
    // ACT
    const shown = hasReadingTime(total);
    // ASSERT
    expect(shown).toBe(false);
  });
});

describe('edge cases', () => {
  it('does not round float noise up to the next minute', () => {
    // ARRANGE
    const noisy = 12.000000000001;
    const expected = 12;
    // ACT
    const whole = wholeMinutes(noisy);
    // ASSERT
    expect(whole).toBe(expected);
  });

  it('counts German compounds and umlauts as one word each', () => {
    // ARRANGE
    const text = 'Übergabeprotokoll für den nächsten Schichtwechsel';
    const expected = 5;
    // ACT
    const words = wordsIn(text);
    // ASSERT
    expect(words).toBe(expected);
  });

  it('labels zero minutes left with the plural form once the Episode is read', () => {
    // ARRANGE
    const expected = '0 mins left';
    // ACT
    const label = remainingLabel(REMAINING, 'en', 0);
    // ASSERT
    expect(label).toBe(expected);
  });
});

/** `count` words of filler. */
function words(count: number): string {
  return Array.from({ length: count }, () => 'word').join(' ');
}
