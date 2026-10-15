import type { Folded, Score, Span, SpanStatus } from '../../skills/new-episode/scripts/run-log.schema.pure';
import { latestJobSpans } from '../../skills/new-episode/scripts/status.pure';
import { jobChips, type JobChips } from './dashboard-chips.pure';
import { JOB_ID, parsePipeline, type Job, type JobAgent, type Pipeline } from './episode-pipeline-definition.pure';
import { agentFields, JOB_FIELDS, TOP_FIELDS } from './episode-pipeline-fields.pure';
import { findCycle } from './episode-pipeline-graph.pure';
import { checkMapping, field, isMapping, optional, type Field } from './mapping-fields.pure';

export interface DashboardPipeline extends Pipeline {
  status: string;
}

/**
 * A Run scaffolded before the stages layer lists no `stages` and no Job `stage`, and its implementors may carry the
 * `ticket` block of the per-ticket fan-out the Build Jobs replaced; the dashboard still reads it.
 */
const legacyOptional = (fields: readonly Field[], key: string) =>
  fields.map((candidate) => (candidate.key === key ? optional(candidate) : candidate));
const PIPELINE_FIELDS = legacyOptional(TOP_FIELDS, 'stages');
const STAGED_JOB_FIELDS = legacyOptional(JOB_FIELDS, 'stage');
const LEGACY_TICKET = optional(field('ticket', isMapping, 'it must be a mapping of agent and skills'));
const legacyAgentFields = (reviewer: boolean): Field[] => [...agentFields(reviewer), LEGACY_TICKET];

function jobErrors(job: unknown, at: number): string[] {
  const where = `Job ${at + 1}`;
  if (!isMapping(job)) return [`${where} must be a mapping.`];
  const agents = Array.isArray(job.agents) ? job.agents : [];
  return [
    ...checkMapping(where, job, STAGED_JOB_FIELDS),
    ...agents.flatMap((agent) =>
      isMapping(agent)
        ? checkMapping(`${where} agent`, agent, legacyAgentFields(agent.type === 'reviewer'))
        : [`${where} agent must be a mapping.`],
    ),
  ];
}

function orderedJobs(jobs: Job[]): Job[] {
  const byId = new Map(jobs.map((job) => [job.id, job]));
  if (byId.size !== jobs.length) throw new Error('The pipeline has duplicate Job ids.');
  for (const job of jobs) {
    if (!JOB_ID.test(job.id)) throw new Error(`Job "${job.id}" has an invalid id.`);
    for (const dependency of [...job.needs, ...job.wants]) {
      if (!byId.has(dependency)) throw new Error(`Job "${job.id}" names missing Job "${dependency}".`);
    }
  }
  const cycle = findCycle(jobs, byId);
  if (cycle !== null) throw new Error(`The pipeline has a dependency cycle: ${cycle.join(' → ')}.`);
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

/** Reads the local pipeline's display configuration through the Pipeline definition reader, offline. */
export function parseDashboardPipeline(text: string): DashboardPipeline {
  const parsed = parsePipeline(text);
  if ('error' in parsed) throw new Error(parsed.error);
  const { document, pipeline } = parsed;
  if (!isMapping(document) || pipeline === null) throw new Error('The pipeline needs a mapping with jobs.');
  const jobs = document.jobs as unknown[];
  const errors = [...checkMapping('The pipeline', document, PIPELINE_FIELDS), ...jobs.flatMap(jobErrors)];
  if (errors.length > 0) throw new Error(errors.join('\n'));
  return { status: String(document.status), stages: pipeline.stages, jobs: orderedJobs(pipeline.jobs) };
}

export interface DashboardJob extends Omit<Job, 'agents'> {
  config: JobAgent[];
  state: SpanStatus | 'waiting' | 'gate';
  span?: Span;
  attempts: Span[];
  agents: Span[];
  gates: Span[];
  scores: Score[];
  /** Every skill and check the Job's pipeline entry names, with what the current Run's latest Attempt shows of each. */
  chips: JobChips;
}

function ownerOf(span: Span, byId: ReadonlyMap<string, Span>): string | undefined {
  const seen = new Set<string>();
  let current: Span | undefined = span;
  while (current !== undefined && !seen.has(current.span_id)) {
    seen.add(current.span_id);
    if (current.job !== undefined) return current.job;
    if (current.type === 'job') return current.name;
    current = byId.get(current.parent_span_id ?? '');
  }
  return undefined;
}

interface ProjectionContext {
  folded: Folded;
  owners: ReadonlyMap<string, string | undefined>;
  latest: ReadonlyMap<string, Span>;
  openGates: readonly Span[];
}

/** One configured Job with its latest span, its children, the Scores worth Han's eye and its chips. */
function jobView({ agents: config, ...job }: Job, context: ProjectionContext): DashboardJob {
  const { folded, owners, latest, openGates } = context;
  const children = folded.spans.filter((span) => owners.get(span.span_id) === job.id);
  const span = latest.get(job.id);
  const owned = folded.scores.filter((score) => owners.get(score.span_id) === job.id);
  const attempts = children.filter((child) => child.type === 'attempt');
  const agents = children.filter((child) => child.type === 'agent');
  return {
    ...job,
    config,
    span,
    state: openGates.some((gate) => owners.get(gate.span_id) === job.id && gate.trace_id === span?.trace_id)
      ? 'gate'
      : (span?.status ?? 'waiting'),
    attempts,
    agents,
    gates: children.filter((child) => child.type === 'gate'),
    scores: owned.filter(
      (score) => score.name === 'rubric' && (score.value === 'fail' || score.value === 'needs-human'),
    ),
    chips: jobChips(
      { agents: config, checks: job.checks },
      { span, attempts, agents, checkScores: owned.filter((score) => score.name === 'check') },
    ),
  };
}

/** Raw terminal states and evidence; no CLI readiness vocabulary or inferred approval of staging files. */
export function projectDashboard(pipeline: DashboardPipeline, folded: Folded) {
  const byId = new Map(folded.spans.map((span) => [span.span_id, span]));
  const latest = latestJobSpans(folded.spans);
  const owners = new Map(folded.spans.map((span) => [span.span_id, ownerOf(span, byId)]));
  const openGates = folded.spans.filter((span) => span.type === 'gate' && span.status === 'running');
  const jobs = pipeline.jobs.map((job) => jobView(job, { folded, owners, latest, openGates }));
  return { stages: pipeline.stages, jobs, openGates, runs: folded.spans.filter((span) => span.type === 'run') };
}

export type DashboardView = ReturnType<typeof projectDashboard>;
