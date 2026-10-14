import { isComplete, runningAgents, type DashboardStage, type DashboardState } from '@/lib/dashboard-stages.pure';
import { fillTemplate } from '@/lib/template.pure';
import { Check, Circle, CircleAlert, Play, X } from 'lucide-react';
import type { DashboardCopy } from './dashboard-evidence';
import styles from './dashboard-graph.module.css';

export function StageStateIcon({ state }: { state: DashboardState }) {
  const Icon = isComplete(state)
    ? Check
    : state === 'running'
      ? Play
      : state === 'gate' || state === 'refused'
        ? CircleAlert
        : state === 'crashed' || state === 'error'
          ? X
          : Circle;
  return <Icon aria-hidden="true" className="size-5 shrink-0" />;
}

export function stageName(stage: DashboardStage, copy: DashboardCopy): string {
  const names: Readonly<Record<string, string>> = copy.graph.stageNames;
  return names[stage.id] ?? stage.id;
}

interface NavigationProps {
  stages: DashboardStage[];
  selected: string | null;
  onSelect: (id: string) => void;
  copy: DashboardCopy;
}

type NodeProps = Omit<NavigationProps, 'stages'> & { stage: DashboardStage };
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
  const state =
    stage.state === 'gate' ? copy.waitingOnHan : isComplete(stage.state) ? copy.graph.complete : stage.state;
  return (
    <span className="min-w-0 flex-1 space-y-1 wrap-anywhere">
      <span className="block text-body font-semibold">{stageName(stage, copy)}</span>
      <span className="block text-caption text-(--node-tone)">{state}</span>
      <span className="block text-caption text-muted-foreground">
        {fillTemplate(copy.graph.jobsComplete, { done: stage.completed, total: stage.jobs.length })}
      </span>
      <StageActivity stage={stage} copy={copy} />
    </span>
  );
}

function StageNode({ stage, selected, onSelect, copy }: NodeProps) {
  return (
    <li className={styles.stage} data-complete={isComplete(stage.state)}>
      <button
        type="button"
        data-stage={stage.id}
        data-state={stage.state}
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
    </li>
  );
}

export function StageNavigation({ stages, selected, onSelect, copy }: NavigationProps) {
  return (
    <ol className={styles.stages} aria-label={copy.graph.title}>
      {stages.map((stage) => (
        <StageNode key={stage.id} stage={stage} selected={selected} onSelect={onSelect} copy={copy} />
      ))}
    </ol>
  );
}
