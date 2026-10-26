import type { ScrubJob } from '@/pipeline/lib/dashboard-scrub.pure';
import { createContext } from 'react';

/** Observed Job boundaries remain independent of the replay cutoff in DashboardMoment. */
export const DashboardObservations = createContext<ReadonlyMap<string, ScrubJob>>(new Map());
