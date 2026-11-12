/*
 * What a state starts with (feedback 09, Q164): the weeks of work waiting at each work center when the page loads
 * Realistic. It comes from the use-case file; "Reset to default" and the first load read the same function. No DOM and no model: the run hands the backlog to the model.
 */
import type { Bundle, Preset } from './software-ecology.types';

/**
 * Weeks of work to seed per work center for a state at the given reality: the state's own `backlog`, else the file's,
 * scaled by reality (Ideal starts clear, Realistic full). A clear state seeds nothing.
 */
export const startBacklogOf = (B: Bundle, p: Preset, reality: number = p.reality ?? 0): Record<string, number> => {
  if (p.start === 'clear') return {};
  const weeks = p.backlog ?? B.data.backlog ?? {},
    k = Math.max(0, Math.min(100, reality)) / 100;
  return Object.fromEntries(
    Object.entries(weeks)
      .map(([id, w]) => [id, w * k] as const)
      .filter(([, w]) => w > 0),
  );
};
