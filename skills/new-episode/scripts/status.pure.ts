// A run's state, read from disk alone: each job of a per-run pipeline.yml
// as done, running, gate, blocked, ready or waiting, from the latest job span
// per job id in the Episode's events.jsonl, folded by `fold`. The orchestrator builds its todo list from this, never from memory.
// It reads the pipeline and the gates through the same src/lib modules the
// pipeline check uses; they import nothing but `yaml`, so bare node runs them.

import { readPipeline, type Job } from '../../../src/lib/episode-pipeline-jobs.pure.ts';
import { gateTier } from '../../../src/lib/staging-file.pure.ts';
import type { Folded, Span } from './run-log.pure.ts';
import { formatDuration } from './run-log.pure.ts';

export type JobState = 'done' | 'running' | 'gate' | 'blocked' | 'ready' | 'waiting';

/**
 * Whether one output opens its gate: a markdown staging file once its trust tier is approved (`gateTier`, from
 * `verified` and `generated.at`), and any other file, pipeline.yml, once its `status:` is approved (design-ADR
 * 0005 keeps `status: approved` there because it is config, not markdown).
 */
export function outputApproved(file: string, text: string): boolean {
  return file.endsWith('.md') ? gateTier(text) === 'approved' : readPipeline(text)?.status === 'approved';
}

/** A sub-issue as `gh api .../sub_issues` returns it, reduced to what the gate reads. */
export interface SubIssue {
  state: string;
  labels: { name: string }[];
}

/** The design gate's rule: the spec issue has sub-issues, and none still open carries `needs-triage`. */
export function subIssuesApproved(tickets: readonly SubIssue[]): boolean {
  const open = tickets.filter((ticket) => ticket.state === 'open');
  return tickets.length > 0 && open.every((ticket) => !ticket.labels.some((label) => label.name === 'needs-triage'));
}

/** The latest job span per job id, by start time then sequence: a retried job reads as its last run. */
function latestJobSpans(folded: Folded): Map<string, Span> {
  const latest = new Map<string, Span>();
  for (const span of folded.spans) {
    if (span.type !== 'job') continue;
    const id = span.job ?? span.name;
    const known = latest.get(id);
    const order =
      known === undefined ? 1 : Date.parse(span.start_t) - Date.parse(known.start_t) || span.seq - known.seq;
    if (order >= 0) latest.set(id, span);
  }
  return latest;
}

/**
 * What a job's latest span says: done when it ended ok or reused, blocked when it ended in error, running while
 * it is open on a live log. A crashed, refused or missing span says nothing, so the job runs again.
 */
function logged(span: Span | undefined): JobState | null {
  if (span === undefined) return null;
  if (span.status === 'ok' || span.status === 'reused') return 'done';
  if (span.status === 'error') return 'blocked';
  return span.status === 'running' ? 'running' : null;
}

/** How a gate is read: whether a staging output is approved (`outputApproved`), or, for a job with no output, its tickets. */
export interface GateReaders {
  outputApproved?: (output: string) => boolean;
  labelApproved?: (jobId: string) => boolean;
}

/** One agent span still open on a live log. */
export interface RunningAgent {
  name: string;
  job?: string;
  attempt?: number;
  role?: string;
  elapsed_ms: number;
}

/** A span that crashed or was refused (the concurrency limit). */
export interface ProblemSpan {
  name: string;
  job?: string;
  attempt?: number;
  role?: string;
  status: 'crashed' | 'refused';
}

/** A Gate span with no end: waiting on Han since it opened. */
export interface WaitingGate {
  name: string;
  job?: string;
  waiting_ms: number;
}

export interface RunStatus {
  jobs: { id: string; state: JobState }[];
  running: RunningAgent[];
  problems: ProblemSpan[];
  waiting: WaitingGate[];
}

/** Only the fields a span has, so an absent attempt or role stays absent. */
function labelled(span: Span): { name: string; job?: string; attempt?: number; role?: string } {
  const { name, job, attempt, role } = span;
  return {
    name,
    ...(job !== undefined && { job }),
    ...(attempt !== undefined && { attempt }),
    ...(role !== undefined && { role }),
  };
}

/** The crashed and refused spans of a run, the Run itself aside. */
const problemsOf = (folded: Folded): RunStatus['problems'] =>
  folded.spans.flatMap((span) =>
    span.type !== 'run' && (span.status === 'crashed' || span.status === 'refused')
      ? [{ ...labelled(span), status: span.status }]
      : [],
  );

/**
 * A run's status: each job's state in pipeline order, the agents running now with their elapsed time, the
 * crashed and refused spans, and the gates waiting on Han with their wait. `folded` is the log folded with
 * `fold` (live Runs named in `live`); `now` (beside the gate readers) is the clock, an ISO time, so nothing here reads it.
 * A job with no finished span is blocked when a job it needs is blocked, ready when every job it needs is
 * done and every job it wants is done or blocked, and waiting otherwise.
 * A `gate: human` job that is done reads `gate` until every output
 * it names is approved; `readers.outputApproved` reads one output (an output path with `<slug>` as written in
 * pipeline.yml) and is built by `readEpisodeStatus`. A gate job that names no output has no
 * status to read: it reads `gate` until `readers.labelApproved(jobId)` says its tickets are approved, and
 * stays `gate` when none is given, so an unreadable label never opens the gate.
 */
export function runStatus(
  pipelineYaml: string,
  folded: Folded,
  { now, ...readers }: GateReaders & { now: string },
): RunStatus {
  const jobs = readPipeline(pipelineYaml)?.jobs ?? [];
  const latest = latestJobSpans(folded);
  const states = new Map<string, JobState>();
  const stateOf = (id: string): JobState => {
    const known = states.get(id);
    if (known !== undefined) return known;
    // Seeded before recursing, so a cycle the pipeline check would refuse reads as waiting, not a stack overflow.
    states.set(id, 'waiting');
    const job = jobs.find((candidate) => candidate.id === id);
    const fromLog = logged(latest.get(id));
    const state =
      job === undefined ? (fromLog ?? 'waiting') : (stateFor(job, fromLog, readers) ?? pending(job, stateOf));
    states.set(id, state);
    return state;
  };
  const since = (span: Span): number => Date.parse(now) - Date.parse(span.start_t);
  const open = (type: Span['type']) => folded.spans.filter((span) => span.type === type && span.status === 'running');
  return {
    jobs: jobs.map(({ id }) => ({ id, state: stateOf(id) })),
    running: open('agent').map((span) => ({ ...labelled(span), elapsed_ms: since(span) })),
    problems: problemsOf(folded),
    waiting: open('gate').map((span) => ({ ...labelled(span), waiting_ms: since(span) })),
  };
}

const spawnName = ({
  name,
  job,
  attempt,
  role,
}: {
  name: string;
  job?: string;
  attempt?: number;
  role?: string;
}): string =>
  job !== undefined && attempt !== undefined && role !== undefined ? `${name} · ${job}#${attempt}/${role}` : name;

/** The status as the CLI prints it: one line per job, then running agents, crashed and refused spans, waiting gates. */
export function renderStatus({ jobs, running, problems, waiting }: RunStatus): string {
  return [
    ...jobs.map(({ id, state }) => `${state.padEnd(8)}${id}`),
    ...running.map((agent) => `${'running'.padEnd(8)}${spawnName(agent)} · ${formatDuration(agent.elapsed_ms)}`),
    ...problems.map((span) => `${span.status.padEnd(8)}${spawnName(span)}`),
    ...waiting.map(
      (gate) => `${'gate'.padEnd(8)}${gate.job ?? gate.name} · waiting on Han ${formatDuration(gate.waiting_ms)}`,
    ),
  ].join('\n');
}

function stateFor(job: Job, fromLog: JobState | null, readers: GateReaders): JobState | null {
  if (fromLog === 'done' && job.gate && !approved(job, readers)) return 'gate';
  return fromLog;
}

function approved(job: Job, { outputApproved = () => false, labelApproved = () => false }: GateReaders): boolean {
  if (job.outputs.length === 0) return labelApproved(job.id);
  return job.outputs.every((output) => outputApproved(output));
}

function pending(job: Job, stateOf: (id: string) => JobState): JobState {
  const needs = job.needs.map(stateOf);
  if (needs.includes('blocked')) return 'blocked';
  const wantsFinished = job.wants.map(stateOf).every((state) => state === 'done' || state === 'blocked');
  return needs.every((state) => state === 'done') && wantsFinished ? 'ready' : 'waiting';
}
