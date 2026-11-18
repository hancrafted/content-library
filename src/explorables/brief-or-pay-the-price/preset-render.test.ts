import { load } from 'cheerio';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { BriefOrPayThePrice } from './brief-or-pay-the-price';
import { explorableData } from './brief-or-pay-the-price-data';
import { BriefOrPayThePriceClient } from './brief-or-pay-the-price.client';
import type { Preset } from './brief-or-pay-the-price.types';

const html = (element: Parameters<typeof renderToStaticMarkup>[0]) => load(renderToStaticMarkup(element));
const BOTH_TOGGLES = 2;
const WORKFLOW_ON: Preset = {
  view: 'stages',
  level: 'workflow',
  scenario: 'drive',
  picker: true,
  layers: ['tryIt'],
};
const clientOf = (locale: string, preset: Preset, slots: { habits?: string; tryIt?: string } = {}) => {
  const data = explorableData(locale);
  return html(
    createElement(BriefOrPayThePriceClient, {
      preset,
      words: data.words,
      definitions: data.definitions,
      stages: data.stages,
      scenarios: data.scenarios,
      matrix: data.matrix,
      habits: slots.habits === undefined ? undefined : createElement('p', { id: 'habits-child' }, slots.habits),
      tryIt: slots.tryIt === undefined ? undefined : createElement('p', { id: 'try-child' }, slots.tryIt),
    }),
  );
};

describe('success cases', () => {
  it.each(['en', 'de'])('Seam 3: the play Preset opens on the PRICE tab at the Define level in %s', (locale) => {
    // ARRANGE
    const $ = html(createElement(BriefOrPayThePrice, { preset: 'play', locale }));
    // ACT
    const level = $('[data-explorable]').attr('data-level');
    const pressed = $('[data-view-go][aria-pressed="true"]').attr('data-view-go');
    // ASSERT
    expect({ level, pressed }).toEqual({ level: 'define', pressed: 'price' });
  });

  it.each(['en', 'de'])('Seam 3: the drive Preset opens at the Workflow level on DRIVE in %s', (locale) => {
    // ARRANGE
    const $ = html(createElement(BriefOrPayThePrice, { preset: 'drive', locale }));
    // ACT
    const level = $('[data-explorable]').attr('data-level');
    const pressed = $('[data-zoom-go][aria-pressed="true"]').attr('data-zoom-go');
    // ASSERT
    expect({ level, pressed }).toEqual({ level: 'workflow', pressed: 'workflow' });
  });

  it('opens with a toggle on and its slot filled by the Slide, the toggle shown pressed', () => {
    // ARRANGE
    const $ = clientOf('en', WORKFLOW_ON, { habits: 'h', tryIt: 'the human in the loop' });
    // ACT
    const region = $('[data-slot="tryIt"] #try-child').text();
    const pressed = $('[data-layer-go="tryIt"]').attr('aria-pressed');
    // ASSERT
    expect({ region, pressed }).toEqual({ region: 'the human in the loop', pressed: 'true' });
  });

  it('shows the Try it toggle once its slot is filled, and the habits toggle at the Agent level', () => {
    // ARRANGE
    const workflow = clientOf('en', { ...WORKFLOW_ON, layers: [] }, { tryIt: 't' });
    const agent = clientOf('en', { ...WORKFLOW_ON, level: 'agent', layers: [] }, { habits: 'h' });
    // ACT
    const toggles = { workflow: workflow('[data-layer-go]').length, agent: agent('[data-layer-go="habits"]').length };
    // ASSERT
    expect(toggles).toEqual({ workflow: BOTH_TOGGLES, agent: 1 });
  });
});

describe('failure cases', () => {
  it('draws no Scenario button when the Preset hides the picker', () => {
    // ARRANGE
    const $ = clientOf('en', { ...WORKFLOW_ON, picker: false, layers: [] });
    // ACT
    const pickers = $('[data-scenario-picker]').length;
    // ASSERT
    expect(pickers).toBe(0);
  });

  it('shows no toggle and no region for a slot the Slide leaves empty, even when the Preset asks for it', () => {
    // ARRANGE
    const $ = clientOf('en', WORKFLOW_ON);
    // ACT
    const found = { toggle: $('[data-layer-go="tryIt"]').length, region: $('[data-slot="tryIt"]').length };
    // ASSERT
    expect(found).toEqual({ toggle: 0, region: 0 });
  });
});

describe('edge cases', () => {
  it('opens at the Agent level with the habits toggle on and its slot filled', () => {
    // ARRANGE
    const preset: Preset = { ...WORKFLOW_ON, level: 'agent', layers: ['habits'] };
    // ACT
    const $ = clientOf('en', preset, { habits: 'the context window' });
    // ASSERT
    expect($('[data-slot="habits"] #habits-child').text()).toBe('the context window');
  });
});
