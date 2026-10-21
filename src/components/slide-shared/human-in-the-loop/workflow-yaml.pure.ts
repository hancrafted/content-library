import { stringify } from 'yaml';
import type { Job, Workflow } from './workflow.types';

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
  prompt: job.prompt,
  ...opt('command', job.command),
  ...opt('exampleInput', job.exampleInput),
  ...opt('exampleOutput', job.exampleOutput),
  ...opt('check', job.check),
  ...opt('page', job.page),
  ...opt('parked', job.parked),
});

export function workflowToYaml(workflow: Workflow): string {
  const jobs = workflow.stages.flatMap((stage) => stage.jobs);
  return stringify({
    id: workflow.id,
    ...opt('focalJob', workflow.focalJobId),
    stages: workflow.stages.map((stage) => ({
      id: stage.id,
      ...opt('move', stage.move),
      ...opt('gate', stage.gate),
      jobs: stage.jobs.map(jobData),
    })),
    words: {
      title: workflow.title,
      scenario: workflow.scenario,
      ...opt('setup', workflow.setup),
      stages: Object.fromEntries(
        workflow.stages.map((stage) => [stage.id, { name: stage.name, ...opt('move', stage.moveLabel) }]),
      ),
      jobs: Object.fromEntries(jobs.map((job) => [job.id, jobWords(job)])),
    },
  });
}
