import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { NoteFunnel, type NoteFunnelProps } from './note-funnel';

const STAGES: NoteFunnelProps['stages'] = [
  { label: 'Leads · 27', count: 27, countLabel: 'Lead' },
  { label: 'Opportunities · 9', count: 9, countLabel: 'Opportunity' },
  { label: 'Deal · 1', count: 1, countLabel: 'Deal' },
];

function render(overrides: Partial<NoteFunnelProps> = {}): string {
  return renderToStaticMarkup(
    createElement(NoteFunnel, {
      stages: STAGES,
      ratios: ['3 : 1', '9 : 1'],
      total: '27 : 1 in total',
      ...overrides,
    }),
  );
}

/** The number of mini notes drawn in each stage's hidden mark grid, in document order. */
function markCounts(html: string): number[] {
  return [...html.matchAll(/<div aria-hidden="true" data-marks[^>]*>(.*?)<\/div>/g)].map(
    ([, inner]) => inner.match(/<span/g)?.length ?? 0,
  );
}

describe('success cases', () => {
  it('draws one mini note per lead and per opportunity, and one full note for the deal', () => {
    // ARRANGE
    const props = {};
    // ACT
    const html = render(props);
    // ASSERT
    expect(markCounts(html)).toEqual([27, 9]);
    expect(html).toContain('>Deal</span>');
  });

  it('reads the total, then each stage chip with its ratio between, in order', () => {
    // ARRANGE
    const props = {};
    // ACT
    const text = render(props)
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    // ASSERT
    expect(text).toBe('27 : 1 in total Leads · 27 3 : 1 Opportunities · 9 9 : 1 Deal · 1 Deal');
  });
});

describe('failure cases', () => {
  it('throws unless there is one ratio between each pair of stages', () => {
    // ARRANGE
    const ratios: [string, string] = ['3 : 1', '9 : 1'];
    // ACT
    const act = () => render({ stages: STAGES.slice(0, 2), ratios });
    // ASSERT
    expect(act).toThrow('NoteFunnel: 2 stages need 1 ratios, got 2.');
  });
});

describe('edge cases', () => {
  it('marks the funnel and its total with their note targets', () => {
    // ARRANGE
    const props = { 'data-target': 'funnel', totalTarget: 'total-ratio' };
    // ACT
    const html = render(props);
    // ASSERT
    expect(html).toMatch(/^<div[^>]*data-target="funnel"/);
    expect(html).toMatch(/data-target="total-ratio"[^>]*>(<[^>]+>)*27 : 1 in total/);
  });
});
