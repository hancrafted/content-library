import type { ReactNode } from 'react';
import type { DealLane } from './deal-board.pure';

export interface IncomingNote {
  readonly slug: string;
  readonly tag: string;
  readonly text: string;
}

export interface DealBracket {
  readonly stage: string;
  readonly label: string;
  readonly from: number;
  readonly to: number;
}

export interface DealBoardProps<Slug extends string = string> {
  readonly label: string;
  readonly lanes: readonly DealLane<Slug>[];
  readonly locale: string;
  readonly countLabel?: (count: number) => string;
  readonly emphasis?: Slug;
  readonly compact?: boolean;
  readonly wrap?: boolean;
  readonly incoming?: readonly IncomingNote[];
  readonly annotation?: string;
  readonly ends?: readonly [string, string];
  readonly bracket?: DealBracket;
  readonly 'data-target'?: string;
  readonly emphasisTarget?: string;
  readonly markers?: Readonly<Partial<Record<Slug, ReactNode>>>;
}
