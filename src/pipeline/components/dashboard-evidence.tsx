import { agentElapsed, spanElapsed, type Elapsed } from '@/pipeline/lib/dashboard-elapsed.pure';
import type { DashboardJob } from '@/pipeline/lib/dashboard-projection.pure';
import { agentState, type DashboardState } from '@/pipeline/lib/dashboard-stages.pure';
import { fillTemplate } from '@/shared/lib/template.pure';
import type { Messages } from 'next-intl';
import { useContext } from 'react';
import { formatDuration } from '../lib/run-log-tree.pure';
import type { Score, Span } from '../lib/run-log.schema.pure';
import { DashboardMoment } from './dashboard-moment';

export type DashboardCopy = Messages['dashboard'];

const STATUS_COLOR: Record<DashboardState, string> = {
  waiting: 'bg-muted text-muted-foreground',
  running: 'bg-(--info)/10 text-(--info)',
  ok: 'bg-(--success)/10 text-(--success)',
  error: 'bg-destructive/10 text-destructive',
  refused: 'bg-(--warning)/10 text-(--warning)',
  crashed: 'bg-destructive/10 text-destructive',
  reused: 'bg-(--success)/10 text-(--success)',
  gate: 'bg-(--warning)/10 text-(--warning)',
  unclosed: 'bg-muted text-muted-foreground',
};

/** Why a Job errored and whether the Run went on without it, so a red node is never unexplained. */
export function JobFailureNote({
  job,
  copy,
  compact = false,
}: {
  job: DashboardJob;
  copy: DashboardCopy;
  compact?: boolean;
}) {
  const { failure } = job;
  if (failure === null) return null;
  const { failure: text } = copy.graph;
  return (
    <span className="block space-y-1 text-caption wrap-anywhere" data-job-failure={job.id}>
      <span className="block font-medium text-destructive">{failure.summary ?? text.noReason}</span>
      {compact
        ? null
        : failure.notes.map((note) => (
            <span key={note} className="block whitespace-pre-wrap text-muted-foreground">
              {note}
            </span>
          ))}
      <span className="block text-muted-foreground">
        {failure.continuedWith.length > 0
          ? fillTemplate(text.continued, { jobs: failure.continuedWith.join(', ') })
          : text.notContinued}
      </span>
    </span>
  );
}

export function StateBadge({ state }: { state: DashboardState }) {
  return <span className={`rounded-md px-2 py-1 text-caption font-medium ${STATUS_COLOR[state]}`}>{state}</span>;
}

/** A measured duration, or the time so far of a span still running at the moment shown. */
export function elapsedText(elapsed: Elapsed, copy: DashboardCopy): string {
  const duration = formatDuration(elapsed.ms);
  return elapsed.open ? fillTemplate(copy.elapsedSoFar, { duration }) : duration;
}

export function ElapsedTime({ elapsed, copy }: { elapsed: Elapsed | null; copy: DashboardCopy }) {
  if (elapsed === null) return null;
  return <span className="font-mono text-muted-foreground tabular-nums">{elapsedText(elapsed, copy)}</span>;
}

/** An agent's span counts as an agent: unclosed under an ended Job or Attempt, it has no time so far. */
export function SpanMetrics({ span, job, copy }: { span: Span; job?: DashboardJob; copy: DashboardCopy }) {
  const { now } = useContext(DashboardMoment);
  const elapsed = job && span.type === 'agent' ? agentElapsed(job, span, now) : spanElapsed(span, now);
  const metrics = [
    [copy.duration, elapsed === null ? copy.pendingDuration : elapsedText(elapsed, copy)],
    [copy.input, span['gen_ai.usage.input_tokens'] ?? copy.notMeasured],
    [copy.output, span['gen_ai.usage.output_tokens'] ?? copy.notMeasured],
    [copy.cache, span['gen_ai.usage.cache_read.input_tokens'] ?? copy.notMeasured],
  ];
  return (
    <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-caption sm:grid-cols-4">
      {metrics.map(([label, value]) => (
        <div key={label}>
          <dt className="text-muted-foreground">{label}</dt>
          <dd className="font-mono tabular-nums">
            {typeof value === 'number' ? value.toLocaleString('en-US') : value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

interface AgentRowProps {
  span: Span;
  job: DashboardJob;
  copy: DashboardCopy;
}

function SpanRow({ span, job, copy }: AgentRowProps) {
  return (
    <li className="space-y-3 rounded-lg border border-border p-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <p className="min-w-0 flex-1 text-body font-medium wrap-anywhere">{span.description ?? span.name}</p>
        <StateBadge state={agentState(job, span)} />
      </div>
      <p className="text-caption text-muted-foreground wrap-anywhere">
        {span['gen_ai.agent.name']} {span.role} {span.source} {span['gen_ai.response.model']}
      </p>
      <SpanMetrics span={span} job={job} copy={copy} />
      {span.summary ? <p className="text-caption whitespace-pre-wrap wrap-anywhere">{span.summary}</p> : null}
    </li>
  );
}

export function AgentEvidence({ spans, job, copy }: { spans: Span[]; job: DashboardJob; copy: DashboardCopy }) {
  if (spans.length === 0) return null;
  return (
    <details className="group">
      <summary className="cursor-pointer py-2 text-body font-medium focus-visible:outline-2 focus-visible:outline-ring">
        {copy.agents} <span className="text-muted-foreground">({spans.length})</span>
      </summary>
      <ul className="mt-2 space-y-2">
        {spans.map((span) => (
          <SpanRow key={span.span_id} span={span} job={job} copy={copy} />
        ))}
      </ul>
    </details>
  );
}

function AttemptRow({ span, spans, copy }: { span: Span; spans: Span[]; copy: DashboardCopy }) {
  const { now } = useContext(DashboardMoment);
  return (
    <li className="text-caption">
      <details>
        <summary className="cursor-pointer py-1 focus-visible:outline-2 focus-visible:outline-ring">
          <span className="font-mono">{span.name}</span> <StateBadge state={span.status} />{' '}
          <ElapsedTime elapsed={spanElapsed(span, now)} copy={copy} />
          {span.retry_of ? (
            <span className="text-muted-foreground">
              {copy.retryOf} {spans.find((other) => other.span_id === span.retry_of)?.name ?? span.retry_of}
            </span>
          ) : null}
        </summary>
        <div className="py-3">
          <SpanMetrics span={span} copy={copy} />
        </div>
      </details>
    </li>
  );
}

export function AttemptEvidence({ spans, copy }: { spans: Span[]; copy: DashboardCopy }) {
  if (spans.length === 0) return null;
  return (
    <section className="space-y-2">
      <h3 className="text-body font-medium">
        {copy.attempts} <span className="text-muted-foreground">({spans.length})</span>
      </h3>
      <ul className="space-y-2">
        {spans.map((span) => (
          <AttemptRow key={span.span_id} span={span} spans={spans} copy={copy} />
        ))}
      </ul>
    </section>
  );
}

function ScoreEvidence({ score, target }: { score: Score; target?: string }) {
  return (
    <li className="space-y-2 border-l-2 border-(--warning) pl-3 text-caption">
      <p className="font-medium text-(--warning)">
        {score.value} <span className="text-muted-foreground">· {score.source}</span>
      </p>
      <p className="font-mono text-muted-foreground wrap-anywhere">
        {target ?? score.span_id} · <time dateTime={score.t}>{score.t}</time>
      </p>
      <p className="font-medium whitespace-pre-wrap wrap-anywhere">{score.rubric}</p>
      <p className="whitespace-pre-wrap text-muted-foreground wrap-anywhere">{score.body ?? score.comment}</p>
    </li>
  );
}

export function ReviewEvidence({ scores, attempts, copy }: { scores: Score[]; attempts: Span[]; copy: DashboardCopy }) {
  if (scores.length === 0) return null;
  return (
    <details>
      <summary className="cursor-pointer py-2 text-body font-medium text-(--warning) focus-visible:outline-2 focus-visible:outline-ring">
        {copy.scores} ({scores.length})
      </summary>
      <ul className="mt-3 space-y-4">
        {scores.map((score) => (
          <ScoreEvidence
            key={`${score.trace_id}-${score.seq}`}
            score={score}
            target={attempts.find((span) => span.span_id === score.span_id)?.name}
          />
        ))}
      </ul>
    </details>
  );
}
