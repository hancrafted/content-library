/*
 * The vocabulary of a new-episode pipeline: the values its keys allow and the
 * fields each mapping (the pipeline, a job, an agent) holds, and the relaxed
 * set the dashboard reads a legacy Run by. The checks that read them live in
 * episode-pipeline.pure.ts and dashboard-projection.pure.ts.
 */

import { field, isMapping, isString, isStringList, optional, requiredWhen, type Field } from './mapping-fields.pure';

const AGENT_TYPES = ['implementor', 'reviewer'];
/** The models an agent may run on; `inherit` runs it on the orchestrator's model. */
const MODELS: readonly string[] = ['opus', 'sonnet', 'haiku', 'inherit'];
/** Where an agent runs: a spawned subagent, or the orchestrator's own session. */
const SESSIONS: readonly string[] = ['subagent', 'orchestrator'];
/** Skills that spawn subagents themselves; a subagent cannot spawn one, so only the orchestrator runs them. */
export const SPAWNING_SKILLS = ['code-review'];
/** What a job's `before` may run ahead of its implementor. */
const BEFORE_STEPS: readonly string[] = ['mh-query'];
/** Where a job's agents work: `worktree` gives the job its own worktree, merged back on a pass. */
const ISOLATIONS: readonly string[] = ['worktree'];
/** The done-checks a job may name, cheapest first. */
export const CHECKS = ['mh', 'vitest', 'sources', 'impeccable', 'verify', 'build', 'test:build', 'visual-check'];
/** Path prefixes that resolve inside the new-episode skill's folder rather than the repo root. */
export const SKILL_PREFIXES = ['references/', 'assets/'];

const LIST = 'it must be a list of strings';

/** "a, b or c": the allowed values a finding names. */
function oneOf(values: readonly string[]): string {
  return `${values.slice(0, -1).join(', ')} or ${values.at(-1)}`;
}

export const TOP_FIELDS = [
  field('status', (value) => value === 'draft' || value === 'approved', 'it must be draft or approved'),
  field('stages', isStringList, 'it must be a list of stage ids'),
  field('jobs', Array.isArray, 'it must be a list of jobs'),
  optional(
    field(
      'template',
      (value) => typeof value === 'string' && /^[0-9a-f]{7,40}$/.test(value),
      'it must be a commit sha',
    ),
  ),
];

export const JOB_FIELDS = [
  field('id', isString, 'it must be a name'),
  field('stage', isString, 'it must be a stage id'),
  optional(field('intent', isString, 'it must be the task, written as a prompt')),
  field('needs', isStringList, LIST),
  optional(field('wants', isStringList, LIST)),
  optional(
    field('isolation', (value) => ISOLATIONS.includes(value as string), `it must be ${ISOLATIONS.join(' or ')}`),
  ),
  optional(field('foreach', isString, 'it must be a path')),
  optional(
    field(
      'before',
      (value) => isStringList(value) && value.every((step) => BEFORE_STEPS.includes(step)),
      `the steps are ${BEFORE_STEPS.join(', ')}`,
    ),
  ),
  field('outputs', isStringList, LIST),
  field('checks', isStringList, LIST),
  field('retries', (value) => Number.isInteger(value) && Number(value) >= 0, 'it must be a whole number of 0 or more'),
  optional(field('gate', (value) => value === 'human', 'the only gate is human')),
  optional(
    field(
      'port',
      (value) => Number.isInteger(value) && Number(value) >= 1024 && Number(value) <= 65535,
      'it must be a whole number from 1024 to 65535',
    ),
  ),
  field('agents', (value) => Array.isArray(value) && value.length > 0, 'it must be a non-empty list of agents'),
];

/** An agent's fields; only a reviewer must carry a rubric. */
export function agentFields(reviewer: boolean): Field[] {
  return [
    field('type', (value) => AGENT_TYPES.includes(value as string), 'it must be implementor or reviewer'),
    field('skills', isStringList, LIST),
    field('references', isStringList, LIST),
    requiredWhen(reviewer, field('rubric', isString, 'it must be a path')),
    optional(field('agent', isString, 'it must be a Claude Code agent type')),
    field('model', (value) => MODELS.includes(value as string), `it must be ${oneOf(MODELS)}`),
    optional(field('session', (value) => SESSIONS.includes(value as string), `it must be ${oneOf(SESSIONS)}`)),
  ];
}

const relaxed = (fields: readonly Field[], key: string) =>
  fields.map((candidate) => (candidate.key === key ? optional(candidate) : candidate));
const LEGACY_TICKET = optional(field('ticket', isMapping, 'it must be a mapping of agent and skills'));

/**
 * The fields the dashboard still reads a Run by. A Run scaffolded before the stages layer lists no `stages` and no
 * Job `stage`, and its implementors may carry the `ticket` block of the per-ticket fan-out the Build Jobs replaced.
 */
export const LEGACY_FIELDS = {
  top: relaxed(TOP_FIELDS, 'stages'),
  job: relaxed(JOB_FIELDS, 'stage'),
  agent: (reviewer: boolean): Field[] => [...agentFields(reviewer), LEGACY_TICKET],
};
