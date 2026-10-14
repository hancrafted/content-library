import type { DashboardView } from '@/lib/dashboard-projection.pure';
import type { EpisodeRead } from '@/lib/dashboard-reader.pure';
import { replayBounds, replayDashboard, stageMarks, type ReplayControls } from '@/lib/dashboard-replay.pure';
import { projectStages } from '@/lib/dashboard-stages.pure';
import { useDeferredValue, useMemo, useState } from 'react';

/**
 * Live follows each poll; off, the view replays the retained events up to a chosen moment while polling continues.
 * The latest moment is the last event, or, while the newest Run has not ended, the later of it and the last read.
 */
export function useDashboardReplay(
  read: EpisodeRead,
  readAt: number,
): ReplayControls & { view: DashboardView | undefined } {
  const [cutoff, setCutoff] = useState<number | null>(null);
  const bounds = useMemo(() => replayBounds(read.events), [read.events]);
  const marks = useMemo(
    () => (read.view ? stageMarks(projectStages(read.view.jobs, read.view.stages).stages) : []),
    [read.view],
  );
  const range = bounds && { start: bounds.start, end: bounds.finished ? bounds.last : Math.max(bounds.last, readAt) };
  const at = cutoff === null || range === null ? null : Math.min(Math.max(cutoff, range.start), range.end);
  const shown = useDeferredValue(at);
  const replayed = useMemo(
    () => (shown !== null && read.pipeline ? replayDashboard(read.pipeline, read.events, shown) : undefined),
    [shown, read.pipeline, read.events],
  );
  return {
    live: at === null,
    setLive: (live: boolean) => setCutoff(live || range === null ? null : range.end),
    seek: (moment: number) => setCutoff(moment),
    at,
    range,
    marks,
    view: at === null ? read.view : (replayed ?? read.view),
  };
}
