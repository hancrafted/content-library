import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { MonthStrip, type MonthStripProps } from './month-strip';

const BARS: MonthStripProps['bars'] = [
  { label: '2 weeks', startHalf: 0, spanHalves: 1 },
  { label: '6 months', startHalf: 1, spanHalves: 12 },
  { label: '3 months', startHalf: 13, spanHalves: 6 },
];

function render(overrides: Partial<MonthStripProps> = {}): string {
  return renderToStaticMarkup(
    createElement(MonthStrip, {
      bars: BARS,
      axisLabel: 'Months from first contact',
      totalLabel: '≈ 9.5 months to first revenue',
      revenueLabel: 'Revenue',
      ...overrides,
    }),
  );
}

/** Every inline `grid-column` in rendered markup, in document order. */
function gridColumns(html: string): string[] {
  return [...html.matchAll(/grid-column:([^;"]+)/g)].map(([, value]) => value.trim());
}

describe('success cases', () => {
  it('places each bar on the half-month grid from its start for its span', () => {
    // ARRANGE
    const props = {};
    // ACT
    const columns = gridColumns(render(props));
    // ASSERT
    expect(columns).toEqual(['1 / span 1', '2 / span 12', '14 / span 6']);
  });

  it('labels the ten months and prints each duration, the axis, the total and the revenue note', () => {
    // ARRANGE
    const props = {};
    // ACT
    const text = render(props)
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    // ASSERT
    expect(text).toBe(
      '1 2 3 4 5 6 7 8 9 10 2 weeks 6 months 3 months Revenue Months from first contact ≈ 9.5 months to first revenue',
    );
  });
});

describe('failure cases', () => {
  it('throws on a bar that runs past month ten', () => {
    // ARRANGE
    const bars = [{ label: '4 months', startHalf: 13, spanHalves: 8 }];
    // ACT
    const act = () => render({ bars });
    // ASSERT
    expect(act).toThrow('MonthStrip: bar "4 months" runs past half 20.');
  });

  it('throws on a bar with no span', () => {
    // ARRANGE
    const bars = [{ label: 'none', startHalf: 2, spanHalves: 0 }];
    // ACT
    const act = () => render({ bars });
    // ASSERT
    expect(act).toThrow('MonthStrip: bar "none" needs a whole number of halves, at least one.');
  });
});

describe('edge cases', () => {
  it('passes its note target to the strip', () => {
    // ARRANGE
    const props = { 'data-target': 'durations' };
    // ACT
    const html = render(props);
    // ASSERT
    expect(html).toMatch(/^<div[^>]*data-target="durations"/);
  });
});
