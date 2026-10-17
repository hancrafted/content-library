import type { Folded, Score, Span, SpanStatus } from '../../skills/new-episode/scripts/run-log.schema.pure';
import { latestJobSpans } from '../../skills/new-episode/scripts/status.pure';
import { jobChips, type JobChips } from './dashboard-chips.pure';
import {
  JOB_ID,
  jobGraph,
  missingEdges,
  parsePipeline,
  type Job,
  type JobAgent,
  type Pipeline,
} from './episode-pipeline-definition.pure';
import { LEGACY_FIELDS } from './episode-pipeline-fields.pure';
import { checkMapping, isMapping } from './mapping-fields.pure';

export interface DashboardPipeline extends Pipeline {
  status: string;
}

/** The dashboard reads a Run scaffolded before the stages layer by the Pipeline definition's legacy fields. */
function jobErrors(job: unknown, at: number): string[] {
  const where = `Job ${at + 1}`;
  if (!isMapping(job)) return [`${where} must be a mapping.`];
  const agents = Array.isArray(job.agents) ? job.agents : [];
  return [
    ...checkMapping(where, job, LEGACY_FIELDS.job),
    ...agents.flatMap((agent) =>
      isMapping(agent)
        ? checkMapping(`${where} agent`, agent, LEGACY_FIELDS.agent(agent.type === 'reviewer'))
        : [`${where} agent must be a mapping.`],
    ),
  ];
}

/** The Jobs in needs order by the Pipeline definition's graph rules, throwing at the first rule broken. */
function orderedJobs(jobs: Job[]): Job[] {
  const graph = jobGraph(jobs);
  if (graph.duplicates.length > 0) throw new Error('The pipeline has duplicate Job ids.');
  for (const job of jobs) {
    if (!JOB_ID.test(job.id)) throw new Error(`Job "${job.id}" has an invalid id.`);
    const [missing] = missingEdges(job, graph.byId);
    if (missing) throw new Error(`Job "${job.id}" names missing Job "${missing.other}".`);
  }
  if (graph.cycle !== null) throw new Error(`The pipeline has a dependency cycle: ${graph.cycle.join(' → ')}.`);
  return graph.ordered!;
}

/** Reads the local pipeline's display configuration through the Pipeline definition reader, offline. */
export function parseDashboardPipeline(text: string): DashboardPipeline {
  const parsed = parsePipeline(text);
  if ('error' in parsed) throw new Error(parsed.error);
  const { document, pipeline } = parsed;
  if (!isMapping(document) || pipeline === null) throw new Error('The pipeline needs a mapping with jobs.');
  const jobs = document.jobs as unknown[];
  const errors = [...checkMapping('The pipeline', document, LEGACY_FIELDS.top), ...jobs.flatMap(jobErrors)];
  if (errors.length > 0) throw new Error(errors.join('\n'));
  const { devPort, specPort } = pipeline;
  return {
    status: String(document.status),
    stages: pipeline.stages,
    jobs: orderedJobs(pipeline.jobs),
    ...(devPort !== undefined && { devPort }),
    ...(specPort !== undefined && { specPort }),
  };
}

export interface DashboardJob extends Omit<Job, 'agents'> {
  config: JobAgent[];
  state: SpanStatus | 'waiting' | 'gate';
  span?: Span;
  attempts: Span[];
  agents: Span[];
  gates: Span[];
  scores: Score[];
  /** The Job's notes in the current Run that block on Han: `needs-human` and `blocked`. Drives the "needs Han" badge. */
  needsHan: number;
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

const NEEDS_HAN: readonly string[] = ['needs-human', 'blocked'];

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
    needsHan: (span?.events ?? []).filter(
      (event) => event.name === 'note' && NEEDS_HAN.includes(event.attributes['note.type']),
    ).length,
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
