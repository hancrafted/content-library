import { fillTemplate } from '@/shared/lib/template.pure';
import { num, pct } from './dash-rows.pure.ts';
import type { DashboardReadout, TrendPaths } from './dashboard-readouts.pure.ts';
import { Glyph } from './factory-glyph-view';
import type { DashWords } from './software-ecology-words.types';
import styles from './software-ecology.module.css';
import type { RoleWords } from './software-ecology.types';

/* The dashboard's read-only sections: three trends, "How it flows" and the role's highlights. Props only. */

interface TrendProps {
  readonly k: 'out' | 'good' | 'wait';
  readonly value: string;
  readonly paths: TrendPaths;
  /** Weeks waiting: amber from one week, red from two; the other trends stay plain. */
  readonly level?: number;
  readonly words: DashWords;
}

function Trend({ k, value, paths, level = 0, words }: TrendProps) {
  const w = words.trends[k];
  return (
    <figure className={styles.trend} data-level={level}>
      <figcaption className="text-caption">
        <span className={`${styles.trendT} text-muted-foreground`} data-tip={w.help}>
          {w.title}
        </span>
        <b className="text-body font-semibold">{value}</b>
        <span className="text-muted-foreground">{w.unit}</span>
      </figcaption>
      <svg viewBox="0 0 100 34" preserveAspectRatio="none" aria-hidden="true">
        <path className={styles.trendRef} d={paths.ref} />
        <path className={styles.trendArea} d={paths.area} />
        <path className={styles.trendLine} d={paths.line} />
      </svg>
      <p className={styles.help}>{w.help}</p>
    </figure>
  );
}

export function DashTrends({ r, words }: { readonly r: DashboardReadout; readonly words: DashWords }) {
  return (
    <div className={styles.trends}>
      <Trend k="out" value={num(r.out.now)} paths={r.out.paths} words={words} />
      <Trend k="good" value={r.good.now === null ? '–' : String(r.good.now)} paths={r.good.paths} words={words} />
      <Trend k="wait" value={r.wait.now.toFixed(1)} paths={r.wait.paths} level={r.wait.level} words={words} />
    </div>
  );
}

function Util({ r, words: w }: { readonly r: DashboardReadout; readonly words: DashWords }) {
  const u = r.util,
    rest = Math.max(0, 1 - u.busy - u.blocked - u.starved),
    tt = Math.max(1e-6, u.busy + u.blocked + u.starved + rest);
  const width = (x: number) => ({ width: `${Math.round((x / tt) * 100)}%` });
  const label = fillTemplate(w.util, { busy: pct(u.busy), blocked: pct(u.blocked), starved: pct(u.starved) });
  return (
    <>
      <div className={styles.util} role="img" aria-label={label}>
        <i data-u="busy" style={width(u.busy)} />
        <i data-u="blocked" style={width(u.blocked)} />
        <i data-u="starved" style={width(u.starved)} />
      </div>
      <p className={`${styles.utilLegend} m-0 text-caption text-muted-foreground`}>
        {(['busy', 'blocked', 'starved'] as const).map((k) => (
          <span key={k}>
            <i data-u={k} />
            {w[k]} <b>{pct(u[k])}</b>
          </span>
        ))}
      </p>
    </>
  );
}

function FlowRow({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <li>
      <span>{label}</span>
      <b>{value}</b>
      <span className="text-muted-foreground">{note}</span>
    </li>
  );
}

export function DashFlows({ r, words: w }: { readonly r: DashboardReadout; readonly words: DashWords }) {
  const f = r.flows;
  return (
    <details className={styles.settings}>
      <summary className="text-caption font-medium">
        <Glyph name="fast" className={styles.ico} />
        <span>{w.flows}</span>
        <span className={`${styles.settingsSum} text-muted-foreground`}>{w.flowsSub}</span>
      </summary>
      <div className={styles.flowsBody}>
        <Util r={r} words={w} />
        <ul className={`${styles.flowsList} text-caption`}>
          <FlowRow label={w.throughput} value={num(f.done)} note={w.throughputNote} />
          <FlowRow label={w.arriving} value={num(f.arriving)} note={w.arrivingNote} />
          <FlowRow label={w.capacity} value={num(f.capacity)} note={w.capacityNote} />
          <FlowRow label={w.backlog} value={num(f.backlog)} note={w.backlogNote} />
          <FlowRow
            label={w.lead}
            value={f.lead === null ? '–' : fillTemplate(w.leadWeeks, { n: num(f.lead) })}
            note={f.lead === null ? w.leadPending : w.leadNote}
          />
        </ul>
      </div>
    </details>
  );
}

function List({ items, ai }: { readonly items: readonly string[]; readonly ai?: boolean }) {
  return (
    <ul className={`${styles.hlList} text-caption`} data-ai={ai}>
      {items.map((x) => (
        <li key={x}>{x}</li>
      ))}
    </ul>
  );
}

export function DashHighlights({ role, words: w }: { readonly role: RoleWords; readonly words: DashWords }) {
  return (
    <div className={styles.dashHl}>
      <div className={styles.hl}>
        <p className={`${styles.hlH} m-0 text-caption`}>{w.artefacts}</p>
        <div className={styles.chips}>
          {(role.artefacts ?? []).map((a) => (
            <span key={a} className={`${styles.chip} text-caption`}>
              {a}
            </span>
          ))}
        </div>
      </div>
      <div className={styles.hl}>
        <p className={`${styles.hlH} m-0 text-caption`}>{w.tasks}</p>
        <List items={role.tasks ?? []} />
      </div>
      <div className={styles.hl}>
        <p className={`${styles.hlH} m-0 text-caption`}>{w.withAiHere}</p>
        <List items={role.ai ?? []} ai />
      </div>
    </div>
  );
}
