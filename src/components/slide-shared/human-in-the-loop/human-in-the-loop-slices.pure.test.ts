import { describe, expect, it } from 'vitest';
import { callbacksFor, shownWorkflow, slicesOf, uploadEvent } from './human-in-the-loop-slices.pure';
import type { HumanInTheLoopData, UiWords } from './human-in-the-loop.types';
import { createState, type WorkflowEvent } from './workflow-state.pure';
import type { Workflow } from './workflow.types';

const job = {
  id: 'ask',
  title: 'Ask',
  description: 'D',
  chat: 'new',
  dependsOn: [],
  inputs: [],
  outputs: [],
  skills: [],
  prompt: 'P',
} as const;
const flow = (id: string): Workflow => ({
  id,
  title: id,
  scenario: 'S',
  stages: [{ id: 's', name: 'S', jobs: [job] }],
});
const labels = {
  modeWatch: 'a',
  modeTry: 'b',
  levelSimple: 'c',
  levelTechnical: 'd',
  workflow: 'e',
  close: 'f',
  copied: 'g',
  signedOff: 'h',
  download: 'i',
  upload: 'j',
};
const words = {
  ...labels,
  ...Object.fromEntries(
    'copyPrompt copyCommand openChatgpt openClaude copyExample copyCheck copyPage sectionDoes sectionIn sectionOut sectionCriteria sectionSkills sectionFullPrompt sectionExample setup newTab'
      .split(' ')
      .map((key) => [key, key]),
  ),
} as UiWords;
const data: HumanInTheLoopData = {
  workflows: [flow('one'), flow('two')],
  workflowId: 'two',
  locale: 'en',
  words,
  controls: { picker: true, download: true, upload: true },
  mode: 'watch',
  level: 'simple',
};
const start = { workflowId: data.workflowId, mode: data.mode, level: data.level };

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

  it('gives the modal the open job and each callback sends its own event', () => {
    // ARRANGE
    const sent: WorkflowEvent[] = [];
    const on = callbacksFor((event) => sent.push(event));
    const state = { ...createState(start), openJobId: job.id };
    // ACT
    const slices = slicesOf({ data, state, workflow: flow('two') }, on);
    slices.diagram.onOpenJob(job.id);
    slices.modal.onClose();
    // ASSERT
    expect(slices.modal.job?.id).toBe(job.id);
    expect(sent).toEqual([{ type: 'open', jobId: job.id }, { type: 'close' }]);
  });
});

describe('failure cases', () => {
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
  it('opens no modal while no job is open, and hands no part the state or dispatch', () => {
    // ARRANGE
    const state = createState(start);
    // ACT
    const slices = slicesOf(
      { data, state, workflow: flow('two') },
      callbacksFor(() => undefined),
    );
    // ASSERT
    expect(slices.modal.job).toBeNull();
    for (const part of Object.values(slices)) expect(Object.keys(part)).not.toContain('dispatch');
    for (const part of Object.values(slices)) expect(Object.keys(part)).not.toContain('state');
  });
});
