import { load } from 'cheerio';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { StickyNote, type StickyNoteProps } from './sticky-note';

function render(props: StickyNoteProps) {
  return load(renderToStaticMarkup(createElement(StickyNote, props)));
}

describe('success cases', () => {
  it('shows a label and a figure in a paragraph, with its tone named', () => {
    // ARRANGE
    const expected = { tag: 'p', tone: 'cost', text: 'Cost$50,000' };
    // ACT
    const $ = render({ tone: 'cost', label: 'Cost', value: '$50,000' });
    const note = $('[data-board-note]');
    // ASSERT
    expect({ tag: note.prop('tagName')?.toLowerCase(), tone: note.attr('data-tone'), text: note.text() }).toEqual(
      expected,
    );
  });
});

describe('failure cases', () => {
  it('becomes a div when it carries a rich body, since a paragraph cannot hold a list', () => {
    // ARRANGE
    const children = createElement('ul', null, createElement('li', null, 'Follow-up'));
    const expectedTag = 'div';
    // ACT
    const $ = render({ tone: 'neutral', fill: true, label: 'Opportunities', children });
    const note = $('[data-board-note]');
    // ASSERT
    expect(note.prop('tagName')?.toLowerCase()).toBe(expectedTag);
    expect(note.find('ul')).toHaveLength(1);
  });
});

describe('edge cases', () => {
  it('merges the Slide class last and passes its target and slot through', () => {
    // ARRANGE
    const expected = { target: 'revenue', slot: 'april-revenue', motion: true };
    // ACT
    const $ = render({
      tone: 'revenue',
      label: 'Revenue',
      value: '$1,000,000',
      target: { 'data-target': 'revenue' },
      dataSlot: 'april-revenue',
      className: 'motion',
    });
    const note = $('[data-board-note]');
    // ASSERT
    expect({
      target: note.attr('data-target'),
      slot: note.attr('data-slot'),
      motion: note.hasClass('motion'),
    }).toEqual(expected);
  });
});
