export const PARTS = ['prompt', 'cursor', 'command', 'output', 'close'] as const;
export type Part = (typeof PARTS)[number];

export const FIRST_PART: Part = PARTS[0];

export const partOf = (value: string): Part =>
  (PARTS as readonly string[]).includes(value) ? (value as Part) : FIRST_PART;

export function stepPart(active: Part, direction: 1 | -1): Part {
  const index = PARTS.indexOf(active) + direction;
  return PARTS[Math.min(PARTS.length - 1, Math.max(0, index))] ?? FIRST_PART;
}

export const hasStep = (active: Part, direction: 1 | -1): boolean => stepPart(active, direction) !== active;
