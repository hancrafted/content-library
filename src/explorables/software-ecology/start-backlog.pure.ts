import type { Bundle, Preset } from './software-ecology.types';

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
