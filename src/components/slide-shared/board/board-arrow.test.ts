import { load } from 'cheerio';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { BoardArrow, type BoardArrowProps } from './board-arrow';

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
  it('draws a dashed shaft as a border while the head stays solid', () => {
    // ARRANGE
    const expected = { dashed: '', shaftDashed: true, headFill: 'currentColor' };
    // ACT
    const $ = render({ direction: 'right', dashed: true });
    // ASSERT
    expect({
      dashed: $('[data-board-arrow]').attr('data-dashed'),
      shaftDashed: $('[data-arrow-shaft]').hasClass('border-dashed'),
      headFill: $('svg').attr('fill'),
    }).toEqual(expected);
  });
});
