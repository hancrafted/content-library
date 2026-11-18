import type { CellKey, Level, ZoomLevel } from './agent-state.pure';

export const LAYERS = ['thoughtExperiment', 'freelancer', 'habits', 'tryIt'] as const;
export type Layer = (typeof LAYERS)[number];

export const LAYERS_OF: Readonly<Record<ZoomLevel, readonly Layer[]>> = {
  agent: ['thoughtExperiment', 'freelancer', 'habits'],
  workflow: ['thoughtExperiment', 'tryIt'],
};

export interface LayerSlice {
  readonly level: Level;
  readonly cell: CellKey | null;
  readonly layers: Readonly<Record<ZoomLevel, readonly Layer[]>>;
}

export interface LayerEvent {
  readonly type: 'layer';
  readonly layer: Layer;
}

export const LAYERS_REST: LayerSlice['layers'] = { agent: [], workflow: [] };

const zoomOf = (level: Level): ZoomLevel | null => (level === 'define' ? null : level);

export function layersOf(state: Pick<LayerSlice, 'level' | 'layers'>): readonly Layer[] {
  const level = zoomOf(state.level);
  return level === null ? [] : state.layers[level];
}

export const hasLayer = (state: Pick<LayerSlice, 'level' | 'layers'>, layer: Layer): boolean =>
  layersOf(state).includes(layer);

export function toggleLayer<S extends LayerSlice>(state: S, layer: Layer): S {
  const level = zoomOf(state.level);
  if (level === null || state.cell !== null || !LAYERS_OF[level].includes(layer)) return state;
  const on = state.layers[level];
  const next = on.includes(layer) ? on.filter((each) => each !== layer) : [...on, layer];
  return { ...state, layers: { ...state.layers, [level]: next } };
}
