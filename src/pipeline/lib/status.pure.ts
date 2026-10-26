// A run's state, read from disk alone: each job of a per-run pipeline.yml
// as done, running, gate, blocked, ready or waiting, from the latest job span
// per job id in the Episode's events.jsonl, folded by `fold`. The orchestrator builds its todo list from this, never from memory.
// It reads the pipeline and the gates through the same src/pipeline/lib modules the
// pipeline check uses; they import nothing but `yaml`, so bare node runs them.

import { readPipeline, type Job } from './episode-pipeline-definition.pure.ts';
import type { Folded, Span } from './run-log.pure.ts';
import { formatDuration } from './run-log.pure.ts';
import { gateTier, metaGateTier } from './staging-file.pure.ts';
import { labelled, skillWarningsOf, type SkillWarning } from './status-skills.pure.ts';

export type JobState = 'done' | 'running' | 'gate' | 'blocked' | 'ready' | 'waiting';

/**
 * Whether one output opens its gate: a markdown staging file once its trust tier is approved (`gateTier`, from
 * `verified` and `generated.at`), the HTML Spec by the same tier read from its meta block (design-ADR 0011), and any
 * other file, pipeline.yml, once its `status:` is approved (design-ADR 0005 keeps `status: approved` there because it
 * is config, not markdown).
 */
export function outputApproved(file: string, text: string): boolean {
  if (file.endsWith('.md')) return gateTier(text) === 'approved';
  if (file.endsWith('.html')) return metaGateTier(text) === 'approved';
  return readPipeline(text)?.status === 'approved';
}

/** The latest job span per job id, by start time then sequence: a retried job reads as its last run. A `reused` span stands for the earlier Run's ok span. */
export function latestJobSpans(spans: readonly Span[]): Map<string, Span> {
  const latest = new Map<string, Span>();
  for (const span of spans) {
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

/** How a gate is read: whether a staging output is approved. */
export interface GateReaders {
  outputApproved?: (output: string) => boolean;
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

/** A Gate span with no end: waiting on the user since it opened. */
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
  /** Skills listed for an agent that its transcript shows it never invoked; only spans that recorded `skills_invoked` are judged. */
  skillWarnings: SkillWarning[];
}

/** The crashed and refused spans of a run, the Run itself aside. */
const problemsOf = (spans: readonly Span[]): RunStatus['problems'] =>
  spans.flatMap((span) =>
    span.type !== 'run' && (span.status === 'crashed' || span.status === 'refused')
      ? [{ ...labelled(span), status: span.status }]
      : [],
  );

/**
 * A run's status: each job's state in pipeline order, the agents running now with their elapsed time, the
 * crashed and refused spans, and the gates waiting on the user with their wait. Only the spans of `trace` (the current
 * Run) count when it is given: an earlier Run's ok span makes nothing done, `reuse` links it instead. `folded` is the log folded with
 * `fold` (live Runs named in `live`); `now` (beside the gate readers) is the clock, an ISO time, so nothing here reads it.
 * A job with no finished span is blocked when a job it needs is blocked, ready when every job it needs is
 * done and every job it wants is done or blocked, and waiting otherwise.
 * A `gate: human` job that is done reads `gate` until every output
 * it names is approved; `readers.outputApproved` reads one output (an output path with `<slug>` as written in
 * pipeline.yml) and is built by `readEpisodeStatus`. A gate job that names no output has nothing to approve,
 * so it stays `gate`.
 */
export function runStatus(
  pipelineYaml: string,
  folded: Folded,
  { now, trace, ...readers }: GateReaders & { now: string; trace?: string },
): RunStatus {
  const spans = trace === undefined ? folded.spans : folded.spans.filter((span) => span.trace_id === trace);
  const jobs = readPipeline(pipelineYaml)?.jobs ?? [];
  const [latest, states] = [latestJobSpans(spans), new Map<string, JobState>()];
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
  const open = (type: Span['type']) => spans.filter((span) => span.type === type && span.status === 'running');
  return {
    jobs: jobs.map(({ id }) => ({ id, state: stateOf(id) })),
    running: open('agent').map((span) => ({ ...labelled(span), elapsed_ms: since(span) })),
    problems: problemsOf(spans),
    waiting: open('gate').map((span) => ({ ...labelled(span), waiting_ms: since(span) })),
    skillWarnings: skillWarningsOf(spans, jobs),
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

/** The status as the CLI prints it: one line per job, then running agents, crashed and refused spans, waiting gates, skills listed and not invoked. */
export function renderStatus({ jobs, running, problems, waiting, skillWarnings }: RunStatus): string {
  return [
    ...jobs.map(({ id, state }) => `${state.padEnd(8)}${id}`),
    ...running.map((agent) => `${'running'.padEnd(8)}${spawnName(agent)} · ${formatDuration(agent.elapsed_ms)}`),
    ...problems.map((span) => `${span.status.padEnd(8)}${spawnName(span)}`),
    ...waiting.map(
      (gate) => `${'gate'.padEnd(8)}${gate.job ?? gate.name} · waiting on the user ${formatDuration(gate.waiting_ms)}`,
    ),
    ...skillWarnings.map(
      (span) => `${'warn'.padEnd(8)}${spawnName(span)} · skill not invoked: ${span.missing.join(', ')}`,
    ),
  ].join('\n');
}

function stateFor(job: Job, fromLog: JobState | null, readers: GateReaders): JobState | null {
  if (fromLog === 'done' && job.gate && !approved(job, readers)) return 'gate';
  return fromLog;
}

function approved(job: Job, { outputApproved = () => false }: GateReaders): boolean {
  return job.outputs.length > 0 && job.outputs.every((output) => outputApproved(output));
}

function pending(job: Job, stateOf: (id: string) => JobState): JobState {
  const needs = job.needs.map(stateOf);
  if (needs.includes('blocked')) return 'blocked';
  const wantsFinished = job.wants.map(stateOf).every((state) => state === 'done' || state === 'blocked');
  return needs.every((state) => state === 'done') && wantsFinished ? 'ready' : 'waiting';
}
