import { describe, expect, it } from 'vitest';
import { start, step, type ExplorableEvent, type ExplorableState } from './explorable-state.pure';
import { hasLayer, layersOf } from './layer-state.pure';

const REST = start({ price: 5, brief: 5, brace: 5 }, 'drive');
const run = (events: readonly ExplorableEvent[], from: ExplorableState = REST) => events.reduce(step, from);
const AGENT: ExplorableEvent = { type: 'zoom', level: 'agent' };
const WORKFLOW: ExplorableEvent = { type: 'zoom', level: 'workflow' };
const toggle = (layer: 'thoughtExperiment' | 'freelancer' | 'habits' | 'tryIt'): ExplorableEvent => ({
  type: 'layer',
  layer,
});

describe('success cases', () => {
  it('Seam 1: toggling the thought experiment off returns to the same Workflow view', () => {
    // ARRANGE
    const before = run([WORKFLOW, { type: 'braceStep', step: 3 }]);
    // ACT
    const after = run([toggle('thoughtExperiment'), toggle('thoughtExperiment')], before);
    // ASSERT
    expect(after).toEqual(before);
  });

  it('Seam 1: toggling the thought experiment off returns to the same node on the Agent view', () => {
    // ARRANGE
    const before = run([WORKFLOW, { type: 'node', node: 'reason' }]);
    // ACT
    const during = run([toggle('thoughtExperiment')], before);
    const after = run([toggle('thoughtExperiment')], during);
    // ASSERT
    expect(hasLayer(during, 'thoughtExperiment')).toBe(true);
    expect(after.node).toBe(before.node);
    expect(after.level).toBe('agent');
  });

  it('Seam 1: keeps layers per view', () => {
    // ARRANGE
    const agentOn = run([AGENT, toggle('freelancer'), toggle('habits')]);
    // ACT
    const workflow = run([WORKFLOW, toggle('tryIt')], agentOn);
    const back = run([AGENT], workflow);
    // ASSERT
    expect(layersOf(workflow)).toEqual(['tryIt']);
    expect(layersOf(back)).toEqual(['freelancer', 'habits']);
  });
});

describe('failure cases', () => {
  it('ignores a layer the view does not have', () => {
    // ARRANGE
    const workflow = run([WORKFLOW]);
    // ACT
    const after = run([toggle('freelancer')], workflow);
    // ASSERT
    expect(after).toBe(workflow);
  });

  it('ignores a layer on a definition', () => {
    // ARRANGE
    const define = REST;
    // ACT
    const after = run([toggle('thoughtExperiment')], define);
    // ASSERT
    expect(after).toBe(define);
  });
});

describe('edge cases', () => {
  it('ignores a layer while a Cell is open', () => {
    // ARRANGE
    const inCell = run([AGENT, { type: 'openCell', cell: { move: 'break-it-down', trait: 'probabilistic' } }]);
    // ACT
    const after = run([toggle('habits')], inCell);
    // ASSERT
    expect(after).toBe(inCell);
  });
});
