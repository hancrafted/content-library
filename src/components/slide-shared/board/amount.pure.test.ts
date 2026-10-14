import { describe, expect, it } from 'vitest';
import { formatAmount } from './amount.pure';

/** Intl separates a German amount from its symbol with a no-break space. */
const NBSP = ' ';

describe('success cases', () => {
  it('writes an English amount in full and compact', () => {
    // ARRANGE
    const expected = { full: '$1,000,000', compact: '$1M' };
    // ACT
    const amount = formatAmount(1_000_000, 'USD', 'en');
    // ASSERT
    expect(amount).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('keeps a German thousand in full when compact, since German has no short word for it', () => {
    // ARRANGE
    const expected = { full: `50.000${NBSP}$`, compact: `50.000${NBSP}$` };
    // ACT
    const amount = formatAmount(50_000, 'USD', 'de');
    // ASSERT
    expect(amount).toEqual(expected);
  });
});

describe('edge cases', () => {
  it('writes a German million compact with its abbreviation, and zero the same in both forms', () => {
    // ARRANGE
    const expected = [
      { full: `1.000.000${NBSP}$`, compact: `1${NBSP}Mio.${NBSP}$` },
      { full: `0${NBSP}$`, compact: `0${NBSP}$` },
    ];
    // ACT
    const amounts = [formatAmount(1_000_000, 'USD', 'de'), formatAmount(0, 'USD', 'de')];
    // ASSERT
    expect(amounts).toEqual(expected);
  });
});
