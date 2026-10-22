import { describe, expect, it } from 'vitest';
import { cueOf, isLinked } from './card-variant.pure';

const LINKED = { route: '/episodes/ai-token-economy' };
const UNLINKED = { route: null };

describe('success cases', () => {
  it('shows the lead card of a linked Episode as a filled button', () => {
    // ARRANGE
    const expected = 'button';
    // ACT
    const cue = cueOf(LINKED, 'lead');
    // ASSERT
    expect(cue).toBe(expected);
  });

  it('shows a compact card of a linked Episode as the quiet arrow', () => {
    // ARRANGE
    const expected = 'arrow';
    // ACT
    const cue = cueOf(LINKED, 'compact');
    // ASSERT
    expect(cue).toBe(expected);
  });

  it('shows a workshop card as the quiet arrow', () => {
    // ARRANGE
    const expected = 'arrow';
    // ACT
    const cue = cueOf(LINKED, 'workshop');
    // ASSERT
    expect(cue).toBe(expected);
  });
});

describe('failure cases', () => {
  it.each(['lead', 'compact', 'workshop'] as const)(
    'shows an announced-only Episode as coming soon on a %s card',
    (variant) => {
      // ARRANGE
      const expected = 'coming-soon';
      // ACT
      const cue = cueOf(UNLINKED, variant);
      // ASSERT
      expect(cue).toBe(expected);
    },
  );
});

describe('edge cases', () => {
  it('treats a card as a link exactly when it has a route', () => {
    // ARRANGE
    const cards = [LINKED, UNLINKED];
    // ACT
    const linked = cards.map(isLinked);
    // ASSERT
    expect(linked).toEqual([true, false]);
  });
});
