import type { Messages } from '@/i18n/translations';
import type { DashboardJob } from '@/lib/dashboard-projection.pure';
import { agentState, type DashboardState } from '@/lib/dashboard-stages.pure';
import { formatDuration } from '../../../skills/new-episode/scripts/run-log-tree.pure';
import type { Score, Span } from '../../../skills/new-episode/scripts/run-log.schema.pure';

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

export function StateBadge({ state }: { state: DashboardState }) {
  return <span className={`rounded-md px-2 py-1 text-caption font-medium ${STATUS_COLOR[state]}`}>{state}</span>;
}

export function SpanMetrics({ span, copy }: { span: Span; copy: DashboardCopy }) {
  const metrics = [
    [copy.duration, span.duration_ms === null ? copy.pendingDuration : formatDuration(span.duration_ms)],
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
      <SpanMetrics span={span} copy={copy} />
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

export function AttemptEvidence({ spans, copy }: { spans: Span[]; copy: DashboardCopy }) {
  if (spans.length === 0) return null;
  return (
    <section className="space-y-2">
      <h3 className="text-body font-medium">
        {copy.attempts} <span className="text-muted-foreground">({spans.length})</span>
      </h3>
      <ul className="space-y-2">
        {spans.map((span) => (
          <li key={span.span_id} className="text-caption">
            <details>
              <summary className="cursor-pointer py-1 focus-visible:outline-2 focus-visible:outline-ring">
                <span className="font-mono">{span.name}</span> <StateBadge state={span.status} />{' '}
                <span className="text-muted-foreground">{formatDuration(span.duration_ms)}</span>
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
