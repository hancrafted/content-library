import type { TargetProps } from '@/shared/lib/context-link.pure';
import { fillTemplate } from '@/shared/lib/template.pure';
import type { ReactNode } from 'react';
import type { CompareWidgetProps } from './compare-widget';
import type { ExchangeButtonsProps } from './exchange-buttons';
import type { Snapshot } from './factory-model.pure.ts';
import { aiChoicesOf, type AiChoice } from './factory-settings.pure.ts';
import { FactoryToolbar, type Choice } from './factory-toolbar.client';
import type { MechanicsMenuProps } from './mechanics-menu.client';
import type { ModelMenuProps } from './model-menu.client';
import type { ScenarioChoice } from './scenario-menu';
import type { Words } from './software-ecology-words.types';
import type { Bundle } from './software-ecology.types';
import type { Display } from './use-display.ts';
import type { FactoryView } from './use-factory.ts';

/*
 * The toolbar wired to the run: the state row, compare mode, speed, the use case and the Settings popover (its Model,
 * Mechanics and Display columns and the file). Every setting goes through the run's controls; the display choices
 * through `Display`.
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
  /** Reset to default: the active state as its use-case file defines it. */
  readonly onReset: () => void;
  readonly statesTarget?: TargetProps;
  readonly statesMarker?: ReactNode;
  readonly scenarios: readonly ScenarioChoice[];
  readonly scenarioMarkers?: Readonly<Partial<Record<string, ReactNode>>>;
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
    aiChoices: aiChoices(p),
    onSettings: c.setSettings,
    onReset: p.onReset,
  };
};

const mechanicsOf = (p: ControlsProps): MechanicsMenuProps => ({
  settings: p.f.controls.settings,
  mechs: p.words.toolbar.mechs,
  onSettings: p.f.controls.setSettings,
});

/** The state row's Scenarios menu, Tour and the modified dot. */
const stateRowOf = (p: ControlsProps) => ({
  scenarios: p.scenarios,
  scenarioMarkers: p.scenarioMarkers,
  canTour: p.tour.can,
  touring: p.tour.on,
  onTour: p.tour.start,
  modified: p.f.controls.modified,
});

export function Controls(p: ControlsProps) {
  const c = p.f.controls;
  return (
    <FactoryToolbar
      words={p.words.toolbar}
      settingsWords={p.words.settings}
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
      model={modelOf(p)}
      mechanics={mechanicsOf(p)}
      display={{ ...p.display, words: p.words.display }}
      compare={p.compare}
      exchange={p.exchange}
    />
  );
}
