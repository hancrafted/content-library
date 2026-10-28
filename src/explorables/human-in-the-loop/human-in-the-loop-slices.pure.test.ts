import { progressFile } from '@/shared/lib/progress-file.pure';
import { describe, expect, it } from 'vitest';
import {
  callbacksFor,
  progressTarget,
  progressUploadEvent,
  shownWorkflow,
  showWorkflow,
  slicesOf,
  uploadEvent,
} from './human-in-the-loop-slices.pure';
import type { HumanInTheLoopData, UiWords } from './human-in-the-loop.types';
import { workflowOf } from './workflow-file-adapter.pure';
import { flow as baseFlow, job as baseJob, stage } from './workflow-fixture.pure';
import { loadWorkflow } from './workflow-loader.pure';
import { runOf } from './workflow-run.pure';
import { createState, type WorkflowEvent } from './workflow-state.pure';
import { workflowView } from './workflow-view.pure';
import fixtureEn from './workflow.fixture.en.yml';
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
const entry = { hash: 'h2', demo: false, results: { 'a.b': 'text' } };
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
  view: 'stages',
  readonly: false,
};
const shown = (workflow: Workflow, state: ReturnType<typeof createState>) => ({
  ...showWorkflow(workflow, state),
  data,
  state,
  note: null,
  progress: null,
  debugAvailable: false,
});
const realFlow = (): Workflow => {
  const loaded = loadWorkflow(fixtureEn);
  if ('problems' in loaded) throw new Error(loaded.problems.join('\n'));
  return workflowOf(loaded.file);
};
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

  it('sends the round a job card of a repeated stage opens, and gives the modal the round', () => {
    // ARRANGE
    const sent: WorkflowEvent[] = [];
    const on = callbacksFor((event) => sent.push(event));
    const round = 2;
    const state = { ...createState(start), openStageId: 's', openJobId: 'j', openRound: round };
    // ACT
    const slices = slicesOf(shown(flow('two'), state), on);
    slices.diagram.onOpenStage('s', 'j', round);
    // ASSERT
    expect(slices.modal.round).toBe(round);
    expect(sent).toEqual([{ type: 'open', stageId: 's', jobId: 'j', round }]);
  });

  it('shows the Debug switch only where it is available, and sends the choice up as a debug event', () => {
    // ARRANGE
    const sent: WorkflowEvent[] = [];
    const on = callbacksFor((event) => sent.push(event));
    const state = createState(start);
    // ACT
    const hidden = slicesOf(shown(flow('two'), state), on);
    const visible = slicesOf({ ...shown(flow('two'), state), debugAvailable: true }, on);
    visible.toolbar.onDebug(true);
    // ASSERT
    expect(hidden.toolbar.debug).toEqual({ show: false, on: false });
    expect(visible.toolbar.debug).toEqual({ show: true, on: false });
    expect(sent).toEqual([{ type: 'debug', debug: true }]);
  });

  it('gives the modal its debug base only while debug is on and available: workflow, level, demo, locale and the short source hash', () => {
    // ARRANGE
    const on = callbacksFor(noop);
    const state = { ...createState(start), debug: true, demo: false, level: 'technical' as const };
    const withHash = { ...shown(flow('two'), state), debugAvailable: true };
    const hashed = { ...withHash, data: { ...data, hashes: { two: '0123456789abcdef' } } };
    // ACT
    const off = slicesOf({ ...hashed, state: { ...state, debug: false } }, on).modal.debug;
    const unavailable = slicesOf({ ...hashed, debugAvailable: false }, on).modal.debug;
    const base = slicesOf(hashed, on).modal.debug;
    const uploaded = slicesOf({ ...hashed, state: { ...state, uploaded: flow('two') } }, on).modal.debug;
    // ASSERT
    expect([off, unavailable]).toEqual([null, null]);
    expect(base).toEqual({
      workflow: { id: 'two', title: 'two' },
      level: 'technical',
      demo: false,
      locale: 'en',
      source: '01234567',
    });
    expect(uploaded?.source).toBe('uploaded');
  });

  it('gives the toolbar and the diagram the view, and the view control sends a view event', () => {
    // ARRANGE
    const sent: WorkflowEvent[] = [];
    const on = callbacksFor((event) => sent.push(event));
    const state = { ...createState(start), view: 'jobs' as const };
    // ACT
    const slices = slicesOf(shown(flow('two'), state), on);
    slices.toolbar.onView('stages');
    // ASSERT
    expect([slices.toolbar.view, slices.diagram.view]).toEqual(['jobs', 'jobs']);
    expect(sent).toEqual([{ type: 'view', view: 'stages' }]);
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
    const loaded = loadWorkflow(fixtureEn);
    if ('problems' in loaded) throw new Error(loaded.problems.join('\n'));
    const real = workflowOf(loaded.file);
    const sent: WorkflowEvent[] = [];
    const on = callbacksFor((event) => sent.push(event));
    const state = { ...createState(start), openStageId: 'each', slotValues: { 'each.look#2': 'R2' } };
    const rounds = [1, 2];
    // ACT
    const { modal } = slicesOf(shown(real, state), on);
    modal.onSlots({ note_1: 'R1' });
    // ASSERT
    expect(modal.slotValues).toEqual({ note_2: 'R2' });
    expect(modal.run?.rounds.map((round) => round.number)).toEqual(rounds);
    expect(sent).toEqual([{ type: 'slots', values: { 'each.look#1': 'R1' } }]);
  });

  it('hands the diagram the run of the pasted results, round states included, so both views show progress', () => {
    // ARRANGE
    const loaded = loadWorkflow(fixtureEn);
    if ('problems' in loaded) throw new Error(loaded.problems.join('\n'));
    const real = workflowOf(loaded.file);
    const on = callbacksFor(() => undefined);
    const checked = {
      'each.look#2': 'R2',
      'each.look.checked#2': 'ok',
      'each.judge#2': 'J2',
      'each.judge.checked#2': 'ok',
    };
    const state = { ...createState(start), slotValues: checked };
    // ACT
    const { diagram } = slicesOf(shown(real, state), on);
    const repeated = diagram.run?.stages.find((each) => each.id === 'each');
    // ASSERT
    expect(repeated?.rounds.map((round) => round.state)).toEqual(['open', 'checked']);
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
    expect(event).toEqual({ type: 'restore', results: entry.results, demo: entry.demo });
  });

  it("offers Reset's download of the run only where progress can be saved to a file", () => {
    // ARRANGE
    const state = createState(start);
    const download = () => undefined;
    const kept = { onDownload: download, onUpload: noop };
    // ACT
    const authored = slicesOf({ ...shown(flow('two'), state), progress: kept }, callbacksFor(noop));
    const uploaded = slicesOf(shown(flow('two'), state), callbacksFor(noop));
    // ASSERT
    expect(authored.toolbar.onDownloadRun).toBe(download);
    expect(uploaded.toolbar.onDownloadRun).toBeUndefined();
    expect(uploaded.modal.onDownloadRun).toBeUndefined();
  });

  it('lists each Workflow for the picker with its title and its description, where it has one', () => {
    // ARRANGE
    const described = { ...flow('one'), description: 'For the picker.' };
    const state = createState(start);
    // ACT
    const { toolbar } = slicesOf(
      { ...shown(flow('two'), state), data: { ...data, workflows: [described, flow('two')] } },
      callbacksFor(noop),
    );
    // ASSERT
    expect(toolbar.choices).toEqual([
      { id: 'one', title: 'one', description: 'For the picker.' },
      { id: 'two', title: 'two', description: undefined },
    ]);
  });

  it('hands the toolbar the note about saved progress', () => {
    // ARRANGE
    const state = createState(start);
    const workflow = flow('two');
    const note = { kind: 'stale', onDownload: () => undefined, onDiscard: () => undefined } as const;
    // ACT
    const slices = slicesOf(
      { ...showWorkflow(workflow, state), data, state, note, progress: null, debugAvailable: false },
      callbacksFor(() => undefined),
    );
    // ASSERT
    expect(slices.toolbar.note).toBe(note);
  });

  it('hands the toolbar and the modal the same demo state: on, free to change, no saved work', () => {
    // ARRANGE
    const state = createState(start);
    // ACT
    const { toolbar, modal } = slicesFor(state);
    // ASSERT
    const expected = { show: true, resetShow: false, on: true, locked: false, hasWork: false };
    expect(toolbar.demo).toEqual(expected);
    expect(modal.demo).toEqual(expected);
  });

  it('locks demo and marks saved work once a result is pasted', () => {
    // ARRANGE
    const state = { ...createState(start), demo: false, slotValues: { 's.ask': 'answer' } };
    // ACT
    const { toolbar } = slicesFor(state);
    // ASSERT
    expect(toolbar.demo).toMatchObject({ on: false, locked: true, hasWork: true });
  });

  it('shows Reset and Save progress only once the run has work, in both places', () => {
    // ARRANGE
    const fresh = createState(start);
    const worked = { ...fresh, slotValues: { 's.ask': 'answer' } };
    // ACT
    const before = slicesFor(fresh);
    const after = slicesFor(worked);
    // ASSERT
    expect([before.toolbar.demo.resetShow, before.modal.demo.resetShow, before.toolbar.canSave]).toEqual([
      false,
      false,
      false,
    ]);
    expect([after.toolbar.demo.resetShow, after.modal.demo.resetShow, after.toolbar.canSave]).toEqual([
      true,
      true,
      true,
    ]);
  });

  it('hands the diagram the run only once it has work, so both views show progress then', () => {
    // ARRANGE
    const loaded = loadWorkflow(fixtureEn);
    if ('problems' in loaded) throw new Error(loaded.problems.join('\n'));
    const real = workflowOf(loaded.file);
    const fresh = createState(start);
    const worked = { ...fresh, slotValues: { 'each.look#2': 'R2' } };
    const on = callbacksFor(noop);
    // ACT
    const before = slicesOf(shown(real, fresh), on).diagram.run;
    const after = slicesOf(shown(real, worked), on).diagram.run;
    // ASSERT
    expect(before).toBeUndefined();
    expect(after?.stages.find((each) => each.id === 'each')?.done).toBe(1);
  });

  it('sends the switch and Reset up as events, from the toolbar and from the modal', () => {
    // ARRANGE
    const sent: WorkflowEvent[] = [];
    const { toolbar, modal } = slicesFor(createState(start), {}, sent);
    // ACT
    toolbar.onDemo(false);
    modal.onReset();
    // ASSERT
    expect(sent).toEqual([{ type: 'demo', demo: false }, { type: 'reset' }]);
  });

  it('lets a Preset hide the switch and Reset, in both places', () => {
    // ARRANGE
    const controls = { demo: { show: false }, reset: { show: false } };
    const worked = { ...createState(start), slotValues: { 's.ask': 'answer' } };
    // ACT
    const { toolbar, modal } = slicesFor(worked, controls);
    // ASSERT
    expect([toolbar.demo, modal.demo]).toEqual([
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
    expect(toolbar.demo).toMatchObject({ show: false, resetShow: false });
  });

  it('draws the rounds the run plays, from the example before anything is pasted', () => {
    // ARRANGE
    const real = realFlow();
    const empty = createState(start);
    const pasted = { ...empty, slotValues: { 'each.look#2': 'R2' } };
    // ACT
    const before = showWorkflow(real, empty);
    const after = showWorkflow(real, pasted);
    // ASSERT
    expect(before.played.each).toBe(before.drawn.each);
    expect(before.drawn.each).toBe(real.stages.find((s) => s.id === 'each')?.foreach?.demo);
    expect(after.drawn.each).toBe(after.played.each);
  });

  it('gives the view and the run of the same results, so the diagram and the modal agree', () => {
    // ARRANGE
    const real = realFlow();
    const state = { ...createState(start), slotValues: { 'each.look#2': 'R2' } };
    // ACT
    const shownNow = showWorkflow(real, state);
    // ASSERT
    expect(shownNow.run).toEqual(runOf(real.file, { results: state.slotValues, demo: state.demo }));
    expect(shownNow.view).toEqual(workflowView(real, { ...state, rounds: shownNow.played }));
  });
});

describe('failure cases', () => {
  it('never hands a readonly Preset the run, work or not', () => {
    // ARRANGE
    const worked = { ...createState(start), slotValues: { 's.ask': 'answer' } };
    // ACT
    const { diagram } = slicesOf(
      { ...shown(flow('two'), worked), data: { ...data, readonly: true } },
      callbacksFor(noop),
    );
    // ASSERT
    expect(diagram.run).toBeUndefined();
  });

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
      { ...showWorkflow(workflow, state), data, state, note: null, progress: null, debugAvailable: false },
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
        ...showWorkflow(workflow, state),
        data: { ...data, readonly: true },
        state,
        note: null,
        progress: null,
        debugAvailable: false,
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
