import { createLogFold, currentRun } from '../../skills/new-episode/scripts/run-log.pure';
import type { RunLogLine } from '../../skills/new-episode/scripts/run-log.schema.pure';
import type { DashboardEvent } from './dashboard-events.pure';
import { projectDashboard, type DashboardPipeline, type DashboardView } from './dashboard-projection.pure';
import type { DashboardStage } from './dashboard-stages.pure';

const readable = (events: readonly DashboardEvent[]): RunLogLine[] =>
  events.flatMap((event) => (event.line ? [event.line] : []));

/**
 * The view as it stood at `at` (epoch milliseconds): the retained events stamped no later than `at`, through the shared
 * fold and the live projection. A Run whose end lies after `at` had not ended then, so its open spans read running.
 */
export function replayDashboard(
  pipeline: DashboardPipeline,
  events: readonly DashboardEvent[],
  at: number,
): DashboardView {
  const log = createLogFold({ live: 'unfinished' });
  log.append(readable(events).filter((line) => Date.parse(line.t) <= at));
  return projectDashboard(pipeline, log.snapshot());
}

/** The first and last event times, and whether the newest Run has ended; null without a readable event. */
export function replayBounds(events: readonly DashboardEvent[]) {
  const lines = readable(events);
  if (lines.length === 0) return null;
  const times = lines.map((line) => Date.parse(line.t));
  const run = currentRun(lines);
  return {
    start: Math.min(...times),
    last: Math.max(...times),
    finished: lines.some(
      (line) => line.kind === 'end-run' && line.trace_id === run?.trace_id && line.span_id === run.span_id,
    ),
  };
}

/** Where each stage began: its earliest Job start, for tick marks on the replay slider. A stage not started is left out. */
export function stageMarks(stages: readonly DashboardStage[]) {
  return stages.flatMap(({ id, jobs }) => {
    const starts = jobs.flatMap((job) => (job.span ? [Date.parse(job.span.start_t)] : []));
    return starts.length > 0 ? [{ stage: id, at: Math.min(...starts) }] : [];
  });
}

/** What the Live checkbox and replay slider read and set; times are epoch milliseconds. */
export interface ReplayControls {
  live: boolean;
  setLive: (live: boolean) => void;
  seek: (moment: number) => void;
  /** The cutoff while replaying, null while live. */
  at: number | null;
  range: { start: number; end: number } | null;
  marks: ReturnType<typeof stageMarks>;
}
