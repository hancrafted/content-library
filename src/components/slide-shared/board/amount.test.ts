import { load } from 'cheerio';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Amount, type AmountProps } from './amount';

function render(props: AmountProps) {
  return load(`<p>${renderToStaticMarkup(createElement(Amount, props))}</p>`);
}

function observe(props: AmountProps) {
  const $ = render(props);
  const compact = $('[data-amount="compact"]');
  const full = $('[data-amount="full"]');
  return {
    compact: [compact.text(), compact.attr('class')],
    full: [full.text(), full.attr('class')],
  };
}

describe('success cases', () => {
  it('writes an amount compact below sm and in full from sm, with the hooks a board test reads', () => {
    // ARRANGE
    const expected = { compact: ['$100K', 'sm:hidden'], full: ['$100,000', 'hidden sm:inline'] };
    // ACT
    const seen = observe({ value: 100_000, locale: 'en', currency: 'USD' });
    // ASSERT
    expect(seen).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('writes no plus before zero, even when signed', () => {
    // ARRANGE
    const expected = { compact: ['$0', 'sm:hidden'], full: ['$0', 'hidden sm:inline'] };
    // ACT
    const seen = observe({ value: 0, locale: 'en', currency: 'USD', signed: true });
    // ASSERT
    expect(seen).toEqual(expected);
  });
});

describe('edge cases', () => {
  it('signs a German million in both forms', () => {
    // ARRANGE
    const expected = { compact: ['+1 Mio. $', 'sm:hidden'], full: ['+1.000.000 $', 'hidden sm:inline'] };
    // ACT
    const seen = observe({ value: 1_000_000, locale: 'de', currency: 'USD', signed: true });
    // ASSERT
    expect(seen).toEqual(expected);
  });
});
