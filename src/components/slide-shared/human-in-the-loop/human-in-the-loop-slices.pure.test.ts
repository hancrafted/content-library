import { progressFile } from '@/lib/progress.pure';
import { describe, expect, it } from 'vitest';
import {
  callbacksFor,
  progressTarget,
  progressUploadEvent,
  shownWorkflow,
  slicesOf,
  uploadEvent,
} from './human-in-the-loop-slices.pure';
import type { HumanInTheLoopData, UiWords } from './human-in-the-loop.types';
import vacationEn from './vacation.en.yml';
import { workflowOf } from './workflow-file-adapter.pure';
import { flow as baseFlow, job as baseJob, stage } from './workflow-fixture.pure';
import { loadWorkflow } from './workflow-loader.pure';
import { createState, type WorkflowEvent } from './workflow-state.pure';
import { workflowView } from './workflow-view.pure';
import type { Workflow } from './workflow.types';

const noop = () => undefined;
const job = baseJob({ id: 'ask', title: 'Ask' });
const flow = (id: string): Workflow => ({ ...baseFlow([stage('s', [job])]), id, title: id });
const words = {
  refuseUnreadable: 'Not a progress file.',
  refuseOtherWorkflow: 'This file is progress of another Workflow, not {workflow}.',
  refuseChanged: '{workflow} changed since this file was made.',
} as UiWords;
const target = { id: 'two', key: 'human-in-the-loop/two', hash: 'h2' };
const entry = { hash: 'h2', teaching: false, results: { 'a.b': 'text' } };
const refusal = (text: string, shownTarget = target) =>
  progressUploadEvent(text, { ...shownTarget, title: 'Two' }, words);
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
  progress: null,
  view: workflowView(workflow, state),
});
const start = { workflowId: data.workflowId, level: data.level, view: data.view };

const slicesFor = (state: ReturnType<typeof createState>, controls = {}, sent: WorkflowEvent[] = []) =>
  slicesOf(
    { ...shown(flow('two'), state), data: { ...data, controls } },
    callbacksFor((event) => sent.push(event)),
  );

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
    const loaded = loadWorkflow(vacationEn);
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

  it('hands the diagram the run of the pasted results, round states included, for the Hands-on view', () => {
    // ARRANGE
    const loaded = loadWorkflow(vacationEn);
    if ('problems' in loaded) throw new Error(loaded.problems.join('\n'));
    const real = workflowOf(loaded.file);
    const on = callbacksFor(() => undefined);
    const state = { ...createState(start), slotValues: { 'research.venue#2': 'R2', 'research.venue.checked#2': 'ok' } };
    // ACT
    const { diagram } = slicesOf(shown(real, state), on);
    const research = diagram.run?.stages.find((each) => each.id === 'research');
    // ASSERT
    expect(research?.rounds.map((round) => round.state)).toEqual(['open', 'checked', 'open']);
  });

  it('names the run of the shown authored Workflow by its key and the hash of its files', () => {
    // ARRANGE
    const withHashes = { ...data, hashes: { one: 'h1', two: 'h2' } };
    // ACT
    const target = progressTarget(withHashes, createState(start));
    // ASSERT
    expect(target).toEqual(target);
  });

  it('restores the run of a progress file made for the shown Workflow and its version', () => {
    // ARRANGE
    const { text } = progressFile('two', entry);
    // ACT
    const event = refusal(text);
    // ASSERT
    expect(event).toEqual({ type: 'restore', results: entry.results, teaching: entry.teaching });
  });

  it('hands the toolbar the note about saved progress', () => {
    // ARRANGE
    const state = createState(start);
    const workflow = flow('two');
    const note = { kind: 'stale', onDownload: () => undefined, onDiscard: () => undefined } as const;
    // ACT
    const slices = slicesOf(
      { data, state, workflow, note, progress: null, view: workflowView(workflow, state) },
      callbacksFor(() => undefined),
    );
    // ASSERT
    expect(slices.toolbar.note).toBe(note);
  });

  it('hands the toolbar and the modal the same teaching state: on, free to change, no saved work', () => {
    // ARRANGE
    const state = createState(start);
    // ACT
    const { toolbar, modal } = slicesFor(state);
    // ASSERT
    const expected = { show: true, resetShow: true, on: true, locked: false, hasWork: false };
    expect(toolbar.teaching).toEqual(expected);
    expect(modal.teaching).toEqual(expected);
  });

  it('locks teaching and marks saved work once a result is pasted', () => {
    // ARRANGE
    const state = { ...createState(start), teaching: false, slotValues: { 's.ask': 'answer' } };
    // ACT
    const { toolbar } = slicesFor(state);
    // ASSERT
    expect(toolbar.teaching).toMatchObject({ on: false, locked: true, hasWork: true });
  });

  it('sends the switch and Reset up as events, from the toolbar and from the modal', () => {
    // ARRANGE
    const sent: WorkflowEvent[] = [];
    const { toolbar, modal } = slicesFor(createState(start), {}, sent);
    // ACT
    toolbar.onTeaching(false);
    modal.onReset();
    // ASSERT
    expect(sent).toEqual([{ type: 'teaching', teaching: false }, { type: 'reset' }]);
  });

  it('lets a Preset hide the switch and Reset, in both places', () => {
    // ARRANGE
    const controls = { teaching: { show: false }, reset: { show: false } };
    // ACT
    const { toolbar, modal } = slicesFor(createState(start), controls);
    // ASSERT
    expect([toolbar.teaching, modal.teaching]).toEqual([
      expect.objectContaining({ show: false, resetShow: false }),
      expect.objectContaining({ show: false, resetShow: false }),
    ]);
  });

  it('hides them for a readonly Preset', () => {
    // ARRANGE
    const state = createState(start);
    const workflow = flow('two');
    // ACT
    const { toolbar } = slicesOf({ ...shown(workflow, state), data: { ...data, readonly: true } }, callbacksFor(noop));
    // ASSERT
    expect(toolbar.teaching).toMatchObject({ show: false, resetShow: false });
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

  it('refuses a progress file of another Workflow, naming the shown one', () => {
    // ARRANGE
    const { text } = progressFile('one', entry);
    // ACT
    const event = refusal(text);
    // ASSERT
    expect(event).toEqual({ type: 'upload-failed', problems: ['This file is progress of another Workflow, not Two.'] });
  });

  it('refuses a progress file made against an edited Workflow, naming it', () => {
    // ARRANGE
    const { text } = progressFile('two', { ...entry, hash: 'older' });
    // ACT
    const event = refusal(text);
    // ASSERT
    expect(event).toEqual({ type: 'upload-failed', problems: ['Two changed since this file was made.'] });
  });

  it('refuses a file that is no progress file', () => {
    // ARRANGE
    const text = 'id: a Workflow, not progress';
    // ACT
    const event = refusal(text);
    // ASSERT
    expect(event).toEqual({ type: 'upload-failed', problems: ['Not a progress file.'] });
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
  it('hands the toolbar no progress actions for an uploaded Workflow, which is not kept', () => {
    // ARRANGE
    const state = { ...createState(start), uploaded: flow('mine') };
    const workflow = flow('mine');
    // ACT
    const slices = slicesOf(
      { data, state, workflow, note: null, progress: null, view: workflowView(workflow, state) },
      callbacksFor(() => undefined),
    );
    // ASSERT
    expect(slices.toolbar.progress).toBeNull();
  });

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
      {
        data: { ...data, readonly: true },
        state,
        workflow,
        note: null,
        progress: null,
        view: workflowView(workflow, state),
      },
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
