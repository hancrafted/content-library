import { describe, expect, it } from 'vitest';
import { callbacksFor, shownWorkflow, slicesOf, uploadEvent } from './human-in-the-loop-slices.pure';
import type { HumanInTheLoopData, UiWords } from './human-in-the-loop.types';
import { flow as baseFlow, job as baseJob, stage } from './workflow-fixture.pure';
import { createState, type WorkflowEvent } from './workflow-state.pure';
import { workflowView } from './workflow-view.pure';
import type { Workflow } from './workflow.types';

const job = baseJob({ id: 'ask', title: 'Ask' });
const flow = (id: string): Workflow => ({ ...baseFlow([stage('s', [job])]), id, title: id });
const words = {} as UiWords;
const data: HumanInTheLoopData = {
  workflows: [flow('one'), flow('two')],
  workflowId: 'two',
  locale: 'en',
  words,
  controls: {},
  level: 'simple',
  readonly: false,
};
const shown = (workflow: Workflow, state: ReturnType<typeof createState>) => ({
  data,
  state,
  workflow,
  view: workflowView(workflow, state),
});
const start = { workflowId: data.workflowId, level: data.level };

describe('success cases', () => {
  it('shows the chosen Workflow, and an uploaded one over it', () => {
    // ARRANGE
    const state = createState(start);
    const mine = flow('mine');
    // ACT
    const chosen = shownWorkflow(data, state);
    const uploaded = shownWorkflow(data, { ...state, uploaded: mine });
    // ASSERT
    expect(chosen?.id).toBe(start.workflowId);
    expect(uploaded).toBe(mine);
  });

  it('gives the modal the open stage and each callback sends its own event', () => {
    // ARRANGE
    const sent: WorkflowEvent[] = [];
    const on = callbacksFor((event) => sent.push(event));
    const state = { ...createState(start), openStageId: 's' };
    // ACT
    const slices = slicesOf(shown(flow('two'), state), on);
    slices.diagram.onOpenStage('s');
    slices.modal.onClose();
    // ASSERT
    expect(slices.modal.stage?.id).toBe('s');
    expect(sent).toEqual([{ type: 'open', stageId: 's' }, { type: 'close' }]);
  });

  it('gives the modal the pasted values and sends a change up as one slots event', () => {
    // ARRANGE
    const sent: WorkflowEvent[] = [];
    const on = callbacksFor((event) => sent.push(event));
    const state = { ...createState(start), slotValues: { spec: 'S' } };
    // ACT
    const { modal } = slicesOf(shown(flow('two'), state), on);
    modal.onSlots({ spec: 'S2' });
    // ASSERT
    expect(modal.slotValues).toEqual({ spec: 'S' });
    expect(sent).toEqual([{ type: 'slots', values: { spec: 'S2' } }]);
  });
});

describe('failure cases', () => {
  it('gives no modal for a stage id the Workflow does not have', () => {
    // ARRANGE
    const state = { ...createState(start), openStageId: 'ghost' };
    // ACT
    const slices = slicesOf(
      shown(flow('two'), state),
      callbacksFor(() => undefined),
    );
    // ASSERT
    expect(slices.modal.stage).toBeNull();
  });

  it('turns a file that is not a Workflow into an upload-failed event with its problems', () => {
    // ARRANGE
    const notAWorkflow = 'stages: [';
    // ACT
    const event = uploadEvent(notAWorkflow);
    // ASSERT
    expect(event.type).toBe('upload-failed');
  });
});

describe('edge cases', () => {
  it('hands the parts the readonly flag of the Preset, so none shows a Try it button or the Technical toggle', () => {
    // ARRANGE
    const state = createState(start);
    const workflow = flow('two');
    // ACT
    const slices = slicesOf(
      { data: { ...data, readonly: true }, state, workflow, view: workflowView(workflow, state) },
      callbacksFor(() => undefined),
    );
    // ASSERT
    expect([slices.diagram.readonly, slices.toolbar.readonly]).toEqual([true, true]);
  });

  it('opens no modal while no stage is open, and hands no part the state or dispatch', () => {
    // ARRANGE
    const state = createState(start);
    // ACT
    const slices = slicesOf(
      shown(flow('two'), state),
      callbacksFor(() => undefined),
    );
    // ASSERT
    expect(slices.modal.stage).toBeNull();
    for (const part of Object.values(slices)) expect(Object.keys(part)).not.toContain('dispatch');
    for (const part of Object.values(slices)) expect(Object.keys(part)).not.toContain('state');
  });
});
