import { load } from 'cheerio';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Board, type BoardProps } from './board';

function render(props: BoardProps) {
  return load(renderToStaticMarkup(createElement(Board, props)));
}

describe('success cases', () => {
  it('renders one column per entry, each headed by its pill, and counts them for the grid', () => {
    // ARRANGE
    const columns = [
      { slug: 'leads', label: 'Leads' },
      { slug: 'opportunities', label: 'Opportunities' },
      { slug: 'closing', label: 'Closing' },
    ];
    const expectedPills = ['Leads', 'Opportunities', 'Closing'];
    const expectedCount = '--board-columns:3';
    // ACT
    const $ = render({ columns });
    const pills = $('[data-board-column] > h4')
      .toArray()
      .map((pill) => $(pill).text());
    // ASSERT
    expect(pills).toEqual(expectedPills);
    expect($('[data-board]').attr('style')).toContain(expectedCount);
  });
});

describe('failure cases', () => {
  it('renders free children inside one surface when it has no columns', () => {
    // ARRANGE
    const children = createElement('p', { id: 'free' }, 'Free layout');
    // ACT
    const $ = render({ children });
    // ASSERT
    expect($('[data-board-surface] > #free')).toHaveLength(1);
    expect($('[data-board-column]')).toHaveLength(0);
  });
});

describe('edge cases', () => {
  it('marks a primary and a dashed column, and paints the overlay after the columns', () => {
    // ARRANGE
    const columns = [
      { slug: 'march', label: 'March', primary: true },
      { slug: 'april', label: 'April', dashed: true },
    ];
    const overlayId = 'stamp';
    const overlay = createElement('p', { id: overlayId }, 'Bankrupt');
    const expected = [
      { primary: '', dashed: undefined },
      { primary: undefined, dashed: '' },
    ];
    // ACT
    const $ = render({ columns, overlay, rows: 4 });
    const marks = $('[data-board-column]')
      .toArray()
      .map((column) => ({ primary: $(column).attr('data-primary'), dashed: $(column).attr('data-dashed') }));
    // ASSERT
    expect(marks).toEqual(expected);
    expect($('[data-board] > :last-child').attr('id')).toBe(overlayId);
  });

  it('pins each column to its own track when rows are fixed, so an overlay placed in a column cannot push it aside', () => {
    // ARRANGE
    const columns = [
      { slug: 'january', label: 'January' },
      { slug: 'february', label: 'February' },
      { slug: 'march', label: 'March' },
    ];
    const expected = ['1', '2', '3'];
    // ACT
    const $ = render({ columns, rows: 4 });
    const tracks = $('[data-board-column]')
      .toArray()
      .map((column) => /grid-column:\s*(\d+)/.exec($(column).attr('style') ?? '')?.[1]);
    // ASSERT
    expect(tracks).toEqual(expected);
  });
});
