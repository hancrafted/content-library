import type { ReactNode } from 'react';
import type { BoardCell, Note } from './cashflow-board.pure';

/** One month or quarter: a lane under a dark pill, three note slots top to bottom, and content under it. */
export interface CashflowColumn {
  readonly label: string;
  /** Three slots, top to bottom; `null` leaves a slot empty. */
  readonly notes: readonly (Note | null)[];
  /** Content under the lane, such as a `CashLeft` line. */
  readonly footer?: ReactNode;
}

/** A call-out or bracket in the row under the lanes, on the lanes' grid; columns count from 1. */
export interface CashflowAnnotation {
  readonly column: number;
  readonly span?: number;
  readonly kind: 'callout' | 'bracket';
  readonly text: string;
}

/** The Slide's words for the board: its accessible name, each note kind, and a ghost outline's text. */
export interface BoardLabels {
  readonly board: string;
  readonly cash: string;
  readonly cost: string;
  readonly revenue: string;
  readonly ghost?: string;
}

/** An arrow dragging a note from one cell to another, its label on the shaft. */
export interface BoardArrow {
  readonly from: BoardCell;
  readonly to: BoardCell;
  readonly label?: string;
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
