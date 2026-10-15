import type { DashboardEvent } from '@/lib/dashboard-events.pure';
import type { EpisodeRead, Polled } from '@/lib/dashboard-reader.pure';
import { eventsAt, replayBounds, replayDashboard } from '@/lib/dashboard-replay.pure';
import { scrubTimeline } from '@/lib/dashboard-scrub.pure';
import { projectStages } from '@/lib/dashboard-stages.pure';
import { useDeferredValue, useMemo, useState } from 'react';

/** What the Live checkbox and replay slider read and set; times are epoch milliseconds. */
export interface ReplayControls {
  live: boolean;
  setLive: (live: boolean) => void;
  seek: (moment: number) => void;
  /** The cutoff while replaying, null while live. */
  at: number | null;
  range: { start: number; end: number } | null;
  timeline: ReturnType<typeof scrubTimeline>;
}

/** The slider's range: the current Run's start to its end, or, while it has not ended, the later of its last event and the last read. */
function useReplayRange({ read, readAt }: Polled) {
  const bounds = useMemo(() => replayBounds(read.events), [read.events]);
  if (bounds === null) return null;
  return { start: bounds.start, end: bounds.finished ? bounds.last : Math.max(bounds.last, readAt) };
}

/** The view and event log at `at`, re-folded only when the deferred cutoff or the retained events change. */
function useReplayed(read: EpisodeRead, at: number | null) {
  const shown = useDeferredValue(at);
  const replayed = useMemo(() => {
    if (shown === null || read.pipeline === undefined) return null;
    return {
      view: replayDashboard(read.pipeline, read.events, shown),
      events: eventsAt(read.events, shown),
      at: shown,
    };
  }, [shown, read.pipeline, read.events]);
  return at === null ? null : replayed;
}

const clamp = (value: number, range: { start: number; end: number }) =>
  Math.min(Math.max(value, range.start), range.end);

/** Observed starts and ends map the structural rail without consulting the replayed projection. */
function useScrubTimeline(read: EpisodeRead, range: ReplayControls['range']) {
  return useMemo(() => {
    if (range === null) return [];
    const stages = read.view ? projectStages(read.view.jobs, read.view.stages).stages : [];
    return scrubTimeline(
      stages.map((stage) =>
        stage.jobs.map((job) => ({
          start: job.span ? Date.parse(job.span.start_t) : null,
          end: job.span?.end_t ? Date.parse(job.span.end_t) : null,
        })),
      ),
      range,
    );
  }, [read.view, range?.start, range?.end]);
}

/** Live follows each poll; off, replay retained events at the cutoff while polling continues. */
export function useDashboardReplay(polled: Polled) {
  const [cutoff, setCutoff] = useState<number | null>(null);
  const range = useReplayRange(polled);
  const timeline = useScrubTimeline(polled.read, range);
  const at = cutoff === null || range === null ? null : clamp(cutoff, range);
  const replayed = useReplayed(polled.read, at);
  const controls: ReplayControls = {
    live: at === null,
    setLive: (live) => setCutoff(live || range === null ? null : range.end),
    seek: (moment) => setCutoff(range === null || moment >= range.end ? null : clamp(moment, range)),
    at,
    range,
    timeline,
  };
  const events: readonly DashboardEvent[] = replayed ? replayed.events : polled.read.events;
  return {
    controls,
    view: replayed ? replayed.view : polled.read.view,
    events,
    now: replayed ? replayed.at : polled.readAt,
  };
}
