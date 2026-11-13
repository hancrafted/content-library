'use client';

import { fillTemplate } from '@/shared/lib/template.pure';
import { useId } from 'react';
import type { CustomerDashboard as Readout } from './dashboard-readouts.pure.ts';
import { Glyph } from './factory-glyph-view';
import type { CustomerChange } from './factory-settings.pure.ts';
import type { CustDashWords, DashWords } from './software-ecology-words.types';
import styles from './software-ecology.module.css';
import type { Defect } from './software-ecology.types';

/*
 * The Customer's dashboard (design-ADR 0024 §2): how many requests a week, steady or random, where they go, and the
 * chance a good release, or a bad one by its defect kind, brings a new request at once. Every change goes up through
 * `onChange`.
 */

export interface CustomerDashboardProps {
  readonly title: string;
  readonly job: string;
  readonly r: Readout;
  readonly titles: Readonly<Record<string, string>>;
  readonly words: CustDashWords;
  readonly rateTip: string;
  readonly close: Pick<DashWords, 'close' | 'closeTip'>;
  readonly titleId?: string;
  readonly onChange: (x: CustomerChange) => void;
  readonly onClose?: () => void;
}

/** A row's list: the mix, a good release's follow-ups, or a bad release's of one defect kind. */
type Kind = 'mix' | 'good' | Defect;

/** Per row kind: the chances it shows, the change a slider sends up and the slider's eval hook. */
interface RowKind {
  readonly list: (c: Readout['cust']) => Readonly<Record<string, number>>;
  readonly change: (to: string, v: number) => CustomerChange;
  readonly control: (to: string) => string;
}
const listRow = (kind: 'mix' | 'good'): RowKind => ({
  list: (c) => c[kind],
  change: (to, v) => ({ kind, to, v }),
  control: (to) => `customer.${kind}.${to}`,
});
const badRow = (defect: Defect): RowKind => ({
  list: (c) => c.bad[defect],
  change: (to, v) => ({ kind: 'bad', defect, to, v }),
  control: (to) => `customer.bad.${defect}.${to}`,
});
const ROWS: Readonly<Record<Kind, RowKind>> = {
  mix: listRow('mix'),
  good: listRow('good'),
  spec: badRow('spec'),
  code: badRow('code'),
};

interface ChanceRow {
  readonly label: string;
  readonly shown: string;
  readonly max: number;
  readonly step: number;
}

/** A mix weight shows its share; a follow-up its chance, capped so the chances never pass 95 %. */
const chanceRow = (p: CustomerDashboardProps, kind: Kind, to: string): ChanceRow => {
  const c = p.r.cust,
    v = ROWS[kind].list(c)[to] ?? 0,
    title = p.titles[to] ?? to;
  if (kind === 'mix') {
    const mw = Object.values(c.mix).reduce((a, b) => a + b, 0) || 1;
    return { label: title, shown: `${Math.round((v / mw) * 100)} %`, max: 100, step: 5 };
  }
  return { label: fillTemplate(p.words[kind], { title }), shown: `${Math.round(v * 100)} %`, max: 0.9, step: 0.05 };
};

function Chance(p: CustomerDashboardProps & { kind: Kind; to: string }) {
  const row = chanceRow(p, p.kind, p.to);
  return (
    <label className={styles.mrow}>
      <span className={styles.tipL}>
        {row.label}{' '}
        {p.kind === 'spec' || p.kind === 'code' ? (
          <span className="text-muted-foreground">{p.words.complaint}</span>
        ) : null}
      </span>
      <input
        type="range"
        className={styles.range}
        data-control={ROWS[p.kind].control(p.to)}
        min={0}
        max={row.max}
        step={row.step}
        value={ROWS[p.kind].list(p.r.cust)[p.to] ?? 0}
        onChange={(e) => p.onChange(ROWS[p.kind].change(p.to, Number(e.target.value)))}
      />
      <b className="font-semibold">{row.shown}</b>
    </label>
  );
}

function Rate(p: CustomerDashboardProps) {
  const id = useId();
  return (
    <div className={`${styles.step} text-caption`}>
      <label className={styles.stepL} htmlFor={id} data-tip={p.rateTip}>
        {p.words.requests}
      </label>
      <input
        type="range"
        className={styles.range}
        data-control="customer.rate"
        id={id}
        min={0}
        max={p.r.max}
        step={0.5}
        value={p.r.cust.rate}
        onChange={(e) => p.onChange({ kind: 'rate', v: Number(e.target.value) })}
      />
      <output className={`${styles.stepV} font-semibold`}>{p.r.cust.rate}</output>
    </div>
  );
}

function Mode(p: CustomerDashboardProps) {
  const id = useId(),
    w = p.words;
  return (
    <div className={`${styles.mrow} text-caption`}>
      <span className="text-muted-foreground" id={id} data-tip={w.modeTip}>
        {w.arrivals}
      </span>
      <div className={styles.seg} role="group" aria-labelledby={id}>
        {(['steady', 'random'] as const).map((m) => (
          <button
            key={m}
            type="button"
            className="text-caption"
            data-control={`customer.arrivals.${m}`}
            aria-pressed={p.r.cust.mode === m}
            onClick={() => p.onChange({ kind: 'mode', v: m })}
          >
            {w[m]}
          </button>
        ))}
      </div>
    </div>
  );
}

function Note({ r, words: w }: Pick<CustomerDashboardProps, 'r' | 'words'>) {
  const rate =
    r.cust.rate === r.base ? w.sizedFor : fillTemplate(w.times, { k: (r.cust.rate / (r.base || 1)).toFixed(1) });
  const gain = fillTemplate(w.gain, { g: r.gain.toFixed(2), off: r.complaints ? '' : w.off });
  return <p className="m-0 text-caption text-muted-foreground">{`${rate} ${gain}`}</p>;
}

function Head(p: CustomerDashboardProps) {
  return (
    <header className={styles.dashHead}>
      <Glyph name="customer" className={styles.glyMd} />
      <div className={styles.dashT}>
        <h3 id={p.titleId} className="m-0 text-body font-semibold">
          {p.title}
        </h3>
        <p className="m-0 text-caption text-muted-foreground">{p.job}</p>
      </div>
      {p.onClose ? (
        <button
          type="button"
          className={styles.iconBtn}
          aria-label={p.close.close}
          data-control="customer.close"
          data-tip={p.close.closeTip}
          onClick={p.onClose}
        >
          <Glyph name="close" className={styles.ico} />
        </button>
      ) : null}
    </header>
  );
}

export function CustomerDashboard(p: CustomerDashboardProps) {
  const w = p.words;
  return (
    <div className={styles.dash} data-kind="customer">
      <Head {...p} />
      <Rate {...p} />
      <Mode {...p} />
      <fieldset className={`${styles.mfs} text-caption`}>
        <legend data-tip={w.mixTip}>{w.mix}</legend>
        {p.r.mix.map((to) => (
          <Chance key={to} {...p} kind="mix" to={to} />
        ))}
      </fieldset>
      <fieldset className={`${styles.mfs} text-caption`}>
        <legend data-tip={w.followTip}>{w.follow}</legend>
        {p.r.good.map((to) => (
          <Chance key={`g${to}`} {...p} kind="good" to={to} />
        ))}
        {p.r.bad.map((b) => (
          <Chance key={`${b.defect}${b.to}`} {...p} kind={b.defect} to={b.to} />
        ))}
      </fieldset>
      <Note r={p.r} words={w} />
    </div>
  );
}
