import type { TaskDef, WorkflowFile } from './workflow-schema.types';
import type { Job, Stage, Workflow } from './workflow.types';

/*
 * The smallest Job, Stage and Workflow the diagram and the state can draw, for tests that need a shape and no
 * content. The file and the task are empty shells: nothing here is a shipped Workflow.
 */

const SECTION = { heading: 'Task', purpose: 'task', text: 'Do it.' } as const;

/** A task with one prompt per runtime and no slots. */
export const TASK: TaskDef = {
  id: 'j',
  title: 'J',
  output: 'o',
  template: 't',
  slots: [],
  do: { simple: [SECTION], technical: [SECTION] },
  details: { why: 'Why.', example: 'Example.', goodLooksLike: ['Good.'] },
};

/** A job that depends on nothing, takes and hands on nothing. */
export const JOB: Job = {
  id: 'j',
  title: 'J',
  dependsOn: [],
  inputs: [],
  outputs: [],
  reviewed: false,
  task: TASK,
};

export const job = (over: Partial<Job> = {}): Job => ({ ...JOB, ...over });

export const stage = (id: string, jobs: readonly Job[]): Stage => ({
  id,
  name: id.toUpperCase(),
  goal: 'G',
  moves: [],
  jobs,
});

const FILE: WorkflowFile = {
  id: 'w',
  title: 'W',
  scenario: { summary: 'S', facts: ['F'] },
  purposes: { role: 'r', context: 'c', task: 't', steps: 's', template: 'm', scope: 'o' },
  techniques: [{ id: 'delimiters', tier: 'basic', title: 'Delimiters', explain: 'Fence it.' }],
  reviewer: { sections: [SECTION] },
  templates: {},
  stages: [],
};

export const flow = (stages: readonly Stage[], focalJobId?: string): Workflow => ({
  id: 'w',
  title: 'W',
  scenario: 'S',
  focalJobId,
  stages,
  file: FILE,
});
