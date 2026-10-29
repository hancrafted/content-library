/*
 * The route chain's model: its pieces in order, the props it takes and each piece's state. No React, so the state
 * logic reads without a DOM.
 */

/** The four working pieces of the route, in the order each hands the next one. */
export const PIECES = ['terminal', 'agent', 'folder', 'skill'] as const;
export type Piece = (typeof PIECES)[number];

export type PieceState = 'done' | 'current' | 'rest';

export interface RouteChainProps {
  /** `hero` draws the Title slide's chain of cards; `mini` the section slides' row of icons. */
  readonly size: 'hero' | 'mini';
  /** How many pieces, from the start, are finished. */
  readonly done: 0 | 1 | 2 | 3 | 4;
  /** The piece being set up, outlined. */
  readonly current?: Piece;
  /** The current piece is built by hand (the technical route): drawn dashed. */
  readonly byHand?: boolean;
  /** The chain's name for assistive tech. */
  readonly label: string;
  /** Each piece's title and the line under it; the mini chain reads the title to assistive tech only. */
  readonly pieces: Readonly<Record<Piece, { readonly title: string; readonly sub?: string }>>;
  /** The homepage at the chain's end: its address, its name and the line that calls it the proof. */
  readonly proof: { readonly title: string; readonly site: string; readonly name: string };
  /** The hero's pill on the first piece, "Start here"; without it the piece shows its number. */
  readonly start?: string;
}

/** A piece's state: finished, being set up, or still to come. */
export function stateOf(piece: Piece, { done, current }: Pick<RouteChainProps, 'done' | 'current'>): PieceState {
  if (PIECES.indexOf(piece) < done) return 'done';
  return piece === current ? 'current' : 'rest';
}
