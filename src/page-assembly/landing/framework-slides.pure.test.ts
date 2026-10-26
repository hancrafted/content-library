import { describe, expect, it } from 'vitest';
import { FRAMEWORK_SLIDES } from './framework-slides.pure';
import de from './i18n/de.json';
import en from './i18n/en.json';

const MESSAGES = { en, de };
interface CardCopy {
  title?: string;
  claim?: string;
  note?: string;
}

function cardCopy(locale: keyof typeof MESSAGES, id: string): CardCopy {
  const cards = MESSAGES[locale].landing.method.cards as Record<string, CardCopy | undefined>;
  return cards[id] ?? {};
}

describe('success cases', () => {
  it('spells PROOF with the letters, in step order', () => {
    // ARRANGE
    const acronym = 'PROOF';
    const expectedSteps = ['01', '02', '03', '04', '05'];
    // ACT
    const letters = FRAMEWORK_SLIDES.map((slide) => slide.letter).join('');
    const steps = FRAMEWORK_SLIDES.map((slide) => slide.step);
    // ASSERT
    expect(letters).toBe(acronym);
    expect(steps).toEqual(expectedSteps);
  });

  it('starts every English and German title with its card letter', () => {
    // ARRANGE
    const locales = ['en', 'de'] as const;
    // ACT
    const mismatched = locales.flatMap((locale) =>
      FRAMEWORK_SLIDES.filter((slide) => !cardCopy(locale, slide.id).title?.startsWith(slide.letter)).map(
        (slide) => `${locale}:${slide.id}`,
      ),
    );
    // ASSERT
    expect(mismatched).toEqual([]);
  });
});

describe('failure cases', () => {
  it('gives every card a title and a claim in English and German', () => {
    // ARRANGE
    const locales = ['en', 'de'] as const;
    // ACT
    const missing = locales.flatMap((locale) =>
      FRAMEWORK_SLIDES.filter((slide) => {
        const copy = cardCopy(locale, slide.id);
        return !copy.title || !copy.claim;
      }).map((slide) => `${locale}:${slide.id}`),
    );
    // ASSERT
    expect(missing).toEqual([]);
  });

  it('has no duplicate ids or step numbers', () => {
    // ARRANGE
    const totalCount = FRAMEWORK_SLIDES.length;
    // ACT
    const uniqueIds = new Set(FRAMEWORK_SLIDES.map((slide) => slide.id));
    const uniqueSteps = new Set(FRAMEWORK_SLIDES.map((slide) => slide.step));
    // ASSERT
    expect(uniqueIds.size).toBe(totalCount);
    expect(uniqueSteps.size).toBe(totalCount);
  });
});

describe('edge cases', () => {
  it('keeps the titles English on /de, so the acronym survives', () => {
    // ARRANGE
    const englishTitles = FRAMEWORK_SLIDES.map((slide) => cardCopy('en', slide.id).title);
    // ACT
    const germanTitles = FRAMEWORK_SLIDES.map((slide) => cardCopy('de', slide.id).title);
    // ASSERT
    expect(germanTitles).toEqual(englishTitles);
  });

  it('writes a note in both locales for exactly the cards whose data declares one', () => {
    // ARRANGE
    const expectedWithNote = ['people-first', 'reason-backwards', 'obsolete-by-design'];
    // ACT
    const declared = FRAMEWORK_SLIDES.filter((slide) => slide.note).map((slide) => slide.id);
    const enWithNote = FRAMEWORK_SLIDES.filter((slide) => cardCopy('en', slide.id).note).map((slide) => slide.id);
    const deWithNote = FRAMEWORK_SLIDES.filter((slide) => cardCopy('de', slide.id).note).map((slide) => slide.id);
    // ASSERT
    expect(declared).toEqual(expectedWithNote);
    expect(enWithNote).toEqual(expectedWithNote);
    expect(deWithNote).toEqual(expectedWithNote);
  });
});
