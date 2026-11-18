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
        state,
        counters: data.matrix.counters,
        braceRows: data.definitions.brace.rows,
        scenarios: data.scenarios,
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
  it('falls back to the first Scenario when the state names an unknown one', () => {
    // ARRANGE
    const known = render('en', [ZOOM]);
    const unknown = render('en', [ZOOM, { type: 'scenario', scenario: 'nope' }]);
    // ACT
    const label = (page: typeof known) => page('[data-workflow]').first().attr('aria-label');
    // ASSERT
    expect(label(unknown)).toBe(label(known));
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

  it('keeps the BRACE steps and Play in the footer, after the Workflow', () => {
    // ARRANGE
    const $ = render('en', [ZOOM]);
    // ACT
    const footer = $('[data-workflow-foot]');
    const order = $('[data-workflow-root], [data-workflow-foot]')
      .toArray()
      .map((el) => ('data-workflow-foot' in el.attribs ? 'foot' : 'root'));
    // ASSERT
    expect(footer.find('[data-brace-steps] [data-play]')).toHaveLength(1);
    expect(order).toEqual(['root', 'foot']);
  });

  it('gives a focused node a visible ring, in tokens only', () => {
    // ARRANGE
    const $ = render('en', [ZOOM]);
    // ACT
    const box = $('[data-workflow]').first().find('[data-node]').first();
    // ASSERT
    expect(box.attr('class')).toContain('group');
    expect(box.find('rect').first().attr('class')).toContain('group-focus-visible:stroke-ring');
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
