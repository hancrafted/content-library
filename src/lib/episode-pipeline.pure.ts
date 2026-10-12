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
import {
  checkMapping,
  field,
  isMapping,
  isString,
  isStringList,
  optional,
  requiredWhen,
  stringsOf,
  type Field,
  type Mapping,
} from './mapping-fields.pure';

/** What exists around a pipeline: its skill's folder, the skill names, and a repo-path lookup. */
export interface PipelineContext {
  /** The new-episode skill's folder, repo-relative; `references/` and `assets/` paths resolve inside it. */
  skillFolder: string;
  skills: readonly string[];
  /** Whether a repo-relative path names an existing file. */
  exists: (path: string) => boolean;
  /**
   * Whether a markdown-harness rule governs a job output, given relative to
   * the staging folder. An implementor queries its outputs' intents before
   * writing them, so an ungoverned markdown output has none to query.
   */
  governs: (output: string) => boolean;
  /**
   * Repo paths a later ticket creates. A read of one is no finding while it is
   * missing; the caller keeps this list for the template only.
   */
  pending?: readonly string[];
}

const AGENT_TYPES = ['implementor', 'reviewer'];
/** The models an agent may run on; `inherit` runs it on the orchestrator's model. */
const MODELS: readonly string[] = ['opus', 'sonnet', 'haiku', 'inherit'];
/** Where an agent runs: a spawned subagent, or the orchestrator's own session. */
const SESSIONS: readonly string[] = ['subagent', 'orchestrator'];
/** Skills that spawn subagents themselves; a subagent cannot spawn one, so only the orchestrator runs them. */
const SPAWNING_SKILLS = ['implement-spec', 'code-review'];
/** The done-checks a job may name, cheapest first. */
const CHECKS = ['mh', 'vitest', 'verify', 'build', 'test:build', 'visual-check'];
/** Path prefixes that resolve inside the new-episode skill's folder rather than the repo root. */
const SKILL_PREFIXES = ['references/', 'assets/'];

const LIST = 'it must be a list of strings';

/** "a, b or c": the allowed values a finding names. */
function oneOf(values: readonly string[]): string {
  return `${values.slice(0, -1).join(', ')} or ${values.at(-1)}`;
}

const TOP_FIELDS = [
  field('status', (value) => value === 'draft' || value === 'approved', 'it must be draft or approved'),
  field('jobs', Array.isArray, 'it must be a list of jobs'),
];

const JOB_FIELDS = [
  field('id', isString, 'it must be a name'),
  optional(field('intent', isString, 'it must be the task, written as a prompt')),
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
    optional(field('agent', isString, 'it must be a Claude Code agent type')),
    field('model', (value) => MODELS.includes(value as string), `it must be ${oneOf(MODELS)}`),
    optional(field('session', (value) => SESSIONS.includes(value as string), `it must be ${oneOf(SESSIONS)}`)),
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
    ...stringsOf(agent.skills)
      .filter((skill) => SPAWNING_SKILLS.includes(skill) && agent.session !== 'orchestrator')
      .map(
        (skill) =>
          `${where} names the skill "${skill}", which spawns subagents; the agent needs session: orchestrator.`,
      ),
    ...[...stringsOf(agent.references), ...rubric].flatMap((reference) => checkRead(reader, reference)),
  ];
}

function checkJob(reader: Reader, job: Mapping): string[] {
  const { where, byId, context } = reader;
  const foreach = isString(job.foreach) ? [job.foreach] : [];
  const agents = Array.isArray(job.agents) ? (job.agents as unknown[]) : [];
  return [
    ...checkMapping(where, job, JOB_FIELDS),
    ...stringsOf(job.checks)
      .filter((check) => !CHECKS.includes(check))
      .map((check) => `${where} has the check "${check}"; the checks are ${CHECKS.join(', ')}.`),
    ...stringsOf(job.outputs)
      .filter((output) => output.endsWith('.md') && !context.governs(output))
      .map(
        (output) =>
          `${where} writes "${output}", which no markdown-harness rule governs; its implementor would query no intents.`,
      ),
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
