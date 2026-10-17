/*
 * The Pipeline definition: the one reader of a new-episode `pipeline.yml`. It parses the text once into the raw
 * document and the typed Pipeline beside it, which the schema check (episode-pipeline.pure.ts), the dashboard
 * projection, the research-jobs check and the skill's status script all share. It imports nothing but `yaml`, so
 * the status script runs it under bare node. Whether the pipeline is well formed is its readers' question: this
 * reads what is there and skips what is not, pairs each Job with its mapping, and answers the structural rules of the
 * `needs`/`wants` graph (`jobGraph`) the schema check and the dashboard both apply.
 */

import { parse } from 'yaml';

/** What a job id may be: it is the `<job>` of a spawn description `<job>#<attempt>/<role>[/#<ticket>]`, which the Claude Code adapter parses. */
export const JOB_ID = /^[a-z0-9][a-z0-9-]*$/;
export const BAD_JOB_ID =
  'an id the spawn description <job>#<attempt>/<role> cannot carry; use lowercase letters, digits and hyphens.';

/** An agent of a job as the skill-use check reads it: its type, the skills it must invoke, and where it runs. */
export interface JobAgent {
  type: string;
  /** The agent definition it runs as; `general-purpose` when it names none. */
  agent: string;
  skills: string[];
  session?: 'orchestrator';
}

/** A pipeline job as its readers see it: its id, the jobs it needs and wants, the staging paths it writes, its gate. */
export interface Job {
  id: string;
  /** The stage the job belongs to, one of the pipeline's `stages`; absent when the job names none. */
  stage?: string;
  needs: string[];
  /** Jobs it waits for that do not block it when they block; empty when it wants none. */
  wants: string[];
  outputs: string[];
  /** The done-checks the job names, cheapest first; empty when it names none. */
  checks: string[];
  /** True for `gate: human`: the job reads done only once Han approves its outputs. */
  gate: boolean;
  /** How often a failed Attempt is retried; 0 when the job names no whole number. */
  retries: number;
  /** A template job's `<file>#<heading>`: customize-pipeline writes one job per item; absent on a real job. */
  foreach?: string;
  /** `orchestrator` when the job itself says so or any of its agents runs in the orchestrator session (the schema sets `session` per agent); absent for the default, a subagent. */
  session?: 'orchestrator';
  agents: JobAgent[];
  /** A Build job's dev-server port, which customize-pipeline assigns; absent on any other job and in the template. */
  port?: number;
}

export interface Pipeline {
  /** The pipeline's own `status:` (draft or approved), null when it is not text. */
  status: string | null;
  /** The pipeline's ordered stage ids; empty when it lists none. */
  stages: string[];
  jobs: Job[];
  /** The Run's dashboard dev-server port (`dev_port`), written by begin-run; absent before it. */
  devPort?: number;
  /** The Run's Spec-server port (`spec_port`); the dashboard links it. */
  specPort?: number;
}

function isMapping(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** A list of strings as is; anything else, a list holding a non-string included, as no list. */
function strings(value: unknown): string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string') ? value : [];
}

function agentOf(agent: Record<string, unknown>): JobAgent {
  return {
    type: String(agent.type),
    agent: typeof agent.agent === 'string' ? agent.agent : 'general-purpose',
    skills: strings(agent.skills),
    ...(agent.session === 'orchestrator' && { session: 'orchestrator' as const }),
  };
}

/** The fields a job may leave out: its stage, foreach template and port. */
function optionalsOf(job: Record<string, unknown>): Pick<Job, 'stage' | 'foreach' | 'port'> {
  return {
    ...(typeof job.stage === 'string' && { stage: job.stage }),
    ...(typeof job.foreach === 'string' && { foreach: job.foreach }),
    ...(Number.isInteger(job.port) && { port: job.port as number }),
  };
}

/** One job mapping as a `Job`. */
function jobOf(job: Record<string, unknown>): Job {
  const agents = Array.isArray(job.agents) ? job.agents.filter(isMapping).map(agentOf) : [];
  const inSession = job.session === 'orchestrator' || agents.some((agent) => agent.session === 'orchestrator');
  return {
    id: String(job.id),
    needs: strings(job.needs),
    wants: strings(job.wants),
    outputs: strings(job.outputs),
    checks: strings(job.checks),
    gate: job.gate === 'human',
    retries: Number.isInteger(job.retries) ? (job.retries as number) : 0,
    ...(inSession && { session: 'orchestrator' as const }),
    agents,
    ...optionalsOf(job),
  };
}

/** A Job beside the mapping it was read from, so a check of the raw mapping never pairs it with another Job by index. */
export interface JobSource {
  job: Job;
  mapping: Record<string, unknown>;
}

/**
 * The text parsed once: the raw document a schema check reads, the typed Pipeline beside it, null when the document
 * is not a mapping with a job list, and each of its Jobs beside its mapping. Text that is not YAML answers the
 * parser's complaint instead.
 */
export type PipelineText =
  { error: string } | { document: unknown; pipeline: Pipeline | null; sources: readonly JobSource[] };

export function parsePipeline(yaml: string): PipelineText {
  let document: unknown;
  try {
    document = parse(yaml);
  } catch (error) {
    return { error: `The pipeline is not valid YAML: ${(error as Error).message}` };
  }
  if (!isMapping(document) || !Array.isArray(document.jobs)) return { document, pipeline: null, sources: [] };
  const sources = document.jobs.filter(isMapping).map((mapping) => ({ job: jobOf(mapping), mapping }));
  return {
    document,
    pipeline: {
      status: typeof document.status === 'string' ? document.status : null,
      stages: strings(document.stages),
      jobs: sources.map(({ job }) => job),
      ...(Number.isInteger(document.dev_port) && { devPort: document.dev_port as number }),
      ...(Number.isInteger(document.spec_port) && { specPort: document.spec_port as number }),
    },
    sources,
  };
}

/** The pipeline's status and jobs, or null when the text is not YAML, not a mapping, or has no job list. */
export function readPipeline(yaml: string): Pipeline | null {
  const parsed = parsePipeline(yaml);
  return 'pipeline' in parsed ? parsed.pipeline : null;
}

/** Every job `id` waits for directly: the ones it needs, then the ones it wants. */
export function waitsFor(id: string, byId: ReadonlyMap<string, Job>): string[] {
  const job = byId.get(id);
  return job === undefined ? [] : [...job.needs, ...job.wants];
}

/** The first cycle in the needs graph, as the ids along it, or null. */
export function findCycle(jobs: readonly Job[], byId: ReadonlyMap<string, Job>): string[] | null {
  const done = new Set<string>();
  const walk = (id: string, path: readonly string[]): string[] | null => {
    if (path.includes(id)) return [...path.slice(path.indexOf(id)), id];
    if (done.has(id)) return null;
    const needs = waitsFor(id, byId);
    const cycle = needs.reduce<string[] | null>((found, need) => found ?? walk(need, [...path, id]), null);
    done.add(id);
    return cycle;
  };
  return jobs.reduce<string[] | null>((found, { id }) => found ?? walk(id, []), null);
}

/** A `needs` or `wants` entry of `job` naming no Job of the pipeline. */
export interface MissingEdge {
  job: string;
  edge: 'needs' | 'wants';
  other: string;
}

/** The entries of one Job's `needs`, then its `wants`, that name no Job in `byId`. */
export function missingEdges(job: Job, byId: ReadonlyMap<string, Job>): MissingEdge[] {
  return (['needs', 'wants'] as const).flatMap((edge) =>
    job[edge].filter((other) => !byId.has(other)).map((other) => ({ job: job.id, edge, other })),
  );
}

/** Each id more than one Job carries, named once, in the order it first repeats. */
function duplicateIds(jobs: readonly Job[]): string[] {
  const seen = new Set<string>();
  const repeated = new Set<string>();
  for (const { id } of jobs) (seen.has(id) ? repeated : seen).add(id);
  return [...repeated];
}

/** Each Job after the Jobs it needs, depth first in listed order; the graph must be whole and acyclic. */
function topological(jobs: readonly Job[], byId: ReadonlyMap<string, Job>): Job[] {
  const ordered: Job[] = [];
  const visited = new Set<string>();
  const visit = (job: Job) => {
    if (visited.has(job.id)) return;
    visited.add(job.id);
    job.needs.forEach((id) => visit(byId.get(id)!));
    ordered.push(job);
  };
  jobs.forEach(visit);
  return ordered;
}

/**
 * The structural rules of the `needs`/`wants` graph every reader of a pipeline shares: ids repeated, edges naming no
 * Job, the first cycle, and the Jobs ordered so each follows the Jobs it needs, null unless the graph is sound.
 */
export function jobGraph(jobs: readonly Job[]) {
  const byId: ReadonlyMap<string, Job> = new Map(jobs.map((job) => [job.id, job]));
  const duplicates = duplicateIds(jobs);
  const missing = jobs.flatMap((job) => missingEdges(job, byId));
  const cycle = findCycle(jobs, byId);
  const sound = duplicates.length === 0 && missing.length === 0 && cycle === null;
  return { byId, duplicates, missing, cycle, ordered: sound ? topological(jobs, byId) : null };
}
