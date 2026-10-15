'use client';

import { Button } from '@/components/ui/button';
import { useDashboardDetail } from '@/hooks/use-dashboard-detail';
import type { ReplayControls } from '@/hooks/use-dashboard-replay';
import type { DashboardEvent, EventScope } from '@/lib/dashboard-events.pure';
import { graphGeometry } from '@/lib/dashboard-graph-geometry.pure';
import { graphView, type GraphView } from '@/lib/dashboard-graph-view.pure';
import type { EpisodeOutputs } from '@/lib/dashboard-outputs.pure';
import type { DashboardJob, DashboardView } from '@/lib/dashboard-projection.pure';
import { jobTimings } from '@/lib/dashboard-scrub.pure';
import { fillTemplate } from '@/lib/template.pure';
import { useId, useState, type CSSProperties } from 'react';
import { DashboardDrawer } from './dashboard-drawer.client';
import type { DashboardCopy } from './dashboard-evidence';
import styles from './dashboard-graph.module.css';
import { DashboardLog } from './dashboard-log.client';
import { DashboardMoment, type Moment } from './dashboard-moment';
import { DashboardObservations } from './dashboard-observations';
import { StageNavigation } from './dashboard-stage-nav';
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
  observedJobs: readonly DashboardJob[];
}

function useGraphControls() {
  const detail = useDashboardDetail();
  const [showJobs, setShowJobs] = useState(false);
  const [log, setLog] = useState<{ title: string; scope: EventScope } | null>(null);
  return {
    detail,
    showJobs,
    setShowJobs,
    log,
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
  graph: GraphView;
}

function ProgressSummary({ graph, copy }: Pick<OverviewProps, 'graph' | 'copy'>) {
  const { next } = graph;
  return (
    <div className="space-y-1">
      <h2 className="text-body font-semibold">{copy.graph.title}</h2>
      <p role="status" className="text-caption">
        {fillTemplate(copy.graph.stagesComplete, { done: graph.completed, total: graph.total })}
        {graph.attention > 0 ? (
          <span className="ml-3 font-medium text-(--warning)">
            {fillTemplate(copy.graph.attention, { count: graph.attention })}
          </span>
        ) : null}
      </p>
      {next ? (
        <p className="text-caption text-muted-foreground">{fillTemplate(copy.graph.next, { name: next.label })}</p>
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

function GraphToolbar({ controls, copy, replay, graph }: Omit<OverviewProps, 'stale'>) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <ProgressSummary graph={graph} copy={copy} />
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

function GraphOverview({ controls, graph, stale, copy, replay }: OverviewProps) {
  const { detail, showJobs } = controls;
  const geometry = graphGeometry(graph.stages, showJobs);
  return (
    <div className="space-y-6 rounded-2xl border border-border bg-card p-4 sm:p-6">
      <GraphToolbar controls={controls} copy={copy} replay={replay} graph={graph} />
      {stale ? <p className="text-caption text-(--warning)">{copy.graph.stale}</p> : null}
      <div className={styles.graphScroll} style={{ maxHeight: geometry.maxHeight }}>
        <div className={styles.canvas} style={geometry.cssVars as CSSProperties}>
          <TimeTravel replay={replay} copy={copy} geometry={geometry} />
          <StageNavigation
            stages={graph.stages}
            onSelect={detail.open}
            onSelectJob={showJobs ? detail.open : undefined}
            copy={copy}
            geometry={geometry}
          />
        </div>
      </div>
    </div>
  );
}

export function DashboardGraph({ view, events, stale, moment, outputs, copy, replay, observedJobs }: GraphProps) {
  const controls = useGraphControls();
  const labels = { stageNames: copy.graph.stageNames, gate: copy.waitingOnHan, complete: copy.graph.complete };
  const graph = graphView(view, labels, controls.detail.selection);
  const { log, openLog, dismissLog } = controls;
  return (
    <DashboardMoment value={moment}>
      <DashboardObservations value={jobTimings(observedJobs)}>
        <section
          className={`${styles.graph} space-y-6`}
          data-motion={stale || moment.replaying ? 'paused' : 'running'}
          aria-label={copy.graph.title}
        >
          <GraphOverview controls={controls} graph={graph} stale={stale} copy={copy} replay={replay} />
          <DashboardDrawer
            detail={controls.detail}
            selection={graph.selection}
            copy={copy}
            openLog={openLog}
            outputs={outputs}
          />
          {log ? (
            <DashboardLog events={events} scope={log.scope} title={log.title} copy={copy} onDismiss={dismissLog} />
          ) : null}
        </section>
      </DashboardObservations>
    </DashboardMoment>
  );
}
