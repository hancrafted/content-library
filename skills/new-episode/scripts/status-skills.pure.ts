// Which listed skills a finished span did not invoke: the pipeline's skills for the agent type a span stands for,
// against the `skills_invoked` its end line (or an orchestrator Job's attrs line) recorded. Pure.
import type { Job, JobAgent } from '../../../src/lib/episode-pipeline-jobs.pure.ts';
import type { Span } from './run-log.pure.ts';

/** Only the fields a span has, so an absent attempt or role stays absent. */
export function labelled(span: Span): { name: string; job?: string; attempt?: number; role?: string } {
  const { name, job, attempt, role } = span;
  return {
    name,
    ...(job !== undefined && { job }),
    ...(attempt !== undefined && { attempt }),
    ...(role !== undefined && { role }),
  };
}

/** A finished agent (or orchestrator-session Job) that did not invoke a skill its pipeline entry lists. */
export interface SkillWarning {
  name: string;
  job?: string;
  attempt?: number;
  role?: string;
  missing: string[];
}

/**
 * The pipeline agents a span answers to: an implementor or reviewer by its role, an orchestrator-session Job by its
 * agents that run there. A `ticket-implementor` of an old log answers to none: no pipeline lists its skills now.
 */
function listedSkills(span: Span, job: Job): string[] {
  const of = (agents: readonly JobAgent[], pick: (agent: JobAgent) => string[]): string[] => agents.flatMap(pick);
  const subagents = job.agents.filter((agent) => agent.session === undefined);
  const byType = (type: string): JobAgent[] => subagents.filter((agent) => agent.type === type);
  if (span.type === 'job')
    return job.session === 'orchestrator'
      ? of(
          job.agents.filter((agent) => agent.session === 'orchestrator'),
          (agent) => agent.skills,
        )
      : [];
  if (span.role === 'implementor') return of(byType('implementor'), (agent) => agent.skills);
  if (span.role?.startsWith('reviewer')) return of(byType('reviewer'), (agent) => agent.skills);
  return [];
}

/** The ended spans that recorded their invoked skills and left a listed one out. */
export function skillWarningsOf(spans: readonly Span[], jobs: readonly Job[]): SkillWarning[] {
  return spans.flatMap((span) => {
    const job = jobs.find((candidate) => candidate.id === span.job);
    if (job === undefined || span.skills_invoked === undefined || (span.type !== 'agent' && span.type !== 'job'))
      return [];
    const invoked = new Set(span.skills_invoked);
    const missing = [...new Set(listedSkills(span, job))].filter((skill) => !invoked.has(skill));
    return missing.length === 0 ? [] : [{ ...labelled(span), missing }];
  });
}
