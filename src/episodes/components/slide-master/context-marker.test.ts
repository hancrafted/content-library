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
    const expected = { id: undefined, target: undefined, nestedTargets: 0 };
    const number = /\d/;
    // ACT
    const button = render({ note: 'spine', label: 'Speaker note: Spine' });
    const seen = {
      id: button.attr('id'),
      target: button.attr('data-target'),
      nestedTargets: button.find('[data-target]').length,
    };
    const text = button.text();
    // ASSERT
    expect(seen).toEqual(expected);
    expect(text).not.toMatch(number);
  });
});

describe('edge cases', () => {
  it('sits in its element’s top-right corner by default, and in the flow of a label when placed beside it', () => {
    // ARRANGE
    const corner = ['absolute', 'top-2', 'right-2'];
    const inFlow = 'relative';
    // ACT
    const fallback = classesOf(render({ note: 'n', label: 'l' }));
    const beside = classesOf(render({ note: 'n', label: 'l', placement: 'beside' }));
    // ASSERT
    expect(fallback).toEqual(expect.arrayContaining(corner));
    expect(beside).toContain(inFlow);
    expect(beside).not.toEqual(expect.arrayContaining(corner));
  });

  it('keeps its hit area on itself when a caller sets it static, so it never covers the Slide around it', () => {
    // ARRANGE: the hit area is an absolute pseudo-element, so a static button would let it span the nearest positioned ancestor.
    const positioned = 'relative';
    const spacing = 'ml-1';
    const unpositioned = 'static';
    // ACT
    const placed = [
      { className: `static ${spacing}` },
      { className: `md:static ${spacing}` },
      { className: `static ${spacing}`, placement: 'beside' as const },
      { className: `!static ${spacing}`, placement: 'inline' as const },
    ].map((props) => classesOf(render({ note: 'n', label: 'l', ...props })));
    // ASSERT
    for (const classes of placed) {
      expect(classes).toEqual(expect.arrayContaining([positioned, spacing]));
      expect(classes.filter((name) => name.endsWith(unpositioned))).toEqual([]);
    }
  });

  it('renders a call site placed beside exactly what the old static class gave it', () => {
    // ARRANGE
    const props = { note: 'n', label: 'l' };
    // ACT
    const old = renderToStaticMarkup(createElement(ContextMarker, { ...props, className: 'static' }));
    const placed = renderToStaticMarkup(createElement(ContextMarker, { ...props, placement: 'beside' }));
    // ASSERT
    expect(placed).toBe(old);
  });
});
