import type { Polled } from '@/lib/dashboard-reader.pure';
import type { RailStop } from '@/lib/dashboard-scrub.pure';
import { dashboardTimeline, type Cutoff, type DashboardTimeline } from '@/lib/dashboard-timeline.pure';
import { useDeferredValue, useMemo, useState } from 'react';

/** What the Live checkbox and replay slider read and set; times are epoch milliseconds. */
export interface ReplayControls {
  live: boolean;
  setLive: (live: boolean) => void;
  seek: (moment: number) => void;
  /** Seeks to a slider position along the rail the Graph geometry `stops` lay out. */
  seekPosition: (position: number, stops: readonly RailStop[]) => void;
  /** The slider position of the cutoff along that rail. */
  position: (stops: readonly RailStop[]) => number;
  /** The cutoff while replaying, null while live. */
  at: number | null;
  range: DashboardTimeline['range'];
}

/** Live follows each poll; off, the timeline replays retained events at the cutoff while polling continues. */
export function useDashboardReplay(polled: Polled) {
  const [cutoff, setCutoff] = useState<Cutoff>('live');
  const timeline = useMemo(() => dashboardTimeline(polled), [polled]);
  const at = timeline.moment(cutoff);
  const deferred = useDeferredValue(at);
  const shown: Cutoff = at === null || deferred === null ? 'live' : deferred;
  const { view, events, now } = useMemo(() => timeline.at(shown), [timeline, shown]);
  const controls: ReplayControls = {
    live: at === null,
    setLive: (live) => setCutoff(timeline.toggle(live)),
    seek: (moment) => setCutoff(timeline.seek(moment)),
    seekPosition: (position, stops) => setCutoff(timeline.seekPosition(position, stops)),
    position: (stops) => timeline.position(cutoff, stops),
    at,
    range: timeline.range,
  };
  return { controls, view, events, now };
}
