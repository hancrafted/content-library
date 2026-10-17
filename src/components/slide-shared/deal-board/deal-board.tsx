import { formatEuro } from '@/components/slide-shared/cashflow-board/cashflow-board.pure';
import { cn } from '@/lib/utils';
import type { CSSProperties } from 'react';
import styles from './deal-board.module.css';
import { checkDealBoard } from './deal-board.pure';
import type { DealBoardProps } from './deal-board.types';
import { Lane } from './deal-lane';
import { Annotation, Bracket, Ends } from './deal-marks';

export type { DealBoardProps } from './deal-board.types';

/** The lanes, and the bracket row on their grid, in a row that scrolls sideways when the board is narrow. */
function LaneRow({ board, emphasis }: { board: DealBoardProps; emphasis: number }) {
  const { label, lanes, bracket } = board;
  return (
    <div
      role="region"
      aria-label={label}
      tabIndex={0}
      data-target={board['data-target']}
      className={`${styles.scroller} rounded-xl focus-visible:outline-2 focus-visible:outline-ring`}
    >
      <div className={styles.grid}>
        <ol role="list" className={`${styles.lanes} focus-group focus-group--dim-others`}>
          {lanes.map((lane, index) => (
            <Lane key={lane.slug} lane={lane} number={index + 1} emphasised={index + 1 === emphasis} board={board} />
          ))}
        </ol>
        {bracket ? <Bracket bracket={bracket} emphasis={Math.max(emphasis, 1)} /> : null}
      </div>
    </div>
  );
}

/**
 * The deal board (the Title slide and Slides 4 and 5 of "Why it's never too early to start with sales"): pipeline
 * stages as pale lanes under dark pills, each deal a tilted paper note. The full board heads each lane with its
 * computed total and count when given a `countLabel`, and writes contact and value on each note; the compact board
 * names the company only. One lane may be ringed in `primary`, with incoming notes, an annotation over it and a
 * bracket under the others; a lane may close on a dashed slot. All lanes stand side by side when the board is wide
 * enough; narrower, the lanes scroll sideways in their own row, or with `wrap` stand two to a row, and nothing is cut.
 * Pointing at a lane dims the others.
 */
export function DealBoard<Slug extends string>(props: DealBoardProps<Slug>) {
  const { lanes, compact, wrap, emphasis, annotation, ends, bracket } = props;
  checkDealBoard({ lanes, emphasis, bracket });
  const emphasisNumber = lanes.findIndex((lane) => lane.slug === emphasis) + 1;
  const style = { '--lanes': lanes.length, '--emphasis': Math.max(emphasisNumber, 1) } as CSSProperties;
  return (
    <div
      data-slot="deal-board"
      data-wrap={wrap ? 'true' : undefined}
      style={style}
      className={cn(styles.board, compact && styles.compact, wrap && styles.wrap, 'flex flex-col')}
    >
      {annotation ? <Annotation text={annotation} /> : null}
      <LaneRow board={props} emphasis={emphasisNumber} />
      {ends ? <Ends ends={ends} /> : null}
    </div>
  );
}

interface OpenPipelineProps {
  label: string;
  total: number;
  /** The deal count as the Slide words it, `11 deals in 5 stages`. */
  deals: string;
  locale: string;
}

/** The open pipeline, pinned as a note: a mono label, the sum of every deal in euros and the deal count. */
export function OpenPipeline({ label, total, deals, locale }: OpenPipelineProps) {
  return (
    <div data-deal="summary" className="rotate-2 bg-card px-5 py-3 text-right shadow-md">
      <p className="font-mono text-caption tracking-widest text-muted-foreground uppercase">{label}</p>
      <p className="text-body font-semibold text-foreground tabular-nums">{formatEuro(total, locale)}</p>
      <p className="text-caption text-muted-foreground">{deals}</p>
    </div>
  );
}
