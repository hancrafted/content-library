import type { DashboardJob } from '@/lib/dashboard-projection.pure';
import type { Span } from '../../../skills/new-episode/scripts/run-log.schema.pure';
import {
  AgentEvidence,
  AttemptEvidence,
  ReviewEvidence,
  SpanMetrics,
  StateBadge,
  type DashboardCopy,
} from './dashboard-evidence';

function Dependencies({ job, copy }: { job: DashboardJob; copy: DashboardCopy }) {
  return (
    <dl className="flex flex-wrap gap-x-6 gap-y-2 text-caption">
      <div>
        <dt className="text-muted-foreground">{copy.needs}</dt>
        <dd className="font-mono wrap-anywhere">{job.needs.join(' · ') || copy.none}</dd>
      </div>
      <div className="border-l border-dashed border-border pl-4">
        <dt className="text-muted-foreground">{copy.wants}</dt>
        <dd className="font-mono wrap-anywhere">{job.wants.join(' · ') || copy.none}</dd>
      </div>
    </dl>
  );
}

function AgentConfig({ job, copy }: { job: DashboardJob; copy: DashboardCopy }) {
  return (
    <details>
      <summary className="cursor-pointer py-2 text-caption text-muted-foreground focus-visible:outline-2 focus-visible:outline-ring">
        {copy.config}
      </summary>
      <ul className="space-y-2 pt-2">
        {job.config.map((agent, index) => (
          <li key={index} className="rounded-lg bg-muted/50 p-3 text-caption">
            <p className="font-medium wrap-anywhere">
              {agent.type} · {agent.agent}
            </p>
            <p className="text-muted-foreground">
              {copy.session}: {agent.session ?? 'subagent'}
            </p>
            <p className="font-mono wrap-anywhere">
              {copy.skills}: {agent.skills.join(', ') || copy.none}
            </p>
          </li>
        ))}
      </ul>
    </details>
  );
}

function GateHistory({ gates, copy }: { gates: Span[]; copy: DashboardCopy }) {
  if (gates.length === 0) return null;
  return (
    <ul aria-label={copy.gates} className="space-y-2 text-caption">
      {gates.map((gate) => (
        <li key={gate.span_id} className="flex flex-wrap items-center gap-2">
          <span>
            {copy.gates}: {gate.name}
          </span>
          <StateBadge state={gate.status} />
          <time className="text-muted-foreground" dateTime={gate.start_t}>
            {gate.start_t}
          </time>
        </li>
      ))}
    </ul>
  );
}

export function JobEvidence({ job, copy }: { job: DashboardJob; copy: DashboardCopy }) {
  return (
    <article aria-label={job.id} className="min-w-0 space-y-4 border-t border-border pt-4">
      {job.needsHan > 0 ? (
        <p className="text-caption font-medium text-destructive" data-needs-han={job.needsHan}>
          {copy.needsHan} ({job.needsHan})
        </p>
      ) : null}
      <Dependencies job={job} copy={copy} />
      <p className="text-caption text-muted-foreground">
        {job.gate ? copy.gateConfig : copy.noGate} · {copy.retryLimit}: {job.retries}
      </p>
      {job.span ? <SpanMetrics span={job.span} copy={copy} /> : null}
      <AgentConfig job={job} copy={copy} />
      <AttemptEvidence spans={job.attempts} copy={copy} />
      <AgentEvidence spans={job.agents} job={job} copy={copy} />
      <GateHistory gates={job.gates} copy={copy} />
      <ReviewEvidence scores={job.scores} attempts={job.attempts} copy={copy} />
    </article>
  );
}
