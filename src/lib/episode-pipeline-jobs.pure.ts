/*
 * A new-episode pipeline read into its status and jobs: the one view of a job that the schema check
 * (episode-pipeline.pure.ts), the research-jobs check and the skill's status script share. It imports nothing
 * but `yaml`, so the status script runs it under bare node. Whether the pipeline is well formed is the schema
 * check's question: this reads what is there and skips what is not.
 */

import { parse } from 'yaml';

/** What a job id may be: it is the `<job>` of a spawn description `<job>#<attempt>/<role>[/#<ticket>]`, which the Claude Code adapter parses. */
export const JOB_ID = /^[a-z0-9][a-z0-9-]*$/;
export const BAD_JOB_ID =
  'an id the spawn description <job>#<attempt>/<role> cannot carry; use lowercase letters, digits and hyphens.';

/** An agent of a job as the skill-use check reads it: its type, the skills it must invoke, and where it runs. */
export interface JobAgent {
  type: string;
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
  /** True for `gate: human`: the job reads done only once Han approves its outputs. */
  gate: boolean;
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
    skills: strings(agent.skills),
    ...(agent.session === 'orchestrator' && { session: 'orchestrator' as const }),
  };
}

/** One job mapping as a `Job`. */
export function jobOf(job: Record<string, unknown>): Job {
  const agents = Array.isArray(job.agents) ? job.agents.filter(isMapping).map(agentOf) : [];
  const inSession = job.session === 'orchestrator' || agents.some((agent) => agent.session === 'orchestrator');
  return {
    id: String(job.id),
    ...(typeof job.stage === 'string' && { stage: job.stage }),
    needs: strings(job.needs),
    wants: strings(job.wants),
    outputs: strings(job.outputs),
    gate: job.gate === 'human',
    ...(inSession && { session: 'orchestrator' as const }),
    agents,
    ...(Number.isInteger(job.port) && { port: job.port as number }),
  };
}

/** The pipeline's status and jobs, or null when the text is not YAML, not a mapping, or has no job list. */
export function readPipeline(yaml: string): Pipeline | null {
  let document: unknown;
  try {
    document = parse(yaml);
  } catch {
    return null;
  }
  if (!isMapping(document) || !Array.isArray(document.jobs)) return null;
  return {
    status: typeof document.status === 'string' ? document.status : null,
    stages: strings(document.stages),
    jobs: document.jobs.filter(isMapping).map(jobOf),
  };
}
