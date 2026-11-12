'use client';

import { useTheme } from '@/shared/hooks/use-theme';
import type { TargetProps } from '@/shared/lib/context-link.pure';
import { useCallback, useRef, useState, type ReactNode, type RefObject } from 'react';
import { drawCompare } from './compare-live.ts';
import { cardClick, compareWidgetOf, Stream, useWatch } from './compare-wiring';
import { DockView } from './dock-view';
import { Controls } from './factory-controls';
import { type Spots } from './factory-floor';
import { presetOf, type FactoryRun } from './factory-run.pure.ts';
import { Stage } from './factory-stage';
import { tourCard } from './factory-tour.pure.ts';
import { OpenDashboard } from './open-dashboard';
import type { Words } from './software-ecology-words.types';
import styles from './software-ecology.module.css';
import type { Bundle, CatalogWords, Locale, ViewId } from './software-ecology.types';
import { LegendView, StatusLineView } from './stage-foot-view';
import { tourClockText, TourPanel } from './tour-panel';
import { scenarioWords, useCaseSub } from './use-case-words.pure.ts';
import { useChoices, type Choices } from './use-choices.ts';
import { useCompare } from './use-compare.ts';
import { useDashboard } from './use-dashboard.ts';
import { useDisplay } from './use-display.ts';
import { useFactory, type FactoryView } from './use-factory.ts';
import { useMorph } from './use-morph.ts';
import { useTour, useTourState, type TourActions } from './use-tour.ts';

/**
 * Context targets and markers a Slide places, by spot: `<id>:card`, `<id>:rack` and `<id>:<sign kind>` on a work
 * center, `customer`, `belts` (the whole belt layer, targets only), `belt:<key>` (a marker on that belt's label place),
 * `states` (the state row) and `scenario:<id>` (a marker beside that entry of the Scenarios menu).
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

/** A preset's view; Swing falls back to Roles for a use case without the cartoon. */
const viewOf = (B: Bundle, preset: string): ViewId => {
  const v = presetOf(B, preset).view ?? 'factory';
  return v === 'swing' && !B.data.panels ? 'roles' : v;
};

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

/** The markers a Slide places beside Scenarios menu entries, by scenario id. */
const scenarioSpots = (markers: Spots<ReactNode> | undefined): Spots<ReactNode> =>
  Object.fromEntries(
    Object.entries(markers ?? {})
      .filter(([k]) => k.startsWith('scenario:'))
      .map(([k, v]) => [k.slice('scenario:'.length), v]),
  );

type Handlers = ReturnType<typeof useHandlers>;

/** The state row's Scenarios menu, Tour and watch line, and the tour's clock. */
const tourRowOf = (t: {
  p: SoftwareEcologyClientProps;
  x: Parts;
  f: FactoryView;
  words: Choices;
  tour: TourActions;
  h: Handlers;
}) => {
  const preset = t.f.controls.preset;
  return {
    scenarios: t.words.scenarios,
    scenarioMarkers: scenarioSpots(t.p.markers),
    watch: scenarioWords(t.words.w, preset).watch ?? '',
    tour: { can: !!presetOf(t.x.B, preset).tour?.length, on: !!t.tour.tour, start: t.h.onTour },
    tourClock: tourClockText(t.tour, t.p.words),
  };
};

function Toolbar(t: {
  p: SoftwareEcologyClientProps;
  x: Parts;
  f: FactoryView;
  words: Choices;
  tour: TourActions;
  h: Handlers;
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
      onUseCase={t.h.onUseCase}
      onPreset={t.h.onPreset}
      onClear={t.h.onClear}
      statesTarget={p.targets?.states}
      statesMarker={p.markers?.states}
      compare={compareWidgetOf({ ...x, words: p.words, f: t.f, titles: words.titles })}
      {...tourRowOf(t)}
    />
  );
}

function useParts(p: SoftwareEcologyClientProps) {
  const [useCase, setUseCase] = useState(p.useCase);
  const B = p.bundles.find((b) => b.data.id === useCase) ?? (p.bundles[0] as Bundle);
  const [chosen, setChosen] = useState<ViewId>(() => viewOf(B, p.preset));
  const view: ViewId = chosen === 'swing' && !B.data.panels ? 'roles' : chosen;
  const wrap = useRef<HTMLElement>(null),
    viewEl = useRef<HTMLDivElement>(null),
    streamRoot = useRef<HTMLElement>(null);
  return {
    bundleOf: (id: string) => p.bundles.find((b) => b.data.id === id) ?? B,
    streamRoot,
    compare: useCompare(presetOf(B, p.preset).compare),
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

const stageOf = (x: Parts) => ({
  view: x.view,
  viewEl: x.viewEl,
  wrap: x.wrap,
  open: x.dash.open,
  beltMotion: x.display.beltMotion,
});

/** What the toolbar and the cards do: a state, a tour, a use case, Clear and a card click. */
function useHandlers(x: Parts, f: FactoryView, tour: TourActions) {
  const { B, dash, view, compare } = x;
  const show = useShow({ view, f, viewEl: x.viewEl, set: x.setChosen });
  // a state applies its own `compare`: a preset like AI compare opens the stream directly
  const apply = (bundle: typeof B, id: string) => compare.reset(presetOf(bundle, id).compare);
  return {
    onPreset: (id: string) => {
      dash.dismiss();
      tour.end();
      show(viewOf(B, id));
      apply(B, id);
      f.controls.setPreset(id);
    },
    onTour: () => {
      const id = f.controls.preset;
      dash.dismiss();
      show(viewOf(B, id));
      apply(B, id);
      tour.start(id);
    },
    onUseCase: (id: string) => (dash.dismiss(), tour.end(), apply(x.bundleOf(id), f.controls.preset), x.setUseCase(id)),
    onClear: () => (tour.end(), f.controls.clear()),
    onCard: cardClick(x, { f, show }),
  };
}

/** The factory's run and its tour, in step: the tour pauses the run's frames on each step's week. */
function useFactoryTour(p: SoftwareEcologyClientProps, x: Parts, words: Choices) {
  const ts = useTourState(),
    root = x.streamRoot;
  const onDraw = useCallback((run: FactoryRun, speed: number) => drawCompare(root.current, run, speed), [root]);
  const f = useFactory({
    B: x.B,
    preset: p.preset,
    words: words.fw,
    flowing: x.view === 'factory',
    onFrame: ts.onFrame,
    onDraw,
    watch: useWatch(x.dash, x.compare),
    stream: x.compare.stream,
    pile: x.display.pile,
  });
  return { f, tour: useTour(x.B, f, ts) };
}

/** The software ecology factory with its toolbar, stage, dashboards, tour, status line, legend and At the Customer panel. */
export function SoftwareEcologyClient(p: SoftwareEcologyClientProps) {
  const x = useParts(p),
    words = useChoices(p, x.B);
  const { f, tour } = useFactoryTour(p, x, words);
  const h = useHandlers(x, f, tour);
  const t = { words: p.words, w: words.w, titles: words.titles, locale: p.locale };
  return (
    <div className={styles.root}>
      <Toolbar p={p} x={x} f={f} words={words} tour={tour} h={h} />
      <Stage
        f={f}
        words={p.words}
        w={words.w}
        spots={p}
        {...stageOf(x)}
        onCard={h.onCard}
        picked={x.compare.state.open ? undefined : x.compare.state.ids}
        toured={tour.tour ? tourCard(tour.tour) : undefined}
        stream={x.compare.stream.length ? <Stream words={p.words} x={x} f={f} w={words.w} /> : undefined}
        overlay={<TourPanel tour={tour} {...t} floor={f.floor} wrap={x.wrap} stream={x.compare.stream.join()} />}
      />
      <OpenDashboard f={f} dash={x.dash} words={p.words} w={words.w} wrap={x.wrap} />
      <Below f={f} words={p.words} titles={words.titles} />
    </div>
  );
}
