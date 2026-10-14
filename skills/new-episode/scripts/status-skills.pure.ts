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
 * Whether a span answers to a pipeline agent: an orchestrator-session agent to its Job's span, an implementor or
 * reviewer subagent to an agent span by its role. A `ticket-implementor` of an old log answers to none: no pipeline
 * lists its skills now.
 */
export function answersTo(span: Pick<Span, 'type' | 'role'>, agent: JobAgent): boolean {
  if (agent.session === 'orchestrator') return span.type === 'job';
  if (span.type !== 'agent') return false;
  if (agent.type === 'implementor') return span.role === 'implementor';
  return agent.type === 'reviewer' && span.role?.startsWith('reviewer') === true;
}

const listedSkills = (span: Span, job: Job): string[] =>
  job.agents.filter((agent) => answersTo(span, agent)).flatMap((agent) => agent.skills);

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
