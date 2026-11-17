export const SPINE_LEVELS = ['episode', 'section', 'slide'] as const;

export type SpineLevel = (typeof SPINE_LEVELS)[number];

export function nextSpineLevel(level: SpineLevel): SpineLevel {
  const index = SPINE_LEVELS.indexOf(level);
  if (index < 0) throw new Error(`"${level}" is not a level of the spine.`);
  return SPINE_LEVELS[(index + 1) % SPINE_LEVELS.length];
}
