import type { Stage } from './workflow.types';

/*
 * The geometry of the hairlines between stages, generated for N branches. The fan of three is the venue pipeline's
 * drawing to the pixel: a 24 wide box, branches 60 apart around the join, 20 from the edge.
 */

/** Rounds drawn per repeated stage, by stage id. */
export type Rounds = Readonly<Record<string, number>>;

export type Connector = { readonly kind: 'straight' } | { readonly kind: 'out' | 'in'; readonly branches: number };

export interface Fan {
  readonly height: number;
  /** The y of each branch end, top to bottom. */
  readonly ys: readonly number[];
  readonly lines: string;
  readonly heads: string;
}

export const BRANCH_PITCH = 60;
const PITCH = BRANCH_PITCH;
const MARGIN = 20;
const MIN_HEIGHT = 160;
const WIDTH = 20;

/** The cards a stage draws side by side: one per round of a repeated stage, else one. */
const widest = (stage: Stage, rounds: Rounds): number => Math.max(1, rounds[stage.id] ?? 1);

/** The hairline into `stage`: out to its chats, back in from the previous stage's chats, else straight. */
export function connectorInto(previous: Stage | undefined, stage: Stage, rounds: Rounds): Connector {
  const into = widest(stage, rounds);
  if (into > 1) return { kind: 'out', branches: into };
  const from = previous ? widest(previous, rounds) : 1;
  return from > 1 ? { kind: 'in', branches: from } : { kind: 'straight' };
}

/** A fan of `branches` lines, from one join to the branch ends (`out`) or from the ends to the join (`in`). */
export function fanGeometry(direction: 'out' | 'in', branches: number): Fan {
  const height = Math.max(MIN_HEIGHT, PITCH * (branches - 1) + 2 * MARGIN);
  const join = height / 2;
  const first = join - (PITCH * (branches - 1)) / 2;
  const ys = Array.from({ length: branches }, (_, i) => first + i * PITCH);
  const line = (y: number): string => {
    if (y === join) return `M0 ${join}h${WIDTH}`;
    return direction === 'out'
      ? `M0 ${join} C 12 ${join}, 10 ${y}, ${WIDTH} ${y}`
      : `M0 ${y} C 12 ${y}, 10 ${join}, ${WIDTH} ${join}`;
  };
  const head = (y: number) => `M18 ${y - 3} 23 ${y}l-5 3z`;
  return {
    height,
    ys,
    lines: ys.map(line).join(' '),
    heads: (direction === 'out' ? ys.map(head) : [head(join)]).join(' '),
  };
}
