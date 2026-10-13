import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { DisciplineRings } from './discipline-rings';

const RINGS = [
  { id: 'prompt', short: 'Prompt', name: 'Prompt engineering', line: 'The ask.' },
  {
    id: 'context',
    short: 'Context',
    name: 'Context engineering',
    line: 'The background.',
    target: { 'data-target': 'context' },
  },
  { id: 'harness', short: 'Harness', name: 'Harness engineering', line: 'The tools.' },
  { id: 'graph', short: 'Graph', name: 'Graph engineering', line: 'The workflow.', tag: 'newest' },
] as const;

/** The rings and their key rendered to static markup, as the server sends them. */
function rings(): string {
  return renderToStaticMarkup(
    createElement(DisciplineRings, { task: 'the task', figureLabel: 'Four rings', rings: RINGS }),
  );
}

describe('success cases', () => {
  it('names the disciplines in the key in order, from the task outwards', () => {
    // ARRANGE
    const expected = ['Prompt engineering', 'Context engineering', 'Harness engineering', 'Graph engineering'];
    // ACT
    const names = [...rings().matchAll(/<p class="text-body font-semibold">([^<]*)</g)].map(([, name]) => name);
    // ASSERT
    expect(names).toEqual(expected);
  });

  it('labels the figure and marks the key item a note targets', () => {
    // ARRANGE
    const expected = ['<figure aria-label="Four rings"', '<li data-target="context"'];
    // ACT
    const html = rings();
    // ASSERT
    for (const fragment of expected) expect(html).toContain(fragment);
  });
});

describe('failure cases', () => {
  it('marks no key item that no note targets', () => {
    // ARRANGE
    const expected = 1;
    // ACT
    const marked = rings().match(/data-target=/g) ?? [];
    // ASSERT
    expect(marked).toHaveLength(expected);
  });
});

describe('edge cases', () => {
  it('draws only the outermost ring dashed and tags only that discipline', () => {
    // ARRANGE
    const expected = 2;
    // ACT
    const html = rings();
    // ASSERT
    expect(html.match(/border-dashed/g)).toHaveLength(expected);
    expect(html.match(/newest/g)).toHaveLength(1);
  });
});
