import type { Layer } from './brief-or-pay-the-price.types';
import { CONTROL_IDS, type ControlId, type ControlMap } from './controls.types';
import { hasLayer, LAYERS_OF, type LayerSlice } from './layer-state.pure';

// decision: FE-012 §4.4
export { CONTROL_IDS, type ControlId, type ControlMap };

export interface ControlDef {
  readonly id: ControlId;
  readonly show: boolean;
}

export const CONTROLS: readonly ControlDef[] = CONTROL_IDS.map((id) => ({
  id,
  show: true,
}));

const BY_ID = new Map<ControlId, ControlDef>(CONTROLS.map((def) => [def.id, def]));

export const offers = (controls: ControlMap, id: ControlId): boolean =>
  controls[id]?.show ?? (BY_ID.get(id) as ControlDef).show;

export interface ToolsInput {
  readonly controls: ControlMap;
  readonly state: Pick<LayerSlice, 'level' | 'cell' | 'layers'>;
  readonly scenarios: number;
  readonly unfilled: readonly Layer[];
}

export interface Tools {
  readonly picker: boolean;
  readonly layers: readonly Layer[];
}

export function toolsOf({ controls, state, scenarios, unfilled }: ToolsInput): Tools {
  const experiment = hasLayer(state, 'thoughtExperiment');
  const picker = offers(controls, 'scenarioPicker') && state.level === 'workflow' && scenarios >= 2 && !experiment;
  if (state.level === 'define' || state.cell !== null) return { picker, layers: [] };
  const layers = LAYERS_OF[state.level].filter(
    (layer) => offers(controls, layer) && !unfilled.includes(layer) && (!experiment || layer === 'thoughtExperiment'),
  );
  return { picker, layers };
}

export function controlProblems(controls: unknown, at: string): string[] {
  if (typeof controls !== 'object' || controls === null || Array.isArray(controls))
    return [`${at}: controls is a map of control ids`];
  return Object.entries(controls).flatMap(([id, setting]) => {
    if (!(CONTROL_IDS as readonly string[]).includes(id))
      return [`${at}: control "${id}" is not one of ${CONTROL_IDS.join(', ')}`];
    const keys = typeof setting === 'object' && setting !== null && !Array.isArray(setting) ? setting : null;
    if (keys === null) return [`${at}: control "${id}" needs show: true or false`];
    return Object.entries(keys).flatMap(([key, value]) =>
      key === 'show' && typeof value === 'boolean' ? [] : [`${at}: control "${id}" takes only show: true or false`],
    );
  });
}
