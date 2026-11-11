import type { TargetProps } from '@/shared/lib/context-link.pure';
import { fillTemplate } from '@/shared/lib/template.pure';
import { memo, type ReactNode } from 'react';
import { Glyph } from './factory-glyph-view';
import type { CardWords } from './software-ecology-words.types';
import styles from './software-ecology.module.css';
import type { SignKind, StationReadout } from './stage-readouts.pure.ts';

/** A card's box on the floor, in layout units: x, y, width, height. */
export type Box = readonly [number, number, number, number];

export const boxStyle = (b: Box) => ({ left: b[0], top: b[1], width: b[2], height: b[3] });

export interface StationCardProps {
  readonly id: string;
  readonly box: Box;
  readonly title: string;
  readonly icon: string;
  readonly inspection: boolean;
  /** The signs this station can show, in order. */
  readonly signs: readonly SignKind[];
  readonly r: StationReadout;
  readonly words: CardWords;
  /** Context targets and markers by spot: `card`, `rack`, or a sign's kind. */
  readonly targets?: Readonly<Partial<Record<string, TargetProps>>>;
  readonly markers?: Readonly<Partial<Record<string, ReactNode>>>;
}

function Status({ r, words }: Pick<StationCardProps, 'r' | 'words'>) {
  return (
    <span className={`${styles.status} text-caption`}>
      <span className={styles.bugs}>
        {r.bugShare >= 0.05 ? fillTemplate(words.onBugs, { n: Math.round(r.bugShare * 100) }) : ''}
      </span>
      <span>
        <b className="font-semibold">{r.waiting}</b> {words.waiting}
      </span>
    </span>
  );
}

function Signs({
  signs,
  r,
  words,
  targets,
  markers,
}: Pick<StationCardProps, 'signs' | 'r' | 'words' | 'targets' | 'markers'>) {
  const marked = signs.filter((k) => markers?.[k]);
  return (
    <div className={styles.signs}>
      {signs.map((k) => (
        <span
          key={k}
          className={styles.sign}
          data-sign={k}
          data-on={r.signs[k]}
          data-tip={words.signs[k]}
          aria-label={words.signs[k]}
          {...targets?.[k]}
        >
          <Glyph name={k} className={styles.ico} />
        </span>
      ))}
      {marked.length ? <span className={styles.spotMarker}>{marked.map((k) => markers?.[k])}</span> : null}
    </div>
  );
}

/** The rack's place on the card, for a Context target or marker; the canvas draws the rack itself. */
function RackSpot({ targets, markers }: Pick<StationCardProps, 'targets' | 'markers'>) {
  if (!targets?.rack && !markers?.rack) return null;
  return (
    <div className={styles.rackSpot} {...targets?.rack}>
      {markers?.rack}
    </div>
  );
}

function Head(p: Pick<StationCardProps, 'icon' | 'title' | 'inspection' | 'words' | 'markers'>) {
  return (
    <div className={styles.head}>
      <Glyph name={p.icon} className={styles.gly} />
      <span className={`${styles.title} font-semibold`}>{p.title}</span>
      {p.inspection ? (
        <span className={styles.insp} data-tip={p.words.inspection}>
          <Glyph name="qa" className={styles.ico} />
        </span>
      ) : null}
      {p.markers?.card}
    </div>
  );
}

/** AI at work: chevrons racing out along the outbound belt. */
function Turbo() {
  return (
    <span className={styles.turbo} aria-hidden="true">
      <svg viewBox="0 0 30 14">
        <g className={styles.chev}>
          <path d="M2 2l5 5-5 5M10 2l5 5-5 5M18 2l5 5-5 5" />
        </g>
      </svg>
    </span>
  );
}

/** A work center on the floor (design-ADR 0024 §14): head, the status line and its signs; the canvas draws the rack and the work. */
export const StationCardView = memo(function StationCardView(p: StationCardProps) {
  return (
    <div
      className={`${styles.card} text-caption`}
      data-kind="role"
      data-id={p.id}
      data-ai={p.r.ai}
      data-piling={p.r.piling}
      style={boxStyle(p.box)}
      {...p.targets?.card}
    >
      <Head {...p} />
      <RackSpot targets={p.targets} markers={p.markers} />
      <div className={styles.body}>
        <Status r={p.r} words={p.words} />
      </div>
      <Signs signs={p.signs} r={p.r} words={p.words} targets={p.targets} markers={p.markers} />
      <Turbo />
    </div>
  );
});
