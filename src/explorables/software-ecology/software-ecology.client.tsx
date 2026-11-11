'use client';

import type { TargetProps } from '@/shared/lib/context-link.pure';
import { fillTemplate } from '@/shared/lib/template.pure';
import { useMemo, useRef, useState, type ReactNode, type RefObject } from 'react';
import { BeltLabelsView, BeltsView } from './belts-view';
import { DockView } from './dock-view';
import { Floor, type SpotProps, type Spots } from './factory-floor';
import { presetOf } from './factory-run.pure.ts';
import { FactoryToolbar, type Choice } from './factory-toolbar.client';
import type { Snapshot } from './run-snapshot.pure.ts';
import type { Words } from './software-ecology-words.types';
import styles from './software-ecology.module.css';
import type { Bundle, CatalogWords, Locale, ViewId } from './software-ecology.types';
import { LegendView, StatusLineView } from './stage-foot-view';
import { beltsOf, cardsOf, rateText } from './stage-parts.pure.ts';
import { presetName, titlesOf, useCaseName, useCaseSub, type WordsIn } from './use-case-words.pure.ts';
import { useFactory, type FactoryView, type FactoryWords } from './use-factory.ts';
import { useMorph } from './use-morph.ts';

/**
 * Context targets and markers a Slide places, by spot: `<id>:card`, `<id>:rack` and `<id>:<sign kind>` on a work
 * center, `customer`, `belts` (the whole belt layer, targets only), `belt:<key>` (a marker on that belt's label place)
 * and `states` (the state row).
 */
export type { Spots };

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

/** The states on the toolbar's row; the Scenarios menu holds the rest (#543). */
const MAIN_STATES = ['swing', 'roles', 'ideal', 'realistic'];

/** A preset's view; Swing falls back to Roles for a use case without the cartoon. */
const viewOf = (B: Bundle, preset: string): ViewId => {
  const v = presetOf(B, preset).view ?? 'factory';
  return v === 'swing' && !B.data.panels ? 'roles' : v;
};

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

interface StageProps {
  readonly f: FactoryView;
  readonly words: Words;
  readonly w: WordsIn;
  readonly spots: SpotProps;
  readonly view: ViewId;
  readonly viewEl: RefObject<HTMLDivElement | null>;
  readonly onCard: (id: string, shift: boolean) => void;
}

function Stage(p: StageProps) {
  const { cards, belts, retOn, labels } = useStageParts(p.f, p);
  return (
    <section className={styles.viewWrap} data-view={p.view} aria-label={p.words.stage.label}>
      <p className={`${styles.stageNote} text-caption`}>{p.words.stage.note}</p>
      <div ref={p.viewEl} className={styles.view} data-view={p.view} data-paused={p.f.controls.speed === 0}>
        <div ref={p.f.stage} className={styles.stage} {...p.spots.targets?.belts}>
          <BeltsView layout={p.f.layout} retOn={retOn} />
          <canvas ref={p.f.canvas} aria-hidden="true" />
          <BeltLabelsView layout={p.f.layout} labels={labels} />
        </div>
        <Floor
          f={p.f}
          view={p.view}
          cards={cards}
          belts={belts}
          w={p.w}
          words={p.words}
          spots={p.spots}
          onCard={p.onCard}
        />
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

/** The morph from one view into the next: the boxes are read before the switch, played after it. */
function useShow(x: {
  view: ViewId;
  f: FactoryView;
  viewEl: RefObject<HTMLDivElement | null>;
  set: (v: ViewId) => void;
}) {
  const { begin } = useMorph({ view: x.view, viewEl: x.viewEl, floor: x.f.floor, place: x.f.repaint });
  return (next: ViewId) => {
    if (next !== x.view) begin();
    x.set(next);
  };
}

interface ControlsProps {
  readonly p: SoftwareEcologyClientProps;
  readonly f: FactoryView;
  readonly words: ReturnType<typeof useWords>;
  readonly useCase: string;
  readonly onUseCase: (id: string) => void;
  readonly onPreset: (id: string) => void;
}

function Controls({ p, f, words, useCase, onUseCase, onPreset }: ControlsProps) {
  const c = f.controls;
  return (
    <FactoryToolbar
      words={p.words.toolbar}
      states={words.states}
      preset={c.preset}
      onPreset={onPreset}
      useCases={words.useCases}
      useCase={useCase}
      onUseCase={onUseCase}
      sub={useCaseSub(words.w)}
      speed={c.speed}
      onSpeed={c.setSpeed}
      onClear={c.clear}
      clock={clockOf(f.snap, p.words)}
      statesTarget={p.targets?.states}
      statesMarker={p.markers?.states}
    />
  );
}

/** The software ecology factory with its toolbar, stage, status line, legend and At the Customer panel. */
export function SoftwareEcologyClient(p: SoftwareEcologyClientProps) {
  const [useCase, setUseCase] = useState(p.useCase);
  const B = p.bundles.find((b) => b.data.id === useCase) ?? (p.bundles[0] as Bundle);
  const words = useWords(p, B);
  const [chosen, setChosen] = useState<ViewId>(() => viewOf(B, p.preset));
  const view: ViewId = chosen === 'swing' && !B.data.panels ? 'roles' : chosen;
  const f = useFactory({ B, preset: p.preset, words: words.fw, flowing: view === 'factory' });
  const viewEl = useRef<HTMLDivElement>(null);
  const show = useShow({ view, f, viewEl, set: setChosen });
  const onPreset = (id: string) => {
    show(viewOf(B, id));
    f.controls.setPreset(id);
  };
  // a card in Swing or Roles opens the factory; in the factory its dashboard joins with #542
  const onCard = () => {
    if (view !== 'factory') show('factory');
  };
  return (
    <div className={styles.root}>
      <Controls p={p} f={f} words={words} useCase={useCase} onUseCase={setUseCase} onPreset={onPreset} />
      <Stage f={f} words={p.words} w={words.w} spots={p} view={view} viewEl={viewEl} onCard={onCard} />
      <Below f={f} words={p.words} titles={words.titles} />
    </div>
  );
}
