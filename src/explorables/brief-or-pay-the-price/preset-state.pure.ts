import type { Preset } from './brief-or-pay-the-price.types';
import { start, step, type ExplorableEvent, type ExplorableState } from './explorable-state.pure';
import type { Layer } from './layer-state.pure';

// decision: FE-012 §4.1
export function presetStart(
  rowCounts: Readonly<Record<string, number>>,
  preset: Preset,
  unfilled: readonly Layer[] = [],
): ExplorableState {
  const events: ExplorableEvent[] = [
    { type: 'view', view: preset.view },
    { type: 'zoom', level: preset.level },
    ...preset.layers
      .filter((layer) => !unfilled.includes(layer))
      .map((layer): ExplorableEvent => ({ type: 'layer', layer })),
  ];
  return events.reduce(step, start(rowCounts, preset.scenario));
}
