import { fillTemplate } from '@/shared/lib/template.pure';
import { Fragment, memo, type ReactNode } from 'react';
import { DocGlyph } from './doc-glyph-view';
import { DockView } from './dock-view';
import { WARM_WEEKS } from './factory-dials.pure.ts';
import type { Snapshot } from './run-snapshot.pure.ts';
import type { LegendWords, StatusWords, Words } from './software-ecology-words.types';
import styles from './software-ecology.module.css';
import type { Status } from './stage-readouts.pure.ts';

const num = (x: number): string => (x >= 10 ? Math.round(x).toString() : x.toFixed(1));

type Busy = Extract<Status, { kind: 'busy' }>;

const drainText = (s: Busy, w: StatusWords): string => {
  const d = s.drain;
  if (!d) return '';
  if (d.grow > 0.05) return fillTemplate(w.growing, { n: num(d.grow) });
  return d.weeks < 1.5 ? w.clearsWeek : fillTemplate(w.clearsWeeks, { n: Math.round(d.weeks) });
};

const hotParts = (s: Busy, x: { w: StatusWords; titles: Readonly<Record<string, string>> }): ReactNode[] => {
  const [n, ...rest] = s.hot;
  if (!n) return [x.w.coping];
  const head = (
    <>
      <b className="font-semibold">{n.red ? x.w.bottleneck : x.w.busiest}:</b>{' '}
      {fillTemplate(x.w.waiting, { title: x.titles[n.id] ?? n.id, weeks: n.weeks.toFixed(1) })}
    </>
  );
  const also = rest.length
    ? [
        fillTemplate(x.w.also, {
          titles: rest
            .slice(0, 2)
            .map((h) => x.titles[h.id] ?? h.id)
            .join(', '),
        }),
      ]
    : [];
  return [head, drainText(s, x.w), ...also];
};

const busyParts = (s: Busy, x: { w: StatusWords; titles: Readonly<Record<string, string>> }): ReactNode[] => [
  ...hotParts(s, x),
  ...(s.back
    ? [
        <>
          <b className="font-semibold">{s.back}</b> {x.w.sentBack}
        </>,
      ]
    : []),
  ...(s.behind ? [<span className="text-muted-foreground">{x.w.behind}</span>] : []),
];

/** The status line under the stage: the bottleneck and how it drains, or that all is calm. */
export const StatusLineView = memo(function StatusLineView(p: {
  status: Status;
  words: StatusWords;
  titles: Readonly<Record<string, string>>;
}) {
  const s = p.status;
  const body =
    s.kind === 'warming'
      ? fillTemplate(p.words.warming, { weeks: WARM_WEEKS })
      : s.kind === 'calm'
        ? p.words.calm
        : busyParts(s, { w: p.words, titles: p.titles }).map((part, i) => (
            <Fragment key={i}>
              {i ? ' · ' : null}
              {part}
            </Fragment>
          ));
  return (
    <p className={`${styles.statusLine} text-body`} data-calm={s.kind === 'calm'} aria-live="polite">
      {body}
    </p>
  );
});

/** The legend: the four documents, the pile-up, merged riders and the handoff time. */
export function LegendView({ words: w }: { readonly words: LegendWords }) {
  return (
    <div className={`${styles.legend} text-caption`} aria-label={w.label}>
      <span className={styles.legendItem}>
        <DocGlyph good />
        {w.good}
      </span>
      <span className={styles.legendItem}>
        <DocGlyph good={false} />
        {w.bad}
      </span>
      <span className={styles.legendItem}>
        <DocGlyph good={false} warn />
        {w.warn}
      </span>
      <span className={styles.legendItem}>
        <DocGlyph good ai />
        {w.ai}
      </span>
      <span>{w.pile}</span>
      <span>{w.merged}</span>
      <span>{w.handoff}</span>
    </div>
  );
}

/** Under the stage: the status line and the legend, then the At the Customer panel. */
export function BelowView(p: {
  readonly snap: Snapshot;
  readonly words: Words;
  readonly titles: Readonly<Record<string, string>>;
}) {
  return (
    <>
      <div className={styles.foot}>
        <StatusLineView status={p.snap.status} words={p.words.stage.status} titles={p.titles} />
        <LegendView words={p.words.stage.legend} />
      </div>
      <div className={styles.below}>
        <DockView r={p.snap.customer} words={p.words.dock} />
      </div>
    </>
  );
}
