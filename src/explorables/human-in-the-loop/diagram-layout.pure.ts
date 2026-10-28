import type { Stage } from './workflow.types';

/*
 * The geometry of the hairlines between stages, generated for N branches: a 24 wide box, measured from the top of the
 * stage's lane, the branches 60 apart.
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
const WIDTH = 20;
/**
 * Cards stand at the top of their lane, so every hairline is measured from the lane's top edge. The title line of a
 * stage card: the lane's padding (12), the card's border and padding (13) and half a title line (body, 25.6 / 2).
 */
export const TITLE_Y = 38;
/** The first round's card under a repeated stage's name: the lane's padding (12), the name's row (50), half a card (24). */
const FIRST_BRANCH_Y = 86;

/** The cards a stage draws side by side: one per round of a repeated stage, else one. */
const widest = (stage: Stage, rounds: Rounds): number => Math.max(1, rounds[stage.id] ?? 1);

/** The hairline into `stage`: out to its chats, back in from the previous stage's chats, else straight. */
export function connectorInto(previous: Stage | undefined, stage: Stage, rounds: Rounds): Connector {
  const into = widest(stage, rounds);
  if (into > 1) return { kind: 'out', branches: into };
  const from = previous ? widest(previous, rounds) : 1;
  return from > 1 ? { kind: 'in', branches: from } : { kind: 'straight' };
}

/**
 * A fan of `branches` lines between the title line of a single stage card and the round cards of a repeated stage:
 * out from the title line to each round (`out`), or from each round back to the title line (`in`).
 */
export function fanGeometry(direction: 'out' | 'in', branches: number): Fan {
  const join = TITLE_Y;
  const ys = Array.from({ length: branches }, (_, i) => FIRST_BRANCH_Y + i * PITCH);
  const line = (y: number): string =>
    direction === 'out'
      ? `M0 ${join} C 12 ${join}, 10 ${y}, ${WIDTH} ${y}`
      : `M0 ${y} C 12 ${y}, 10 ${join}, ${WIDTH} ${join}`;
  const head = (y: number) => `M18 ${y - 3} 23 ${y}l-5 3z`;
  return {
    height: (ys.at(-1) ?? join) + MARGIN,
    ys,
    lines: ys.map(line).join(' '),
    heads: (direction === 'out' ? ys.map(head) : [head(join)]).join(' '),
  };
}
