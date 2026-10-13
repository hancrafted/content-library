import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { DayOneNote } from './day-one-note';

const ROWS = [
  { id: 'people', term: 'your people', text: 'not known yet' },
  { id: 'budget', term: 'your budget', text: 'not known yet' },
  { id: 'last-year', term: 'last year', text: 'not known yet' },
] as const;

/** The day-one note rendered to static markup, as the server sends it. */
function note(props: Partial<Parameters<typeof DayOneNote>[0]> = {}): string {
  return renderToStaticMarkup(createElement(DayOneNote, { label: 'Your company', rows: ROWS, ...props }));
}

describe('success cases', () => {
  it('writes the label as the caption of a figure and each row as a term and its text', () => {
    // ARRANGE
    const expected = [
      '<figcaption class="text-caption font-medium text-muted-foreground">Your company</figcaption>',
      '<dt class="text-caption text-muted-foreground">your people</dt>',
      '<dd class="text-body text-foreground">not known yet</dd>',
      '<dt class="text-caption text-muted-foreground">last year</dt>',
    ];
    // ACT
    const html = note();
    // ASSERT
    for (const fragment of expected) expect(html).toContain(fragment);
  });

  it('hands each row its index as --i and the shared row class, so a Slide can stagger the rows', () => {
    // ARRANGE
    const rowClass = 'rise-row';
    const expected = ['--i:0', '--i:1', '--i:2'];
    // ACT
    const rows = [...note({ rowClassName: rowClass }).matchAll(/<div style="([^"]*)" class="([^"]*)"/g)];
    // ASSERT
    expect(rows.map(([, style]) => style)).toEqual(expected);
    for (const [, , cls] of rows) expect(cls.split(' ')).toContain(rowClass);
  });

  it('marks the figure as the Slide target it is given', () => {
    // ARRANGE
    const expected = '<figure data-target="gap"';
    // ACT
    const html = note({ 'data-target': 'gap' });
    // ASSERT
    expect(html).toContain(expected);
  });
});

describe('failure cases', () => {
  it('writes no marker cell for a row without a marker', () => {
    // ARRANGE
    const expected = ROWS.length;
    // ACT
    const cells = note().match(/<dd/g) ?? [];
    // ASSERT
    expect(cells).toHaveLength(expected);
  });
});

describe('edge cases', () => {
  it('adds a third cell for a row that carries a marker, and that row’s own class', () => {
    // ARRANGE
    const marker = createElement('span', { 'aria-label': 'checked' }, '✓');
    const rows = [{ ...ROWS[0], marker, className: 'ring-1' }];
    const expectedCells = 2;
    // ACT
    const html = note({ rows });
    // ASSERT
    expect(html.match(/<dd/g)).toHaveLength(expectedCells);
    expect(html).toContain('<span aria-label="checked">✓</span>');
    expect(html).toMatch(/class="[^"]*ring-1[^"]*"/);
  });
});
