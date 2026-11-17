import type { DashboardEvent } from './dashboard-events.pure';
import { projectDashboard, type DashboardView } from './dashboard-projection.pure';
import type { Polled } from './dashboard-reader.pure';
import { scrubPosition, scrubTime, scrubTimeline, snapScrubPosition, type ReplayRange } from './dashboard-scrub.pure';
import { projectStages } from './dashboard-stages.pure';
import { createLogFold } from './run-log.pure';
import type { RunLogLine } from './run-log.schema.pure';

export type Cutoff = number | 'live';

const readable = (events: readonly DashboardEvent[]): RunLogLine[] =>
  events.flatMap((event) => (event.line ? [event.line] : []));

const eventsAt = (events: readonly DashboardEvent[], at: number): DashboardEvent[] =>
  events.filter((event) => event.line !== undefined && Date.parse(event.line.t) <= at);

const clamp = (value: number, range: ReplayRange) => Math.min(Math.max(value, range.start), range.end);

const momentOf = (range: ReplayRange | null, cutoff: Cutoff): number | null =>
  cutoff === 'live' || range === null ? null : clamp(cutoff, range);

const seekTo = (range: ReplayRange | null, to: number): Cutoff =>
  range === null || to >= range.end ? 'live' : clamp(to, range);

function replayRange({ read, readAt }: Polled): ReplayRange | null {
  const lines = readable(read.events);
  if (lines.length === 0) return null;
  const { run } = read;
  const times = lines.map((line) => Date.parse(line.t));
  const start = run ? Date.parse(run.start_t) : Math.min(...times);
  const end = run?.end_t ? Date.parse(run.end_t) : Math.max(...times, readAt);
  return { start, end };
}

function stageRailOf(view: DashboardView | undefined, range: ReplayRange) {
  const stages = view ? projectStages(view.jobs, view.stages).stages : [];
  const stops = scrubTimeline(
    stages.map((stage) =>
      stage.jobs.map((job) => ({
        start: job.span ? Date.parse(job.span.start_t) : null,
        end: job.span?.end_t ? Date.parse(job.span.end_t) : null,
      })),
    ),
    range,
  );
  return { stops, stageStops: stages.length + 1 };
}

function shownAt({ read, readAt }: Polled, moment: number | null) {
  if (moment === null || read.pipeline === undefined) return { view: read.view, events: read.events, now: readAt };
  const log = createLogFold({ live: 'unfinished' });
  const events = eventsAt(read.events, moment);
  log.append(readable(events));
  return { view: projectDashboard(read.pipeline, log.snapshot()), events, now: moment };
}

type StageRail = ReturnType<typeof stageRailOf>;

function railControls(rail: StageRail | null, range: ReplayRange | null) {
  return {
    railAt(cutoff: Cutoff): number {
      if (rail === null || range === null) return 0;
      return scrubPosition(rail.stops, momentOf(range, cutoff) ?? range.end);
    },
    seekRail(place: number): Cutoff {
      if (rail === null || range === null) return 'live';
      if (place >= scrubPosition(rail.stops, range.end) - 0.0001) return 'live';
      return seekTo(range, scrubTime(rail.stops, snapScrubPosition(place, rail.stageStops)));
    },
  };
}

export function dashboardTimeline(polled: Polled) {
  const range = replayRange(polled);
  const rail = range === null ? null : stageRailOf(polled.read.view, range);
  return {
    range,
    moment: (cutoff: Cutoff) => momentOf(range, cutoff),
    seek: (to: number) => seekTo(range, to),
    toggle: (live: boolean): Cutoff => (live || range === null ? 'live' : range.end),
    ...railControls(rail, range),
    at: (cutoff: Cutoff) => shownAt(polled, momentOf(range, cutoff)),
  };
}

export type DashboardTimeline = ReturnType<typeof dashboardTimeline>;
