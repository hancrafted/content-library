import type { ReactNode } from 'react';
import type { BoardCell, Note } from './cashflow-board.pure';

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

/**
 * An arrow dragging a note from one cell to another. A `shaft` (the default) runs straight along the slot row, its
 * label on the shaft; a `curve` is a stroked arc across the gap beside the `from` cell, toward `to`, its label on a
 * pill in the slot under `from`.
 */
export interface BoardArrow {
  readonly from: BoardCell;
  readonly to: BoardCell;
  readonly label?: string;
  readonly variant?: 'shaft' | 'curve';
  /**
   * A shaft's label stands on the shaft in the gap between this column's lane and the next, clear of the notes on
   * either side, where the board is wide enough to hold it there; narrower, it stands in the slot under `from`. With
   * no `labelGap`, the label is a pill under the middle of the shaft.
   */
  readonly labelGap?: number;
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
