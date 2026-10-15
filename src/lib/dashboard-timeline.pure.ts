import { createLogFold, fold } from '../../skills/new-episode/scripts/run-log.pure';
import type { RunLogLine } from '../../skills/new-episode/scripts/run-log.schema.pure';
import type { DashboardEvent } from './dashboard-events.pure';
import { projectDashboard, type DashboardView } from './dashboard-projection.pure';
import type { Polled } from './dashboard-reader.pure';
import {
  scrubPosition,
  scrubTime,
  scrubTimeline,
  snapScrubPosition,
  type RailStop,
  type ReplayRange,
} from './dashboard-scrub.pure';
import { projectStages } from './dashboard-stages.pure';

/** Where the dashboard stands: following each poll, or a moment (epoch milliseconds) replayed from the events. */
export type Cutoff = number | 'live';

const readable = (events: readonly DashboardEvent[]): RunLogLine[] =>
  events.flatMap((event) => (event.line ? [event.line] : []));

const eventsAt = (events: readonly DashboardEvent[], at: number): DashboardEvent[] =>
  events.filter((event) => event.line !== undefined && Date.parse(event.line.t) <= at);

const clamp = (value: number, range: ReplayRange) => Math.min(Math.max(value, range.start), range.end);

/** The replayed moment a cutoff stands for, kept within the range; null while live. */
const momentOf = (range: ReplayRange | null, cutoff: Cutoff): number | null =>
  cutoff === 'live' || range === null ? null : clamp(cutoff, range);

/** The cutoff seeking `to` sets: the Run's leading edge or later resumes Live. */
const seekTo = (range: ReplayRange | null, to: number): Cutoff =>
  range === null || to >= range.end ? 'live' : clamp(to, range);

/**
 * The current Run, the one started latest by time then sequence: from its start to its end once the fold has closed
 * it, else to the later of its last event and the reading. Null without a readable event; the first event starts a
 * log without a Run.
 */
function replayRange({ read, readAt }: Polled): ReplayRange | null {
  const lines = readable(read.events);
  if (lines.length === 0) return null;
  // The fold orders spans by start time then sequence, so the last Run span is the current Run.
  const run = fold(lines, { live: 'unfinished' })
    .spans.filter((span) => span.type === 'run')
    .at(-1);
  const times = lines.map((line) => Date.parse(line.t));
  const start = run ? Date.parse(run.start_t) : Math.min(...times);
  const end = run?.end_t ? Date.parse(run.end_t) : Math.max(...times, readAt);
  return { start, end };
}

/** Observed starts and ends map the structural rail; the live view supplies them, never a replayed one. */
function railOf(view: DashboardView | undefined, range: ReplayRange) {
  const stages = view ? projectStages(view.jobs, view.stages).stages : [];
  return scrubTimeline(
    stages.map((stage) =>
      stage.jobs.map((job) => ({
        start: job.span ? Date.parse(job.span.start_t) : null,
        end: job.span?.end_t ? Date.parse(job.span.end_t) : null,
      })),
    ),
    range,
  );
}

/** The view, the event log and the clock: live, the reading itself; replayed, the events up to `moment`. */
function shownAt({ read, readAt }: Polled, moment: number | null) {
  if (moment === null || read.pipeline === undefined) return { view: read.view, events: read.events, now: readAt };
  const log = createLogFold({ live: 'unfinished' });
  const events = eventsAt(read.events, moment);
  log.append(readable(events));
  return { view: projectDashboard(read.pipeline, log.snapshot()), events, now: moment };
}

type Rail = ReturnType<typeof railOf>;

/** The replay slider over the rail `stops` lay out: a cutoff's position, 0 to 1, and the cutoff a position sets. */
function slider(rail: Rail, range: ReplayRange | null) {
  return {
    position(cutoff: Cutoff, stops: readonly RailStop[]): number {
      if (range === null) return 0;
      return scrubPosition(stops, scrubPosition(rail, momentOf(range, cutoff) ?? range.end));
    },
    /** A position snaps to a nearby Stage centre; the Run's leading edge or past it resumes Live. */
    seekPosition(position: number, stops: readonly RailStop[]): Cutoff {
      if (range === null) return 'live';
      const structural = scrubTime(stops, position);
      if (structural >= scrubPosition(rail, range.end) - 0.0001) return 'live';
      return seekTo(range, scrubTime(rail, snapScrubPosition(structural, stops.length)));
    },
  };
}

/**
 * What the dashboard shows of one reading at any cutoff. `at` gives the view, the event log and the clock: live, the
 * reading itself; at a moment, the events up to it through the shared fold, a Run ending later read as running. The
 * rest maps the Live checkbox, the replay slider and its keys to cutoffs and back.
 */
export function dashboardTimeline(polled: Polled) {
  const range = replayRange(polled);
  const rail = range === null ? [] : railOf(polled.read.view, range);
  return {
    range,
    moment: (cutoff: Cutoff) => momentOf(range, cutoff),
    seek: (to: number) => seekTo(range, to),
    /** Live on, or off holding the Run's leading edge. */
    toggle: (live: boolean): Cutoff => (live || range === null ? 'live' : range.end),
    ...slider(rail, range),
    at: (cutoff: Cutoff) => shownAt(polled, momentOf(range, cutoff)),
  };
}

export type DashboardTimeline = ReturnType<typeof dashboardTimeline>;
