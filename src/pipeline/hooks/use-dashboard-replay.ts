import type { Polled } from '@/pipeline/lib/dashboard-reader.pure';
import { dashboardTimeline, type Cutoff, type DashboardTimeline } from '@/pipeline/lib/dashboard-timeline.pure';
import { useDeferredValue, useMemo, useState } from 'react';

export interface ReplayControls {
  live: boolean;
  setLive: (live: boolean) => void;
  seek: (moment: number) => void;
  seekRail: (place: number) => void;
  railPlace: number;
  at: number | null;
  range: DashboardTimeline['range'];
}

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
