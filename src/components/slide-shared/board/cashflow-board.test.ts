import { load } from 'cheerio';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { CashflowBoard, type CashColumn } from './cashflow-board';

/** January and February of the hook's board: cash, cost, cash, and a zero-cash close. */
const TWO_MONTHS: readonly CashColumn[] = [
  {
    slug: 'january',
    label: 'January',
    notes: [
      { slug: 'january-opening', slot: 'opening', label: 'Cash', amount: '$100,000' },
      { slug: 'january-cost', slot: 'cost', label: 'Cost', amount: '$50,000' },
      { slug: 'january-closing', slot: 'closing', label: 'Cash', amount: '$50,000' },
    ],
  },
  {
    slug: 'february',
    label: 'February',
    notes: [
      { slug: 'february-cost', slot: 'cost', label: 'Cost', amount: '$50,000' },
      { slug: 'february-closing', slot: 'closing', label: 'Cash', amount: '$0', zeroCash: true },
    ],
  },
];

function render(props: Parameters<typeof CashflowBoard>[0]) {
  return load(renderToStaticMarkup(createElement(CashflowBoard, props)));
}

describe('success cases', () => {
  it('places each note in the grid row of its slot, opening to closing', () => {
    // ARRANGE
    const expected = {
      'january-opening': '2',
      'january-cost': '3',
      'january-closing': '5',
      'february-cost': '3',
      'february-closing': '5',
    };
    // ACT
    const $ = render({ columns: TWO_MONTHS });
    const rows = Object.fromEntries(
      $('[data-board-note]')
        .toArray()
        .map((note) => [$(note).attr('data-slot'), /grid-row:\s*(\d+)/.exec($(note).attr('style') ?? '')?.[1]]),
    );
    // ASSERT
    expect(rows).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('turns a zero-cash note into a primary warning note, whatever its slot', () => {
    // ARRANGE
    const expected = { tone: 'warning', primary: '' };
    // ACT
    const $ = render({ columns: TWO_MONTHS });
    const note = $('[data-slot="february-closing"]');
    // ASSERT
    expect({ tone: note.attr('data-tone'), primary: note.attr('data-primary') }).toEqual(expected);
  });
});

describe('edge cases', () => {
  it('numbers notes in reading order and gives the stamp the index after its column', () => {
    // ARRANGE
    const expectedIndices = ['0', '1', '2', '3', '4', '5'];
    const expectedOrder = [
      'january-opening',
      'january-cost',
      'january-closing',
      'stamp',
      'february-cost',
      'february-closing',
    ];
    // ACT
    const $ = render({ columns: TWO_MONTHS, stamp: { text: 'Bankrupt', column: 1 } });
    const order = $('[data-board-note], [data-board-stamp]')
      .toArray()
      .sort((a, b) => indexOf($(a).attr('style')) - indexOf($(b).attr('style')))
      .map((node) => $(node).attr('data-slot') ?? 'stamp');
    const indices = $('[data-board-note], [data-board-stamp]')
      .toArray()
      .map((node) => String(indexOf($(node).attr('style'))))
      .sort();
    // ASSERT
    expect(order).toEqual(expectedOrder);
    expect(indices).toEqual(expectedIndices);
  });
});

function indexOf(style: string | undefined): number {
  return Number(/--i:\s*(\d+)/.exec(style ?? '')?.[1]);
}
