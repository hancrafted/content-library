import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { CashflowBoard, type CashflowBoardProps, type CashflowMonth } from './cashflow-board';

const ROW_LABELS = { cash: 'Cash', cost: 'Cost', revenue: 'Revenue' } as const;

const MONTHS: readonly CashflowMonth[] = [
  {
    id: 'jan',
    label: 'Jan',
    notes: [
      { row: 'cash', amount: '$100k' },
      { row: 'cost', amount: '$50k', target: 'cost-jan' },
    ],
  },
  { id: 'feb', label: 'Feb', notes: [{ row: 'cash', amount: '$50k' }] },
  {
    id: 'mar',
    label: 'Mar',
    notes: [
      { row: 'cash', amount: '$0', zero: true },
      { row: 'cost', amount: '$50k' },
    ],
  },
  { id: 'apr', label: 'Apr', notes: [{ row: 'revenue', amount: '+$1M' }] },
];

function render(overrides: Partial<CashflowBoardProps> = {}): string {
  return renderToStaticMarkup(
    createElement(CashflowBoard, { label: 'Cashflow board', rowLabels: ROW_LABELS, months: MONTHS, ...overrides }),
  );
}

/** The text of every list item, tags stripped, in document order. */
function noteTexts(html: string): string[] {
  return [...html.matchAll(/<li\b[^>]*>(.*?)<\/li>/g)].map(([, inner]) => inner.replace(/<[^>]+>/g, ' ').trim());
}

describe('success cases', () => {
  it('prints each note with its kind word and its amount', () => {
    // ARRANGE
    const props = {};
    // ACT
    const notes = noteTexts(render(props)).map((text) => text.replace(/\s+/g, ' '));
    // ASSERT
    expect(notes).toEqual(['Cash $100k', 'Cost $50k', 'Cash $50k', 'Cash $0', 'Cost $50k', 'Revenue +$1M']);
  });

  it('names the board figure by its label and each month group by its pill', () => {
    // ARRANGE
    const props = {};
    // ACT
    const html = render(props);
    // ASSERT
    expect(html).toMatch(/<figure[^>]*aria-label="Cashflow board"/);
    expect(html.match(/role="group"/g)).toHaveLength(4);
  });

  it('marks the stamp, the gap and the noted cost with their targets', () => {
    // ARRANGE
    const props: Partial<CashflowBoardProps> = {
      stamp: { month: 'mar', text: 'Bankrupt', target: 'stamp' },
      gap: { after: 'mar', target: 'march-april-gap' },
      'data-target': 'board',
    };
    // ACT
    const html = render(props);
    // ASSERT
    for (const target of ['board', 'cost-jan', 'stamp', 'march-april-gap']) {
      expect(html).toContain(`data-target="${target}"`);
    }
    expect(html).toContain('Bankrupt');
  });
});

describe('failure cases', () => {
  it('refuses two notes in one row of a month', () => {
    // ARRANGE
    const months: CashflowMonth[] = [
      {
        id: 'jan',
        label: 'Jan',
        notes: [
          { row: 'cost', amount: '$50k' },
          { row: 'cost', amount: '$10k' },
        ],
      },
    ];
    // ACT
    const draw = () => render({ months });
    // ASSERT
    expect(draw).toThrow(/two notes in the cost row of "jan"/);
  });

  it('refuses two months with the same id', () => {
    // ARRANGE
    const months: CashflowMonth[] = [
      { id: 'jan', label: 'Jan', notes: [] },
      { id: 'jan', label: 'Jan', notes: [] },
    ];
    // ACT
    const draw = () => render({ months });
    // ASSERT
    expect(draw).toThrow(/month "jan" twice/);
  });

  it.each(['cost', 'revenue'] as const)('refuses `zero` on a %s note', (row) => {
    // ARRANGE
    const months: CashflowMonth[] = [{ id: 'jan', label: 'Jan', notes: [{ row, amount: '$0', zero: true }] }];
    // ACT
    const draw = () => render({ months });
    // ASSERT
    expect(draw).toThrow(/zero.*cash/);
  });

  it.each([
    ['stamp', { stamp: { month: 'may', text: 'Bankrupt' } }],
    ['arrow from', { arrow: { from: 'may', to: 'jan' } }],
    ['arrow to', { arrow: { from: 'apr', to: 'may' } }],
    ['gap', { gap: { after: 'may', target: 'gap' } }],
  ] as const)('refuses a %s naming an unknown month', (_, overrides) => {
    // ARRANGE
    const props: Partial<CashflowBoardProps> = overrides;
    // ACT
    const draw = () => render(props);
    // ASSERT
    expect(draw).toThrow(/unknown month "may"/);
  });

  it('refuses a moved note from an unknown month', () => {
    // ARRANGE
    const months: CashflowMonth[] = [
      { id: 'jan', label: 'Jan', notes: [{ row: 'revenue', amount: '+$1M', movedFrom: 'may' }] },
    ];
    // ACT
    const draw = () => render({ months });
    // ASSERT
    expect(draw).toThrow(/unknown month "may"/);
  });
});

describe('edge cases', () => {
  it('keeps an empty dashed cell where a moved note came from', () => {
    // ARRANGE
    const months: CashflowMonth[] = [
      { id: 'jan', label: 'Jan', notes: [] },
      { id: 'feb', label: 'Feb', notes: [{ row: 'revenue', amount: '+$1M', movedFrom: 'apr' }] },
      { id: 'mar', label: 'Mar', notes: [] },
      { id: 'apr', label: 'Apr', notes: [] },
    ];
    // ACT
    const html = render({ months, arrow: { from: 'apr', to: 'feb', label: 'Pulled in' } });
    // ASSERT
    expect(html.match(/<li\b[^>]*aria-hidden="true"/g)).toHaveLength(1);
    expect(html).toContain('Pulled in');
  });
});
