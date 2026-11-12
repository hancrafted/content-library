import { fillTemplate } from '@/shared/lib/template.pure';
import { memo } from 'react';
import { ReleaseCells, shelfGrid } from './customer-card-view';
import type { Snapshot } from './factory-model.pure.ts';
import type { DockWords } from './software-ecology-words.types';
import styles from './software-ecology.module.css';
import { relativeOf, verdictOf } from './stage-readouts.pure.ts';

const relText = (k: number, w: DockWords): string => {
  const r = relativeOf(k);
  return r.kind === 'times' ? fillTemplate(w.times, { k: r.k.toFixed(1) }) : w[r.kind];
};

function Grid({ r, w }: { r: Snapshot['customer']; w: DockWords }) {
  const good = r.releases.filter((s) => s?.good).length,
    complaints = r.releases.filter((s) => s?.complaint).length;
  return (
    <div
      className={styles.dockGrid}
      style={shelfGrid}
      role="img"
      aria-label={fillTemplate(w.grid, { good, complaints })}
    >
      <ReleaseCells releases={r.releases} />
    </div>
  );
}

function Satisfaction({ sat, w }: { sat: number; w: DockWords }) {
  const pct = Math.round(sat * 100);
  return (
    <div className={styles.dockSat}>
      <p className={`${styles.dockSatHead} font-semibold`}>
        <span>{w.satisfaction}</span>
        <b className="font-semibold">{pct} %</b>
      </p>
      <div className={styles.satbar}>
        <i style={{ width: `${pct}%` }} />
      </div>
      <p className="text-caption">{w.satNote}</p>
    </div>
  );
}

/** At the Customer, below the stage (design-ADR 0024 §14): the last twenty releases, output against Ideal, satisfaction and the verdict. */
export const DockView = memo(function DockView({
  r,
  words: w,
}: {
  readonly r: Snapshot['customer'];
  readonly words: DockWords;
}) {
  const compl = Math.round(r.bugs);
  return (
    <aside className={styles.dock} aria-label={w.label}>
      <p className={`${styles.eyebrow} text-caption`}>{w.eyebrow}</p>
      <div className={styles.dockRow}>
        <Grid r={r} w={w} />
        <div className={styles.dockOut}>
          <p className={`${styles.dockK} text-heading font-semibold`}>{`${r.output.toFixed(1)}×`}</p>
          <p className="font-semibold">{w.output}</p>
          <p className={`${styles.dockSub} text-caption`}>
            {fillTemplate(w.sub, { relative: relText(r.output, w), n: Math.round(r.rate) })}
          </p>
        </div>
      </div>
      <Satisfaction sat={r.sat} w={w} />
      <p className="font-semibold">{w.verdicts[verdictOf(r.output, r.sat)]}</p>
      <p className="text-caption">
        {w.note}
        {compl ? ` ${fillTemplate(w.complaints, { n: compl })}` : ''}
      </p>
    </aside>
  );
});
