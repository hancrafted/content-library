import { formatEuro } from '@/components/slide-shared/cashflow-board/cashflow-board.pure';
import { cn } from '@/lib/utils';
import type { CSSProperties } from 'react';
import styles from './deal-board.module.css';
import { laneTotal, type Deal, type DealLane, type DealSlot } from './deal-board.pure';
import type { DealBoardProps, IncomingNote } from './deal-board.types';
import { slotOutline } from './deal-slot';

const TILT = ['-rotate-1', 'rotate-1', '-rotate-2', 'rotate-2'] as const;

/** A note's tilt, cycled by its place in the lane. */
function tiltOf(index: number) {
  return TILT[index % TILT.length];
}

interface DealNoteProps {
  deal: Deal;
  index: number;
  compact: boolean;
  locale: string;
}

/** A note that stands for any deal: its mono tag over the company, ringed in `primary` when the board points at it. */
function TaggedNote({ deal, tilt }: { deal: Deal & { tag: string }; tilt: string }) {
  return (
    <li
      data-deal="note"
      data-ringed={deal.ringed ? 'true' : undefined}
      className={cn(
        tilt,
        'border bg-card p-3 shadow-md',
        deal.ringed && 'ring-2 ring-primary ring-offset-2 ring-offset-muted',
      )}
    >
      <p className="font-mono text-caption text-muted-foreground uppercase">{deal.tag}</p>
      <p className="text-body font-semibold text-foreground">{deal.company}</p>
    </li>
  );
}

/**
 * One deal as a paper note: company and contact over its value, or on the compact board the company alone; a tagged
 * deal is a `TaggedNote`.
 */
function DealNote({ deal, index, compact, locale }: DealNoteProps) {
  const tilt = tiltOf(index);
  if (deal.tag !== undefined) return <TaggedNote deal={{ ...deal, tag: deal.tag }} tilt={tilt} />;
  if (compact) {
    return (
      <li data-deal="note" className={`${tilt} bg-card p-2 text-caption text-muted-foreground shadow-sm`}>
        {deal.company}
      </li>
    );
  }
  return (
    <li data-deal="note" className={`${tilt} bg-card p-3 shadow-md`}>
      <p className="text-caption font-semibold text-foreground">{deal.company}</p>
      {deal.contact ? <p className="text-caption text-muted-foreground">{deal.contact}</p> : null}
      {deal.value === undefined ? null : (
        <p className="mt-2 text-body font-semibold text-foreground tabular-nums">{formatEuro(deal.value, locale)}</p>
      )}
    </li>
  );
}

/** A note a customer put in: its tag in `primary` mono over its line. */
function Incoming({ note, index }: { note: IncomingNote; index: number }) {
  return (
    <li data-deal="note" className={`${tiltOf(index)} bg-card p-2 shadow-md`}>
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
  emphasised: boolean;
  board: DealBoardProps;
}

/** The lane's box: pale, ringed in `primary` when emphasised, tighter on the compact board. */
function laneClass(compact: boolean, emphasised: boolean): string {
  return cn(
    styles.lane,
    'focus-group__item',
    'relative flex flex-col rounded-xl bg-muted',
    compact ? 'gap-3 px-2 pt-10 pb-4' : 'gap-4 px-3 pt-12 pb-5',
    emphasised && 'ring-2 ring-primary ring-offset-4 ring-offset-background',
  );
}

/** The dashed slot closing a lane, a payment slot's text centred in it. */
function Slot({ slot, compact }: { slot: DealSlot; compact: boolean }) {
  return (
    <li
      data-deal="slot"
      data-kind={slot.kind}
      className={cn(
        'flex items-center justify-center p-3 text-center font-semibold text-muted-foreground',
        compact ? 'min-h-12 text-caption' : 'min-h-24 text-body',
        slotOutline(slot),
      )}
    >
      {slot.kind === 'payment' ? slot.text : null}
    </li>
  );
}

/** The lane's notes: the incoming notes first when it is the emphasised lane, then its deals, then its slot. */
function LaneNotes({ lane, emphasised, board }: LaneProps) {
  const { compact = false, locale } = board;
  const incoming = emphasised ? (board.incoming ?? []) : [];
  return (
    <ul role="list" className={compact ? 'flex flex-col gap-3' : 'flex flex-col gap-4'}>
      {incoming.map((note, index) => (
        <Incoming key={note.slug} note={note} index={index} />
      ))}
      {lane.deals.map((deal, index) => (
        <DealNote key={deal.slug} deal={deal} index={incoming.length + index} compact={compact} locale={locale} />
      ))}
      {lane.slot ? <Slot slot={lane.slot} compact={compact} /> : null}
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
      {board.markers?.[lane.slug]}
      {compact || !board.countLabel ? null : (
        <LaneHead lane={lane} emphasised={emphasised} locale={board.locale} countLabel={board.countLabel} />
      )}
      <LaneNotes {...props} />
    </li>
  );
}
