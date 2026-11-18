import { load } from 'cheerio';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Matrix } from './agent-matrix.client';
import { explorableData } from './brief-or-pay-the-price-data';
import { start, step, type ExplorableEvent } from './explorable-state.pure';
import { titleOf } from './explorable-view.pure';
import { LEVEL } from './levels.client';

const HANDLERS = { onLight: () => undefined, onUnlight: () => undefined, onOpenCell: () => undefined };
const OPEN: Parameters<typeof step>[1][] = [
  { type: 'zoom', level: 'workflow' },
  { type: 'node', node: 'verify' },
];

function level(locale: 'en' | 'de', events: readonly ExplorableEvent[]) {
  const data = explorableData(locale);
  const state = events.reduce(step, start({ price: 5, brief: 5, brace: 5, cell: 2 }, 'drive'));
  const none = () => undefined;
  const props = {
    data,
    state,
    dispatch: none,
    handlers: { onOpen: none, onLeave: none, onTurn: none },
    matrixHandlers: HANDLERS,
    labels: { backs: data.words.backs, turn: data.words.chrome.turn },
  };
  return { $: load(renderToStaticMarkup(LEVEL.agent(props))), data, state };
}

describe('success cases', () => {
  it('marks exactly the node’s Cells, dims the other counters, outlines the non-counter Cell "in this context" (Seam 1)', () => {
    // ARRANGE
    const { $, data } = level('en', OPEN);
    const verify = data.scenarios.drive!.scenario.nodes.find((node) => node.id === 'verify')!;
    const counterCells = 11;
    // ACT
    const marked = $('[data-mark="mark"]').length;
    const context = $('[data-mark="context"]');
    const dimmed = $('[data-mark="dim"]').length;
    // ASSERT
    expect(marked + context.length).toBe(verify.cells.length);
    expect(context).toHaveLength(1);
    expect(context.text()).toBe('in this context');
    expect(dimmed).toBe(counterCells - marked);
    expect($('[data-cell]')).toHaveLength(counterCells - marked + verify.cells.length);
  });

  it('shows the role strip with the stage, the node and its role', () => {
    // ARRANGE
    const { $, data } = level('en', OPEN);
    const words = data.scenarios.drive!.words;
    // ACT
    const strip = $('[data-role-strip="verify"]').text();
    // ASSERT
    expect(strip).toContain(words.nodes.verify!.label);
    expect(strip).toContain(words.nodes.verify!.role);
    expect(strip).toContain(words.stages.verify!.name);
    expect(strip).toContain('Cells in play');
  });

  it('offers the way back to the workflow only from a node', () => {
    // ARRANGE
    const fromNode = level('en', OPEN).$;
    const fromDefinition = level('en', [{ type: 'zoom', level: 'agent' }]).$;
    // ACT
    const seen = [fromNode('[data-agent-back]').text(), fromDefinition('[data-agent-back]').length];
    // ASSERT
    expect(seen).toEqual(['⤢ Back to the workflow', 0]);
  });

  it('adds the node’s example to a Cell entered from a node, with Workflow › node › Cell crumbs, in both locales', () => {
    // ARRANGE
    const cell = { move: 'evaluate-each-step', trait: 'relentless' } as const;
    const open = [...OPEN, { type: 'openCell', cell } as const];
    // ACT
    const seen = (['en', 'de'] as const).map((locale) => {
      const { $, data } = level(locale, open);
      const said = data.scenarios.drive!.words;
      const id = data.scenarios
        .drive!.scenario.nodes.find((node) => node.id === 'verify')!
        .cells.find((one) => one.move === cell.move && one.trait === cell.trait)!.id;
      return { $, said: said.cells[id]!, crumbs: $('nav').text() };
    });
    // ASSERT
    for (const { $, said, crumbs } of seen) {
      expect($('[data-example-side="freelancer"]').text()).toContain(said.freelancer);
      expect($('[data-example-side="ai"]').text()).toContain(said.ai);
      expect(crumbs).toContain('Workflow');
    }
    expect(seen[0]!.said.ai).not.toBe(seen[1]!.said.ai);
  });

  it('counts a Cell entered from a node within that node’s Cells only', () => {
    // ARRANGE
    const { data } = level('en', OPEN);
    const verify = data.scenarios.drive!.scenario.nodes.find((node) => node.id === 'verify')!;
    const [first] = verify.cells;
    // ACT
    const { $ } = level('en', [...OPEN, { type: 'openCell', cell: { move: first!.move, trait: first!.trait } }]);
    // ASSERT
    expect($('[data-cell-view] .ml-auto').text()).toContain(`1 / ${verify.cells.length}`);
  });

  it('titles the Agent view by the node it was entered from', () => {
    // ARRANGE
    const { data, state } = level('en', OPEN);
    const tabs = { ...data.definitions, stages: data.stages.drive! };
    // ACT
    const title = titleOf(data, tabs, { ...state, nodeLabel: 'Verify' });
    // ASSERT
    expect(title).toBe('Verify agent · PRICE × BRIEF in this stage');
  });
});

describe('failure cases', () => {
  it('shows the plain matrix, with no strip and no mark, after the node is dropped by a zoom', () => {
    // ARRANGE
    const { $ } = level('en', [...OPEN, { type: 'zoom', level: 'define' }, { type: 'zoom', level: 'agent' }]);
    // ACT
    const marks = $('[data-mark]')
      .toArray()
      .map((el) => $(el).attr('data-mark'));
    // ASSERT
    expect($('[data-role-strip]')).toHaveLength(0);
    expect(new Set(marks)).toEqual(new Set(['on']));
  });
});

describe('edge cases', () => {
  it('leaves a Cell the node does not meet inert even when the counters table fills it', () => {
    // ARRANGE
    const data = explorableData('en');
    const node = data.scenarios.drive!.scenario.nodes[0]!;
    // ACT
    const html = renderToStaticMarkup(
      createElement(Matrix, {
        words: data.words.matrix,
        traits: data.definitions.price.rows,
        moves: data.definitions.brief.rows,
        counters: data.matrix.counters,
        node,
        lit: null,
        handlers: HANDLERS,
      }),
    );
    // ASSERT
    expect(html.match(/data-mark="(mark|context)"/g)).toHaveLength(node.cells.length);
  });
});
