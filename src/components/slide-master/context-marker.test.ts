import { load } from 'cheerio';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { ContextMarker } from './context-marker';

type MarkerProps = Parameters<typeof ContextMarker>[0];

/** The marker's button, parsed from the server markup the page ships. */
function render(props: MarkerProps) {
  return load(renderToStaticMarkup(createElement(ContextMarker, props)))('button');
}

const classesOf = (button: ReturnType<typeof render>): string[] => (button.attr('class') ?? '').split(/\s+/);

describe('success cases', () => {
  it('is a native button naming its Speaker note by slug, by the attribute the drawer listens for', () => {
    // ARRANGE
    const note = 'stateless-by-design';
    const label = 'Speaker note: Stateless by design';
    const expected = { type: 'button', ref: note, label };
    // ACT
    const button = render({ note, label });
    const seen = { type: button.attr('type'), ref: button.attr('data-context-ref'), label: button.attr('aria-label') };
    // ASSERT
    expect(seen).toEqual(expected);
  });

  it('shows the icon in parentheses when it sits in running text, hidden from assistive tech', () => {
    // ARRANGE
    const expected = '()';
    // ACT
    const button = render({ note: 'n', label: 'Speaker note: N', placement: 'inline' });
    const shown = button.find('[aria-hidden="true"]').text();
    const icons = button.find('svg').length;
    // ASSERT
    expect(shown).toBe(expected);
    expect(icons).toBe(1);
  });
});

describe('failure cases', () => {
  it('carries no id, target or number, so it never stands in for the element its note explains', () => {
    // ARRANGE
    const expected = { id: undefined, targets: 0, digits: false };
    // ACT
    const button = render({ note: 'spine', label: 'Speaker note: Spine' });
    const seen = {
      id: button.attr('id'),
      targets: button.find('[data-target]').length,
      digits: /\d/.test(button.text()),
    };
    // ASSERT
    expect(seen).toEqual(expected);
  });
});

describe('edge cases', () => {
  it('sits in its element’s top-right corner by default, and takes the caller’s position instead', () => {
    // ARRANGE
    const corner = ['absolute', 'top-2', 'right-2'];
    const beside = 'ml-1';
    const fixed = 'absolute';
    // ACT
    const fallback = classesOf(render({ note: 'n', label: 'l' }));
    const placed = classesOf(render({ note: 'n', label: 'l', className: `static ${beside}` }));
    // ASSERT
    expect(fallback).toEqual(expect.arrayContaining(corner));
    expect(placed).toContain(beside);
    expect(placed).not.toContain(fixed);
  });
});
