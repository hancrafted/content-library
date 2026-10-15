import { agentElapsed, spanElapsed } from '@/lib/dashboard-elapsed.pure';
import type { DashboardJob } from '@/lib/dashboard-projection.pure';
import { agentState, currentAgent, stageLayers, type DashboardStage } from '@/lib/dashboard-stages.pure';
import { fillTemplate } from '@/lib/template.pure';
import { useContext, useState, type KeyboardEvent } from 'react';
import { JobChipList } from './dashboard-chips';
import { ElapsedTime, StateBadge, type DashboardCopy } from './dashboard-evidence';
import styles from './dashboard-graph.module.css';
import { PreviewButton } from './dashboard-job-links';
import { DashboardMoment, type Moment } from './dashboard-moment';
import { AttentionMarker, StageStateIcon } from './dashboard-state-icon';

export type SelectJob = (stage: string, job: string) => void;

interface JobProps {
  stage: DashboardStage;
  job: DashboardJob;
  onSelectJob: SelectJob;
  copy: DashboardCopy;
}

interface BranchProps extends JobProps {
  layer: number;
  layers: number;
  lane: number;
  lanes: number;
  last: boolean;
}

function nodeAgents(job: DashboardJob) {
  if (job.config.length === 0) return [{ role: job.id, state: job.state, span: job.span }];
  return job.config.map((config) => {
    const span = currentAgent(job, config.type);
    return {
      role: config.type,
      state: span ? agentState(job, span) : config.session === 'orchestrator' ? job.state : ('waiting' as const),
      span: span ?? (config.session === 'orchestrator' ? job.span : undefined),
    };
  });
}

type Agent = ReturnType<typeof nodeAgents>[number];
interface NodeProps extends JobProps {
  agent: Agent;
  x: number;
  y: number;
}

function TemplateLabel({ job, copy }: Pick<JobProps, 'job' | 'copy'>) {
  if (!job.foreach) return null;
  return (
    <span className="block text-caption text-muted-foreground">
      {fillTemplate(copy.graph.onePer, { heading: job.foreach.split('#').at(-1) ?? job.foreach })}
    </span>
  );
}

function JobPopover({ job, agent, stage, onSelectJob, copy }: JobProps & { agent: Agent }) {
  const { now } = useContext(DashboardMoment);
  const elapsed =
    agent.span && (agent.span.type === 'agent' ? agentElapsed(job, agent.span, now) : spanElapsed(agent.span, now));
  return (
    <div className={styles.popover}>
      <button
        type="button"
        onClick={() => onSelectJob(stage.id, job.id)}
        className="block w-full cursor-pointer space-y-2 text-left focus-visible:outline-2 focus-visible:outline-ring"
      >
        <span className="block text-caption font-semibold wrap-anywhere">
          {job.id} · {agent.role}
        </span>
        <span className="flex flex-wrap items-center gap-2 text-caption">
          <StageStateIcon state={agent.state} />
          <StateBadge state={agent.state} />
          <ElapsedTime elapsed={elapsed ?? null} copy={copy} />
          <AttentionMarker job={job} label={copy.graph.jobAttention} />
        </span>
        <JobChipList job={job} copy={copy} />
        <TemplateLabel job={job} copy={copy} />
      </button>
      <PreviewButton job={job} copy={copy} className="mt-2" />
    </div>
  );
}

function dismissPopover(event: KeyboardEvent, dismiss: (value: boolean) => void) {
  if (event.key !== 'Escape') return;
  dismiss(true);
  event.stopPropagation();
}

function AgentNode({ job, stage, agent, x, y, onSelectJob, copy }: NodeProps) {
  const [dismissed, setDismissed] = useState(false);
  return (
    <div
      className={styles.branchNode}
      data-graph-node
      data-popover-dismissed={dismissed}
      style={{ left: `${x}%`, top: `calc(50% + ${y}px)` }}
      onPointerEnter={() => setDismissed(false)}
      onFocusCapture={() => setDismissed(false)}
      onKeyDown={(event) => dismissPopover(event, setDismissed)}
    >
      <button
        type="button"
        data-job={job.id}
        data-template={job.foreach !== undefined}
        data-state={agent.state}
        aria-label={`${job.id} · ${agent.role} · ${agent.state}`}
        aria-controls="dashboard-stage-detail"
        onClick={() => onSelectJob(stage.id, job.id)}
        className={`${styles.job} cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring`}
      >
        <span className={styles.jobDot}>
          <StageStateIcon state={agent.state} className="size-4" />
        </span>
      </button>
      <JobPopover job={job} stage={stage} agent={agent} onSelectJob={onSelectJob} copy={copy} />
    </div>
  );
}

function branchTimes(job: DashboardJob, { now, observedJobs, observedAt }: Moment) {
  const observed = observedJobs ?? [job];
  const span = observed.find((candidate) => candidate.id === job.id)?.span;
  const start = span ? Date.parse(span.start_t) : null;
  const end = span?.end_t ? Date.parse(span.end_t) : observedAt;
  return { start, end: end ?? now };
}

function BranchLine({ job, path }: { job: DashboardJob; path: string }) {
  const moment = useContext(DashboardMoment);
  const { start, end } = branchTimes(job, moment);
  const progress =
    start === null || moment.now < start ? 0 : end <= start ? 1 : Math.min(1, (moment.now - start) / (end - start));
  return (
    <svg aria-hidden="true" className={styles.branchLine} viewBox="0 0 100 100" preserveAspectRatio="none">
      <path d={path} className={styles.branchTrack} />
      <path
        d={path}
        className={styles.branchProgress}
        pathLength={1}
        style={{ strokeDasharray: 1, strokeDashoffset: 1 - progress }}
        data-branch-progress={progress}
      />
    </svg>
  );
}

function JobBranch(props: BranchProps) {
  const { job, layer, layers, lane, lanes, last } = props;
  const agents = nodeAgents(job);
  const y = (lane - (lanes - 1) / 2) * 96;
  const start = last ? 100 : (layer / layers) * 100;
  const end = ((layer + 1) / layers) * 100;
  const left = last ? 0 : start;
  const width = end - left;
  const path = `M ${start} 100 C ${left + width * 0.15} 100 ${left + width * 0.15} 0 ${left + width * 0.3} 0 L ${left + width * 0.7} 0 C ${left + width * 0.85} 0 ${left + width * 0.85} 100 ${end} 100`;
  return (
    <li className={styles.jobBranch}>
      <div
        className={styles.branchCurve}
        style={{ height: `${Math.max(1, Math.abs(y))}px`, transform: y > 0 ? 'scaleY(-1)' : undefined }}
      >
        <BranchLine job={job} path={path} />
      </div>
      {agents.map((agent, index) => (
        <AgentNode
          key={`${agent.role}-${index}`}
          {...props}
          agent={agent}
          x={left + width * ((index + 1) / (agents.length + 1))}
          y={y}
        />
      ))}
    </li>
  );
}

/** Parallel Jobs fan out around the spine; dependency layers and configured agent order run left to right. */
export function StageJobs({ stage, onSelectJob, copy, last = false }: Omit<JobProps, 'job'> & { last?: boolean }) {
  const layers = stageLayers(stage);
  return (
    <ul className={styles.jobs} data-stage-jobs={stage.id} data-last={last}>
      {layers.flatMap((jobs, layer) =>
        jobs.map((job, lane) => (
          <JobBranch
            key={job.id}
            job={job}
            stage={stage}
            onSelectJob={onSelectJob}
            copy={copy}
            layer={layer}
            layers={layers.length}
            lane={lane}
            lanes={jobs.length}
            last={last}
          />
        )),
      )}
    </ul>
  );
}
