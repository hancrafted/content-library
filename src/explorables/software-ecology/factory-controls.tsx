import type { TargetProps } from '@/shared/lib/context-link.pure';
import { fillTemplate } from '@/shared/lib/template.pure';
import type { ReactNode } from 'react';
import type { CompareWidgetProps } from './compare-widget';
import type { ExchangeButtonsProps } from './exchange-buttons';
import { aiChoicesOf, withMech, type AiChoice } from './factory-settings.pure.ts';
import { FactoryToolbar, type Choice } from './factory-toolbar.client';
import type { ModelMenuProps } from './model-menu';
import type { Snapshot } from './run-snapshot.pure.ts';
import type { ScenarioChoice } from './scenario-menu';
import type { Words } from './software-ecology-words.types';
import type { Bundle } from './software-ecology.types';
import type { Display } from './use-display.ts';
import type { FactoryView } from './use-factory.ts';

/*
 * The toolbar wired to the run: the state row, the use case, mechanics, compare mode, speed, the Model and the ⋮ menu. Every
 * setting goes through the run's controls; the display choices through `Display`.
 */

export interface ControlsProps {
  readonly B: Bundle;
  readonly f: FactoryView;
  readonly words: Words;
  readonly states: readonly Choice[];
  readonly useCases: readonly Choice[];
  readonly useCase: string;
  readonly sub: string;
  readonly titles: Readonly<Record<string, string>>;
  readonly display: Display;
  readonly onUseCase: (id: string) => void;
  readonly onPreset: (id: string) => void;
  readonly statesTarget?: TargetProps;
  readonly statesMarker?: ReactNode;
  readonly scenarios: readonly ScenarioChoice[];
  readonly scenarioMarkers?: Readonly<Partial<Record<string, ReactNode>>>;
  readonly watch: string;
  readonly tour: { readonly can: boolean; readonly on: boolean; readonly start: () => void };
  /** While a tour runs, its clock ("Week 8 · Day 1") in place of the day. */
  readonly tourClock?: string;
  /** Clear ends a tour first. */
  readonly onClear: () => void;
  readonly compare: CompareWidgetProps;
  readonly exchange: ExchangeButtonsProps;
}

const clockOf = (snap: Snapshot, w: Words): string =>
  snap.warming ? w.toolbar.warming : fillTemplate(w.toolbar.day, { n: snap.day });

const aiChoices = (p: ControlsProps): AiChoice[] =>
  aiChoicesOf(p.B, (id) => p.titles[id] ?? id).map((c) =>
    c.id === 'off'
      ? { ...c, label: p.words.model.off }
      : c.id === 'ai:all'
        ? { ...c, label: p.words.model.everywhere }
        : c,
  );

const modelOf = (p: ControlsProps): ModelMenuProps => {
  const c = p.f.controls;
  return {
    B: p.B,
    settings: c.settings,
    words: p.words.model,
    mechs: p.words.toolbar.mechs,
    aiChoices: aiChoices(p),
    onSettings: c.setSettings,
    onReset: () => p.onPreset(c.preset),
  };
};

/** The state row's Scenarios menu, Tour and "modified", and the watch line. */
const stateRowOf = (p: ControlsProps) => ({
  scenarios: p.scenarios,
  scenarioMarkers: p.scenarioMarkers,
  canTour: p.tour.can,
  touring: p.tour.on,
  onTour: p.tour.start,
  watch: p.watch,
  modified: p.f.controls.modified,
});

export function Controls(p: ControlsProps) {
  const c = p.f.controls;
  return (
    <FactoryToolbar
      words={p.words.toolbar}
      states={p.states}
      preset={c.preset}
      onPreset={p.onPreset}
      useCases={p.useCases}
      useCase={p.useCase}
      onUseCase={p.onUseCase}
      sub={p.sub}
      speed={c.speed}
      onSpeed={c.setSpeed}
      onClear={p.onClear}
      clock={p.tourClock ?? clockOf(p.f.snap, p.words)}
      statesTarget={p.statesTarget}
      statesMarker={p.statesMarker}
      {...stateRowOf(p)}
      mech={c.settings.mech}
      onMech={(k) => c.setSettings(withMech(c.settings, k))}
      model={modelOf(p)}
      more={{ ...p.display, words: p.words.more }}
      compare={p.compare}
      exchange={p.exchange}
    />
  );
}
