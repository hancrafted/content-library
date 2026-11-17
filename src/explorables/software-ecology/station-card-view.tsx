// decision: docs/adr/0024-software-ecology-flow-model-and-use-case-files.md
import type { TargetProps } from '@/shared/lib/context-link.pure';
import { fillTemplate } from '@/shared/lib/template.pure';
import { memo, type ComponentType } from 'react';
import { Glyph } from './factory-glyph-view';
import type { CardWords } from './software-ecology-words.types';
import styles from './software-ecology.module.css';
import type { SignKind, StationReadout } from './stage-readouts.pure.ts';

export type Box = readonly [number, number, number, number];

export const boxStyle = (b: Box) => ({ left: b[0], top: b[1], width: b[2], height: b[3] });

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

export type SignsProps = Pick<StationCardProps, 'id' | 'signs' | 'r' | 'words' | 'targets'>;

export interface StationCardProps {
  readonly id: string;
  readonly box: Box;
  readonly title: string;
  readonly icon: string;
  readonly inspection: boolean;
  readonly signs: readonly SignKind[];
  readonly r: StationReadout;
  readonly Signs: ComponentType<SignsProps>;
  readonly words: CardWords;
  readonly targets?: Readonly<Partial<Record<string, TargetProps>>>;
  readonly label?: string;
  readonly open?: boolean;
  readonly toured?: boolean;
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

export const StationCardView = memo(function StationCardView(p: StationCardProps) {
  return (
    <div
      className={`${styles.card} text-caption`}
      data-kind="role"
      data-id={p.id}
      {...openerProps(p.label, p.open, p.toured)}
      data-ai={p.r.ai}
      data-piling={p.r.piling}
      data-control={`node.${p.id}`}
      data-readout-waiting={p.r.waiting}
      data-readout-weeks-waiting={p.r.weeks.toFixed(1)}
      data-readout-rework={p.r.rework.toFixed(2)}
      data-picked={p.picked || undefined}
      style={boxStyle(p.box)}
      {...p.targets?.card}
    >
      <Head {...p} />
      <RackSpot targets={p.targets} />
      <div className={styles.body}>
        <Status r={p.r} words={p.words} />
      </div>
      <p.Signs id={p.id} signs={p.signs} r={p.r} words={p.words} targets={p.targets} />
      <Turbo />
    </div>
  );
});
