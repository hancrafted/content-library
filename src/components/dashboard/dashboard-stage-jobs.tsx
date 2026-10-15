import { agentElapsed, spanElapsed } from '@/lib/dashboard-elapsed.pure';
import { edgePath, type JobGeometry, type StageGeometry } from '@/lib/dashboard-layout.pure';
import type { DashboardJob } from '@/lib/dashboard-projection.pure';
import { jobProgress } from '@/lib/dashboard-scrub.pure';
import { agentState, currentAgent, type DashboardStage } from '@/lib/dashboard-stages.pure';
import { fillTemplate } from '@/lib/template.pure';
import { useContext } from 'react';
import { JobChipList } from './dashboard-chips';
import { ElapsedTime, StateBadge, type DashboardCopy } from './dashboard-evidence';
import styles from './dashboard-graph.module.css';
import { PreviewButton } from './dashboard-job-links';
import { DashboardMoment } from './dashboard-moment';
import { DashboardObservations } from './dashboard-observations';
import { blurGraphPopover, dismissGraphPopover, leaveGraphPopover, openGraphPopover } from './dashboard-popover';
import { AttentionMarker, StageStateIcon } from './dashboard-state-icon';

export type SelectJob = (stage: string, job: string) => void;

interface JobProps {
  stage: DashboardStage;
  job: DashboardJob;
  onSelectJob: SelectJob;
  copy: DashboardCopy;
  selected?: string;
}

interface BranchProps extends JobProps {
  geometry: JobGeometry;
  layout: StageGeometry;
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
    <div className={styles.popover} popover="manual" data-dashboard-popover>
      <button
        type="button"
        tabIndex={-1}
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
      <PreviewButton job={job} copy={copy} className="mt-2" tabIndex={-1} />
    </div>
  );
}

function AgentButton({ job, stage, agent, onSelectJob, copy, selected }: NodeProps) {
  return (
    <button
      type="button"
      data-job={job.id}
      data-template={job.foreach !== undefined}
      data-state={agent.state}
      aria-label={`${job.id} · ${agent.role} · ${copy.states[agent.state]}`}
      aria-expanded={selected === job.id}
      aria-controls="dashboard-stage-detail"
      onClick={() => onSelectJob(stage.id, job.id)}
      className={`${styles.job} cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring`}
    >
      <span className={styles.jobDot}>
        <StageStateIcon state={agent.state} className="size-4" />
      </span>
    </button>
  );
}

function AgentNode(props: NodeProps) {
  const { job, stage, agent, x, y, onSelectJob, copy } = props;
  return (
    <div
      className={styles.branchNode}
      data-graph-node
      style={{ left: `${x}%`, top: `calc(50% + ${y}px)` }}
      onPointerEnter={(event) => openGraphPopover(event.currentTarget)}
      onPointerLeave={(event) => leaveGraphPopover(event.currentTarget)}
      onFocusCapture={(event) => openGraphPopover(event.currentTarget)}
      onBlurCapture={blurGraphPopover}
      onKeyDown={dismissGraphPopover}
    >
      <AgentButton {...props} />
      <JobPopover job={job} stage={stage} agent={agent} onSelectJob={onSelectJob} copy={copy} />
    </div>
  );
}

function BranchLine({ job, geometry, layout }: Pick<BranchProps, 'job' | 'geometry' | 'layout'>) {
  const { now } = useContext(DashboardMoment);
  const timings = useContext(DashboardObservations);
  const progress = jobProgress(timings.get(job.id) ?? { start: null, end: null }, now);
  return (
    <svg
      aria-hidden="true"
      className={styles.branchLine}
      viewBox={`0 ${-layout.height / 2} ${layout.width} ${layout.height}`}
      preserveAspectRatio="none"
    >
      {geometry.edges.map((edge) => (
        <g key={`${edge.from.id}-${edge.to.id}`}>
          <path d={edgePath(edge)} className={styles.branchTrack} />
          <path
            d={edgePath(edge)}
            className={styles.branchProgress}
            pathLength={1}
            style={{ strokeDasharray: 1, strokeDashoffset: 1 - progress }}
            data-branch-progress={progress}
          />
        </g>
      ))}
    </svg>
  );
}

function JobBranch(props: BranchProps) {
  const { job, geometry, layout } = props;
  const agents = nodeAgents(job);
  return (
    <li className={styles.jobBranch}>
      <BranchLine job={job} geometry={geometry} layout={layout} />
      {agents.map((agent, index) => (
        <AgentNode
          key={`${agent.role}-${index}`}
          {...props}
          agent={agent}
          x={(geometry.nodes[index].x / layout.width) * 100}
          y={geometry.nodes[index].y}
        />
      ))}
    </li>
  );
}

/** Parallel Jobs fan out around the spine; dependency layers and configured agent order run left to right. */
export function StageJobs({
  stage,
  onSelectJob,
  copy,
  selected,
  layout,
}: Omit<JobProps, 'job'> & { layout: StageGeometry }) {
  return (
    <ul className={styles.jobs} data-stage-jobs={stage.id}>
      {layout.branches.map((geometry) => (
        <JobBranch
          key={geometry.job}
          job={stage.jobs.find((job) => job.id === geometry.job)!}
          stage={stage}
          onSelectJob={onSelectJob}
          copy={copy}
          selected={selected}
          geometry={geometry}
          layout={layout}
        />
      ))}
    </ul>
  );
}
