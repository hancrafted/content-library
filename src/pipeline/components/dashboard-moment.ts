import { createContext } from 'react';

/**
 * The moment the dashboard shows, read by elapsed times and outputs deep in the graph: `now` is the replay cutoff, or
 * the last read while live (never a render-time clock); `replaying` is true while the slider holds the view.
 */
export interface Moment {
  now: number;
  replaying: boolean;
}

export const DashboardMoment = createContext<Moment>({ now: 0, replaying: false });
