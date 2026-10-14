import type { DashboardEvent } from '@/lib/dashboard-events.pure';
import type { EpisodeRead } from '@/lib/dashboard-reader.pure';
import { eventsAt, replayBounds, replayDashboard, stageMarks } from '@/lib/dashboard-replay.pure';
import { projectStages } from '@/lib/dashboard-stages.pure';
import { useDeferredValue, useMemo, useState } from 'react';
import type { Polled } from './use-episode-dashboard';

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

/** The slider's range: the current Run's start to its end, or, while it has not ended, the later of its last event and the last read. */
function useReplayRange({ read, readAt }: Polled) {
  const bounds = useMemo(() => replayBounds(read.events), [read.events]);
  const marks = useMemo(
    () => (read.view ? stageMarks(projectStages(read.view.jobs, read.view.stages).stages) : []),
    [read.view],
  );
  if (bounds === null) return { range: null, marks };
  return { range: { start: bounds.start, end: bounds.finished ? bounds.last : Math.max(bounds.last, readAt) }, marks };
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

/**
 * Live follows each poll; off, the view and the event log replay the retained events up to a chosen moment while
 * polling continues. `now` is the moment shown: the cutoff, or the last read while live.
 */
export function useDashboardReplay(polled: Polled) {
  const [cutoff, setCutoff] = useState<number | null>(null);
  const { range, marks } = useReplayRange(polled);
  const at = cutoff === null || range === null ? null : clamp(cutoff, range);
  const replayed = useReplayed(polled.read, at);
  const controls: ReplayControls = {
    live: at === null,
    setLive: (live) => setCutoff(live || range === null ? null : range.end),
    seek: setCutoff,
    at,
    range,
    marks,
  };
  const events: readonly DashboardEvent[] = replayed ? replayed.events : polled.read.events;
  return {
    controls,
    view: replayed ? replayed.view : polled.read.view,
    events,
    now: replayed ? replayed.at : polled.readAt,
  };
}
