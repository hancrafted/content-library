import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Matrix } from './agent-matrix.client';
import { explorableData } from './brief-or-pay-the-price-data';
import { CellView } from './cell-view.client';
import { rowAt, start, step } from './explorable-state.pure';
import { cellsOf } from './matrix-data.pure';

const HANDLERS = { onLight: () => undefined, onUnlight: () => undefined, onOpenCell: () => undefined };

function matrix(locale: string, extra: { lit?: Parameters<typeof Matrix>[0]['lit'] } = {}) {
  const data = explorableData(locale);
  return renderToStaticMarkup(
    createElement(Matrix, {
      words: data.words.matrix,
      traits: data.definitions.price.rows,
      moves: data.definitions.brief.rows,
      counters: data.matrix.counters,
      lit: extra.lit ?? null,
      handlers: HANDLERS,
    }),
  );
}

function cellView(locale: string, key: { move: 'break-it-down'; trait: 'relentless' }) {
  const data = explorableData(locale);
  const state = step(start({ price: 5, brief: 5 }), { type: 'openCell', cell: key });
  const cells = cellsOf(data.matrix.counters);
  const handlers = { onOpen: () => undefined, onLeave: () => undefined, onTurn: () => undefined };
  return renderToStaticMarkup(
    createElement(CellView, {
      words: data.words.matrix,
      crumbs: [data.words.chrome.agent],
      cell: key,
      position: { at: 0, of: cells.length },
      trait: data.definitions.price.rows[1]!,
      move: data.definitions.brief.rows[0]!,
      reads: [rowAt(state, 0), rowAt(state, 1)],
      evidence: { text: data.words.matrix.evidenceOf[key.move], source: data.matrix.sources[key.move] },
      labels: { backs: data.words.backs, turn: data.words.chrome.turn },
      handlers,
      onBack: () => undefined,
      onStep: () => undefined,
    }),
  );
}

describe('success cases', () => {
  it('renders one button for each filled Cell and none for an empty one', () => {
    // ARRANGE
    const html = matrix('en');
    const filled = 11;
    const cellsInGrid = 25;
    // ACT
    const buttons = html.match(/data-cell="[a-z-]+\|[a-z-]+"/g) ?? [];
    const gridCells = html.match(/<td data-move=/g) ?? [];
    // ASSERT
    expect(buttons).toHaveLength(filled);
    expect(gridCells).toHaveLength(cellsInGrid);
  });

  it('names each Cell button by its move and trait, in German with the English names', () => {
    // ARRANGE
    const html = matrix('de');
    const expected = 'Break it down wirkt gegen Relentless: Zelle öffnen';
    // ACT
    const names = [...html.matchAll(/aria-label="([^"]+)"/g)].map(([, name]) => name);
    // ASSERT
    expect(names).toContain(expected);
  });

  it('keeps every Cell button at least 44 px square and gives a legend naming each letter, with its German gloss', () => {
    // ARRANGE
    const html = matrix('de');
    const legend = html.slice(html.indexOf('data-matrix-legend'));
    const filledCells = 11;
    // ACT
    const targets = html.match(/size-11/g) ?? [];
    // ASSERT
    expect(targets.length).toBeGreaterThanOrEqual(filledCells);
    for (const text of ['Probabilistic', 'probabilistisch', 'Break it down', 'Fresh start for each piece'])
      expect(legend).toContain(text);
  });

  it('lights the row and the column of the heading under the pointer', () => {
    // ARRANGE
    const html = matrix('en', { lit: { kind: 'trait', id: 'informed' } });
    const headingAndCells = 1 + 5;
    // ACT
    const lit = html.match(/bg-ai\/10/g) ?? [];
    // ASSERT
    expect(lit).toHaveLength(headingAndCells);
  });

  it('shows the problem row over the fix row, the counter link and the evidence line with its source', () => {
    // ARRANGE
    const html = cellView('en', { move: 'break-it-down', trait: 'relentless' });
    // ACT
    const at = (text: string) => html.indexOf(text);
    // ASSERT
    expect(at('The problem · PRICE')).toBeLessThan(at('data-cell-link'));
    expect(at('data-cell-link')).toBeLessThan(at('The fix · BRIEF'));
    expect(at('The fix · BRIEF')).toBeLessThan(at('data-cell-evidence'));
    expect(html).toContain('<b translate="no" class="font-semibold">Break it down</b> counters ');
    expect(html).toContain('against 16% for chain-of-thought');
    expect(html).toContain('Zhou et al., Least-to-Most Prompting');
  });

  it('names the Cell controls in English and German', () => {
    // ARRANGE
    const expected = {
      en: ['Previous Cell', 'Next Cell', '← Back'],
      de: ['Vorige Zelle', 'Nächste Zelle', '← Zurück'],
    };
    // ACT
    const html = {
      en: cellView('en', { move: 'break-it-down', trait: 'relentless' }),
      de: cellView('de', { move: 'break-it-down', trait: 'relentless' }),
    };
    // ASSERT
    for (const text of expected.en) expect(html.en).toContain(text);
    for (const text of expected.de) expect(html.de).toContain(text);
  });
});

describe('failure cases', () => {
  it('renders no button for the Cells the counters table leaves empty', () => {
    // ARRANGE
    const html = matrix('en');
    // ACT
    const emptyCell = html.includes('data-cell="break-it-down|informed"');
    // ASSERT
    expect(emptyCell).toBe(false);
  });
});

describe('edge cases', () => {
  it('renders the matrix in its end state, with no animation class or hidden part, for the flights to start from', () => {
    // ARRANGE
    const html = matrix('en');
    const headsPerAxis = 5;
    const filledCells = 11;
    // ACT
    const stylesheetClasses = html.match(/class="[^"]*(assembles|fromPrice|letterCol)/g) ?? [];
    // ASSERT
    expect(stylesheetClasses).toEqual([]);
    expect(html.match(/data-head-letter="column"/g)).toHaveLength(headsPerAxis);
    expect(html.match(/data-head-letter="row"/g)).toHaveLength(headsPerAxis);
    expect(html.match(/data-dot/g)).toHaveLength(filledCells);
  });
});
