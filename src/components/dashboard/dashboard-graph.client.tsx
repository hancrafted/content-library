'use client';

import { Button } from '@/components/ui/button';
import { useDashboardDetail } from '@/hooks/use-dashboard-detail';
import type { ReplayControls } from '@/hooks/use-dashboard-replay';
import type { DashboardEvent, EventScope } from '@/lib/dashboard-events.pure';
import type { EpisodeOutputs } from '@/lib/dashboard-outputs.pure';
import type { DashboardView } from '@/lib/dashboard-projection.pure';
import { projectStages, stageLayers } from '@/lib/dashboard-stages.pure';
import { fillTemplate } from '@/lib/template.pure';
import { useId, useState, type CSSProperties } from 'react';
import { DashboardDrawer } from './dashboard-drawer.client';
import type { DashboardCopy } from './dashboard-evidence';
import styles from './dashboard-graph.module.css';
import { DashboardLog } from './dashboard-log.client';
import { DashboardMoment, type Moment } from './dashboard-moment';
import { stageName, StageNavigation } from './dashboard-stage-nav';
import { LiveToggle, TimeTravel } from './dashboard-time-travel.client';

interface GraphProps {
  view: DashboardView;
  events: readonly DashboardEvent[];
  stale: boolean;
  /** The moment shown; while replaying it stands still, so activity animation pauses. */
  moment: Moment;
  outputs: EpisodeOutputs;
  copy: DashboardCopy;
  replay: ReplayControls;
}

function useGraphControls(view: DashboardView) {
  const graph = projectStages(view.jobs, view.stages);
  const detail = useDashboardDetail();
  const selected = detail.selection?.stage ?? null;
  const [showJobs, setShowJobs] = useState(false);
  const [log, setLog] = useState<{ title: string; scope: EventScope } | null>(null);
  return {
    graph,
    detail,
    selected,
    showJobs,
    setShowJobs,
    log,
    stage: graph.stages.find((candidate) => candidate.id === selected),
    select: (id: string) => detail.open(id),
    selectJob: detail.open,
    openLog: (title: string, scope: EventScope) => setLog({ title, scope }),
    dismissLog: () => setLog(null),
  };
}

type Controls = ReturnType<typeof useGraphControls>;
interface OverviewProps {
  controls: Controls;
  stale: boolean;
  copy: DashboardCopy;
  replay: ReplayControls;
}

function ProgressSummary({ graph, copy }: { graph: Controls['graph']; copy: DashboardCopy }) {
  const next = graph.stages.find((stage) => stage.state === 'waiting');
  return (
    <div className="space-y-1">
      <h2 className="text-body font-semibold">{copy.graph.title}</h2>
      <p role="status" className="text-caption">
        {fillTemplate(copy.graph.stagesComplete, { done: graph.completed, total: graph.stages.length })}
        {graph.attention > 0 ? (
          <span className="ml-3 font-medium text-(--warning)">
            {fillTemplate(copy.graph.attention, { count: graph.attention })}
          </span>
        ) : null}
      </p>
      {next ? (
        <p className="text-caption text-muted-foreground">
          {fillTemplate(copy.graph.next, { name: stageName(next, copy) })}
        </p>
      ) : null}
    </div>
  );
}

function JobsSwitch({ controls, copy }: Pick<OverviewProps, 'controls' | 'copy'>) {
  const help = useId();
  return (
    <label className="flex min-h-11 cursor-pointer items-center gap-3 text-body font-medium">
      <input
        type="checkbox"
        role="switch"
        checked={controls.showJobs}
        onChange={(event) => controls.setShowJobs(event.target.checked)}
        aria-describedby={help}
        className={`${styles.switch} focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring`}
      />
      {copy.graph.showJobs}
      <span id={help} className="sr-only">
        {copy.graph.showJobsHelp}
      </span>
    </label>
  );
}

function GraphToolbar({ controls, copy, replay }: Pick<OverviewProps, 'controls' | 'copy' | 'replay'>) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <ProgressSummary graph={controls.graph} copy={copy} />
      <div className="flex flex-wrap items-center gap-2">
        <JobsSwitch controls={controls} copy={copy} />
        <LiveToggle replay={replay} copy={copy} />
        <Button variant="outline" onClick={() => controls.openLog(copy.graph.allLogs, {})}>
          {copy.graph.allLogs}
        </Button>
      </div>
    </div>
  );
}

function graphWidth(graph: Controls['graph'], showJobs: boolean) {
  return showJobs
    ? Math.max(
        160,
        ...graph.stages.map((stage) =>
          stageLayers(stage).reduce(
            (sum, jobs) => sum + Math.max(...jobs.map((job) => Math.max(1, job.config.length))) * 64 + 32,
            0,
          ),
        ),
      )
    : 160;
}

function GraphOverview({ controls, stale, copy, replay }: OverviewProps) {
  const { graph, selected, select, showJobs, selectJob } = controls;
  const width = graphWidth(graph, showJobs);
  return (
    <div className="space-y-6 rounded-2xl border border-border bg-card p-4 sm:p-6">
      <GraphToolbar controls={controls} copy={copy} replay={replay} />
      {stale ? <p className="text-caption text-(--warning)">{copy.graph.stale}</p> : null}
      <div className={styles.graphScroll}>
        <div
          className={styles.canvas}
          style={{ '--stage-count': Math.max(1, graph.stages.length), '--stage-width': `${width}px` } as CSSProperties}
        >
          <TimeTravel replay={replay} copy={copy} stages={graph.stages.length} />
          <StageNavigation
            stages={graph.stages}
            selected={selected}
            onSelect={select}
            onSelectJob={showJobs ? selectJob : undefined}
            copy={copy}
          />
        </div>
      </div>
    </div>
  );
}

export function DashboardGraph({ view, events, stale, moment, outputs, copy, replay }: GraphProps) {
  const controls = useGraphControls(view);
  const { stage, log, openLog, dismissLog } = controls;
  return (
    <DashboardMoment value={moment}>
      <section
        className={`${styles.graph} space-y-6`}
        data-motion={stale || moment.replaying ? 'paused' : 'running'}
        aria-label={copy.graph.title}
      >
        <GraphOverview controls={controls} stale={stale} copy={copy} replay={replay} />
        <DashboardDrawer detail={controls.detail} stage={stage} copy={copy} openLog={openLog} outputs={outputs} />
        {log ? (
          <DashboardLog events={events} scope={log.scope} title={log.title} copy={copy} onDismiss={dismissLog} />
        ) : null}
      </section>
    </DashboardMoment>
  );
}
