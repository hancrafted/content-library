import type { ReactNode } from 'react';
import type { ArrowCells, Note } from './cashflow-board.pure';

export interface CashflowColumn {
  readonly label: string;
  readonly notes: readonly (Note | null)[];
  readonly footer?: ReactNode;
  readonly marker?: ReactNode;
}

export interface CashflowAnnotation {
  readonly column: number;
  readonly span?: number;
  readonly kind: 'callout' | 'bracket';
  readonly text: ReactNode;
}

export interface BoardLabels {
  readonly board: string;
  readonly cash: string;
  readonly cost: string;
  readonly revenue: string;
  readonly ghost?: string;
}

export interface BoardArrow extends ArrowCells {
  readonly stop?: 'centre' | 'beside';
}

export interface CashflowBoardProps {
  readonly columns: readonly CashflowColumn[];
  readonly labels: BoardLabels;
  readonly locale: string;
  readonly stamp?: { readonly label: string; readonly column: number };
  readonly arrow?: BoardArrow;
  readonly highlight?: number;
  readonly annotations?: readonly CashflowAnnotation[];
}
