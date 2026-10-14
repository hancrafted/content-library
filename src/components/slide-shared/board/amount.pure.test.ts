import { describe, expect, it } from 'vitest';
import { formatAmount } from './amount.pure';

/** Intl separates a German amount from its symbol with a no-break space. */
const NBSP = ' ';

describe('success cases', () => {
  it('writes an English amount in full and compact', () => {
    // ARRANGE
    const expected = { full: '$1,000,000', compact: '$1M' };
    // ACT
    const amount = formatAmount(1_000_000, { currency: 'USD', locale: 'en' });
    // ASSERT
    expect(amount).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('writes German thousands compact with k, which Intl leaves in full and a phone note cannot hold', () => {
    // ARRANGE
    const expected = [
      { full: `50.000${NBSP}$`, compact: `50k${NBSP}$` },
      { full: `100.000${NBSP}$`, compact: `100k${NBSP}$` },
    ];
    // ACT
    const amounts = [
      formatAmount(50_000, { currency: 'USD', locale: 'de' }),
      formatAmount(100_000, { currency: 'USD', locale: 'de' }),
    ];
    // ASSERT
    expect(amounts).toEqual(expected);
  });
});

describe('edge cases', () => {
  it('writes a signed amount with a plus, as revenue reads, in full and compact in both locales', () => {
    // ARRANGE
    const expected = [
      { full: '+$1,000,000', compact: '+$1M' },
      { full: '+$50,000', compact: '+$50K' },
      { full: `+1.000.000${NBSP}$`, compact: `+1${NBSP}Mio.${NBSP}$` },
      { full: `+50.000${NBSP}$`, compact: `+50k${NBSP}$` },
    ];
    // ACT
    const amounts = [
      formatAmount(1_000_000, { currency: 'USD', locale: 'en', signed: true }),
      formatAmount(50_000, { currency: 'USD', locale: 'en', signed: true }),
      formatAmount(1_000_000, { currency: 'USD', locale: 'de', signed: true }),
      formatAmount(50_000, { currency: 'USD', locale: 'de', signed: true }),
    ];
    // ASSERT
    expect(amounts).toEqual(expected);
  });

  it('writes a German million compact with its abbreviation, and zero the same in both forms', () => {
    // ARRANGE
    const expected = [
      { full: `1.000.000${NBSP}$`, compact: `1${NBSP}Mio.${NBSP}$` },
      { full: `0${NBSP}$`, compact: `0${NBSP}$` },
    ];
    // ACT
    const amounts = [
      formatAmount(1_000_000, { currency: 'USD', locale: 'de' }),
      formatAmount(0, { currency: 'USD', locale: 'de' }),
    ];
    // ASSERT
    expect(amounts).toEqual(expected);
  });
});
