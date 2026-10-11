import { createElement, Fragment, type FunctionComponent } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { EffortCorpusChart } from './effort-corpus-chart';
import { EffortDecayChart } from './effort-decay-chart';

const CHARTS: [string, FunctionComponent][] = [
  ['decay chart', EffortDecayChart],
  ['corpus chart', EffortCorpusChart as FunctionComponent],
];

/** Every `id="..."` in rendered markup, in document order. */
function idsOf(html: string): string[] {
  return [...html.matchAll(/\bid="([^"]+)"/g)].map(([, id]) => id);
}

describe('success cases', () => {
  it.each(CHARTS)('the %s tips its axes with an arrow marker it renders itself', (_, Chart) => {
    // ARRANGE
    const chart = createElement(Chart);
    // ACT
    const html = renderToStaticMarkup(chart);
    const references = [...html.matchAll(/url\(#([^)]+)\)/g)].map(([, id]) => id);
    // ASSERT
    expect(references.length > 0 && references.every((id) => idsOf(html).includes(id))).toBe(true);
  });
});

describe('failure cases', () => {
  it.each(CHARTS)('the %s keeps its marker id unique when rendered twice on one page', (_, Chart) => {
    // ARRANGE
    const page = createElement(Fragment, null, createElement(Chart), createElement(Chart));
    // ACT
    const ids = idsOf(renderToStaticMarkup(page));
    // ASSERT
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('edge cases', () => {
  it('lets the two charts share their Slide without sharing a marker id', () => {
    // ARRANGE
    const slide = createElement(
      Fragment,
      null,
      createElement(EffortDecayChart),
      createElement(EffortCorpusChart as FunctionComponent),
    );
    // ACT
    const ids = idsOf(renderToStaticMarkup(slide));
    // ASSERT
    expect(new Set(ids).size).toBe(ids.length);
  });
});
