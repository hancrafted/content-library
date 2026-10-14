import { parse } from 'yaml';
import type { Folded, Score, Span, SpanStatus } from '../../skills/new-episode/scripts/run-log.schema.pure';
import { latestJobSpans } from '../../skills/new-episode/scripts/status.pure';
import { jobChips, type JobChips } from './dashboard-chips.pure';
import { agentFields, JOB_FIELDS, TOP_FIELDS } from './episode-pipeline-fields.pure';
import { findCycle } from './episode-pipeline-graph.pure';
import { JOB_ID, jobOf, type Job, type JobAgent } from './episode-pipeline-jobs.pure';
import { checkMapping, field, isMapping, optional, stringsOf, type Field, type Mapping } from './mapping-fields.pure';

export interface DashboardAgentConfig extends JobAgent {
  agent: string;
}

export interface DashboardJobConfig extends Job {
  retries: number;
  /** A template Job's `<file>#<heading>`: customize-pipeline writes one Job per item; absent on a real Job. */
  foreach?: string;
  agents: DashboardAgentConfig[];
}

export interface DashboardPipeline {
  status: string;
  /** The ordered stage ids the pipeline lists; empty for a Run scaffolded before stages existed. */
  stages: string[];
  jobs: DashboardJobConfig[];
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

function jobConfig(job: Mapping): DashboardJobConfig {
  const parsed = jobOf(job);
  return {
    ...parsed,
    retries: Number(job.retries),
    ...(typeof job.foreach === 'string' && { foreach: job.foreach }),
    agents: (job.agents as Mapping[]).map((agent, index) => ({
      ...parsed.agents[index],
      agent: typeof agent.agent === 'string' ? agent.agent : 'general-purpose',
    })),
  };
}

function orderedJobs(jobs: DashboardJobConfig[]): DashboardJobConfig[] {
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
  const ordered: DashboardJobConfig[] = [];
  const visited = new Set<string>();
  const visit = (job: DashboardJobConfig) => {
    if (visited.has(job.id)) return;
    visited.add(job.id);
    job.needs.forEach((id) => visit(byId.get(id)!));
    ordered.push(job);
  };
  jobs.forEach(visit);
  return ordered;
}

/** Reads the local pipeline's display configuration without consulting the repository or network. */
export function parseDashboardPipeline(text: string): DashboardPipeline {
  const document: unknown = parse(text);
  if (!isMapping(document) || !Array.isArray(document.jobs)) throw new Error('The pipeline needs a mapping with jobs.');
  const errors = [...checkMapping('The pipeline', document, PIPELINE_FIELDS), ...document.jobs.flatMap(jobErrors)];
  if (errors.length > 0) throw new Error(errors.join('\n'));
  return {
    status: String(document.status),
    stages: stringsOf(document.stages),
    jobs: orderedJobs(document.jobs.filter(isMapping).map(jobConfig)),
  };
}

export interface DashboardJob extends Omit<DashboardJobConfig, 'agents'> {
  config: DashboardAgentConfig[];
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
function jobView({ agents: config, ...job }: DashboardJobConfig, context: ProjectionContext): DashboardJob {
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
