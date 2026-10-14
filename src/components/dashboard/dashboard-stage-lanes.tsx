import { Button } from '@/components/ui/button';
import type { EventScope } from '@/lib/dashboard-events.pure';
import type { DashboardJob } from '@/lib/dashboard-projection.pure';
import {
  agentIdentity,
  agentState,
  isComplete,
  jobLanes,
  runningAgents,
  stageLayers,
  type DashboardStage,
} from '@/lib/dashboard-stages.pure';
import { fillTemplate } from '@/lib/template.pure';
import { ArrowDown, GitBranch } from 'lucide-react';
import { AgentEvidence, StateBadge, type DashboardCopy } from './dashboard-evidence';
import styles from './dashboard-graph.module.css';
import { JobEvidence } from './dashboard-jobs';
import { StageStateIcon } from './dashboard-stage-nav';

export type OpenEventLog = (title: string, scope: EventScope) => void;
interface JobProps {
  job: DashboardJob;
  copy: DashboardCopy;
  openLog: OpenEventLog;
}
type Lane = ReturnType<typeof jobLanes>[number];
interface LaneProps extends JobProps {
  lane: Lane;
}

function AgentChips({ agents, job, copy }: { agents: Lane['agents']; job: DashboardJob; copy: DashboardCopy }) {
  return (
    <ul className="flex flex-wrap gap-2" aria-label={copy.agents}>
      {agents.map((agent) => (
        <li
          key={agent.span_id}
          className="flex min-w-0 items-center gap-2 rounded-md border border-border px-2 py-1 text-caption"
        >
          <StageStateIcon state={agentState(job, agent)} />
          <span className="min-w-0 wrap-anywhere">{agent.description ?? agentIdentity(agent).role}</span>
          <span className="text-muted-foreground">{agentState(job, agent)}</span>
        </li>
      ))}
    </ul>
  );
}

function SessionLane({ lane, job, copy, openLog }: LaneProps) {
  const label =
    lane.ticket === undefined ? copy.graph.unassigned : fillTemplate(copy.graph.ticket, { number: lane.ticket });
  return (
    <li className="space-y-3 rounded-lg border border-border bg-background p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-body font-medium">{label}</p>
        <StateBadge state={lane.state} />
      </div>
      {lane.ticket === undefined ? (
        <p className="text-caption text-muted-foreground">{copy.graph.unassignedHelp}</p>
      ) : null}
      <AgentChips agents={lane.agents} job={job} copy={copy} />
      <AgentEvidence spans={lane.agents} job={job} copy={copy} />
      {lane.ticket !== undefined ? (
        <Button variant="outline" onClick={() => openLog(label, { jobs: [job.id], ticket: lane.ticket })}>
          {copy.graph.logs}
        </Button>
      ) : null}
    </li>
  );
}

function SessionLanes({ job, copy, openLog }: JobProps) {
  const lanes = jobLanes(job);
  if (lanes.length === 0) return <p className="text-caption text-muted-foreground">{copy.graph.noSessions}</p>;
  return (
    <ul className="space-y-3" aria-label={copy.graph.sessions}>
      {lanes.map((lane) => (
        <SessionLane key={lane.ticket ?? 'unassigned'} lane={lane} job={job} copy={copy} openLog={openLog} />
      ))}
    </ul>
  );
}

function ActiveSessions({ job, copy }: Pick<JobProps, 'job' | 'copy'>) {
  const active = runningAgents(job);
  return (
    <>
      {active.length > 0 ? (
        <span className="block text-caption text-(--info)">
          {fillTemplate(copy.graph.running, { count: active.length })}
        </span>
      ) : null}
      {active.map((agent) => (
        <span key={agent.span_id} className="block text-caption wrap-anywhere">
          {fillTemplate(copy.graph.active, { name: agent.description ?? agent.name })}
        </span>
      ))}
    </>
  );
}

function JobSummary({ job, copy }: Pick<JobProps, 'job' | 'copy'>) {
  return (
    <summary className="cursor-pointer space-y-2 p-4 focus-visible:outline-2 focus-visible:outline-ring">
      <span className="inline-flex max-w-full flex-wrap items-center gap-2 align-middle">
        <span className="text-body font-medium wrap-anywhere">{job.id}</span>
        <StateBadge state={job.state} />
      </span>
      <span className="block text-caption text-muted-foreground wrap-anywhere">
        {copy.needs}: {job.needs.join(', ') || copy.none}
      </span>
      {job.wants.length > 0 ? (
        <span className="block border-l-2 border-dashed border-border pl-2 text-caption text-muted-foreground wrap-anywhere">
          {copy.wants}: {job.wants.join(', ')}
        </span>
      ) : null}
      <ActiveSessions job={job} copy={copy} />
    </summary>
  );
}

function JobLane({ job, copy, openLog }: JobProps) {
  return (
    <li className={styles.branch} data-complete={isComplete(job.state)}>
      <details className="min-w-0 rounded-lg border border-border bg-card">
        <JobSummary job={job} copy={copy} />
        <div className="space-y-4 border-t border-border p-4">
          <Button variant="outline" onClick={() => openLog(job.id, { jobs: [job.id] })}>
            {copy.graph.logs}
          </Button>
          <SessionLanes job={job} copy={copy} openLog={openLog} />
          <details>
            <summary className="cursor-pointer py-2 text-body font-medium focus-visible:outline-2 focus-visible:outline-ring">
              {copy.graph.details}
            </summary>
            <JobEvidence job={job} copy={copy} />
          </details>
        </div>
      </details>
    </li>
  );
}

function LayerHeading({ count, level, copy }: { count: number; level: number; copy: DashboardCopy }) {
  return (
    <p className="flex items-center gap-2 text-caption text-muted-foreground">
      {count > 1 ? (
        <GitBranch aria-hidden="true" className="size-4" />
      ) : (
        <ArrowDown aria-hidden="true" className="size-4" />
      )}
      {count > 1 ? fillTemplate(copy.graph.parallel, { count }) : fillTemplate(copy.graph.step, { number: level })}
    </p>
  );
}

interface StageProps {
  stage: DashboardStage;
  copy: DashboardCopy;
  openLog: OpenEventLog;
}

export function StageLanes({ stage, copy, openLog }: StageProps) {
  return (
    <div className="space-y-5">
      {stageLayers(stage).map((jobs, index) => (
        <section key={index} className="space-y-3" aria-label={fillTemplate(copy.graph.step, { number: index + 1 })}>
          <LayerHeading count={jobs.length} level={index + 1} copy={copy} />
          <ul className="grid grid-cols-1 items-start gap-4 xl:grid-cols-2">
            {jobs.map((job) => (
              <JobLane key={job.id} job={job} copy={copy} openLog={openLog} />
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
