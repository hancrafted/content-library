import { readPipeline, type Job } from './episode-pipeline-definition.pure.ts';
import type { Folded, Span } from './run-log.pure.ts';
import { formatDuration } from './run-log.pure.ts';
import { gateTier, metaGateTier } from './staging-file.pure.ts';
import { labelled, skillWarningsOf, type SkillWarning } from './status-skills.pure.ts';

export type JobState = 'done' | 'running' | 'gate' | 'blocked' | 'ready' | 'waiting';

// decision: docs/decision-records/0011-episode-design-is-reviewed-as-a-static-html-spec.md
// decision: docs/decision-records/0005-frontmatter-follows-okf.md
export function outputApproved(file: string, text: string): boolean {
  if (file.endsWith('.md')) return gateTier(text) === 'approved';
  if (file.endsWith('.html')) return metaGateTier(text) === 'approved';
  return readPipeline(text)?.status === 'approved';
}

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

function logged(span: Span | undefined): JobState | null {
  if (span === undefined) return null;
  if (span.status === 'ok' || span.status === 'reused') return 'done';
  if (span.status === 'error') return 'blocked';
  return span.status === 'running' ? 'running' : null;
}

export interface GateReaders {
  outputApproved?: (output: string) => boolean;
}

export interface RunningAgent {
  name: string;
  job?: string;
  attempt?: number;
  role?: string;
  elapsedMilliseconds: number;
}

export interface ProblemSpan {
  name: string;
  job?: string;
  attempt?: number;
  role?: string;
  status: 'crashed' | 'refused';
}

export interface WaitingGate {
  name: string;
  job?: string;
  waitingMilliseconds: number;
}

export interface RunStatus {
  jobs: { id: string; state: JobState }[];
  running: RunningAgent[];
  problems: ProblemSpan[];
  waiting: WaitingGate[];
  skillWarnings: SkillWarning[];
}

const problemsOf = (spans: readonly Span[]): RunStatus['problems'] =>
  spans.flatMap((span) =>
    span.type !== 'run' && (span.status === 'crashed' || span.status === 'refused')
      ? [{ ...labelled(span), status: span.status }]
      : [],
  );

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
    const seedWaitingSoACycleIsNotAStackOverflow = (): void => void states.set(id, 'waiting');
    seedWaitingSoACycleIsNotAStackOverflow();
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
    running: open('agent').map((span) => ({ ...labelled(span), elapsedMilliseconds: since(span) })),
    problems: problemsOf(spans),
    waiting: open('gate').map((span) => ({ ...labelled(span), waitingMilliseconds: since(span) })),
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

export function renderStatus({ jobs, running, problems, waiting, skillWarnings }: RunStatus): string {
  return [
    ...jobs.map(({ id, state }) => `${state.padEnd(8)}${id}`),
    ...running.map(
      (agent) => `${'running'.padEnd(8)}${spawnName(agent)} · ${formatDuration(agent.elapsedMilliseconds)}`,
    ),
    ...problems.map((span) => `${span.status.padEnd(8)}${spawnName(span)}`),
    ...waiting.map(
      (gate) =>
        `${'gate'.padEnd(8)}${gate.job ?? gate.name} · waiting on the user ${formatDuration(gate.waitingMilliseconds)}`,
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
