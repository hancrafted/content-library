// A probe scenario on tire swing, for the scenario judge's tests in both lanes.
import type { Bundle, Preset, TourStep } from './software-ecology.types';
import { builtinBundle } from './use-case-data.ts';

/** Tire swing with one more scenario, `probe`: Realistic, then the given beats. */
export const withTour = (tour: readonly TourStep[]): Bundle => {
  const B = builtinBundle('tire');
  const p: Preset = { id: 'probe', view: 'factory', reality: 100, tour };
  return { ...B, data: { ...B.data, presets: [...B.data.presets, p] } };
};
export const SEEDS = [1, 2, 3];
export const AI_AT_ENG = { ai: ['eng'], dials: { eng: { aiExtra: 2 } } } as const;
