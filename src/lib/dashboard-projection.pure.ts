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
  /** Why the Job's latest span errored, and which Jobs went on without it; null unless it errored. */
  failure: JobFailure | null;
  /** Every skill and check the Job's pipeline entry names, with what the current Run's latest Attempt shows of each. */
  chips: JobChips;
}

export interface JobFailure {
  summary: string | null;
  /** The text of the Job's `blocked` and `needs-human` notes. */
  notes: string[];
  /** Jobs that only want this one and started after it errored: wants never block, so the Run went on. */
  continuedWith: string[];
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
  /** The trace of the latest Run: only its notes can still need Han. */
  currentTrace: string | undefined;
  owners: ReadonlyMap<string, string | undefined>;
  latest: ReadonlyMap<string, Span>;
  openGates: readonly Span[];
}

const NEEDS_HAN: readonly string[] = ['needs-human', 'blocked'];

/** The text of a span's `needs-human` and `blocked` notes. */
function needsHanNotes(span: Span): string[] {
  return (span.events ?? []).flatMap((event) =>
    event.name === 'note' && NEEDS_HAN.includes(event.attributes['note.type']) ? [event.attributes['note.text']] : [],
  );
}

/** The Job's `needs-human` and `blocked` notes, counted only while its latest span belongs to the latest Run. */
function needsHanCount(span: Span | undefined, currentTrace: string | undefined): number {
  if (span === undefined || span.trace_id !== currentTrace) return 0;
  return needsHanNotes(span).length;
}

/** What an errored Job said about itself, and the Jobs that started after it ended anyway; null for any other state. */
function jobFailure(
  job: Omit<DashboardJob, 'failure'>,
  jobs: readonly Omit<DashboardJob, 'failure'>[],
): JobFailure | null {
  const { span } = job;
  if (span === undefined || span.status !== 'error') return null;
  const ended = span.end_t ?? span.start_t;
  return {
    summary: span.summary,
    notes: needsHanNotes(span),
    continuedWith: jobs
      .filter(
        (other) =>
          other.wants.includes(job.id) && other.span?.trace_id === span.trace_id && other.span.start_t >= ended,
      )
      .map((other) => other.id),
  };
}

/** One configured Job with its latest span, its children, the Scores worth Han's eye and its chips. */
function jobView({ agents: config, ...job }: Job, context: ProjectionContext): Omit<DashboardJob, 'failure'> {
  const { folded, owners, latest, openGates, currentTrace } = context;
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
    needsHan: needsHanCount(span, currentTrace),
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
  const runs = folded.spans.filter((span) => span.type === 'run');
  const currentTrace = runs.reduce<Span | undefined>(
    (known, run) => (known === undefined || run.start_t >= known.start_t ? run : known),
    undefined,
  )?.trace_id;
  const views = pipeline.jobs.map((job) => jobView(job, { folded, currentTrace, owners, latest, openGates }));
  const jobs = views.map((job) => ({ ...job, failure: jobFailure(job, views) }));
  return { stages: pipeline.stages, jobs, openGates, runs };
}

export type DashboardView = ReturnType<typeof projectDashboard>;
