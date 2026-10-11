import { createElement, Fragment } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { EffortVenn } from './effort-venn';

/** Every `id="..."` in rendered markup, in document order. */
function idsOf(html: string): string[] {
  return [...html.matchAll(/\bid="([^"]+)"/g)].map(([, id]) => id);
}

/** Every `url(#...)` reference in rendered markup. */
function referencesOf(html: string): string[] {
  return [...html.matchAll(/url\(#([^)]+)\)/g)].map(([, id]) => id);
}

describe('success cases', () => {
  it('points its hatch fill at a pattern it renders itself', () => {
    // ARRANGE
    const venn = createElement(EffortVenn, { emphasis: 'machine' });
    // ACT
    const html = renderToStaticMarkup(venn);
    // ASSERT
    expect(referencesOf(html).every((id) => idsOf(html).includes(id))).toBe(true);
  });
});

describe('failure cases', () => {
  it('gives two Venns on one page distinct pattern ids, so neither fills from the other', () => {
    // ARRANGE
    const page = createElement(
      Fragment,
      null,
      createElement(EffortVenn, { emphasis: 'establish' }),
      createElement(EffortVenn, { emphasis: 'establish' }),
    );
    // ACT
    const ids = idsOf(renderToStaticMarkup(page));
    // ASSERT
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('edge cases', () => {
  it.each(['establish', 'machine', 'human'] as const)(
    'fills the AI lens from its own pattern under %s emphasis',
    (emphasis) => {
      // ARRANGE
      const venn = createElement(EffortVenn, { emphasis });
      // ACT
      const html = renderToStaticMarkup(venn);
      // ASSERT
      expect(referencesOf(html)).toEqual(idsOf(html));
    },
  );
});
