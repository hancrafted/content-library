import type { Polled } from '@/pipeline/lib/dashboard-reader.pure';
import { dashboardTimeline, type Cutoff, type DashboardTimeline } from '@/pipeline/lib/dashboard-timeline.pure';
import { useDeferredValue, useMemo, useState } from 'react';

/** What the Live checkbox and replay slider read and set; times are epoch milliseconds. */
export interface ReplayControls {
  live: boolean;
  setLive: (live: boolean) => void;
  seek: (moment: number) => void;
  /** Seeks to a place on the Stage rail, 0 to 1 by Stage index; Graph geometry maps the slider to it. */
  seekRail: (place: number) => void;
  /** The cutoff's place on the Stage rail. */
  railPlace: number;
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
    seekRail: (place) => setCutoff(timeline.seekRail(place)),
    railPlace: timeline.railAt(cutoff),
    at,
    range: timeline.range,
  };
  return { controls, view, events, now };
}
