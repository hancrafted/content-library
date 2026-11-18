import { describe, expect, it } from 'vitest';
import type { Preset } from './brief-or-pay-the-price.types';
import { presetStart } from './preset-state.pure';

const COUNTS = { price: 5, brief: 5, brace: 5, 'stages:drive': 5 };
const DEFINE: Preset = { view: 'price', level: 'define', scenario: 'drive', controls: {}, layers: [] };
const WORKFLOW: Preset = {
  view: 'stages',
  level: 'workflow',
  scenario: 'drive',
  controls: { scenarioPicker: { show: false } },
  layers: [],
};

describe('success cases', () => {
  it('opens on the Preset’s Definition tab and Scenario', () => {
    // ARRANGE
    const preset: Preset = { ...DEFINE, view: 'brace', scenario: 'other' };
    // ACT
    const state = presetStart(COUNTS, preset);
    // ASSERT
    expect({ level: state.level, view: state.view, scenario: state.scenario }).toEqual({
      level: 'define',
      view: 'brace',
      scenario: 'other',
    });
  });

  it('opens at the Workflow level on the Preset’s Scenario, with the first BRACE step shown', () => {
    // ARRANGE
    const expected = { level: 'workflow', scenario: 'drive', braceStep: 1 };
    // ACT
    const state = presetStart(COUNTS, WORKFLOW);
    // ASSERT
    expect({ level: state.level, scenario: state.scenario, braceStep: state.braceStep }).toEqual(expected);
  });

  it('opens with the Preset’s toggles on at its level', () => {
    // ARRANGE
    const preset: Preset = { ...WORKFLOW, layers: ['thoughtExperiment', 'tryIt'] };
    // ACT
    const state = presetStart(COUNTS, preset);
    // ASSERT
    expect(state.layers).toEqual({ agent: [], workflow: ['thoughtExperiment', 'tryIt'] });
  });
});

describe('failure cases', () => {
  it('leaves a toggle off when its slot is empty', () => {
    // ARRANGE
    const preset: Preset = { ...WORKFLOW, layers: ['thoughtExperiment', 'tryIt'] };
    // ACT
    const state = presetStart(COUNTS, preset, ['tryIt']);
    // ASSERT
    expect(state.layers.workflow).toEqual(['thoughtExperiment']);
  });
});

describe('edge cases', () => {
  it('opens at rest on the Define level with no toggles', () => {
    // ARRANGE
    const expected = { level: 'define', braceStep: 0, layers: { agent: [], workflow: [] } };
    // ACT
    const { level, braceStep, layers } = presetStart(COUNTS, DEFINE);
    // ASSERT
    expect({ level, braceStep, layers }).toEqual(expected);
  });
});
