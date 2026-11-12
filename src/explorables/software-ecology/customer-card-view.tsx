import type { TargetProps } from '@/shared/lib/context-link.pure';
import { fillTemplate } from '@/shared/lib/template.pure';
import { memo, type CSSProperties } from 'react';
import { Glyph } from './factory-glyph-view';
import type { Snapshot } from './factory-model.pure.ts';
import type { CustomerWords } from './software-ecology-words.types';
import styles from './software-ecology.module.css';
import { SHELF_COLS, SHELF_ROWS, type Release } from './stage-readouts.pure.ts';
import { boxStyle, openerProps, type Box } from './station-card-view';

export interface CustomerCardProps {
  readonly box: Box;
  readonly title: string;
  readonly r: Snapshot['customer'];
  readonly words: CustomerWords;
  readonly target?: TargetProps;
  /** "{title}: open its settings", the card's name as a button. */
  readonly label?: string;
  /** Its dashboard is open. */
  readonly open?: boolean;
  /** A tour caption points at it. */
  readonly toured?: boolean;
}

/** The shelf grid's size as CSS custom properties: `SHELF_ROWS` down, `SHELF_COLS` across. */
export const shelfGrid = {
  '--shelf-cols': SHELF_COLS,
  '--shelf-rows': SHELF_ROWS,
} as CSSProperties;

/** The twenty release cells, newest first: good or bad, a complaint marked. */
export function ReleaseCells({ releases }: { readonly releases: readonly (Release | null)[] }) {
  return releases.map((s, i) => (
    <i key={i} data-q={s ? (s.good ? 'good' : 'bad') : undefined}>
      {s?.complaint ? <Glyph name="complaint" className={styles.ico} /> : null}
    </i>
  ));
}

/** A lead time as the Customer card shows it: one decimal below ten days, whole days above, a dash before any release. */
export const leadTimeText = (d: number | null, words: CustomerWords) =>
  d === null ? '–' : fillTemplate(words.days, { n: d < 10 ? d.toFixed(1) : Math.round(d) });

function Row({ label, tip, value, r }: { label: string; tip: string; value: string; r?: string }) {
  return (
    <p className={styles.sat} data-tip={tip} data-r={r}>
      <span>{label}</span> <b className="font-semibold">{value}</b>
    </p>
  );
}

function Readouts({ r, words: w }: Pick<CustomerCardProps, 'r' | 'words'>) {
  return (
    <>
      <Row label={w.satisfied} tip={w.satTip} value={`${Math.round(r.sat * 100)} %`} r="sat" />
      <Row label={w.leadTime} tip={w.leadTip} value={leadTimeText(r.leadDays, w)} />
      <Row
        label={w.couldServe}
        tip={w.headroomTip}
        value={fillTemplate(w.demand, { n: r.headroom.toFixed(1) })}
        r="head"
      />
      <Row label={w.bugs} tip={w.bugsTip} value={r.bugs < 0.05 ? '0' : r.bugs.toFixed(1)} />
      {r.ownShown ? <Row label={w.own} tip={w.ownTip} value={r.own.toFixed(1)} /> : null}
    </>
  );
}

function Output({ r, words: w }: Pick<CustomerCardProps, 'r' | 'words'>) {
  return (
    <div className={styles.custRow}>
      <div className={styles.grid20} style={shelfGrid} role="img" aria-label={w.lastReleases}>
        <ReleaseCells releases={r.releases} />
      </div>
      <div className={styles.rel} data-tip={w.outputTip}>
        <b className="text-body font-semibold">{`${r.output.toFixed(1)}×`}</b>
        <span>{w.ofIdeal}</span>
      </div>
    </div>
  );
}

function Demand({ r, words: w }: Pick<CustomerCardProps, 'r' | 'words'>) {
  return (
    <p className={styles.dials} data-tip={w.rateTip}>
      <b className="font-semibold">{fillTemplate(w.aWeek, { n: r.requests })}</b>{' '}
      <span>{r.arrivals === 'steady' ? w.steady : w.random}</span>
    </p>
  );
}

function Head({ title }: { readonly title: string }) {
  return (
    <div className={styles.head}>
      <Glyph name="customer" className={styles.gly} />
      <span className={`${styles.title} font-semibold`}>{title}</span>
    </div>
  );
}

/** The Customer on the floor (design-ADR 0024 §14): its last twenty releases, output against Ideal, and its readouts. */
export const CustomerCardView = memo(function CustomerCardView(p: CustomerCardProps) {
  const { r, words: w } = p;
  return (
    <div
      className={`${styles.card} text-caption`}
      data-kind="customer"
      data-id="customer"
      data-control="node.customer"
      {...openerProps(p.label, p.open, p.toured)}
      data-unhappy={r.sat < 0.6}
      data-full={r.headroom < 1}
      data-readout-output={r.output.toFixed(2)}
      data-readout-satisfied={r.sat.toFixed(2)}
      data-readout-lead-days={r.leadDays === null ? undefined : r.leadDays.toFixed(1)}
      style={boxStyle(p.box)}
      {...p.target}
    >
      <Head title={p.title} />
      <div className={`${styles.body} ${styles.bodyCust}`}>
        <Output r={r} words={w} />
        <Readouts r={r} words={w} />
        <Demand r={r} words={w} />
      </div>
    </div>
  );
});
