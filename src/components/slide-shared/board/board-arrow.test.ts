import { load } from 'cheerio';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { BoardArrow, type BoardArrowProps } from './board-arrow';
import { CashflowBoard } from './cashflow-board';

function render(props: BoardArrowProps) {
  return load(renderToStaticMarkup(createElement(BoardArrow, props)));
}

describe('success cases', () => {
  it('draws a left arrow head first, so its tip leads, and shows its label to assistive tech', () => {
    // ARRANGE
    const expectedOrder = ['svg', 'span', 'span'];
    // ACT
    const $ = render({ direction: 'left', label: 'Pull it in' });
    const arrow = $('[data-board-arrow]');
    const order = arrow
      .children()
      .toArray()
      .map((child) => child.tagName);
    // ASSERT
    expect(order).toEqual(expectedOrder);
    expect(arrow.attr('aria-hidden')).toBeUndefined();
  });
});

describe('failure cases', () => {
  it('hides an unlabelled arrow from assistive tech, since it is a drawing', () => {
    // ARRANGE
    const expected = 'true';
    // ACT
    const $ = render({ direction: 'right' });
    // ASSERT
    expect($('[data-board-arrow]').attr('aria-hidden')).toBe(expected);
  });
});

describe('edge cases', () => {
  it('spans only the columns between its ends on a cashflow board, pointing back, indexed last', () => {
    // ARRANGE
    const month = (slug: string) => ({
      slug,
      label: slug,
      notes: [{ slug: `${slug}-cost`, slot: 'cost' as const, label: 'Cost', amount: '$1' }],
    });
    const expected = { direction: 'left', column: '2 / 4', row: '4', index: '4' };
    // ACT
    const $ = load(
      renderToStaticMarkup(
        createElement(CashflowBoard, {
          columns: [month('january'), month('february'), month('march'), month('april')],
          arrow: { from: 4, to: 1, slot: 'revenue' },
        }),
      ),
    );
    const arrow = $('[data-board-arrow]');
    const style = arrow.attr('style') ?? '';
    // ASSERT
    expect({
      direction: arrow.attr('data-direction'),
      column: /grid-column:\s*([^;]+)/.exec(style)?.[1],
      row: /grid-row:\s*([^;]+)/.exec(style)?.[1],
      index: /--i:\s*([^;]+)/.exec(style)?.[1],
    }).toEqual(expected);
  });
});
