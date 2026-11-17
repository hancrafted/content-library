import { formatEuro } from '@/episodes/components/slide-shared/cashflow-board/cashflow-board.pure';
import { cn } from '@/shared/lib/utils';
import type { CSSProperties } from 'react';
import styles from './deal-board.module.css';
import { laneTotal, type Deal, type DealLane, type DealSlot } from './deal-board.pure';
import type { DealBoardProps, IncomingNote } from './deal-board.types';
import { slotOutline } from './deal-slot';

const TILT = ['-rotate-1', 'rotate-1', '-rotate-2', 'rotate-2'] as const;

function tiltOf(index: number) {
  return TILT[index % TILT.length];
}

interface DealNoteProps {
  deal: Deal;
  index: number;
  compact: boolean;
  locale: string;
}

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

function laneClass(compact: boolean, emphasised: boolean): string {
  return cn(
    styles.lane,
    'focus-group__item',
    'relative flex flex-col rounded-xl bg-muted',
    compact ? 'gap-3 px-2 pt-10 pb-4' : 'gap-4 px-3 pt-12 pb-5',
    emphasised && 'ring-2 ring-primary ring-offset-4 ring-offset-background',
  );
}

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
