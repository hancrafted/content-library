import { load } from 'cheerio';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { explorableData } from './brief-or-pay-the-price-data';
import { start, step } from './explorable-state.pure';
import { WorkflowLevel } from './workflow-level.client';

const render = (locale: 'en' | 'de', events: Parameters<typeof step>[1][] = []) => {
  const data = explorableData(locale);
  const state = events.reduce(step, start({ price: 5, brief: 5, brace: 5 }, 'drive'));
  return load(
    renderToStaticMarkup(
      createElement(WorkflowLevel, {
        words: data.words.workflow,
        locale,
        state,
        counters: data.matrix.counters,
        braceRows: data.definitions.brace.rows,
        stages: data.stages,
        dispatch: () => undefined,
      }),
    ),
  );
};
const ZOOM = { type: 'zoom', level: 'workflow' } as const;

describe('success cases', () => {
  it('renders both layouts so the container width can pick one', () => {
    // ARRANGE
    const $ = render('en', [ZOOM]);
    // ACT
    const orients = $('[data-workflow]')
      .toArray()
      .map((el) => $(el).attr('data-orient'));
    // ASSERT
    expect(orients).toEqual(['vertical', 'horizontal']);
  });

  it('gives each layout its own arrow marker so the ids stay unique', () => {
    // ARRANGE
    const $ = render('en', [ZOOM]);
    // ACT
    const ids = $('marker')
      .toArray()
      .map((el) => $(el).attr('id'));
    // ASSERT
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('offers one button per BRACE letter, named by its requirement, with the current step pressed', () => {
    // ARRANGE
    const $ = render('en', [ZOOM, { type: 'braceStep', step: 3 }]);
    // ACT
    const buttons = $('[data-step-go]');
    const pressed = $('[data-step-go][aria-pressed="true"]').attr('data-step-go');
    // ASSERT
    expect(buttons.toArray().map((el) => $(el).text())).toEqual(['B', 'R', 'A', 'C', 'E']);
    expect(buttons.first().attr('aria-label')).toBe('Backwards from the goal');
    expect(pressed).toBe('3');
  });

  it('shows the German words for the chrome and the Scenario', () => {
    // ARRANGE
    const $ = render('de', [ZOOM]);
    // ACT
    const label = $('[data-brace-steps]').attr('aria-label');
    // ASSERT
    expect(label).toBe('BRACE-Schritte');
    expect($('[data-goal]').first().text()).toContain('Ziel');
  });

  it('outlines the Cell the counters table lacks (Verify, evaluate each step against confident)', () => {
    // ARRANGE
    const $ = render('en', [ZOOM]);
    // ACT
    const outlined = $('[data-workflow]').first().find('[data-badge="verify"] [data-cell="context"]').length;
    // ASSERT
    expect(outlined).toBe(1);
  });
});

describe('failure cases', () => {
  it('draws no picker while only one Scenario is registered', () => {
    // ARRANGE
    const $ = render('en', [ZOOM]);
    // ACT
    const pickers = $('[data-scenario-picker]').length;
    // ASSERT
    expect(pickers).toBe(0);
  });
});

describe('edge cases', () => {
  it('labels the play button with its action and flips it while playing', () => {
    // ARRANGE
    const idle = render('en', [ZOOM]);
    const playing = render('en', [ZOOM, { type: 'play' }]);
    // ACT
    const labels = [idle('[data-play]').text(), playing('[data-play]').text()];
    // ASSERT
    expect(labels).toEqual(['Play', 'Pause']);
  });

  it('makes each node reachable as a button the delegated handler can find', () => {
    // ARRANGE
    const $ = render('en', [ZOOM]);
    // ACT
    const nodes = $('[data-workflow]').first().find('[data-node][role="button"][tabindex="0"]').length;
    // ASSERT
    expect(nodes).toBeGreaterThan(0);
  });
});
