import { agentElapsed, spanElapsed } from '@/lib/dashboard-elapsed.pure';
import type { BranchGeometry, StageGeometry } from '@/lib/dashboard-graph-geometry.pure';
import type { AgentNode, JobNode, StageNode } from '@/lib/dashboard-graph-view.pure';
import { jobProgress } from '@/lib/dashboard-scrub.pure';
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
  node: JobNode;
  onSelectJob: SelectJob;
  copy: DashboardCopy;
}

interface BranchProps extends JobProps {
  geometry: BranchGeometry;
  viewBox: string;
}

interface NodeProps extends JobProps {
  agent: AgentNode;
  position: { left: string; top: string };
}

function FanOutLabel({ node, copy }: Pick<JobProps, 'node' | 'copy'>) {
  if (node.fanOut === undefined) return null;
  return (
    <span className="block text-caption text-muted-foreground">
      {fillTemplate(copy.graph.onePer, { heading: node.fanOut })}
    </span>
  );
}

function JobPopover({ node, agent, onSelectJob, copy }: JobProps & { agent: AgentNode }) {
  const { now } = useContext(DashboardMoment);
  const { job } = node;
  const elapsed =
    agent.span && (agent.span.type === 'agent' ? agentElapsed(job, agent.span, now) : spanElapsed(agent.span, now));
  return (
    <div className={`${styles.popover} shadow-header`} popover="manual" data-dashboard-popover>
      <button
        type="button"
        tabIndex={-1}
        onClick={() => onSelectJob(node.stage, node.id)}
        className="block w-full cursor-pointer space-y-2 text-left focus-visible:outline-2 focus-visible:outline-ring"
      >
        <span className="block text-caption font-semibold wrap-anywhere">{agent.label}</span>
        <span className="flex flex-wrap items-center gap-2 text-caption">
          <StageStateIcon state={agent.state} />
          <StateBadge state={agent.state} />
          <ElapsedTime elapsed={elapsed ?? null} copy={copy} />
          <AttentionMarker attention={node.attention} label={copy.graph.jobAttention} />
        </span>
        <JobChipList job={job} copy={copy} />
        <FanOutLabel node={node} copy={copy} />
      </button>
      <PreviewButton job={job} copy={copy} className="mt-2" tabIndex={-1} />
    </div>
  );
}

function AgentButton({ node, agent, onSelectJob, copy }: NodeProps) {
  return (
    <button
      type="button"
      data-job={node.id}
      data-template={node.fanOut !== undefined}
      data-state={agent.state}
      aria-label={`${agent.label} · ${copy.states[agent.state]}`}
      aria-expanded={node.selected}
      aria-controls="dashboard-stage-detail"
      onClick={() => onSelectJob(node.stage, node.id)}
      className={`${styles.job} cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring`}
    >
      <span className={styles.jobDot}>
        <StageStateIcon state={agent.state} className="size-4" />
      </span>
    </button>
  );
}

function AgentNodeView(props: NodeProps) {
  const { node, agent, position, onSelectJob, copy } = props;
  return (
    <div
      className={styles.branchNode}
      data-graph-node
      style={{ left: position.left, top: position.top }}
      onPointerEnter={(event) => openGraphPopover(event.currentTarget)}
      onPointerLeave={(event) => leaveGraphPopover(event.currentTarget)}
      onFocusCapture={(event) => openGraphPopover(event.currentTarget)}
      onBlurCapture={blurGraphPopover}
      onKeyDown={dismissGraphPopover}
    >
      <AgentButton {...props} />
      <JobPopover node={node} agent={agent} onSelectJob={onSelectJob} copy={copy} />
    </div>
  );
}

function BranchLine({ node, geometry, viewBox }: Pick<BranchProps, 'node' | 'geometry' | 'viewBox'>) {
  const { now } = useContext(DashboardMoment);
  const timings = useContext(DashboardObservations);
  const progress = jobProgress(timings.get(node.id) ?? { start: null, end: null }, now);
  return (
    <svg aria-hidden="true" className={styles.branchLine} viewBox={viewBox} preserveAspectRatio="none">
      {geometry.edges.map((edge) => (
        <g key={edge.id}>
          <path d={edge.path} className={styles.branchTrack} />
          <path
            d={edge.path}
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
  const { node, geometry, viewBox } = props;
  return (
    <li className={styles.jobBranch}>
      <BranchLine node={node} geometry={geometry} viewBox={viewBox} />
      {node.agents.map((agent) => (
        <AgentNodeView
          key={agent.id}
          {...props}
          agent={agent}
          position={geometry.nodes.find((point) => point.id === agent.id)!}
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
  geometry,
}: Omit<JobProps, 'node'> & { stage: StageNode; geometry: StageGeometry }) {
  return (
    <ul className={styles.jobs} data-stage-jobs={stage.id}>
      {geometry.branches.map((branch) => (
        <JobBranch
          key={branch.job}
          node={stage.nodes.find((node) => node.id === branch.job)!}
          onSelectJob={onSelectJob}
          copy={copy}
          geometry={branch}
          viewBox={geometry.viewBox}
        />
      ))}
    </ul>
  );
}
