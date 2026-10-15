import { spanElapsed } from '@/lib/dashboard-elapsed.pure';
import type { GraphGeometry, StageGeometry } from '@/lib/dashboard-graph-geometry.pure';
import type { StageNode } from '@/lib/dashboard-graph-view.pure';
import { fillTemplate } from '@/lib/template.pure';
import { CircleAlert } from 'lucide-react';
import { useContext } from 'react';
import { JobChipList } from './dashboard-chips';
import { ElapsedTime, StateBadge, type DashboardCopy } from './dashboard-evidence';
import styles from './dashboard-graph.module.css';
import { DashboardMoment } from './dashboard-moment';
import { blurGraphPopover, dismissGraphPopover, leaveGraphPopover, openGraphPopover } from './dashboard-popover';
import { StageJobs, type SelectJob } from './dashboard-stage-jobs';
import { StageStateIcon } from './dashboard-state-icon';

interface NavigationProps {
  stages: StageNode[];
  onSelect: (id: string) => void;
  /** Present when the view shows each stage's Jobs. */
  onSelectJob?: SelectJob;
  copy: DashboardCopy;
  geometry: GraphGeometry;
}

type NodeProps = Omit<NavigationProps, 'stages' | 'geometry'> & {
  stage: StageNode;
  geometry: StageGeometry;
};
type LabelProps = Pick<NodeProps, 'stage' | 'copy'>;

function StageActivity({ stage, copy }: LabelProps) {
  const { active, sessions } = stage;
  return (
    <>
      {active.slice(0, 1).map((id) => (
        <span key={id} className="block text-caption" title={id}>
          {id}
        </span>
      ))}
      {active.length > 1 ? (
        <span className="block text-caption text-muted-foreground">
          {fillTemplate(copy.graph.moreActive, { count: active.length - 1 })}
        </span>
      ) : null}
      {sessions > 0 ? (
        <span className="block text-caption text-(--info)">
          {fillTemplate(copy.graph.running, { count: sessions })}
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
  return (
    <span className="min-w-0 flex-1 space-y-1 wrap-anywhere">
      <span className="block text-body font-semibold">{stage.label}</span>
      <span className="block text-caption text-(--node-tone)">{stage.stateLabel}</span>
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
        <span className="block text-body font-semibold">{stage.label}</span>
        <span className="flex items-center gap-2">
          <StageStateIcon state={stage.state} />
          <StateBadge state={stage.state} />
        </span>
        {stage.nodes.map(({ job }) => (
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

function StageButton({ stage, onSelect, onSelectJob, copy }: NodeProps) {
  return (
    <button
      type="button"
      data-stage={stage.id}
      data-state={stage.state}
      data-planned={stage.planned}
      aria-expanded={stage.selected}
      aria-controls="dashboard-stage-detail"
      onClick={() => onSelect(stage.id)}
      className={`${styles.node} cursor-pointer transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring`}
    >
      <span className={styles.orbit}>
        <StageStateIcon state={stage.state} />
      </span>
      {onSelectJob ? (
        <span className={`${styles.stageCaption} text-caption font-semibold`}>{stage.label}</span>
      ) : (
        <StageLabel stage={stage} copy={copy} />
      )}
    </button>
  );
}

function StageNode(props: NodeProps) {
  const { stage, geometry, onSelectJob, onSelect, copy } = props;
  return (
    <li className={styles.stage} data-complete={stage.complete} style={onSelectJob ? geometry.placement : undefined}>
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
      {onSelectJob ? <StageJobs stage={stage} geometry={geometry} onSelectJob={onSelectJob} copy={copy} /> : null}
    </li>
  );
}

function StageNodes(props: NavigationProps) {
  const { stages, geometry, onSelectJob, onSelect, copy } = props;
  return stages.map((stage, index) => (
    <StageNode
      key={stage.id}
      stage={stage}
      geometry={geometry.stages[index]}
      onSelect={onSelect}
      onSelectJob={onSelectJob}
      copy={copy}
    />
  ));
}

export function StageNavigation(props: NavigationProps) {
  const { onSelectJob, copy, geometry } = props;
  return (
    <ol className={styles.stages} data-jobs={onSelectJob !== undefined} aria-label={copy.graph.title}>
      <StageNodes {...props} />
      <li className={styles.endNode} style={{ left: `${geometry.end * 100}%` }}>
        <span role="img" aria-label={copy.graph.runEnd} title={copy.graph.runEnd} className={styles.endDot} />
      </li>
    </ol>
  );
}
