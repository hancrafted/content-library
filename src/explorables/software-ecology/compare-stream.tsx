import { fillTemplate } from '@/shared/lib/template.pure';
import { useMemo, type CSSProperties, type ReactNode, type RefObject } from 'react';
import { streamOf, type ColumnReadout, type StreamPart } from './compare-stream.pure.ts';
import { num } from './dash-rows.pure.ts';
import { DocGlyph } from './doc-glyph-view';
import { Glyph } from './factory-glyph-view';
import { boxOf, type BeltLayout, type FactoryLayout } from './factory-layout.pure.ts';
import type { Factory, FactoryNode } from './factory.types';
import type { CardWords, CompareWords } from './software-ecology-words.types';
import styles from './software-ecology.module.css';
import { cardsOf, type CardPart } from './stage-parts.pure.ts';
import type { StationReadout } from './stage-readouts.pure.ts';
import { beltWords, type WordsIn } from './use-case-words.pure.ts';

/*
 * The compare stream (design-ADR 0024 §17), as the reference build's `renderCompare` lays it out: a title and Exit
 * compare, an overview strip of the whole line with the compared work centers marked, and the columns in flow order,
 * each its station above its dashboard, a live belt between neighbours and a "+n stations" gap otherwise. The rings,
 * the documents in work and the riders on the belts are drawn every frame by `compare-live.ts`; the rest follows the
 * readouts.
 */

export interface CompareStreamProps {
  readonly m: Factory;
  readonly layout: FactoryLayout;
  readonly ids: readonly string[];
  readonly w: WordsIn;
  readonly words: CompareWords;
  readonly card: CardWords;
  readonly stations: Readonly<Record<string, StationReadout>>;
  readonly columns: Readonly<Record<string, ColumnReadout>>;
  readonly belts: Readonly<Record<string, { readonly rate: number }>>;
  /** A column's dashboard, below its station. */
  readonly dashboard: (id: string) => ReactNode;
  readonly onExit: () => void;
  /** The stream's root, which the frame loop draws into. */
  readonly root: RefObject<HTMLElement | null>;
}

/** Text the SVG strip scales from the caption role to its layout units. */
const STRIP_TEXT = 'scale(1.86)';
const NODE_HEAD = 18;

type StripProps = Pick<CompareStreamProps, 'm' | 'layout' | 'ids' | 'stations' | 'words'> & { titles: Titles };

/** One node of the strip: its box, and its title while it is compared; amber while it backs up two weeks. */
function StripNode({ n, p }: { n: FactoryNode; p: StripProps }) {
  const [x, y, w, h] = boxOf(n.def),
    on = p.ids.includes(n.id);
  return (
    <g className={styles.stripN} data-on={on} data-hot={n.kind === 'role' && p.stations[n.id]?.level === 2}>
      <rect x={x} y={y + NODE_HEAD} width={w} height={h - NODE_HEAD} rx="8" />
      {on ? (
        <text
          className="text-caption font-semibold"
          transform={`translate(${x + w / 2} ${y + 6}) ${STRIP_TEXT}`}
          textAnchor="middle"
        >
          {p.titles[n.id]?.title}
        </text>
      ) : null}
    </g>
  );
}

function Strip(p: StripProps) {
  const { layout: l } = p;
  return (
    <svg viewBox={`0 ${l.top} ${l.width} ${l.height}`} className={styles.strip} role="img" aria-label={p.words.strip}>
      {l.order.map((k) => (
        <path key={k} d={(l.belts[k] as BeltLayout).path.d} className={styles.stripBelt} />
      ))}
      {[...p.m.nodes.values()].map((n) => (
        <StripNode key={n.id} n={n} p={p} />
      ))}
    </svg>
  );
}

type Titles = Readonly<Record<string, CardPart>>;

interface StationProps {
  readonly c: CardPart;
  readonly r?: StationReadout;
  readonly col?: ColumnReadout;
  readonly words: CompareWords;
  readonly card: CardWords;
}

/** The station's head: glyph, title and its damage signs. */
function StationHead(p: StationProps) {
  return (
    <div className={styles.csHead}>
      <Glyph name={p.c.icon} className={styles.glyMd} />
      <span className="text-body font-semibold">{p.c.title}</span>
      <span className={styles.csSigns}>
        {p.c.signs.map((k) => (
          <span
            key={k}
            className={styles.sign}
            data-on={!!p.r?.signs[k]}
            data-tip={p.card.signs[k]}
            aria-label={p.card.signs[k]}
          >
            <Glyph name={k} className={styles.ico} />
          </span>
        ))}
      </span>
    </div>
  );
}

/** The station's line: the front of its backlog as documents, and the box with the ring and the document in work. */
function StationLine({ col }: { col?: ColumnReadout }) {
  return (
    <div className={styles.csLine}>
      <div className={styles.csQueue}>
        {col?.queue.map((d, i) => (
          <DocGlyph key={i} good={d.good} ai={d.ai} warn={d.warn} />
        ))}
        {col && col.more > 0 ? <b className="text-caption">+{col.more}</b> : null}
      </div>
      <div className={styles.csBox}>
        <span className={styles.ring} data-r="ring">
          <i className={styles.dchip} data-r="work" />
        </span>
      </div>
    </div>
  );
}

const noteOf = (col: ColumnReadout | undefined, w: CompareWords): string =>
  col
    ? fillTemplate(w.note, { waiting: col.waiting, weeks: col.weeks.toFixed(1), busy: col.busy, done: num(col.done) })
    : '';

function Station(p: StationProps) {
  return (
    <div className={styles.cs}>
      <StationHead {...p} />
      <StationLine col={p.col} />
      <p className={`${styles.csNote} m-0 text-caption`}>{noteOf(p.col, p.words)}</p>
    </div>
  );
}

function Gap({ part, p }: { part: Exclude<StreamPart, { kind: 'column' }>; p: CompareStreamProps }) {
  const w = p.words;
  if (part.kind === 'belt')
    return (
      <div className={`${styles.gap} ${styles.gapBelt} text-caption`}>
        <span className={styles.gapRate}>{fillTemplate(w.aWeek, { n: Math.round(p.belts[part.key]?.rate ?? 0) })}</span>
        <div className={styles.gbelt} data-gbelt={part.key} />
        <span className={styles.gapL}>{beltWords(p.w, part.key, '').label}</span>
      </div>
    );
  const n = part.skipped;
  return (
    <div className={`${styles.gap} text-caption`} aria-label={fillTemplate(w.gapLabel, { n })}>
      {n ? <span>{n > 1 ? fillTemplate(w.gap, { n }) : w.gapOne}</span> : null}
      <Glyph name="play" className={styles.gapArrow} />
    </div>
  );
}

/** A column: its station above its dashboard. */
function Column({ id, p, cards }: { id: string; p: CompareStreamProps; cards: Titles }) {
  const c = cards[id];
  return (
    <div className={styles.ccol} data-col={id}>
      {c ? <Station c={c} r={p.stations[id]} col={p.columns[id]} words={p.words} card={p.card} /> : null}
      <div className={styles.colDash}>{p.dashboard(id)}</div>
    </div>
  );
}

function Top({ n, p }: { n: number; p: CompareStreamProps }) {
  return (
    <div className={styles.cmpTop}>
      <p className="m-0 text-body font-semibold">{n === 1 ? p.words.titleOne : fillTemplate(p.words.title, { n })}</p>
      <button type="button" className={`${styles.tbtn} ${styles.tbtnSolid} text-caption`} onClick={p.onExit}>
        {p.words.exitStream}
      </button>
    </div>
  );
}

export function CompareStream(p: CompareStreamProps) {
  const parts = useMemo(() => streamOf(p.m, p.ids), [p.m, p.ids]);
  const cards = useMemo(() => Object.fromEntries(cardsOf(p.m, p.w).map((c) => [c.id, c])), [p.m, p.w]);
  const n = parts.filter((x) => x.kind === 'column').length;
  return (
    <section ref={p.root} className={styles.compare} aria-label={p.words.label}>
      <Top n={n} p={p} />
      <Strip {...p} titles={cards} />
      <div className={styles.cmpCols} style={{ '--n': String(n) } as CSSProperties}>
        {parts.map((part, i) =>
          part.kind === 'column' ? (
            <Column key={part.id} id={part.id} p={p} cards={cards} />
          ) : (
            <Gap key={`gap-${i}`} part={part} p={p} />
          ),
        )}
      </div>
    </section>
  );
}
