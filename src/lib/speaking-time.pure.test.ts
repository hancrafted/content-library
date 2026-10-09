import { describe, expect, it } from 'vitest';
import { segmentSpans, wholeMinutes, wordsIn } from './speaking-time.pure';

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
});

/** `count` words of filler. */
function words(count: number): string {
  return Array.from({ length: count }, () => 'word').join(' ');
}
