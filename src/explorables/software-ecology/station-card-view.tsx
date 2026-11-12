import type { TargetProps } from '@/shared/lib/context-link.pure';
import { fillTemplate } from '@/shared/lib/template.pure';
import { memo, type ComponentType } from 'react';
import { Glyph } from './factory-glyph-view';
import type { CardWords } from './software-ecology-words.types';
import styles from './software-ecology.module.css';
import type { SignKind, StationReadout } from './stage-readouts.pure.ts';

/** A card's box on the floor, in layout units: x, y, width, height. */
export type Box = readonly [number, number, number, number];

export const boxStyle = (b: Box) => ({ left: b[0], top: b[1], width: b[2], height: b[3] });

/**
 * A station card as a button that opens its dashboard; the floor hears its click, Enter and Space. `toured`: a tour
 * caption points at it.
 */
export const openerProps = (label: string | undefined, open: boolean | undefined, toured?: boolean) =>
  label
    ? {
        role: 'button',
        tabIndex: 0,
        'aria-label': label,
        'aria-expanded': !!open,
        'data-open': open,
        'data-toured': toured || undefined,
      }
    : { 'data-open': open, 'data-toured': toured || undefined };

/** What the signs above a station card need. */
export type SignsProps = Pick<StationCardProps, 'signs' | 'r' | 'words' | 'targets'>;

export interface StationCardProps {
  readonly id: string;
  readonly box: Box;
  readonly title: string;
  readonly icon: string;
  readonly inspection: boolean;
  /** The signs this station can show, in order. */
  readonly signs: readonly SignKind[];
  readonly r: StationReadout;
  /**
   * The signs above the card, a client leaf the floor passes in: each sign carries the site's tooltip (a `*-view` file
   * renders on the server and holds no hook, FE-006). A component, not an element, so the memoised card stays still.
   */
  readonly Signs: ComponentType<SignsProps>;
  readonly words: CardWords;
  /** Context targets by spot: `card`, `rack`, or a sign's kind. The floor carries no Context marker (feedback 10). */
  readonly targets?: Readonly<Partial<Record<string, TargetProps>>>;
  /** "{title}: open its dashboard", the card's name as a button; the floor handles the click. */
  readonly label?: string;
  /** Its dashboard is open. */
  readonly open?: boolean;
  /** A tour caption points at it. */
  readonly toured?: boolean;
  /** Picked for the compare stream. */
  readonly picked?: boolean;
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

/** The rack's place on the card, for a Context target; the canvas draws the rack itself. */
function RackSpot({ targets }: Pick<StationCardProps, 'targets'>) {
  return targets?.rack ? <div className={styles.rackSpot} {...targets.rack} /> : null;
}

function Head(p: Pick<StationCardProps, 'icon' | 'title' | 'inspection' | 'words'>) {
  return (
    <div className={styles.head}>
      <Glyph name={p.icon} className={styles.gly} />
      <span className={`${styles.title} font-semibold`}>{p.title}</span>
      {p.inspection ? (
        <span className={styles.insp} data-tip={p.words.inspection}>
          <Glyph name="qa" className={styles.ico} />
        </span>
      ) : null}
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
      {...openerProps(p.label, p.open, p.toured)}
      data-ai={p.r.ai}
      data-piling={p.r.piling}
      data-picked={p.picked || undefined}
      style={boxStyle(p.box)}
      {...p.targets?.card}
    >
      <Head {...p} />
      <RackSpot targets={p.targets} />
      <div className={styles.body}>
        <Status r={p.r} words={p.words} />
      </div>
      <p.Signs signs={p.signs} r={p.r} words={p.words} targets={p.targets} />
      <Turbo />
    </div>
  );
});
