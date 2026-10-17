import type { ReactNode } from 'react';
import type { DealLane } from './deal-board.pure';

/** A note a customer put into the emphasised lane themselves: a mono tag over one line. */
export interface IncomingNote {
  readonly slug: string;
  readonly tag: string;
  readonly text: string;
}

/** A label under the emphasised lane and a bracket under the lanes `from` to `to`, counted from 1, with its text. */
export interface DealBracket {
  readonly stage: string;
  readonly label: string;
  readonly from: number;
  readonly to: number;
}

export interface DealBoardProps {
  /** The board's accessible name. */
  readonly label: string;
  readonly lanes: readonly DealLane[];
  /** The locale euros are written in. */
  readonly locale: string;
  /** A lane's deal count as the Slide words it, `3 deals`; unused on the compact board. */
  readonly countLabel?: (count: number) => string;
  /** The slug of the lane ringed in `primary`. */
  readonly emphasis?: string;
  /** Short labels, company-only notes, no totals or values. */
  readonly compact?: boolean;
  /** Lanes of one height that wrap two to a row where the board is narrow, instead of scrolling sideways. */
  readonly wrap?: boolean;
  /** Notes standing first in the emphasised lane. */
  readonly incoming?: readonly IncomingNote[];
  /** A `primary` label with a drawn arrow, over the emphasised lane. */
  readonly annotation?: string;
  /** The two ends of the dashed flow arrow under the lanes, first to last. */
  readonly ends?: readonly [string, string];
  readonly bracket?: DealBracket;
  /** The Context drawer's target on the lanes. */
  readonly 'data-target'?: string;
  /** The Context drawer's target on the emphasised lane. */
  readonly emphasisTarget?: string;
  /** Context markers by lane slug, each in its lane's top-right corner. */
  readonly markers?: Readonly<Record<string, ReactNode>>;
}
