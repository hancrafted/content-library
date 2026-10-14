import { createLogFold, fold } from '../../skills/new-episode/scripts/run-log.pure';
import type { RunLogLine } from '../../skills/new-episode/scripts/run-log.schema.pure';
import type { DashboardEvent } from './dashboard-events.pure';
import { projectDashboard, type DashboardPipeline, type DashboardView } from './dashboard-projection.pure';
import type { DashboardStage } from './dashboard-stages.pure';

const readable = (events: readonly DashboardEvent[]): RunLogLine[] =>
  events.flatMap((event) => (event.line ? [event.line] : []));

/** The retained events as they stood at `at` (epoch milliseconds): readable records stamped no later than it. */
export function eventsAt(events: readonly DashboardEvent[], at: number): DashboardEvent[] {
  return events.filter((event) => event.line !== undefined && Date.parse(event.line.t) <= at);
}

/**
 * The view as it stood at `at`: the events up to `at` through the shared fold and the live projection. A Run whose
 * end lies after `at` had not ended then, so its open spans read running.
 */
export function replayDashboard(
  pipeline: DashboardPipeline,
  events: readonly DashboardEvent[],
  at: number,
): DashboardView {
  const log = createLogFold({ live: 'unfinished' });
  log.append(readable(eventsAt(events, at)));
  return projectDashboard(pipeline, log.snapshot());
}

/**
 * The replay range of the current Run, the one started latest by time then sequence: from its start to its end once
 * the fold has closed it, else to the last event. Null without a readable event; the first event starts a log
 * without a Run.
 */
export function replayBounds(events: readonly DashboardEvent[]) {
  const lines = readable(events);
  if (lines.length === 0) return null;
  const folded = fold(lines, { live: 'unfinished' });
  // The fold orders spans by start time then sequence, so the last Run span is the current Run.
  const run = folded.spans.filter((span) => span.type === 'run').at(-1);
  const end = run?.end_t ?? null;
  const times = lines.map((line) => Date.parse(line.t));
  return {
    start: run ? Date.parse(run.start_t) : Math.min(...times),
    last: end === null ? Math.max(...times) : Date.parse(end),
    finished: end !== null,
  };
}

/** Where each stage began: its earliest Job start, for tick marks on the replay slider. A stage not started is left out. */
export function stageMarks(stages: readonly DashboardStage[]) {
  return stages.flatMap(({ id, jobs }) => {
    const starts = jobs.flatMap((job) => (job.span ? [Date.parse(job.span.start_t)] : []));
    return starts.length > 0 ? [{ stage: id, at: Math.min(...starts) }] : [];
  });
}
