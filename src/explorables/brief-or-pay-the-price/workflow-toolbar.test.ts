import { load } from 'cheerio';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { explorableData } from './brief-or-pay-the-price-data';
import { start, step, type ExplorableEvent } from './explorable-state.pure';
import { Toolbar } from './toolbar.client';

const data = explorableData('en');
const render = (scenarios: { id: string; name: string }[], events: ExplorableEvent[]) =>
  load(
    renderToStaticMarkup(
      createElement(Toolbar, {
        words: data.words,
        tabs: { ...data.definitions, stages: data.stages.drive as never },
        state: events.reduce(step, start({ price: 5, brief: 5, brace: 5 }, 'drive')),
        scenarios,
        title: '',
        onView: () => undefined,
        onScenario: () => undefined,
        onZoom: () => undefined,
        onLayer: () => undefined,
      }),
    ),
  );
const TWO = [
  { id: 'drive', name: 'DRIVE' },
  { id: 'other', name: 'OTHER' },
];
const WORKFLOW: ExplorableEvent = { type: 'zoom', level: 'workflow' };

describe('success cases', () => {
  it('puts one button per Scenario in the toolbar tools at the Workflow level, the current one pressed', () => {
    // ARRANGE
    const $ = render(TWO, [WORKFLOW]);
    // ACT
    const buttons = $('[data-tools] [data-scenario-go]');
    // ASSERT
    expect(buttons.toArray().map((el) => $(el).attr('data-scenario-go'))).toEqual(['drive', 'other']);
    expect($('[data-scenario-go][aria-pressed="true"]').attr('data-scenario-go')).toBe('drive');
  });
});

describe('failure cases', () => {
  it('draws no picker while only one Scenario is registered', () => {
    // ARRANGE
    const $ = render(TWO.slice(0, 1), [WORKFLOW]);
    // ACT
    const pickers = $('[data-scenario-picker]').length;
    // ASSERT
    expect(pickers).toBe(0);
  });
});

describe('edge cases', () => {
  it('draws no picker outside the Workflow level', () => {
    // ARRANGE
    const $ = render(TWO, []);
    // ACT
    const pickers = $('[data-scenario-picker]').length;
    // ASSERT
    expect(pickers).toBe(0);
  });
});
