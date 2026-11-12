import { fillTemplate } from '@/shared/lib/template.pure';
import { useId } from 'react';
import { dialRowsOf, num, type DialKey, type DialRow } from './dash-rows.pure.ts';
import { DashFlows, DashHighlights, DashTrends } from './dash-sections-view';
import { posToEff, type DashboardReadout, type Signal } from './dashboard-readouts.pure.ts';
import { Glyph } from './factory-glyph-view';
import type { DashWords } from './software-ecology-words.types';
import styles from './software-ecology.module.css';
import type { RoleWords } from './software-ecology.types';

/*
 * A work center's dashboard (design-ADR 0024 §17): a monitor with its traffic light, signals and three trends; only
 * the AI switch sits on it, the dials fold away in Settings, the queueing measures in "How it flows", and the role's
 * artefacts, tasks and what AI does there close it. `WorkCenterCard`'s `dashboard` view; the popover and the compare
 * stream's columns show it. Every change goes up through a callback.
 */

export interface WorkCenterDashboardProps {
  readonly title: string;
  readonly icon: string;
  readonly role: RoleWords;
  readonly r: DashboardReadout;
  readonly help: boolean;
  readonly words: DashWords;
  /** The title's id, which names the dialog. */
  readonly titleId?: string;
  readonly onDial: (k: DialKey, v: number) => void;
  readonly onAi: (on: boolean) => void;
  readonly onHelp: () => void;
  /** A close button, in the popover. */
  readonly onClose?: () => void;
}

const signalText = (s: Signal, w: DashWords) => fillTemplate(w.signals[s.kind], { n: s.n.toFixed(1) });

const SIGN_ICON = { green: 'ok', red: 'complaint', amber: 'dot' } as const;

function Head(p: WorkCenterDashboardProps) {
  const w = p.words;
  const status = fillTemplate(w.status, {
    level: w.levels[p.r.light],
    signals: p.r.signals.map((s) => signalText(s, w)).join('; '),
  });
  return (
    <header className={styles.dashHead}>
      <Glyph name={p.icon} className={styles.glyMd} />
      <div className={styles.dashT}>
        <h3 id={p.titleId} className="m-0 text-body font-semibold">
          {p.title}
        </h3>
        <p className={`${styles.dashJob} m-0 text-caption text-muted-foreground`}>{p.role.job}</p>
      </div>
      <span className={styles.light} data-level={p.r.light} role="img" aria-label={status} data-tip={w.lightTip}>
        <i data-l="red" />
        <i data-l="amber" />
        <i data-l="green" />
      </span>
      <AiSwitch {...p} />
      <HeadButtons {...p} />
    </header>
  );
}

function AiSwitch(p: WorkCenterDashboardProps) {
  const d = p.r.dials;
  if (!d.en.includes('ai')) return null;
  return (
    <button
      type="button"
      role="switch"
      className={`${styles.switch} text-caption font-semibold`}
      aria-checked={d.ai}
      data-tip={p.words.aiTip}
      onClick={() => p.onAi(!d.ai)}
    >
      <span className={styles.switchTrack} aria-hidden="true" />
      <span>{p.words.ai}</span>
    </button>
  );
}

function HeadButtons(p: WorkCenterDashboardProps) {
  const w = p.words;
  return (
    <>
      <button
        type="button"
        className={styles.iconBtn}
        aria-pressed={p.help}
        aria-label={w.help}
        data-tip={w.help}
        onClick={p.onHelp}
      >
        <Glyph name="help" className={styles.ico} />
      </button>
      {p.onClose ? (
        <button type="button" className={styles.iconBtn} aria-label={w.close} data-tip={w.closeTip} onClick={p.onClose}>
          <Glyph name="close" className={styles.ico} />
        </button>
      ) : null}
    </>
  );
}

function Signals({ r, words: w }: Pick<WorkCenterDashboardProps, 'r' | 'words'>) {
  return (
    <ul className={styles.sigs} aria-live="polite">
      {r.signals.map((s) => (
        <li key={s.kind} className={`${styles.sig} text-caption`} data-level={s.level}>
          <Glyph name={SIGN_ICON[s.level]} className={styles.ico} />
          <span>{signalText(s, w)}</span>
        </li>
      ))}
    </ul>
  );
}

function Drain({ r, words: w }: Pick<WorkCenterDashboardProps, 'r' | 'words'>) {
  const dr = r.drain;
  if (!dr) return null;
  const text =
    dr.kind === 'grow'
      ? fillTemplate(w.grows, { n: num(dr.n) })
      : dr.weeks < 1.5
        ? w.clearsWeek
        : fillTemplate(w.clearsWeeks, { n: Math.round(dr.weeks) });
  return <p className={`${styles.drain} text-caption text-muted-foreground`}>{text}</p>;
}

function Row({ row, p, id }: { row: DialRow; p: WorkCenterDashboardProps; id: string }) {
  const w = p.words.rows[row.key];
  return (
    <div className={`${styles.step} text-caption`} data-ai={row.ai}>
      <label className={styles.stepL} htmlFor={`${id}-${row.key}`} data-tip={w.help}>
        {w.label} {w.sub ? <span className="text-muted-foreground">{w.sub}</span> : null}
      </label>
      <input
        type="range"
        className={styles.range}
        id={`${id}-${row.key}`}
        min={row.min}
        max={row.max}
        step={row.step}
        value={row.pos}
        aria-valuetext={row.text}
        onChange={(e) =>
          p.onDial(row.key, row.key === 'eff' ? posToEff(Number(e.target.value)) : Number(e.target.value))
        }
      />
      <output className={`${styles.stepV} font-semibold`}>{row.text}</output>
      <p className={styles.help}>{w.help}</p>
    </div>
  );
}

function Settings(p: WorkCenterDashboardProps) {
  const id = useId(),
    rows = dialRowsOf(p.r.dials, p.words.withAi),
    by = (k: DialKey) => rows.find((r) => r.key === k)?.text;
  const sum = [by('eff'), by('effv'), by('fan')].filter(Boolean).join(' · ');
  return (
    <details className={styles.settings}>
      <summary className="text-caption font-medium">
        <Glyph name="model" className={styles.ico} />
        <span>{p.words.settings}</span>
        <span className={`${styles.settingsSum} text-muted-foreground`}>{sum}</span>
      </summary>
      <div className={styles.steps}>
        {rows
          .filter((r) => !r.ai || p.r.dials.ai)
          .map((r) => (
            <Row key={r.key} row={r} p={p} id={id} />
          ))}
      </div>
    </details>
  );
}

export function WorkCenterDashboard(p: WorkCenterDashboardProps) {
  return (
    <div className={styles.dash} data-help={p.help}>
      <Head {...p} />
      <Signals r={p.r} words={p.words} />
      <Drain r={p.r} words={p.words} />
      <DashTrends r={p.r} words={p.words} />
      <Settings {...p} />
      <DashFlows r={p.r} words={p.words} />
      <DashHighlights role={p.role} words={p.words} />
    </div>
  );
}
