import { describe, expect, it } from 'vitest';
import { callbacksFor, progressTarget, shownWorkflow, slicesOf, uploadEvent } from './human-in-the-loop-slices.pure';
import type { HumanInTheLoopData, UiWords } from './human-in-the-loop.types';
import summerPartyEn from './summer-party.en.yml';
import { workflowOf } from './workflow-file-adapter.pure';
import { flow as baseFlow, job as baseJob, stage } from './workflow-fixture.pure';
import { loadWorkflow } from './workflow-loader.pure';
import { createState, type WorkflowEvent } from './workflow-state.pure';
import { workflowView } from './workflow-view.pure';
import type { Workflow } from './workflow.types';

const job = baseJob({ id: 'ask', title: 'Ask' });
const flow = (id: string): Workflow => ({ ...baseFlow([stage('s', [job])]), id, title: id });
const words = {} as UiWords;
const data: HumanInTheLoopData = {
  workflows: [flow('one'), flow('two')],
  workflowId: 'two',
  hashes: {},
  locale: 'en',
  words,
  controls: {},
  level: 'simple',
  view: 'presentation',
  readonly: false,
};
const shown = (workflow: Workflow, state: ReturnType<typeof createState>) => ({
  data,
  state,
  workflow,
  note: null,
  view: workflowView(workflow, state),
});
const start = { workflowId: data.workflowId, level: data.level, view: data.view };

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

  it('sends the stage and the job a job card opens, and gives the modal the job', () => {
    // ARRANGE
    const sent: WorkflowEvent[] = [];
    const on = callbacksFor((event) => sent.push(event));
    const state = { ...createState(start), openStageId: 's', openJobId: 'j' };
    // ACT
    const slices = slicesOf(shown(flow('two'), state), on);
    slices.diagram.onOpenStage('s', 'j');
    // ASSERT
    expect(slices.modal.jobId).toBe('j');
    expect(sent).toEqual([{ type: 'open', stageId: 's', jobId: 'j' }]);
  });

  it('gives the toolbar and the diagram the view, and the view control sends a view event', () => {
    // ARRANGE
    const sent: WorkflowEvent[] = [];
    const on = callbacksFor((event) => sent.push(event));
    const state = { ...createState(start), view: 'detailed' as const };
    // ACT
    const slices = slicesOf(shown(flow('two'), state), on);
    slices.toolbar.onView('handson');
    // ASSERT
    expect([slices.toolbar.view, slices.diagram.view]).toEqual(['detailed', 'detailed']);
    expect(sent).toEqual([{ type: 'view', view: 'handson' }]);
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

  it('shows the modal the results by marker name and sends a change up keyed by result', () => {
    // ARRANGE
    const loaded = loadWorkflow(summerPartyEn);
    if ('problems' in loaded) throw new Error(loaded.problems.join('\n'));
    const real = workflowOf(loaded.file);
    const sent: WorkflowEvent[] = [];
    const on = callbacksFor((event) => sent.push(event));
    const state = { ...createState(start), openStageId: 'research', slotValues: { 'research.venue#2': 'R2' } };
    const rounds = [1, 2, 3];
    // ACT
    const { modal } = slicesOf(shown(real, state), on);
    modal.onSlots({ research_3: 'R3' });
    // ASSERT
    expect(modal.slotValues).toEqual({ research_2: 'R2' });
    expect(modal.run?.rounds.map((round) => round.number)).toEqual(rounds);
    expect(sent).toEqual([{ type: 'slots', values: { 'research.venue#3': 'R3' } }]);
  });

  it('names the run of the shown authored Workflow by its key and the hash of its files', () => {
    // ARRANGE
    const withHashes = { ...data, hashes: { one: 'h1', two: 'h2' } };
    // ACT
    const target = progressTarget(withHashes, createState(start));
    // ASSERT
    expect(target).toEqual({ key: 'human-in-the-loop/two', hash: 'h2' });
  });

  it('hands the toolbar the note about saved progress', () => {
    // ARRANGE
    const state = createState(start);
    const workflow = flow('two');
    const note = { kind: 'stale', onDownload: () => undefined, onDiscard: () => undefined } as const;
    // ACT
    const slices = slicesOf(
      { data, state, workflow, note, view: workflowView(workflow, state) },
      callbacksFor(() => undefined),
    );
    // ASSERT
    expect(slices.toolbar.note).toBe(note);
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
  it('keeps no run for an uploaded Workflow', () => {
    // ARRANGE
    const state = { ...createState(start), uploaded: flow('mine') };
    // ACT
    const target = progressTarget({ ...data, hashes: { two: 'h2' } }, state);
    // ASSERT
    expect(target).toBeNull();
  });

  it('hands the parts the readonly flag of the Preset, so none shows a Try it button or the Technical toggle', () => {
    // ARRANGE
    const state = createState(start);
    const workflow = flow('two');
    // ACT
    const slices = slicesOf(
      { data: { ...data, readonly: true }, state, workflow, note: null, view: workflowView(workflow, state) },
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
