import { isComplete, runningAgents, stageTitle, stateText, type DashboardStage } from '@/lib/dashboard-stages.pure';
import { fillTemplate } from '@/lib/template.pure';
import { CircleAlert } from 'lucide-react';
import type { DashboardCopy } from './dashboard-evidence';
import styles from './dashboard-graph.module.css';
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
}

type NodeProps = Omit<NavigationProps, 'stages'> & { stage: DashboardStage; index: number };
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

function StageNode({ stage, index, selected, onSelect, onSelectJob, copy }: NodeProps) {
  return (
    <li className={styles.stage} data-complete={isComplete(stage.state)}>
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
        <StageLabel stage={stage} copy={copy} />
      </button>
      {onSelectJob ? <StageJobs stage={stage} index={index} onSelectJob={onSelectJob} copy={copy} /> : null}
    </li>
  );
}

export function StageNavigation({ stages, selected, onSelect, onSelectJob, copy }: NavigationProps) {
  return (
    <ol className={styles.stages} data-jobs={onSelectJob !== undefined} aria-label={copy.graph.title}>
      {stages.map((stage, index) => (
        <StageNode
          key={stage.id}
          stage={stage}
          index={index}
          selected={selected}
          onSelect={onSelect}
          onSelectJob={onSelectJob}
          copy={copy}
        />
      ))}
    </ol>
  );
}
