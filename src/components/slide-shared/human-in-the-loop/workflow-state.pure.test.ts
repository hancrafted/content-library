import { describe, expect, it } from 'vitest';
import { flow } from './workflow-fixture.pure';
import { createState, reduce, type WorkflowEvent, type WorkflowState } from './workflow-state.pure';

const start = { workflowId: 'summer-party', level: 'simple', view: 'presentation' } as const;
const uploaded = { ...flow([]), id: 'mine', title: 'Mine' };

describe('success cases', () => {
  it('keeps what is pasted into a slot, shared whatever stage is open, and keeps it when a modal closes', () => {
    // ARRANGE
    const pasted = { spec: '# My spec' };
    const initial = reduce(createState(start), { type: 'open', stageId: 'tickets' });
    // ACT
    const filled = reduce(initial, { type: 'slots', values: pasted });
    const later = reduce(reduce(filled, { type: 'close' }), { type: 'open', stageId: 'compare' });
    // ASSERT
    expect(later.slotValues).toEqual(pasted);
  });

  it('takes back a saved run: its results and its teaching flag', () => {
    // ARRANGE
    const saved = { results: { 'a.b': 'text' }, teaching: false };
    // ACT
    const state = reduce(createState(start), { type: 'restore', ...saved });
    // ASSERT
    expect(state.slotValues).toEqual(saved.results);
    expect(state.teaching).toBe(saved.teaching);
  });

  it('takes back an uploaded progress file over the problems of an earlier refusal', () => {
    // ARRANGE
    const refused = reduce(createState(start), { type: 'upload-failed', problems: ['no'] });
    // ACT
    const state = reduce(refused, { type: 'restore', results: { 'a.b': 'x' }, teaching: true });
    // ASSERT
    expect(state.uploadProblems).toEqual([]);
  });

  it('forgets the pasted values when another Workflow is shown', () => {
    // ARRANGE
    const filled = reduce(createState(start), { type: 'slots', values: { spec: 'S' } });
    // ACT
    const state = reduce(filled, { type: 'workflow', workflowId: 'vacation' });
    // ASSERT
    expect(state.slotValues).toEqual({});
  });

  it('starts in the Preset: the chosen Workflow at the Simple level, nothing open', () => {
    // ARRANGE
    const expected: WorkflowState = {
      ...start,
      teaching: true,
      openStageId: null,
      openJobId: null,
      slotValues: {},
      uploaded: null,
      uploadProblems: [],
    };
    // ACT
    const state = createState(start);
    // ASSERT
    expect(state).toEqual(expected);
  });

  it('switches the view without touching the pasted values, and keeps it when the Workflow changes', () => {
    // ARRANGE
    const filled = reduce(createState(start), { type: 'slots', values: { a: 'b' } });
    // ACT
    const viewed = reduce(filled, { type: 'view', view: 'handson' });
    const other = reduce(viewed, { type: 'workflow', workflowId: 'vacation' });
    // ASSERT
    expect(viewed).toEqual({ ...filled, view: 'handson' });
    expect(other.view).toBe('handson');
  });

  it('switches the level', () => {
    // ARRANGE
    const initial = createState(start);
    // ACT
    const state = reduce(initial, { type: 'level', level: 'technical' });
    // ASSERT
    expect(state.level).toBe('technical');
  });

  it('opens and closes the Try it modal of a stage', () => {
    // ARRANGE
    const initial = createState(start);
    const stage = 'interview';
    // ACT
    const open = reduce(initial, { type: 'open', stageId: stage });
    const closed = reduce(open, { type: 'close' });
    // ASSERT
    expect(open.openStageId).toBe(stage);
    expect(closed.openStageId).toBeNull();
  });

  it('opens the modal at the job whose card was pressed, and forgets the job when it closes or opens by stage', () => {
    // ARRANGE
    const initial = createState(start);
    // ACT
    const atJob = reduce(initial, { type: 'open', stageId: 'tickets', jobId: 'epics' });
    const byStage = reduce(atJob, { type: 'open', stageId: 'tickets' });
    const closed = reduce(atJob, { type: 'close' });
    // ASSERT
    expect([atJob.openStageId, atJob.openJobId]).toEqual(['tickets', 'epics']);
    expect(byStage.openJobId).toBeNull();
    expect(closed.openJobId).toBeNull();
  });

  it('switching Workflow resets the open stage, the pasted values and any upload', () => {
    // ARRANGE
    const events: WorkflowEvent[] = [
      { type: 'open', stageId: 'x' },
      { type: 'slots', values: { a: 'b' } },
      { type: 'upload', workflow: uploaded },
    ];
    const busy = events.reduce(reduce, createState(start));
    const other = 'vacation';
    // ACT
    const state = reduce(busy, { type: 'workflow', workflowId: other });
    // ASSERT
    expect(state).toEqual({ ...createState(start), workflowId: other });
  });

  it('an upload becomes the shown Workflow, clears old problems and starts a clean slate', () => {
    // ARRANGE
    const failed = reduce(createState(start), { type: 'upload-failed', problems: ['bad'] });
    // ACT
    const state = reduce(failed, { type: 'upload', workflow: uploaded });
    // ASSERT
    expect(state).toMatchObject({
      workflowId: uploaded.id,
      uploaded,
      uploadProblems: [],
      openStageId: null,
    });
  });
});

describe('failure cases', () => {
  it('a failed upload keeps the shown Workflow and holds the problems', () => {
    // ARRANGE
    const initial = reduce(createState(start), { type: 'open', stageId: 'x' });
    const problems = ['one', 'two'];
    // ACT
    const state = reduce(initial, { type: 'upload-failed', problems });
    // ASSERT
    expect(state).toEqual({ ...initial, uploadProblems: problems });
  });
});

describe('edge cases', () => {
  it('never changes the state it is given, and the state survives a JSON round trip', () => {
    // ARRANGE
    const initial = reduce(createState(start), { type: 'open', stageId: 't' });
    const before = JSON.stringify(initial);
    // ACT
    const next = reduce(initial, { type: 'open', stageId: 'u' });
    // ASSERT
    expect(JSON.stringify(initial)).toBe(before);
    expect(JSON.parse(JSON.stringify(next))).toEqual(next);
  });

  it('ignores closing when nothing is open', () => {
    // ARRANGE
    const initial = createState(start);
    // ACT
    const closed = reduce(initial, { type: 'close' });
    // ASSERT
    expect(closed).toEqual(initial);
  });
});
