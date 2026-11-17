import { parse } from 'yaml';

export const JOB_ID = /^[a-z0-9][a-z0-9-]*$/;
export const BAD_JOB_ID =
  'an id the spawn description <job>#<attempt>/<role> cannot carry; use lowercase letters, digits and hyphens.';

export interface JobAgent {
  type: string;
  agent: string;
  skills: string[];
  session?: 'orchestrator';
}

export interface Job {
  id: string;
  stage?: string;
  needs: string[];
  wants: string[];
  outputs: string[];
  checks: string[];
  gate: boolean;
  retries: number;
  foreach?: string;
  session?: 'orchestrator';
  agents: JobAgent[];
  port?: number;
}

export interface Pipeline {
  status: string | null;
  stages: string[];
  jobs: Job[];
  devPort?: number;
  specPort?: number;
}

function isMapping(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

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

function optionalsOf(job: Record<string, unknown>): Pick<Job, 'stage' | 'foreach' | 'port'> {
  return {
    ...(typeof job.stage === 'string' && { stage: job.stage }),
    ...(typeof job.foreach === 'string' && { foreach: job.foreach }),
    ...(Number.isInteger(job.port) && { port: job.port as number }),
  };
}

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

export interface JobSource {
  job: Job;
  mapping: Record<string, unknown>;
}

export type PipelineText =
  | { error: string }
  | { document: unknown; pipeline: Pipeline | null; sources: readonly JobSource[] };

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

export function readPipeline(yaml: string): Pipeline | null {
  const parsed = parsePipeline(yaml);
  return 'pipeline' in parsed ? parsed.pipeline : null;
}

export function waitsFor(id: string, byId: ReadonlyMap<string, Job>): string[] {
  const job = byId.get(id);
  return job === undefined ? [] : [...job.needs, ...job.wants];
}

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

export interface MissingEdge {
  job: string;
  edge: 'needs' | 'wants';
  other: string;
}

export function missingEdges(job: Job, byId: ReadonlyMap<string, Job>): MissingEdge[] {
  return (['needs', 'wants'] as const).flatMap((edge) =>
    job[edge].filter((other) => !byId.has(other)).map((other) => ({ job: job.id, edge, other })),
  );
}

function duplicateIds(jobs: readonly Job[]): string[] {
  const seen = new Set<string>();
  const repeated = new Set<string>();
  for (const { id } of jobs) (seen.has(id) ? repeated : seen).add(id);
  return [...repeated];
}

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

export function jobGraph(jobs: readonly Job[]) {
  const byId: ReadonlyMap<string, Job> = new Map(jobs.map((job) => [job.id, job]));
  const duplicates = duplicateIds(jobs);
  const missing = jobs.flatMap((job) => missingEdges(job, byId));
  const cycle = findCycle(jobs, byId);
  const sound = duplicates.length === 0 && missing.length === 0 && cycle === null;
  return { byId, duplicates, missing, cycle, ordered: sound ? topological(jobs, byId) : null };
}
