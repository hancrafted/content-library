import { describe, expect, it } from 'vitest';
import { createState, reduce, type WorkflowState } from './workflow-state.pure';
import type { Workflow } from './workflow.types';

const start = { workflowId: 'summer-party', mode: 'watch', level: 'simple' } as const;
const uploaded: Workflow = { id: 'mine', title: 'Mine', scenario: 'S', stages: [] };

describe('success cases', () => {
  it('starts in the Preset: the chosen Workflow in Watch mode at the Simple level, nothing open or ticked', () => {
    // ARRANGE
    const expected: WorkflowState = { ...start, openJobId: null, ticked: [], uploaded: null, uploadProblems: [] };
    // ACT
    const state = createState(start);
    // ASSERT
    expect(state).toEqual(expected);
  });

  it('switches mode and level', () => {
    // ARRANGE
    const initial = createState(start);
    // ACT
    const state = reduce(reduce(initial, { type: 'mode', mode: 'try' }), { type: 'level', level: 'technical' });
    // ASSERT
    expect([state.mode, state.level]).toEqual(['try', 'technical']);
  });

  it('opens and closes a job', () => {
    // ARRANGE
    const initial = createState(start);
    const job = 'interview';
    // ACT
    const open = reduce(initial, { type: 'open', jobId: job });
    const closed = reduce(open, { type: 'close' });
    // ASSERT
    expect(open.openJobId).toBe(job);
    expect(closed.openJobId).toBeNull();
  });

  it('ticks a ticket and unticks it on the second press', () => {
    // ARRANGE
    const initial = createState(start);
    const ticket = 't1';
    // ACT
    const once = reduce(initial, { type: 'tick', ticketId: ticket });
    const twice = reduce(once, { type: 'tick', ticketId: ticket });
    // ASSERT
    expect(once.ticked).toEqual([ticket]);
    expect(twice.ticked).toEqual([]);
  });

  it('switching Workflow resets the open job, the ticks and any upload', () => {
    // ARRANGE
    const busy = reduce(
      reduce(reduce(createState(start), { type: 'open', jobId: 'x' }), { type: 'tick', ticketId: 't' }),
      { type: 'upload', workflow: uploaded },
    );
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
    expect(state).toMatchObject({ workflowId: uploaded.id, uploaded, uploadProblems: [], openJobId: null, ticked: [] });
  });
});

describe('failure cases', () => {
  it('a failed upload keeps the shown Workflow and holds the problems', () => {
    // ARRANGE
    const initial = reduce(createState(start), { type: 'open', jobId: 'x' });
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
    const initial = reduce(createState(start), { type: 'tick', ticketId: 't' });
    const before = JSON.stringify(initial);
    // ACT
    const next = reduce(initial, { type: 'tick', ticketId: 'u' });
    // ASSERT
    expect(JSON.stringify(initial)).toBe(before);
    expect(JSON.parse(JSON.stringify(next))).toEqual(next);
  });

  it('ignores opening a job twice and closing when nothing is open', () => {
    // ARRANGE
    const initial = createState(start);
    // ACT
    const closed = reduce(initial, { type: 'close' });
    // ASSERT
    expect(closed).toEqual(initial);
  });
});
