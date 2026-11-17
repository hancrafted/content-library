import type { TaskDef, WorkflowFile } from './workflow-schema.types';
import type { Job, Stage, Workflow } from './workflow.types';

const SECTION = { heading: 'Task', purpose: 'task', text: 'Do it.' } as const;

export const TASK: TaskDef = {
  id: 'j',
  title: 'J',
  goal: { do: 'Do J.', review: 'Check J.' },
  output: 'o',
  template: 't',
  slots: [],
  do: { simple: [SECTION], technical: [SECTION] },
  details: { why: 'Why.', example: 'Example.', goodLooksLike: ['Good.'] },
};

export const JOB: Job = {
  id: 'j',
  title: 'J',
  dependsOn: [],
  needs: [],
  inputs: [],
  outputs: [],
  reviewed: false,
  optional: false,
  task: TASK,
};

export const job = (over: Partial<Job> = {}): Job => ({ ...JOB, ...over });

export const stage = (id: string, jobs: readonly Job[]): Stage => ({
  id,
  name: id.toUpperCase(),
  goal: 'G',
  moves: [],
  optional: false,
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

export const optionalFlow = (): Workflow =>
  flow([
    stage('a', [job({ id: 'must' }), job({ id: 'extra', optional: true })]),
    { ...stage('b', [job({ id: 'bonus', optional: true })]), optional: true },
  ]);
