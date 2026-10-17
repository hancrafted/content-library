import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';
import styles from './cashflow-board.module.css';
import { lanePlacement } from './cashflow-board.pure';
import type { BoardArrow, CashflowAnnotation } from './cashflow-board.types';
import { placeOn } from './place-on';

/** A stamp fallen across a column's middle slot, drawn as type. */
export function Stamp({ label, column }: { label: string; column: number }) {
  return (
    <p data-cashflow="stamp" style={placeOn(column)} className={styles.stamp}>
      <span className="block -rotate-45 rounded-lg border-4 border-destructive bg-card/70 px-3 py-1 text-subheading font-semibold tracking-wide @min-[38rem]:px-6 @min-[38rem]:tracking-widest whitespace-nowrap text-destructive uppercase shadow-md">
        {label}
      </span>
    </p>
  );
}

const PILL =
  'rounded-full bg-primary py-1 text-caption font-medium whitespace-nowrap text-primary-foreground shadow-md';

/** The arrow's label, a `primary` pill under its shaft. */
function ArrowLabel({ label }: { label: string }) {
  return <span className={cn(styles.arrowLabel, PILL, 'px-3')}>{label}</span>;
}

/**
 * A shaft label's `primary` pill. With `points`, it carries a head toward the arrow's end, which a narrow board shows
 * where it cannot draw the shaft.
 */
function ArrowPill({ label, points }: { label: string; points?: 'up' | 'down' }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2.5', PILL)}>
      {points ? (
        <svg viewBox="0 0 24 24" className={cn(styles.pointer, 'size-4 fill-current')} aria-hidden="true">
          <path d={points === 'up' ? 'M12 2 L22 22 L2 22 Z' : 'M12 22 L22 2 L2 2 Z'} />
        </svg>
      ) : null}
      {label}
    </span>
  );
}

/** Where the arrow sits: its first column, its span in either layout, its slot row, and whether it is drawn narrow. */
function arrowPlacement([fromColumn, slot]: BoardArrow['from'], [toColumn]: BoardArrow['to']) {
  const a = lanePlacement(fromColumn);
  const b = lanePlacement(toColumn);
  const style = placeOn(Math.min(fromColumn, toColumn), {
    '--span': Math.abs(fromColumn - toColumn) + 1,
    '--narrow-span': Math.abs(a.narrowColumn - b.narrowColumn) + 1,
    '--slot': slot - 1,
  });
  return { style, 'data-narrow': a.narrowRow === b.narrowRow ? 'true' : 'false' };
}

/** Which way a narrow board's rows of lanes lie from the arrow's start to its end, when they differ. */
function rowsBetween(from: BoardArrow['from'], to: BoardArrow['to']) {
  const start = lanePlacement(from[0]).narrowRow;
  const end = lanePlacement(to[0]).narrowRow;
  if (start === end) return undefined;
  return end < start ? 'up' : 'down';
}

/**
 * A shaft's label standing on its own: on the shaft in the gap after column `gap` where the board is wide enough,
 * else in the slot under `from`, with a head toward `to`'s row on a narrow board that cannot draw the shaft.
 */
function ShaftLabel({
  label,
  from,
  to,
  gap,
}: {
  label: string;
  from: BoardArrow['from'];
  to: BoardArrow['to'];
  gap: number;
}) {
  const [column, slot] = from;
  const points = rowsBetween(from, to);
  return (
    <p
      data-cashflow="arrow-label"
      data-variant="shaft"
      data-gap={gap}
      data-points={points}
      style={placeOn(column, { '--slot': slot, '--gap-wc': gap })}
      className={styles.shaftLabel}
    >
      <ArrowPill label={label} points={points} />
    </p>
  );
}

/**
 * A `primary` arrow along one slot row from the centre of one column to another's, under the notes it crosses, its
 * label on a pill below the shaft or, with `labelGap`, standing on its own. A narrow board draws the shaft only when
 * both ends share a row of lanes.
 */
function ShaftArrow({ from, to, label, labelGap, stop }: BoardArrow) {
  const leftward = to[0] < from[0];
  return (
    <>
      <div
        data-cashflow="arrow"
        data-variant="shaft"
        data-direction={leftward ? 'left' : 'right'}
        data-stop={stop}
        {...arrowPlacement(from, to)}
        className={styles.arrow}
      >
        <svg viewBox="0 0 24 24" className="size-8 flex-none fill-primary" aria-hidden="true">
          <path d={leftward ? 'M2 12 L22 2 L22 22 Z' : 'M22 12 L2 2 L2 22 Z'} />
        </svg>
        <span className="h-2 flex-1 rounded-full bg-primary" aria-hidden="true" />
        {label && labelGap === undefined ? <ArrowLabel label={label} /> : null}
      </div>
      {label && labelGap !== undefined ? <ShaftLabel label={label} from={from} to={to} gap={labelGap} /> : null}
    </>
  );
}

/** The arc and its filled head, drawn leftwards; the stroke's path length is 1 for a `stroke-dashoffset` draw. */
function Arc() {
  return (
    <svg viewBox="0 0 120 60" className={styles.curveSvg} aria-hidden="true">
      <path
        data-arrow="stroke"
        d="M116 46 C 92 6, 44 6, 12 36"
        pathLength={1}
        className="fill-none stroke-primary"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <path data-arrow="head" d="M3 45 L20 42 L8 28 Z" className="fill-primary" />
    </svg>
  );
}

/** The curved arrow's label: a tilted `primary` pill in the slot under the arrow's start. */
function CurveLabel({ label, from: [column, slot] }: { label: string; from: BoardArrow['from'] }) {
  const pill =
    'inline-block -rotate-2 rounded-full bg-primary px-4 py-1.5 text-body font-semibold text-balance text-primary-foreground shadow-md';
  return (
    <p data-cashflow="arrow-label" style={placeOn(column, { '--slot': slot })} className={styles.curveLabel}>
      <span className={pill}>{label}</span>
    </p>
  );
}

/**
 * A thick `primary` arc over the notes, across the gap beside the `from` cell toward `to`, its head filled; mirrored
 * for a rightward arrow. Its label is a pill in the slot under `from`. A narrow board draws the arc only when both
 * ends share a row of lanes.
 */
function CurveArrow({ from, to, label }: BoardArrow) {
  const [column, slot] = from;
  return (
    <>
      <div
        data-cashflow="arrow"
        data-variant="curve"
        data-direction={to[0] < column ? 'left' : 'right'}
        data-narrow={arrowPlacement(from, to)['data-narrow']}
        style={placeOn(column, { '--slot': slot - 1 })}
        className={styles.curve}
      >
        <Arc />
      </div>
      {label ? <CurveLabel label={label} from={from} /> : null}
    </>
  );
}

/** The board's arrow, as a straight shaft or, with `variant: 'curve'`, an arc. */
export function Arrow(props: BoardArrow) {
  return props.variant === 'curve' ? <CurveArrow {...props} /> : <ShaftArrow {...props} />;
}

/** A `primary` call-out pointing up at its column. */
function Callout({ text }: { text: ReactNode }) {
  return (
    <>
      <svg viewBox="0 0 24 12" className="h-3 w-6 fill-primary" aria-hidden="true">
        <path d="M12 0 L24 12 L0 12 Z" />
      </svg>
      <p className="rounded-lg bg-primary px-3 py-1.5 text-center text-caption font-medium text-primary-foreground shadow-md">
        {text}
      </p>
    </>
  );
}

/** A bracket under the columns it spans, its text centred below. */
function Bracket({ text }: { text: ReactNode }) {
  return (
    <>
      <svg viewBox="0 0 400 40" className="h-10 w-full" preserveAspectRatio="none" aria-hidden="true">
        <path
          d="M4 4 V18 H196 L200 34 L204 18 H396 V4"
          className="stroke-foreground"
          strokeWidth="2"
          fill="none"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <p className="mt-2 text-center text-body font-semibold text-balance text-foreground">{text}</p>
    </>
  );
}

/** One call-out or bracket in the row under the lanes. */
export function Annotation({ column, span = 1, kind, text }: CashflowAnnotation) {
  return (
    <div
      data-cashflow="annotation"
      data-kind={kind}
      style={placeOn(column, { '--span': span })}
      className={cn(styles.annotation, 'flex flex-col', kind === 'callout' && 'items-center')}
    >
      {kind === 'callout' ? <Callout text={text} /> : <Bracket text={text} />}
    </div>
  );
}
