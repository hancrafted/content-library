'use client';

import type { TargetProps } from '@/shared/lib/context-link.pure';
import { fillTemplate } from '@/shared/lib/template.pure';
import { useMemo, useState, type ReactNode } from 'react';
import { BeltLabelsView, BeltsView } from './belts-view';
import { CustomerCardView } from './customer-card-view';
import { DockView } from './dock-view';
import { FactoryToolbar, type Choice } from './factory-toolbar.client';
import type { Snapshot } from './run-snapshot.pure.ts';
import type { Words } from './software-ecology-words.types';
import styles from './software-ecology.module.css';
import type { Bundle, CatalogWords, Locale } from './software-ecology.types';
import { LegendView, StatusLineView } from './stage-foot-view';
import { beltsOf, cardsOf, customerCardOf, rateText, type BeltPart, type CardPart } from './stage-parts.pure.ts';
import { StationCardView } from './station-card-view';
import { presetName, titlesOf, useCaseName, useCaseSub, type WordsIn } from './use-case-words.pure.ts';
import { useFactory, type FactoryView, type FactoryWords } from './use-factory.ts';

/**
 * Context targets and markers a Slide places, by spot: `<id>:card`, `<id>:rack` and `<id>:<sign kind>` on a work
 * center, `customer`, `belts` (the whole belt layer, targets only), `belt:<key>` (a marker on that belt's label place)
 * and `states` (the state row).
 */
export type Spots<T> = Readonly<Partial<Record<string, T>>>;

export interface SoftwareEcologyClientProps {
  readonly bundles: readonly Bundle[];
  readonly useCase: string;
  readonly preset: string;
  readonly locale: Locale;
  readonly words: Words;
  readonly catalog: CatalogWords;
  readonly targets?: Spots<TargetProps>;
  readonly markers?: Spots<ReactNode>;
}

/** The states the toolbar shows now; Swing and Roles join with their views (#541). */
const MAIN_STATES = ['ideal', 'realistic'];

const spotsFor = <T,>(spots: Spots<T> | undefined, prefix: string): Spots<T> =>
  Object.fromEntries(
    Object.entries(spots ?? {})
      .filter(([k]) => k.startsWith(prefix))
      .map(([k, v]) => [k.slice(prefix.length), v]),
  );

type SpotProps = Pick<SoftwareEcologyClientProps, 'targets' | 'markers'>;

/** Each card's own spots, once per run, so a memoised card redraws only when its readout changes. */
const useCardSpots = (cards: readonly CardPart[], spots: SpotProps) =>
  useMemo(
    () =>
      Object.fromEntries(
        cards.map((c) => [
          c.id,
          { targets: spotsFor(spots.targets, `${c.id}:`), markers: spotsFor(spots.markers, `${c.id}:`) },
        ]),
      ),
    [cards, spots.targets, spots.markers],
  );

function BeltSpots({ belts, spots }: { belts: readonly BeltPart[]; spots: SpotProps }) {
  return belts.map((b) => {
    const m = spots.markers?.[`belt:${b.key}`];
    return m ? (
      <span
        key={b.key}
        className={styles.beltSpot}
        style={{ left: b.at.x, top: b.at.y }}
        {...spots.targets?.[`belt:${b.key}`]}
      >
        {m}
      </span>
    ) : null;
  });
}

interface FloorProps {
  readonly f: FactoryView;
  readonly cards: readonly CardPart[];
  readonly belts: readonly BeltPart[];
  readonly w: WordsIn;
  readonly words: Words;
  readonly spots: SpotProps;
}

function Floor(p: FloorProps) {
  const { layout, snap, run } = p.f,
    cust = customerCardOf(run.m, p.w),
    own = useCardSpots(p.cards, p.spots);
  return (
    <div ref={p.f.floor} className={styles.floor} style={{ width: layout.width, height: layout.height }}>
      <CustomerCardView
        box={cust.box}
        title={cust.title}
        r={snap.customer}
        words={p.words.customer}
        target={p.spots.targets?.customer}
        marker={p.spots.markers?.customer}
      />
      {p.cards.map((c) => (
        <StationCardView
          key={c.id}
          {...c}
          {...own[c.id]}
          r={snap.stations[c.id] as Snapshot['stations'][string]}
          words={p.words.card}
        />
      ))}
      <BeltSpots belts={p.belts} spots={p.spots} />
    </div>
  );
}

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

function Stage(p: { f: FactoryView; words: Words; w: WordsIn; spots: SpotProps }) {
  const { cards, belts, retOn, labels } = useStageParts(p.f, p);
  return (
    <section className={styles.viewWrap} aria-label={p.words.stage.label}>
      <p className={`${styles.stageNote} text-caption`}>{p.words.stage.note}</p>
      <div className={styles.view} data-paused={p.f.controls.speed === 0}>
        <div ref={p.f.stage} className={styles.stage} {...p.spots.targets?.belts}>
          <BeltsView layout={p.f.layout} retOn={retOn} />
          <canvas ref={p.f.canvas} aria-hidden="true" />
          <BeltLabelsView layout={p.f.layout} labels={labels} />
        </div>
        <Floor f={p.f} cards={cards} belts={belts} w={p.w} words={p.words} spots={p.spots} />
      </div>
    </section>
  );
}

const clockOf = (snap: Snapshot, w: Words): string =>
  snap.warming ? w.toolbar.warming : fillTemplate(w.toolbar.day, { n: snap.day });

function useWords(p: SoftwareEcologyClientProps, B: Bundle) {
  const w = useMemo<WordsIn>(() => ({ B, locale: p.locale, catalog: p.catalog }), [B, p.locale, p.catalog]);
  const fw = useMemo<FactoryWords>(
    () => ({ warming: (day, of) => fillTemplate(p.words.stage.warming, { day, of }), blocked: p.words.stage.blocked }),
    [p.words.stage],
  );
  const states = useMemo<Choice[]>(
    () =>
      B.data.presets.filter((x) => MAIN_STATES.includes(x.id)).map((x) => ({ id: x.id, name: presetName(w, x.id) })),
    [B, w],
  );
  const useCases = useMemo<Choice[]>(
    () => p.bundles.map((b) => ({ id: b.data.id, name: useCaseName({ ...w, B: b }) })),
    [p.bundles, w],
  );
  return { w, fw, states, useCases, titles: useMemo(() => titlesOf(w), [w]) };
}

function Below({ f, words, titles }: { f: FactoryView; words: Words; titles: Readonly<Record<string, string>> }) {
  return (
    <>
      <div className={styles.foot}>
        <StatusLineView status={f.snap.status} words={words.stage.status} titles={titles} />
        <LegendView words={words.stage.legend} />
      </div>
      <div className={styles.below}>
        <DockView r={f.snap.customer} words={words.dock} />
      </div>
    </>
  );
}

/** The software ecology factory with its toolbar, stage, status line, legend and At the Customer panel. */
export function SoftwareEcologyClient(p: SoftwareEcologyClientProps) {
  const [useCase, setUseCase] = useState(p.useCase);
  const B = p.bundles.find((b) => b.data.id === useCase) ?? (p.bundles[0] as Bundle);
  const { w, fw, states, useCases, titles } = useWords(p, B);
  const f = useFactory({ B, preset: p.preset, words: fw });
  const c = f.controls;
  return (
    <div className={styles.root}>
      <FactoryToolbar
        words={p.words.toolbar}
        states={states}
        preset={c.preset}
        onPreset={c.setPreset}
        useCases={useCases}
        useCase={useCase}
        onUseCase={setUseCase}
        sub={useCaseSub(w)}
        speed={c.speed}
        onSpeed={c.setSpeed}
        onClear={c.clear}
        clock={clockOf(f.snap, p.words)}
        statesTarget={p.targets?.states}
        statesMarker={p.markers?.states}
      />
      <Stage f={f} words={p.words} w={w} spots={p} />
      <Below f={f} words={p.words} titles={titles} />
    </div>
  );
}
