import type { ReactNode } from 'react';
import type { ArrowCells, Note } from './cashflow-board.pure';

/** One month or quarter: a lane under a dark pill, three note slots top to bottom, and content under it. */
export interface CashflowColumn {
  readonly label: string;
  /** Three slots, top to bottom; `null` leaves a slot empty. */
  readonly notes: readonly (Note | null)[];
  /** Content under the lane, such as a `CashLeft` line. */
  readonly footer?: ReactNode;
  /** A Context marker in the lane's top-right corner, for a fact the whole column shows. */
  readonly marker?: ReactNode;
}

/** A call-out or bracket in the row under the lanes, on the lanes' grid; columns count from 1. */
export interface CashflowAnnotation {
  readonly column: number;
  readonly span?: number;
  readonly kind: 'callout' | 'bracket';
  /** Its words, which may end in a Context marker. */
  readonly text: ReactNode;
}

/** The Slide's words for the board: its accessible name, each note kind, and a ghost outline's text. */
export interface BoardLabels {
  readonly board: string;
  readonly cash: string;
  readonly cost: string;
  readonly revenue: string;
  readonly ghost?: string;
}

/** An arrow dragging a note from one cell to another, placed as `ArrowCells` says. */
export interface BoardArrow extends ArrowCells {
  /** Where a shaft's head stops: on the centre of the `to` cell (the default) or just beside its note. */
  readonly stop?: 'centre' | 'beside';
}

export interface CashflowBoardProps {
  readonly columns: readonly CashflowColumn[];
  readonly labels: BoardLabels;
  /** The locale euros are written in. */
  readonly locale: string;
  /** A stamp fallen across one column. */
  readonly stamp?: { readonly label: string; readonly column: number };
  readonly arrow?: BoardArrow;
  /** A column ringed in `primary`. */
  readonly highlight?: number;
  readonly annotations?: readonly CashflowAnnotation[];
}
