import type { TargetProps } from '@/lib/context-link.pure';
import { PenLine } from 'lucide-react';
import styles from './polished-plan.module.css';

/** One row of the plan: its slug, its label and its value. */
export interface PlanRow {
  slug: string;
  label: string;
  value: string;
}

/** The pen hovering past the card's edge; only its position points at the row. */
function Pen(props: TargetProps) {
  return (
    <span {...props} className={`${styles.pen} text-muted-foreground`}>
      <PenLine aria-hidden="true" className="size-full" />
    </span>
  );
}

/** One label and value. The off row looks exactly like the others; it only carries a target and the pen. */
function Row({ row, off }: { row: PlanRow; off?: { line: TargetProps; pen: TargetProps } }) {
  return (
    <div {...off?.line} className={styles.row}>
      <dt className="text-caption text-muted-foreground">{row.label}</dt>
      <dd className="text-body text-foreground">{row.value}</dd>
      {off && <Pen {...off.pen} />}
    </div>
  );
}

interface PolishedPlanProps {
  heading: string;
  rows: readonly PlanRow[];
  /** The slug of the row that is off. */
  offRow: string;
  offTarget: TargetProps;
  penTarget: TargetProps;
  'data-target'?: string;
}

/*
 * A server part of this Slide: the finished plan, polished and sure of itself,
 * with one row quietly off and a pen hovering at that row's height. The off row
 * carries no colour, strike or icon: it says it in the same calm voice. It
 * takes plain props, never the kit; the Slide passes the `data-target`s its
 * notes name.
 */
export function PolishedPlan({ heading, rows, offRow, offTarget, penTarget, ...props }: PolishedPlanProps) {
  const off = { line: offTarget, pen: penTarget };
  return (
    <div
      {...props}
      className={`${styles.card} mt-12 w-full max-w-2xl border border-border bg-card p-6 text-card-foreground`}
    >
      <p className="text-caption text-muted-foreground">{heading}</p>
      <dl className={`${styles.rows} mt-4`}>
        {rows.map((row) => (
          <Row key={row.slug} row={row} off={row.slug === offRow ? off : undefined} />
        ))}
      </dl>
    </div>
  );
}
