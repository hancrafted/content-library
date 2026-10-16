import { cn } from '@/lib/utils';
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

/** The arrow's label, a `primary` pill under its shaft. */
function ArrowLabel({ label }: { label: string }) {
  const pill =
    'rounded-full bg-primary px-3 py-1 text-caption font-medium whitespace-nowrap text-primary-foreground shadow-md';
  return <span className={cn(styles.arrowLabel, pill)}>{label}</span>;
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

/**
 * A `primary` arrow along one slot row from the centre of one column to another's, under the notes it crosses, its
 * label on a pill below the shaft. A narrow board draws it only when both ends share a row of lanes.
 */
export function Arrow({ from, to, label }: BoardArrow) {
  const leftward = to[0] < from[0];
  return (
    <div
      data-cashflow="arrow"
      data-direction={leftward ? 'left' : 'right'}
      {...arrowPlacement(from, to)}
      className={styles.arrow}
    >
      <svg viewBox="0 0 24 24" className="size-8 flex-none fill-primary" aria-hidden="true">
        <path d={leftward ? 'M2 12 L22 2 L22 22 Z' : 'M22 12 L2 2 L2 22 Z'} />
      </svg>
      <span className="h-2 flex-1 rounded-full bg-primary" aria-hidden="true" />
      {label ? <ArrowLabel label={label} /> : null}
    </div>
  );
}

/** A `primary` call-out pointing up at its column. */
function Callout({ text }: { text: string }) {
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
function Bracket({ text }: { text: string }) {
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
