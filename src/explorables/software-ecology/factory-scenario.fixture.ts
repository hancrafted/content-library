import type { Bundle, Preset, TourStep } from './software-ecology.types';
import { builtinBundle } from './use-case-data.ts';

export const withTour = (tour: readonly TourStep[]): Bundle => {
  const B = builtinBundle('tire');
  const p: Preset = { id: 'probe', view: 'factory', reality: 100, tour };
  return { ...B, data: { ...B.data, presets: [...B.data.presets, p] } };
};
export const SEEDS = [1, 2, 3];
export const AI_AT_ENG = { ai: ['eng'], dials: { eng: { aiExtra: 2 } } } as const;
