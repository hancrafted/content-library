import { describe, expect, it } from 'vitest';
import { catalogWordsFor } from './software-ecology-data';
import type { Bundle, Preset } from './software-ecology.types';
import { builtinBundle } from './use-case-data.ts';
import { beatCaption } from './use-case-words.pure.ts';

/* A beat's caption in the tour box: its own caption line, else Han's claim the beat names (design-ADR 0024 §20). */

const PROBE: Preset = {
  id: 'probe',
  view: 'factory',
  tour: [{ run: 2, claim: 'clean' }, { run: 4 }],
} as Preset;

const withWords = (scenario: { steps?: string[]; claims?: Record<string, string> }): Bundle => {
  const B = builtinBundle('tire');
  return {
    ...B,
    data: { ...B.data, presets: [...B.data.presets, PROBE] },
    words: { ...B.words, en: { ...B.words.en, scenarios: { probe: scenario } } },
  };
};
const at = (B: Bundle) => ({ B, locale: 'en' as const, catalog: catalogWordsFor('en') });

describe('success cases', () => {
  it('shows the claim a beat names when the scenario has no caption line for it', () => {
    // ARRANGE
    const expected = 'The line runs clean.';
    // ACT
    const caption = beatCaption(at(withWords({ claims: { clean: expected } })), PROBE, 0);
    // ASSERT
    expect(caption).toBe(expected);
  });
});

describe('failure cases', () => {
  it('shows nothing for a beat with neither a caption line nor a claim', () => {
    // ARRANGE
    const expected = '';
    // ACT
    const caption = beatCaption(at(withWords({ claims: { clean: 'The line runs clean.' } })), PROBE, 1);
    // ASSERT
    expect(caption).toBe(expected);
  });
});

describe('edge cases', () => {
  it('prefers a caption line over the claim', () => {
    // ARRANGE
    const expected = 'Watch the Customer card.';
    // ACT
    const caption = beatCaption(
      at(withWords({ steps: [expected], claims: { clean: 'The line runs clean.' } })),
      PROBE,
      0,
    );
    // ASSERT
    expect(caption).toBe(expected);
  });
});
