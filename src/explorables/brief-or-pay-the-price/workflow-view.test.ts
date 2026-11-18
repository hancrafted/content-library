import { load } from 'cheerio';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import type { Layout, Orientation } from './scenario.types';
import { scenarioFor } from './scenarios';
import { anchorOf, groupBoxOf, litOf, pillAt, stepState } from './workflow-annotations.pure';
import { wrapWords } from './workflow-node-view';
import { WorkflowView } from './workflow-view';
import type { WorkflowWords } from './workflow.types';

const scenario = scenarioFor('drive');
const words = scenario.i18n.en;
const ui: WorkflowWords = { goal: 'Goal', thenGoal: 'then the goal', zoomNode: '{label}, {role}: zoom in' };
const render = (orient: Orientation, step: number, extra: { counters?: () => boolean } = {}) =>
  load(
    renderToStaticMarkup(
      createElement(WorkflowView, { scenario, layout: scenario.layouts[orient], words, ui, step, ...extra }),
    ),
  );
const lit = ($: ReturnType<typeof load>, kind: string): string[] =>
  $(`[data-${kind}][data-lit="true"]`)
    .toArray()
    .map((el) => $(el).attr(`data-${kind}`) ?? '');

describe('success cases', () => {
  it.each(['horizontal', 'vertical'] as const)('draws every stage band, node, edge and the goal (%s)', (orient) => {
    // ARRANGE
    const $ = render(orient, 0);
    // ACT
    const counts = [$('[data-band]').length, $('[data-node]').length, $('[data-edge]').length, $('[data-goal]').length];
    // ASSERT
    expect(counts).toEqual([scenario.stages.length, scenario.nodes.length, scenario.edges.length, 1]);
  });

  it('names each band by its acronym letter and its stage words', () => {
    // ARRANGE
    const $ = render('horizontal', 0);
    // ACT
    const labels = $('[data-band-labels] text')
      .toArray()
      .map((el) => $(el).text());
    // ASSERT
    expect(labels.map((label) => label.slice(0, 1))).toEqual(['D', 'R', 'I', 'V', 'E']);
    expect(labels[0]).toContain(words.stages.define?.name);
  });

  it('lights only the current letter and shows letters 1..step (cumulative)', () => {
    // ARRANGE
    const $ = render('horizontal', 3);
    // ACT
    const shown = $('[data-letter][data-shown="true"]')
      .toArray()
      .map((el) => $(el).attr('data-letter'));
    // ASSERT
    expect(shown).toEqual(['B', 'R', 'A']);
    expect(lit($, 'node').sort()).toEqual(['implement-a', 'implement-b']);
    expect(lit($, 'band')).toEqual(['implement']);
  });

  it('lights the goal at step 1 (B) and the contract edges at step 4 (C)', () => {
    // ARRANGE
    const first = render('horizontal', 1);
    const fourth = render('horizontal', 4);
    // ACT
    const goalAtB = first('[data-goal]').attr('data-lit');
    const edgesAtC = lit(fourth, 'edge');
    const contractEdges = scenario.edges.length - 1;
    // ASSERT
    expect(goalAtB).toBe('true');
    expect(edgesAtC).toHaveLength(contractEdges);
  });

  it('looks up annotation words by id from the Scenario', () => {
    // ARRANGE
    const $ = render('horizontal', 5);
    // ACT
    const text = $('[data-annotations]').text();
    // ASSERT
    expect(text).toContain(words.annotations['b-arrow']);
    expect(text).toContain(words.annotations['c-pr']);
  });

  it('draws one primitive per annotation type used by the Scenario', () => {
    // ARRANGE
    const $ = render('horizontal', 5);
    // ACT
    const types = new Set(
      $('[data-annotation]')
        .toArray()
        .map((el) => $(el).attr('data-annotation')),
    );
    // ASSERT
    expect([...types].sort()).toEqual(['arrow', 'chip', 'group', 'mark', 'tag']);
  });

  it('draws the Cell badge with a marked square for each Cell of the node', () => {
    // ARRANGE
    const $ = render('horizontal', 0);
    // ACT
    const marked = $('[data-badge="define"] [data-cell="on"]').length;
    const cells = scenario.nodes[0]?.cells.length;
    // ASSERT
    expect(marked).toBe(cells);
  });
});

describe('failure cases', () => {
  it('draws no annotation at step 0', () => {
    // ARRANGE
    const $ = render('horizontal', 0);
    // ACT
    const shown = $('[data-letter][data-shown="true"]').length;
    // ASSERT
    expect(shown).toBe(0);
    expect(lit($, 'node')).toEqual([]);
  });

  it('outlines a Cell the counters table lacks, instead of marking it', () => {
    // ARRANGE
    const $ = render('horizontal', 0, { counters: () => false });
    // ACT
    const outlined = $('[data-badge="define"] [data-cell="context"]').length;
    const cells = scenario.nodes[0]?.cells.length;
    // ASSERT
    expect(outlined).toBe(cells);
    expect($('[data-cell="on"]')).toHaveLength(0);
  });
});

describe('edge cases', () => {
  it('clamps a step beyond the last letter', () => {
    // ARRANGE
    const lastStep = ['B', 'R', 'A', 'C', 'E'].length;
    const state = stepState(scenario, lastStep + 94);
    // ACT
    const shown = state.shown;
    // ASSERT
    expect(shown).toBe(lastStep);
    expect(stepState(scenario, -lastStep).shown).toBe(0);
  });

  it('marks only earlier letters as past', () => {
    // ARRANGE
    const state = stepState(scenario, 3);
    // ACT
    const past = ['B', 'R', 'A', 'C', 'E'].filter((letter) => state.isPast(letter as 'B'));
    // ASSERT
    expect(past).toEqual(['B', 'R']);
  });

  it('puts the group text in the band label row on the vertical layout', () => {
    // ARRANGE
    const $ = render('vertical', 2);
    const band = scenario.layouts.vertical.stages.find((each) => each.id === 'implement');
    // ACT
    const group = $('[data-annotation="group"] g');
    const y = /translate\(\S+ (\S+?)\)/.exec(group.attr('transform') ?? '')?.[1];
    // ASSERT
    expect(Number(y)).toBe(band?.ly);
    expect(group.find('text').attr('text-anchor')).toBe('end');
  });

  it('routes the E loop over and the B arrow under in both orientations', () => {
    // ARRANGE
    const layouts: Layout[] = [scenario.layouts.horizontal, scenario.layouts.vertical];
    // ACT
    const lanes = layouts.map((layout) => [layout.lanes.under, layout.lanes.over]);
    // ASSERT
    expect(lanes.every(([under, over]) => under !== over)).toBe(true);
  });

  it('anchors each letter, preferring a drawn primitive over its highlight', () => {
    // ARRANGE
    const layout = scenario.layouts.horizontal;
    // ACT
    const b = anchorOf(scenario, layout, 'B');
    const a = anchorOf(scenario, layout, 'A');
    // ASSERT
    expect(b?.y).toBe(layout.lanes.under);
    expect(a).toEqual({ x: layout.nodes['implement-a']?.x, y: layout.nodes['implement-a']?.y });
  });

  it('unions the highlights of a letter', () => {
    // ARRANGE
    const result = litOf(scenario, 'E');
    // ACT
    const nodes = [...result.nodes];
    // ASSERT
    expect(nodes).toEqual(['verify', 'evolve']);
  });

  it('shrinks a pill to its room but never below a readable size', () => {
    // ARRANGE
    const room = 60;
    const floor = 11;
    const pill = pillAt({ x: 100, y: 50 }, 'a long chip text', { room });
    // ACT
    const size = pill.size;
    // ASSERT
    expect(size).toBe(floor);
    expect(pill.w).toBeLessThanOrEqual(room);
  });

  it('boxes a group around its nodes with the layout padding', () => {
    // ARRANGE
    const layout = scenario.layouts.horizontal;
    // ACT
    const widePadding = 24;
    const box = groupBoxOf(layout, ['implement-a', 'implement-b']);
    // ASSERT
    expect(box.pad).toBe(widePadding);
    expect(box.w).toBeGreaterThan(layout.nodes['implement-a']?.w ?? 0);
  });

  it('wraps role text on word boundaries', () => {
    // ARRANGE
    const limit = 12;
    const slack = 2;
    const lines = wrapWords('Decision docs, spec, tickets', limit);
    // ACT
    const joined = lines.join(' ');
    // ASSERT
    expect(joined).toBe('Decision docs, spec, tickets');
    expect(lines.every((line) => line.length <= limit + slack)).toBe(true);
  });
});
