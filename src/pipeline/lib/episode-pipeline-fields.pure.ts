import { field, isMapping, isString, isStringList, optional, requiredWhen, type Field } from './mapping-fields.pure';

const AGENT_TYPES = ['implementor', 'reviewer'];
const MODELS: readonly string[] = ['opus', 'sonnet', 'haiku', 'inherit'];
const SESSIONS: readonly string[] = ['subagent', 'orchestrator'];
export const SPAWNING_SKILLS = ['code-review'];
const BEFORE_STEPS: readonly string[] = ['mh-query'];
const ISOLATIONS: readonly string[] = ['worktree'];
export const CHECKS = ['mh', 'vitest', 'sources', 'impeccable', 'verify', 'build', 'test:build', 'visual-check'];
export const SKILL_PREFIXES = ['references/', 'assets/'];

const LIST = 'it must be a list of strings';

function oneOf(values: readonly string[]): string {
  return `${values.slice(0, -1).join(', ')} or ${values.at(-1)}`;
}

const PORT = field(
  'dev_port',
  (value) => Number.isInteger(value) && Number(value) >= 1024 && Number(value) <= 65535,
  'it must be a whole number from 1024 to 65535',
);

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
  optional(PORT),
  optional({ ...PORT, key: 'spec_port' }),
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

export const LEGACY_FIELDS = {
  top: relaxed(TOP_FIELDS, 'stages'),
  job: relaxed(JOB_FIELDS, 'stage'),
  agent: (reviewer: boolean): Field[] => [...agentFields(reviewer), LEGACY_TICKET],
};
