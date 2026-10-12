/*
 * The schema check for a new-episode pipeline: the skill's template and every
 * per-run `docs/episodes/<slug>/pipeline.yml`. It parses the YAML and checks
 * its keys, its `needs` graph, the skills it names and the paths it reads, so
 * a typo or a missing file fails `npm run verify` instead of a run. Reading
 * the disk is the caller's job: the context says which skills and paths exist.
 */

import { parse } from 'yaml';
import { ancestors, findCycle, type Job } from './episode-pipeline-graph.pure';
import { unless, type Finding } from './finding.pure';

/** What exists around a pipeline: its skill's folder, the skill names, and a repo-path lookup. */
export interface PipelineContext {
  /** The new-episode skill's folder, repo-relative; `references/` and `assets/` paths resolve inside it. */
  skillFolder: string;
  skills: readonly string[];
  /** Whether a repo-relative path names an existing file. */
  exists: (path: string) => boolean;
  /**
   * Repo paths a later ticket creates. A read of one is no finding while it is
   * missing; the caller keeps this list for the template only.
   */
  pending?: readonly string[];
}

const AGENT_TYPES = ['implementor', 'reviewer'];
/** The done-checks a job may name, cheapest first. */
const CHECKS = ['mh', 'vitest', 'verify', 'build', 'test:build', 'visual-check'];
/** Path prefixes that resolve inside the new-episode skill's folder rather than the repo root. */
const SKILL_PREFIXES = ['references/', 'assets/'];

type Mapping = Record<string, unknown>;

function isMapping(value: unknown): value is Mapping {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function isStringList(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(isString);
}

/** The strings of a list, or none when the value is no list of strings (its own finding). */
function stringsOf(value: unknown): string[] {
  return isStringList(value) ? value : [];
}

/** One key of a mapping: whether it must be present, and what its value must be. */
interface Field {
  key: string;
  required: boolean;
  valid: (value: unknown) => boolean;
  /** Completes "<where> has <key> <value>; …" when the value is not valid. */
  rule: string;
}

function field(key: string, valid: (value: unknown) => boolean, rule: string): Field {
  return { key, required: true, valid, rule };
}

function optional(fieldOf: Field): Field {
  return { ...fieldOf, required: false };
}

/** The field, required only when the condition holds and optional otherwise. */
function requiredWhen(condition: boolean, fieldOf: Field): Field {
  return { ...fieldOf, required: condition };
}

const LIST = 'it must be a list of strings';

const TOP_FIELDS = [
  field('status', (value) => value === 'draft' || value === 'approved', 'it must be draft or approved'),
  field('jobs', Array.isArray, 'it must be a list of jobs'),
];

const JOB_FIELDS = [
  field('id', isString, 'it must be a name'),
  field('needs', isStringList, LIST),
  optional(field('foreach', isString, 'it must be a path')),
  field('outputs', isStringList, LIST),
  field('checks', isStringList, LIST),
  field('retries', (value) => Number.isInteger(value) && Number(value) >= 0, 'it must be a whole number of 0 or more'),
  optional(field('gate', (value) => value === 'human', 'the only gate is human')),
  field('agents', (value) => Array.isArray(value) && value.length > 0, 'it must be a non-empty list of agents'),
];

/** An agent's fields; only a reviewer must carry a rubric. */
function agentFields(reviewer: boolean): Field[] {
  return [
    field('type', (value) => AGENT_TYPES.includes(value as string), 'it must be implementor or reviewer'),
    field('skills', isStringList, LIST),
    field('references', isStringList, LIST),
    requiredWhen(reviewer, field('rubric', isString, 'it must be a path')),
    field('profile', (value) => value === null, 'it stays empty (~) for now'),
  ];
}

/** Missing required keys, then unknown keys, then invalid values, each as a message after `where`. */
function checkMapping(where: string, mapping: Mapping, fields: readonly Field[]): string[] {
  const keys = fields.map(({ key }) => key);
  return [
    ...fields
      .filter(({ key, required }) => required && !Object.hasOwn(mapping, key))
      .map(({ key }) => `${where} lacks the key "${key}".`),
    ...Object.keys(mapping)
      .filter((key) => !keys.includes(key))
      .map((key) => `${where} has an unknown key "${key}"; the keys are ${keys.join(', ')}.`),
    ...fields
      .filter(({ key, valid }) => Object.hasOwn(mapping, key) && !valid(mapping[key]))
      .map(({ key, rule }) => `${where} has ${key} ${JSON.stringify(mapping[key])}; ${rule}.`),
  ];
}

/** A job reading a path: who reads it, how a finding names the reader, and the pipeline around it. */
interface Reader {
  job: string;
  where: string;
  byId: ReadonlyMap<string, Job>;
  jobs: readonly Job[];
  context: PipelineContext;
}

/**
 * A path a job reads is a staging file when some job lists it in `outputs`:
 * then the reading job must need a job that writes it. Any other path is a
 * file, resolved inside the skill folder for `references/` and `assets/` and
 * at the repo root otherwise, and must exist unless the context lists it as
 * pending. A `#heading` suffix is ignored.
 */
function checkRead({ job, where, byId, jobs, context }: Reader, reference: string): string[] {
  const target = reference.split('#')[0];
  const writers = jobs.filter(({ outputs }) => outputs.includes(target)).map(({ id }) => id);
  if (writers.length > 0) {
    const upstream = ancestors(job, byId);
    if (writers.some((writer) => writer === job || upstream.has(writer))) return [];
    return [`${where} reads "${reference}", which job "${writers[0]}" writes, but "${job}" does not need it.`];
  }
  const resolved = SKILL_PREFIXES.some((prefix) => target.startsWith(prefix))
    ? `${context.skillFolder}/${target}`
    : target;
  if (context.exists(resolved) || (context.pending ?? []).includes(resolved)) return [];
  return [`${where} reads "${reference}", which resolves to ${resolved}, no existing file.`];
}

function checkAgent(reader: Reader, agent: unknown): string[] {
  const { where, context } = reader;
  if (!isMapping(agent)) return [`${where} must be a mapping.`];
  const reviewer = agent.type === 'reviewer';
  const strayRubric = agent.type === 'implementor' && Object.hasOwn(agent, 'rubric');
  const rubric = reviewer && isString(agent.rubric) ? [agent.rubric] : [];
  return [
    ...checkMapping(where, agent, agentFields(reviewer)),
    ...unless(!strayRubric, `${where} is an implementor and has a rubric; only a reviewer has one.`),
    ...stringsOf(agent.skills)
      .filter((skill) => !context.skills.includes(skill))
      .map((skill) => `${where} names the skill "${skill}", which does not exist.`),
    ...[...stringsOf(agent.references), ...rubric].flatMap((reference) => checkRead(reader, reference)),
  ];
}

function checkJob(reader: Reader, job: Mapping): string[] {
  const { where, byId } = reader;
  const foreach = isString(job.foreach) ? [job.foreach] : [];
  const agents = Array.isArray(job.agents) ? (job.agents as unknown[]) : [];
  return [
    ...checkMapping(where, job, JOB_FIELDS),
    ...stringsOf(job.checks)
      .filter((check) => !CHECKS.includes(check))
      .map((check) => `${where} has the check "${check}"; the checks are ${CHECKS.join(', ')}.`),
    ...stringsOf(job.needs)
      .filter((need) => !byId.has(need))
      .map((need) => `${where} needs "${need}", which is no job in the pipeline.`),
    ...foreach.flatMap((path) => checkRead({ ...reader, where: `${where} foreach` }, path)),
    ...agents.flatMap((agent, at) => checkAgent({ ...reader, where: `${where}, agent ${at + 1}` }, agent)),
  ];
}

function checkJobs(raw: readonly unknown[], context: PipelineContext): string[] {
  const mappings = raw.filter(isMapping);
  const jobs = mappings.map((job): Job => ({
    id: String(job.id),
    needs: stringsOf(job.needs),
    outputs: stringsOf(job.outputs),
  }));
  const byId = new Map(jobs.map((job) => [job.id, job]));
  const ids = jobs.map(({ id }) => id);
  const cycle = findCycle(jobs, byId);
  return [
    ...raw.flatMap((job, index) => unless(isMapping(job), `Job ${index + 1} must be a mapping.`)),
    ...mappings.flatMap((job, index) =>
      checkJob({ job: ids[index], where: `Job "${ids[index]}"`, byId, jobs, context }, job),
    ),
    ...[...new Set(ids.filter((id, at) => ids.indexOf(id) !== at))].map(
      (id) => `The job id "${id}" appears twice; job ids are unique.`,
    ),
    ...(cycle === null ? [] : [`The needs graph has a cycle: ${cycle.join(' → ')}.`]),
  ];
}

/** The parsed document, or the parser's complaint. */
function parseDocument(yaml: string): { document: unknown } | { error: string } {
  try {
    return { document: parse(yaml) };
  } catch (error) {
    return { error: `The pipeline is not valid YAML: ${(error as Error).message}` };
  }
}

/**
 * Checks one pipeline file. `file` is the path a finding names; `yaml` is its
 * text. Returns no findings when the pipeline is well formed.
 */
export function checkPipeline(file: string, yaml: string, context: PipelineContext): Finding[] {
  const parsed = parseDocument(yaml);
  const document = 'document' in parsed ? parsed.document : undefined;
  const messages =
    'error' in parsed
      ? [parsed.error]
      : !isMapping(document)
        ? ['The pipeline must be a mapping with status and jobs.']
        : [
            ...checkMapping('The pipeline', document, TOP_FIELDS),
            ...(Array.isArray(document.jobs) ? checkJobs(document.jobs, context) : []),
          ];
  return messages.map((message): Finding => ({ kind: 'pipeline', file, message }));
}
