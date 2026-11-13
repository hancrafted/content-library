import { memo } from 'react';
import type { LabelPlace } from './factory-labels.pure.ts';
import { BELT_W, offsetD, RET, RETURN_W, type BeltLayout, type FactoryLayout } from './factory-layout.pure.ts';
import styles from './software-ecology.module.css';

/*
 * The belts as SVG (design-ADR 0024 §14): rails, surface and slats, the junction plates, and each rework lane, shown
 * only while work is sent back on it. A belt marked `over` crosses the others on a bridge, drawn on top. Ported from
 * the reference build's `beltSvg` and `renderFactory`.
 */

const SW = BELT_W - 4;

function Lanes({ belts, retOn }: { belts: readonly BeltLayout[]; retOn: Readonly<Record<string, boolean>> }) {
  return (
    <g>
      {belts.map((b) => {
        const d = offsetD(b.path, RET);
        return (
          <g key={b.key} className={styles.ret} data-on={!!retOn[b.key]}>
            <path d={d} className={styles.beltRail} strokeWidth={RETURN_W} />
            <path d={d} className={styles.beltSurface} strokeWidth="10" />
            <path d={d} className={styles.beltSlats} strokeWidth="8" data-back="true" />
          </g>
        );
      })}
    </g>
  );
}

function Belts({ belts, retOn }: { belts: readonly BeltLayout[]; retOn: Readonly<Record<string, boolean>> }) {
  return (
    <>
      <Lanes belts={belts.filter((b) => b.returns)} retOn={retOn} />
      {belts.map((b) => (
        <path key={`r${b.key}`} d={b.path.d} className={styles.beltRail} strokeWidth={BELT_W + 2} />
      ))}
      {belts.map((b) => (
        <path key={`s${b.key}`} d={b.path.d} className={styles.beltSurface} strokeWidth={SW} />
      ))}
      {belts.map((b) => (
        <path key={`l${b.key}`} d={b.path.d} className={styles.beltSlats} strokeWidth={SW - 2} />
      ))}
    </>
  );
}

const viewBox = (l: FactoryLayout) => `0 ${l.top} ${l.width} ${l.height}`;

/** The belts under the cards. */
export const BeltsView = memo(function BeltsView({
  layout,
  retOn,
}: {
  layout: FactoryLayout;
  retOn: Readonly<Record<string, boolean>>;
}) {
  const all = layout.order.map((k) => layout.belts[k] as BeltLayout);
  return (
    <svg viewBox={viewBox(layout)} aria-hidden="true">
      <Belts belts={all.filter((b) => !b.over)} retOn={retOn} />
      {layout.plates.map(([x, y]) => (
        <rect key={`${x},${y}`} x={x - 14} y={y - 14} width="28" height="28" rx="3" className={styles.plate} />
      ))}
      <Belts belts={all.filter((b) => b.over)} retOn={retOn} />
    </svg>
  );
});

export interface BeltLabel {
  readonly key: string;
  readonly at: LabelPlace;
  readonly label: string;
  /** "· 12 a week · ↩ 3 changes requested", filled. */
  readonly rate: string;
}

/** Each belt's hover label over the canvas: the belt's name and its rates, shown while the pointer is on the belt. */
export function BeltLabelsView({ layout, labels }: { layout: FactoryLayout; labels: readonly BeltLabel[] }) {
  return (
    <svg viewBox={viewBox(layout)} className={styles.overlay} aria-hidden="true">
      {labels.map((l) => {
        const b = layout.belts[l.key] as BeltLayout,
          w = (l.label.length + l.rate.length) * 6.4 + 20,
          { x, y, anchor } = l.at,
          bx = anchor === 'middle' ? x - w / 2 : anchor === 'end' ? x - w + 10 : x - 10;
        return (
          <g key={l.key}>
            <path d={b.path.d} className={styles.edgeHit} />
            <g className={styles.elabel}>
              <rect className={styles.elabelBg} rx="11" height="22" x={bx} y={y - 11} width={w} />
              <text className={`${styles.elabelTx} text-caption`} x={x} y={y + 4} textAnchor={anchor}>
                {l.label} <tspan className={styles.elabelRate}>{l.rate}</tspan>
              </text>
            </g>
          </g>
        );
      })}
    </svg>
  );
}
