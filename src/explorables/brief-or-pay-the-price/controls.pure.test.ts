import { describe, expect, it } from 'vitest';
import { CONTROL_IDS, offers, toolsOf, type ToolsInput } from './controls.pure';
import { start, step, type ExplorableEvent } from './explorable-state.pure';

const stateAt = (...events: ExplorableEvent[]) => events.reduce(step, start({ price: 5, brief: 5, brace: 5 }, 'drive'));
const WORKFLOW: ExplorableEvent = { type: 'zoom', level: 'workflow' };
const AGENT: ExplorableEvent = { type: 'zoom', level: 'agent' };
const EXPERIMENT: ExplorableEvent = {
  type: 'layer',
  layer: 'thoughtExperiment',
};
const tools = (input: Partial<ToolsInput> & Pick<ToolsInput, 'state'>) =>
  toolsOf({ controls: {}, scenarios: 2, unfilled: [], ...input });

describe('success cases', () => {
  it('offers every registered control until a Preset hides it', () => {
    // ARRANGE
    const hidden = { scenarioPicker: { show: false } };
    // ACT
    const seen = CONTROL_IDS.map((id) => [offers({}, id), offers(hidden, id)]);
    // ASSERT
    expect(seen).toEqual([[true, false], ...CONTROL_IDS.slice(1).map(() => [true, true])]);
  });

  it('shows the picker with two Scenarios at the Workflow level, and the Workflow toggles', () => {
    // ARRANGE
    const state = stateAt(WORKFLOW);
    // ACT
    const found = tools({ state });
    // ASSERT
    expect(found).toEqual({
      picker: true,
      layers: ['thoughtExperiment', 'tryIt'],
    });
  });

  it('lets a Preset override one control and leave the rest to the registry', () => {
    // ARRANGE
    const state = stateAt(AGENT);
    // ACT
    const found = tools({ state, controls: { freelancer: { show: false } } });
    // ASSERT
    expect(found.layers).toEqual(['thoughtExperiment', 'habits']);
  });
});

describe('failure cases', () => {
  it('hides the picker with one Scenario, though the Preset allows it', () => {
    // ARRANGE
    const state = stateAt(WORKFLOW);
    // ACT
    const found = tools({
      state,
      scenarios: 1,
      controls: { scenarioPicker: { show: true } },
    });
    // ASSERT
    expect(found.picker).toBe(false);
  });

  it('hides the picker when the Preset says so, and outside the Workflow level', () => {
    // ARRANGE
    const hidden = { scenarioPicker: { show: false } };
    // ACT
    const found = [tools({ state: stateAt(WORKFLOW), controls: hidden }).picker, tools({ state: stateAt() }).picker];
    // ASSERT
    expect(found).toEqual([false, false]);
  });

  it('drops a toggle whose slot the Slide leaves empty', () => {
    // ARRANGE
    const state = stateAt(WORKFLOW);
    // ACT
    const found = tools({ state, unfilled: ['tryIt'] });
    // ASSERT
    expect(found.layers).toEqual(['thoughtExperiment']);
  });
});

describe('edge cases', () => {
  it('lets the thought experiment hide the picker and every other toggle', () => {
    // ARRANGE
    const state = stateAt(WORKFLOW, EXPERIMENT);
    // ACT
    const found = tools({ state });
    // ASSERT
    expect(found).toEqual({ picker: false, layers: ['thoughtExperiment'] });
  });

  it('shows no toggle at the Define level or inside a Cell', () => {
    // ARRANGE
    const cell = stateAt(AGENT, {
      type: 'openCell',
      cell: { move: 'break-it-down', trait: 'relentless' },
    });
    // ACT
    const found = [tools({ state: stateAt() }).layers, tools({ state: cell }).layers];
    // ASSERT
    expect(found).toEqual([[], []]);
  });
});
