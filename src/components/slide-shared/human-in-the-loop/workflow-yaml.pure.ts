import { stringify } from 'yaml';
import { jobsOf } from './workflow-jobs.pure';
import type { Job, Stage, Workflow } from './workflow.types';

/*
 * A Workflow back to YAML, for the download control: the config shape with the current locale's words inline, so the
 * same text loads again through `loadWorkflow(text, text)` as an upload.
 */

/** `{ key: value }` when the value is set, nothing otherwise, so a text of the Workflow leaves unset fields out. */
const opt = (key: string, value: unknown) => (value ? { [key]: value } : {});

const jobData = (job: Job) => ({
  id: job.id,
  chat: job.chat,
  dependsOn: job.dependsOn,
  inputs: job.inputs,
  outputs: job.outputs,
  ...opt('fanOut', job.fanOut),
  skills: job.skills.map(({ group, name }) => `${group}/${name}`),
});

const jobWords = (job: Job) => ({
  title: job.title,
  ...opt('detail', job.detail),
  description: job.description,
  run: { todo: job.run.todo, prompt: job.run.prompt, ...opt('short', job.run.short) },
  ...opt('command', job.command),
  ...opt('exampleInput', job.exampleInput),
  ...opt('exampleOutput', job.exampleOutput),
  ...opt('check', job.check),
  ...opt('page', job.page),
  ...opt('parked', job.parked),
});

/** A stage's words: its name, its tooltips by letter and its card. */
const stageWords = (stage: Stage) => ({
  name: stage.name,
  ...opt(
    'moves',
    stage.moves.length > 0 ? Object.fromEntries(stage.moves.map(({ letter, why }) => [letter, why])) : undefined,
  ),
  ...opt('card', stage.card),
});

const stageData = (stage: Stage) => ({
  id: stage.id,
  ...opt('moves', stage.moves.length > 0 ? stage.moves.map((move) => move.letter) : undefined),
  ...opt('gate', stage.gate),
  jobs: stage.jobs.map(jobData),
});

export function workflowToYaml(workflow: Workflow): string {
  const jobs = jobsOf(workflow.stages);
  return stringify({
    id: workflow.id,
    ...opt('focalJob', workflow.focalJobId),
    stages: workflow.stages.map(stageData),
    words: {
      title: workflow.title,
      scenario: workflow.scenario,
      ...opt('setup', workflow.setup),
      stages: Object.fromEntries(workflow.stages.map((stage) => [stage.id, stageWords(stage)])),
      jobs: Object.fromEntries(jobs.map((job) => [job.id, jobWords(job)])),
    },
  });
}
