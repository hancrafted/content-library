import { createContext } from 'react';

export interface Moment {
  now: number;
  replaying: boolean;
}

export const DashboardMoment = createContext<Moment>({ now: 0, replaying: false });
