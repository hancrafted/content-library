import { formatEuro } from '@/components/slide-shared/cashflow-board/cashflow-board.pure';
import { cn } from '@/lib/utils';
import type { CSSProperties } from 'react';
import styles from './deal-board.module.css';
import { laneTotal, type Deal, type DealLane } from './deal-board.pure';
import type { DealBoardProps, IncomingNote } from './deal-board.types';

const TILT = ['-rotate-1', 'rotate-1', '-rotate-2', 'rotate-2'] as const;

/** A note's tilt, cycled by its place in the lane, and its place in reading order, `--i`, for a Slide's entrance. */
function notePlace(index: number, order: number) {
  return { tilt: TILT[index % TILT.length], style: { '--i': order } as CSSProperties };
}

interface DealNoteProps {
  deal: Deal;
  index: number;
  order: number;
  compact: boolean;
  locale: string;
}

/** One deal as a paper note: company and contact over its value, or on the compact board the company alone. */
function DealNote({ deal, index, order, compact, locale }: DealNoteProps) {
  const { tilt, style } = notePlace(index, order);
  if (compact) {
    return (
      <li data-deal="note" style={style} className={`${tilt} bg-card p-2 text-caption text-muted-foreground shadow-sm`}>
        {deal.company}
      </li>
    );
  }
  return (
    <li data-deal="note" style={style} className={`${tilt} bg-card p-3 shadow-md`}>
      <p className="text-caption font-semibold text-foreground">{deal.company}</p>
      {deal.contact ? <p className="text-caption text-muted-foreground">{deal.contact}</p> : null}
      {deal.value === undefined ? null : (
        <p className="mt-2 text-body font-semibold text-foreground tabular-nums">{formatEuro(deal.value, locale)}</p>
      )}
    </li>
  );
}

/** A note a customer put in: its tag in `primary` mono over its line. */
function Incoming({ note, index, order }: { note: IncomingNote; index: number; order: number }) {
  const { tilt, style } = notePlace(index, order);
  return (
    <li data-deal="note" style={style} className={`${tilt} bg-card p-2 shadow-md`}>
      <p className="font-mono text-caption text-primary">{note.tag}</p>
      <p className="text-caption text-foreground">{note.text}</p>
    </li>
  );
}

interface LaneHeadProps {
  lane: DealLane;
  emphasised: boolean;
  locale: string;
  countLabel: (count: number) => string;
}

/** A lane's head under its pill: its total, in `primary` on the emphasised lane, and its deal count. */
function LaneHead({ lane, emphasised, locale, countLabel }: LaneHeadProps) {
  const colour = emphasised ? 'text-primary' : 'text-foreground';
  return (
    <p className="flex flex-wrap items-baseline justify-between gap-x-2 px-1">
      <span className={`text-body font-semibold tabular-nums ${colour}`}>{formatEuro(laneTotal(lane), locale)}</span>
      <span className="font-mono text-caption text-muted-foreground">{countLabel(lane.deals.length)}</span>
    </p>
  );
}

export interface LaneProps {
  lane: DealLane;
  number: number;
  /** The reading-order index of the lane's first note. */
  firstOrder: number;
  emphasised: boolean;
  board: DealBoardProps;
}

/** The lane's box: pale, ringed in `primary` when emphasised, tighter on the compact board. */
function laneClass(compact: boolean, emphasised: boolean): string {
  return cn(
    styles.lane,
    'relative flex flex-col rounded-xl bg-muted',
    compact ? 'gap-3 px-2 pt-10 pb-4' : 'gap-4 px-3 pt-12 pb-5',
    emphasised && 'ring-2 ring-primary ring-offset-4 ring-offset-background',
  );
}

/** The lane's notes: the incoming notes first when it is the emphasised lane, then its deals. */
function LaneNotes({ lane, firstOrder, emphasised, board }: LaneProps) {
  const { compact = false, locale } = board;
  const incoming = emphasised ? (board.incoming ?? []) : [];
  return (
    <ul role="list" className={compact ? 'flex flex-col gap-3' : 'flex flex-col gap-4'}>
      {incoming.map((note, index) => (
        <Incoming key={note.slug} note={note} index={index} order={firstOrder + index} />
      ))}
      {lane.deals.map((deal, index) => (
        <DealNote
          key={deal.slug}
          deal={deal}
          index={incoming.length + index}
          order={firstOrder + incoming.length + index}
          compact={compact}
          locale={locale}
        />
      ))}
    </ul>
  );
}

/** One stage: a pale lane under a dark pill, its head on the full board, then its notes. */
export function Lane(props: LaneProps) {
  const { lane, number, emphasised, board } = props;
  const compact = board.compact === true;
  const pill =
    'absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-foreground py-1.5 text-caption font-medium whitespace-nowrap text-background';
  return (
    <li
      data-deal="lane"
      data-emphasis={emphasised ? 'true' : undefined}
      data-target={emphasised ? board.emphasisTarget : undefined}
      style={{ '--n': number } as CSSProperties}
      className={laneClass(compact, emphasised)}
    >
      <h4 className={`${pill} ${compact ? 'px-3' : 'px-5'}`}>{lane.label}</h4>
      {compact || !board.countLabel ? null : (
        <LaneHead lane={lane} emphasised={emphasised} locale={board.locale} countLabel={board.countLabel} />
      )}
      <LaneNotes {...props} />
    </li>
  );
}
