/*
 * What a state starts with (feedback 09, Q164): the weeks of work waiting at each work center when the page loads
 * Realistic, and the display defaults a state defines. All of it comes from the use-case file; "Reset to default"
 * and the first load read the same functions. No DOM and no model: the run hands the backlog to the model.
 */
import type { Bundle, Display, Preset } from './software-ecology.types';

/** The pile-up style and belt motion every state starts at unless the file says otherwise. */
export const DISPLAY_DEFAULT: Required<Display> = { pile: 'heap', beltMotion: false };

/** The display a state defines: the page's defaults, the file's `display`, then the state's own. */
export const displayOf = (B: Bundle, p: Preset): Required<Display> => ({
  ...DISPLAY_DEFAULT,
  ...(B.data.display ?? {}),
  ...(p.display ?? {}),
});

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
