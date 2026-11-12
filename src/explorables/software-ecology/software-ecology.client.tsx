'use client';

import { useTheme } from '@/shared/hooks/use-theme';
import type { TargetProps } from '@/shared/lib/context-link.pure';
import { fillTemplate } from '@/shared/lib/template.pure';
import { useMemo, useRef, useState, type ReactNode, type RefObject } from 'react';
import { BeltLabelsView, BeltsView } from './belts-view';
import { DockView } from './dock-view';
import { Controls } from './factory-controls';
import { Floor, type SpotProps, type Spots } from './factory-floor';
import { presetOf } from './factory-run.pure.ts';
import type { Choice } from './factory-toolbar.client';
import { OpenDashboard } from './open-dashboard';
import type { Words } from './software-ecology-words.types';
import styles from './software-ecology.module.css';
import type { Bundle, CatalogWords, Locale, ViewId } from './software-ecology.types';
import { LegendView, StatusLineView } from './stage-foot-view';
import { beltsOf, cardsOf, rateText } from './stage-parts.pure.ts';
import { presetName, titlesOf, useCaseName, useCaseSub, type WordsIn } from './use-case-words.pure.ts';
import { useDashboard } from './use-dashboard.ts';
import { useDisplay } from './use-display.ts';
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
  readonly wrap: RefObject<HTMLElement | null>;
  readonly open: string | null;
  readonly beltMotion: boolean;
  readonly onCard: (id: string, shift: boolean) => void;
}

function Stage(p: StageProps) {
  const { cards, belts, retOn, labels } = useStageParts(p.f, p);
  return (
    <section ref={p.wrap} className={styles.viewWrap} data-view={p.view} aria-label={p.words.stage.label}>
      <p className={`${styles.stageNote} text-caption`}>{p.words.stage.note}</p>
      <div
        ref={p.viewEl}
        className={styles.view}
        data-view={p.view}
        data-paused={p.f.controls.speed === 0}
        data-belts-move={p.beltMotion}
      >
        <div ref={p.f.stage} className={styles.stage} {...p.spots.targets?.belts}>
          <BeltsView layout={p.f.layout} retOn={retOn} />
          <canvas ref={p.f.canvas} aria-hidden="true" />
          <BeltLabelsView layout={p.f.layout} labels={labels} />
        </div>
        <Floor {...p} cards={cards} belts={belts} />
      </div>
    </section>
  );
}

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

type Parts = ReturnType<typeof useParts>;

function Toolbar(t: {
  p: SoftwareEcologyClientProps;
  x: Parts;
  f: FactoryView;
  words: ReturnType<typeof useWords>;
  onPreset: (id: string) => void;
  onUseCase: (id: string) => void;
}) {
  const { p, x, words } = t;
  return (
    <Controls
      B={x.B}
      f={t.f}
      words={p.words}
      states={words.states}
      useCases={words.useCases}
      useCase={x.useCase}
      sub={useCaseSub(words.w)}
      titles={words.titles}
      display={x.display}
      onUseCase={t.onUseCase}
      onPreset={t.onPreset}
      statesTarget={p.targets?.states}
      statesMarker={p.markers?.states}
    />
  );
}

function useParts(p: SoftwareEcologyClientProps) {
  const [useCase, setUseCase] = useState(p.useCase);
  const B = p.bundles.find((b) => b.data.id === useCase) ?? (p.bundles[0] as Bundle);
  const [chosen, setChosen] = useState<ViewId>(() => viewOf(B, p.preset));
  const view: ViewId = chosen === 'swing' && !B.data.panels ? 'roles' : chosen;
  const wrap = useRef<HTMLElement>(null),
    viewEl = useRef<HTMLDivElement>(null);
  return {
    useCase,
    setUseCase,
    B,
    view,
    setChosen,
    wrap,
    viewEl,
    dash: useDashboard(wrap),
    display: useDisplay(useTheme()),
  };
}

const watchOf = (x: Parts) => ({ watch: x.dash.watch, pile: x.display.pile });

const stageOf = (x: Parts) => ({
  view: x.view,
  viewEl: x.viewEl,
  wrap: x.wrap,
  open: x.dash.open,
  beltMotion: x.display.beltMotion,
});

/** The software ecology factory with its toolbar, stage, dashboards, status line, legend and At the Customer panel. */
export function SoftwareEcologyClient(p: SoftwareEcologyClientProps) {
  const x = useParts(p),
    { B, view, dash } = x;
  const words = useWords(p, B);
  const f = useFactory({ B, preset: p.preset, words: words.fw, flowing: view === 'factory', ...watchOf(x) });
  const show = useShow({ view, f, viewEl: x.viewEl, set: x.setChosen });
  const onPreset = (id: string) => {
    dash.dismiss();
    show(viewOf(B, id));
    f.controls.setPreset(id);
  };
  const onUseCase = (id: string) => (dash.dismiss(), x.setUseCase(id));
  // a card in Swing or Roles opens the factory; in the factory it opens or closes its dashboard (shift: #544)
  const onCard = (id: string) => (view === 'factory' ? dash.toggle(id) : show('factory'));
  return (
    <div className={styles.root}>
      <Toolbar p={p} x={x} f={f} words={words} onPreset={onPreset} onUseCase={onUseCase} />
      <Stage f={f} words={p.words} w={words.w} spots={p} {...stageOf(x)} onCard={onCard} />
      <OpenDashboard f={f} dash={dash} words={p.words} w={words.w} wrap={x.wrap} />
      <Below f={f} words={p.words} titles={words.titles} />
    </div>
  );
}
