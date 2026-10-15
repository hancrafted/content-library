import { spanElapsed } from '@/lib/dashboard-elapsed.pure';
import type { dashboardLayout, StageGeometry } from '@/lib/dashboard-layout.pure';
import { isComplete, runningAgents, stageTitle, stateText, type DashboardStage } from '@/lib/dashboard-stages.pure';
import { fillTemplate } from '@/lib/template.pure';
import { CircleAlert } from 'lucide-react';
import { useContext, type CSSProperties } from 'react';
import { JobChipList } from './dashboard-chips';
import { ElapsedTime, StateBadge, type DashboardCopy } from './dashboard-evidence';
import styles from './dashboard-graph.module.css';
import { DashboardMoment } from './dashboard-moment';
import { blurGraphPopover, dismissGraphPopover, leaveGraphPopover, openGraphPopover } from './dashboard-popover';
import { StageJobs, type SelectJob } from './dashboard-stage-jobs';
import { StageStateIcon } from './dashboard-state-icon';

export function stageName(stage: DashboardStage, copy: DashboardCopy): string {
  return stageTitle(stage.id, copy.graph.stageNames);
}

interface NavigationProps {
  stages: DashboardStage[];
  selected: string | null;
  onSelect: (id: string) => void;
  /** Present when the view shows each stage's Jobs. */
  onSelectJob?: SelectJob;
  copy: DashboardCopy;
  layout: ReturnType<typeof dashboardLayout>;
  selectedJob?: string;
  endPosition: number;
}

type NodeProps = Omit<NavigationProps, 'stages' | 'layout' | 'endPosition'> & {
  stage: DashboardStage;
  layout: StageGeometry;
  placement?: CSSProperties;
};
type LabelProps = Pick<NodeProps, 'stage' | 'copy'>;

function StageActivity({ stage, copy }: LabelProps) {
  const active = stage.jobs.filter((job) => job.state === 'running' || job.state === 'gate');
  const sessions = stage.jobs.flatMap(runningAgents);
  return (
    <>
      {active.slice(0, 1).map((job) => (
        <span key={job.id} className="block text-caption" title={job.id}>
          {job.id}
        </span>
      ))}
      {active.length > 1 ? (
        <span className="block text-caption text-muted-foreground">
          {fillTemplate(copy.graph.moreActive, { count: active.length - 1 })}
        </span>
      ) : null}
      {sessions.length > 0 ? (
        <span className="block text-caption text-(--info)">
          {fillTemplate(copy.graph.running, { count: sessions.length })}
        </span>
      ) : null}
      {stage.attention > 0 ? (
        <span className="flex items-center gap-1 text-caption font-medium text-(--warning) lg:justify-center">
          <CircleAlert aria-hidden="true" className="size-4 shrink-0" />
          {fillTemplate(copy.graph.attention, { count: stage.attention })}
        </span>
      ) : null}
    </>
  );
}

function StageLabel({ stage, copy }: LabelProps) {
  const state = stateText(stage.state, { gate: copy.waitingOnHan, complete: copy.graph.complete });
  return (
    <span className="min-w-0 flex-1 space-y-1 wrap-anywhere">
      <span className="block text-body font-semibold">{stageName(stage, copy)}</span>
      <span className="block text-caption text-(--node-tone)">{state}</span>
      <span className="block text-caption text-muted-foreground">
        {stage.planned
          ? fillTemplate(copy.graph.jobsComplete, { done: stage.completed, total: stage.jobs.length })
          : copy.graph.notPlanned}
      </span>
      <StageActivity stage={stage} copy={copy} />
    </span>
  );
}

function StagePopover({ stage, copy, onSelect }: LabelProps & { onSelect: (id: string) => void }) {
  const { now } = useContext(DashboardMoment);
  return (
    <div className={`${styles.stagePopover} shadow-header`} popover="manual" data-dashboard-popover>
      <button
        type="button"
        tabIndex={-1}
        onClick={() => onSelect(stage.id)}
        className="w-full cursor-pointer space-y-3 text-left focus-visible:outline-2 focus-visible:outline-ring"
      >
        <span className="block text-body font-semibold">{stageName(stage, copy)}</span>
        <span className="flex items-center gap-2">
          <StageStateIcon state={stage.state} />
          <StateBadge state={stage.state} />
        </span>
        {stage.jobs.map((job) => (
          <div key={job.id} className="space-y-1 border-t border-border pt-2 text-caption">
            <span className="block font-medium wrap-anywhere">{job.id}</span>
            {job.span ? <ElapsedTime elapsed={spanElapsed(job.span, now)} copy={copy} /> : null}
            <JobChipList job={job} copy={copy} />
          </div>
        ))}
      </button>
    </div>
  );
}

function StageButton({ stage, selected, onSelect, onSelectJob, copy }: NodeProps) {
  return (
    <button
      type="button"
      data-stage={stage.id}
      data-state={stage.state}
      data-planned={stage.planned}
      aria-expanded={selected === stage.id}
      aria-controls="dashboard-stage-detail"
      onClick={() => onSelect(stage.id)}
      className={`${styles.node} cursor-pointer transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring`}
    >
      <span className={styles.orbit}>
        <StageStateIcon state={stage.state} />
      </span>
      {onSelectJob ? (
        <span className={`${styles.stageCaption} text-caption font-semibold`}>{stageName(stage, copy)}</span>
      ) : (
        <StageLabel stage={stage} copy={copy} />
      )}
    </button>
  );
}

function StageNode(props: NodeProps) {
  const { stage, layout, onSelectJob, onSelect, copy, selectedJob } = props;
  return (
    <li className={styles.stage} data-complete={isComplete(stage.state)} style={props.placement}>
      <div
        className={styles.stageAnchor}
        data-graph-stage
        onPointerEnter={(event) => openGraphPopover(event.currentTarget)}
        onPointerLeave={(event) => leaveGraphPopover(event.currentTarget)}
        onFocusCapture={(event) => openGraphPopover(event.currentTarget)}
        onBlurCapture={blurGraphPopover}
        onKeyDown={dismissGraphPopover}
      >
        <StageButton {...props} />
        <StagePopover stage={stage} copy={copy} onSelect={onSelect} />
      </div>
      {onSelectJob ? (
        <StageJobs stage={stage} layout={layout} onSelectJob={onSelectJob} copy={copy} selected={selectedJob} />
      ) : null}
    </li>
  );
}

function StageNodes(props: NavigationProps) {
  const { stages, layout, onSelectJob, selected, selectedJob, onSelect, copy } = props;
  return stages.map((stage, index) => (
    <StageNode
      key={stage.id}
      stage={stage}
      layout={layout.stages[index]}
      selectedJob={selectedJob}
      placement={
        onSelectJob
          ? {
              left: `${(layout.stages[index].x / layout.width) * 100}%`,
              width: `${(layout.stages[index].width / layout.width) * 100}%`,
            }
          : undefined
      }
      selected={selected}
      onSelect={onSelect}
      onSelectJob={onSelectJob}
      copy={copy}
    />
  ));
}

export function StageNavigation(props: NavigationProps) {
  const { onSelectJob, copy, endPosition } = props;
  return (
    <ol className={styles.stages} data-jobs={onSelectJob !== undefined} aria-label={copy.graph.title}>
      <StageNodes {...props} />
      <li className={styles.endNode} style={{ left: `${endPosition * 100}%` }}>
        <span role="img" aria-label={copy.graph.runEnd} title={copy.graph.runEnd} className={styles.endDot} />
      </li>
    </ol>
  );
}
