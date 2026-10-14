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

/** A pipeline job as its readers see it: its id, the jobs it needs and wants, the staging paths it writes, its gate. */
export interface Job {
  id: string;
  needs: string[];
  /** Jobs it waits for that do not block it when they block; empty when it wants none. */
  wants: string[];
  outputs: string[];
  /** True for `gate: human`: the job reads done only once Han approves its outputs. */
  gate: boolean;
  /** `orchestrator` when the job's agents run in the orchestrator session; absent for the default, a subagent. */
  session?: 'orchestrator';
}

export interface Pipeline {
  /** The pipeline's own `status:` (draft or approved), null when it is not text. */
  status: string | null;
  jobs: Job[];
}

function isMapping(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** A list of strings as is; anything else, a list holding a non-string included, as no list. */
function strings(value: unknown): string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string') ? value : [];
}

/** One job mapping as a `Job`. */
export function jobOf(job: Record<string, unknown>): Job {
  return {
    id: String(job.id),
    needs: strings(job.needs),
    wants: strings(job.wants),
    outputs: strings(job.outputs),
    gate: job.gate === 'human',
    ...(job.session === 'orchestrator' && { session: 'orchestrator' as const }),
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
    jobs: document.jobs.filter(isMapping).map(jobOf),
  };
}
