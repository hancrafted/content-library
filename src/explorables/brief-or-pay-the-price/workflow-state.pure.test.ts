import { describe, expect, it } from 'vitest';
import { start, step, type ExplorableEvent, type ExplorableState } from './explorable-state.pure';
import { MAX_STEP } from './workflow-annotations.pure';

const REST = start({ price: 5, brief: 5, brace: 5 }, 'drive');
const run = (events: readonly ExplorableEvent[], from: ExplorableState = REST) => events.reduce(step, from);
const IN_WORKFLOW: readonly ExplorableEvent[] = [{ type: 'zoom', level: 'workflow' }];

describe('success cases', () => {
  it('zooms to the Workflow level at BRACE step one, remembering the definition it came from', () => {
    // ARRANGE
    const onBrace = run([{ type: 'view', view: 'brace' }]);
    // ACT
    const workflow = step(onBrace, { type: 'zoom', level: 'workflow' });
    // ASSERT
    expect(workflow).toMatchObject({ level: 'workflow', step: 1, arrival: 'brace', playing: false });
  });

  it('sets the BRACE step and stops a running play', () => {
    // ARRANGE
    const playing = run([...IN_WORKFLOW, { type: 'play' }]);
    const third = 3;
    // ACT
    const stepped = step(playing, { type: 'braceStep', step: third });
    // ASSERT
    expect(stepped).toMatchObject({ step: third, playing: false });
  });

  it('advances one step on each tick while playing and stops at the last letter', () => {
    // ARRANGE
    const ticks = Array.from({ length: MAX_STEP }, () => ({ type: 'tick' }) as const);
    // ACT
    const done = run([...IN_WORKFLOW, { type: 'play' }, ...ticks]);
    // ASSERT
    expect(done).toMatchObject({ step: MAX_STEP, playing: false });
  });

  it('zooms to the Agent level on a node click, remembering the node', () => {
    // ARRANGE
    const inWorkflow = run(IN_WORKFLOW);
    // ACT
    const agent = step(inWorkflow, { type: 'node', node: 'verify' });
    // ASSERT
    expect(agent).toMatchObject({ level: 'agent', node: 'verify', cell: null, arrival: REST.view });
  });
});

describe('failure cases', () => {
  it('ignores a tick when nothing is playing', () => {
    // ARRANGE
    const inWorkflow = run(IN_WORKFLOW);
    // ACT
    const next = step(inWorkflow, { type: 'tick' });
    // ASSERT
    expect(next).toBe(inWorkflow);
  });

  it('clamps a step outside 0 to the last letter', () => {
    // ARRANGE
    const beyond = MAX_STEP + MAX_STEP;
    // ACT
    const high = run([...IN_WORKFLOW, { type: 'braceStep', step: beyond }]);
    const low = run([...IN_WORKFLOW, { type: 'braceStep', step: -beyond }]);
    // ASSERT
    expect(high.step).toBe(MAX_STEP);
    expect(low.step).toBe(0);
  });
});

describe('edge cases', () => {
  it('restarts from the first letter when played from the last', () => {
    // ARRANGE
    const atEnd = run([...IN_WORKFLOW, { type: 'braceStep', step: MAX_STEP }]);
    // ACT
    const replay = step(atEnd, { type: 'play' });
    // ASSERT
    expect(replay).toMatchObject({ step: 1, playing: true });
  });

  it('pauses a running play on a second toggle', () => {
    // ARRANGE
    const playing = run([...IN_WORKFLOW, { type: 'play' }]);
    // ACT
    const paused = step(playing, { type: 'play' });
    // ASSERT
    expect(paused.playing).toBe(false);
  });

  it('leaves the Workflow with no step and no node when zooming to another level', () => {
    // ARRANGE
    const inWorkflow = run([...IN_WORKFLOW, { type: 'braceStep', step: 4 }]);
    // ACT
    const define = step(inWorkflow, { type: 'zoom', level: 'define' });
    // ASSERT
    expect(define).toMatchObject({ step: 0, node: null, level: 'define' });
  });

  it('keeps the picked Scenario across levels', () => {
    // ARRANGE
    const picked = run([{ type: 'scenario', scenario: 'other' }, ...IN_WORKFLOW]);
    // ACT
    const agent = step(picked, { type: 'node', node: 'a' });
    // ASSERT
    expect(agent.scenario).toBe('other');
  });
});
