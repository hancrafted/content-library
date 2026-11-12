import type { ReactNode, RefObject } from 'react';
import { useLayoutEffect, useMemo, useRef } from 'react';
import { BeltLabelsView, BeltsView } from './belts-view';
import { Floor, type SpotProps } from './factory-floor';
import type { Words } from './software-ecology-words.types';
import styles from './software-ecology.module.css';
import type { ViewId } from './software-ecology.types';
import { beltsOf, cardsOf, rateText } from './stage-parts.pure.ts';
import type { WordsIn } from './use-case-words.pure.ts';
import type { FactoryView } from './use-factory.ts';

/*
 * The stage: the belts and their labels, the canvas the painter draws on, the floor of cards and, over it, the tour's
 * caption box; while the compare stream is shown, the stream in place of the floor. Rendered by the client parent.
 */

function useStageParts(f: FactoryView, x: { w: WordsIn; words: Words }) {
  const { run, layout, snap } = f;
  const cards = useMemo(() => cardsOf(run.m, x.w), [run, x.w]);
  const belts = useMemo(
    () => beltsOf({ m: run.m, layout, w: x.w, stage: x.words.stage }),
    [run, layout, x.w, x.words.stage],
  );
  const retOn = Object.fromEntries(Object.entries(snap.belts).map(([k, b]) => [k, b.retOn]));
  const labels = belts.map((b) => ({
    key: b.key,
    at: b.at,
    label: b.label,
    rate: rateText(b, snap.belts[b.key], x.words.stage),
  }));
  return { cards, belts, retOn, labels };
}

export interface StageProps {
  readonly f: FactoryView;
  readonly words: Words;
  readonly w: WordsIn;
  readonly spots: SpotProps;
  readonly view: ViewId;
  readonly viewEl: RefObject<HTMLDivElement | null>;
  readonly wrap: RefObject<HTMLElement | null>;
  readonly open: string | null;
  readonly beltMotion: boolean;
  readonly onCard: (id: string, shift: boolean) => void;
  /** The card a tour caption points at. */
  readonly toured?: string;
  /** The work centers picked for the compare stream. */
  readonly picked?: readonly string[];
  /** The compare stream; while it is shown, the floor is hidden. */
  readonly stream?: ReactNode;
  /** The tour's caption box, on the stage. */
  readonly overlay?: ReactNode;
}

/** Back from the compare stream, the hidden floor is placed and painted at once, also while the run is paused. */
function useRepaintOnReturn(comparing: boolean, repaint: () => void) {
  const was = useRef(comparing);
  useLayoutEffect(() => {
    if (was.current && !comparing) repaint();
    was.current = comparing;
  }, [comparing, repaint]);
}

const wrapAttrs = (p: StageProps, comparing: boolean) => ({
  'data-view': p.view,
  'data-compare': comparing,
  'aria-label': p.words.stage.label,
});

export function Stage(p: StageProps) {
  const { cards, belts, retOn, labels } = useStageParts(p.f, p);
  const comparing = !!p.stream;
  useRepaintOnReturn(comparing, p.f.repaint);
  return (
    <section ref={p.wrap} className={styles.viewWrap} {...wrapAttrs(p, comparing)}>
      <p className={`${styles.stageNote} text-caption`}>{p.words.stage.note}</p>
      <div
        ref={p.viewEl}
        className={styles.view}
        data-view={p.view}
        data-paused={p.f.controls.speed === 0}
        data-belts-move={p.beltMotion}
        hidden={comparing}
      >
        <div ref={p.f.stage} className={styles.stage} {...p.spots.targets?.belts}>
          <BeltsView layout={p.f.layout} retOn={retOn} />
          <canvas ref={p.f.canvas} aria-hidden="true" />
          <BeltLabelsView layout={p.f.layout} labels={labels} />
        </div>
        <Floor {...p} cards={cards} belts={belts} />
      </div>
      {p.stream}
      {p.overlay}
    </section>
  );
}
