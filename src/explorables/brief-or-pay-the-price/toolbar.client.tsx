'use client';

import { Button } from '@/shared/components/ui/button';
import type { Definition, ViewId, Words } from './brief-or-pay-the-price.types';
import { toolsOf } from './controls.pure';
import type { ControlMap } from './controls.types';
import { ZOOM_LEVELS, type ExplorableState, type ZoomLevel } from './explorable-state.pure';
import { hasLayer, type Layer } from './layer-state.pure';

export const TAB_ORDER = ['price', 'brief', 'stages', 'brace'] as const satisfies readonly ViewId[];

const ZOOM_LABEL: Readonly<Record<ZoomLevel, (chrome: Words['chrome']) => string>> = {
  agent: (chrome) => chrome.agent,
  workflow: (chrome) => chrome.workflow,
};

const GROUP_LABEL = 'text-caption font-semibold tracking-wide text-muted-foreground uppercase';

interface PressProps {
  readonly label: string;
  readonly pressed: boolean;
}

function Press({ label, pressed, ...rest }: PressProps & { readonly onClick: () => void }) {
  return (
    <Button type="button" size="sm" variant={pressed ? 'default' : 'outline'} aria-pressed={pressed} {...rest}>
      {label}
    </Button>
  );
}

export interface ToolbarProps {
  readonly words: Words;
  readonly tabs: Readonly<Record<ViewId, Definition>>;
  readonly state: Pick<ExplorableState, 'view' | 'level' | 'scenario' | 'cell' | 'layers'>;
  readonly scenarios: readonly { readonly id: string; readonly name: string }[];
  readonly controls: ControlMap;
  readonly title: string;
  readonly onView: (view: ViewId) => void;
  readonly onScenario: (scenario: string) => void;
  readonly onZoom: (level: ZoomLevel) => void;
  readonly onLayer: (layer: Layer) => void;
  readonly unfilled?: readonly Layer[];
}

function DefineTabs({ words, tabs, state, onView }: ToolbarProps) {
  return (
    <div role="group" aria-label={words.chrome.views} className="flex flex-wrap items-center gap-2">
      <span className={GROUP_LABEL}>{words.chrome.define}</span>
      {TAB_ORDER.map((id) => (
        <Press
          key={id}
          label={tabs[id].acronym}
          pressed={state.level === 'define' && state.view === id}
          data-view-go={id}
          onClick={() => onView(id)}
        />
      ))}
    </div>
  );
}

function ZoomTabs({ words, state, onZoom }: ToolbarProps) {
  return (
    <div role="group" aria-label={words.chrome.zoom} data-zoom className="flex flex-wrap items-center gap-2">
      <span className={GROUP_LABEL}>{words.chrome.zoom}</span>
      {ZOOM_LEVELS.map((level) => (
        <Press
          key={level}
          label={ZOOM_LABEL[level](words.chrome)}
          pressed={state.level === level}
          data-zoom-go={level}
          onClick={() => onZoom(level)}
        />
      ))}
    </div>
  );
}

function ScenarioPicker({ words, state, scenarios, onScenario }: ToolbarProps) {
  return (
    <div
      role="group"
      aria-label={words.workflow.scenario}
      data-scenario-picker
      className="flex flex-wrap items-center gap-2"
    >
      <span className={GROUP_LABEL}>{words.workflow.scenario}</span>
      {scenarios.map(({ id, name }) => (
        <Press
          key={id}
          label={name}
          pressed={state.scenario === id}
          data-scenario-go={id}
          onClick={() => onScenario(id)}
        />
      ))}
    </div>
  );
}

function LayerToggles({
  words,
  state,
  onLayer,
  layers,
}: Pick<ToolbarProps, 'words' | 'state' | 'onLayer'> & { readonly layers: readonly Layer[] }) {
  return (
    <>
      {layers.map((layer) => (
        <Press
          key={layer}
          label={words.layers[layer]}
          pressed={hasLayer(state, layer)}
          data-layer-go={layer}
          onClick={() => onLayer(layer)}
        />
      ))}
    </>
  );
}

export function Toolbar(props: ToolbarProps) {
  const tools = toolsOf({
    controls: props.controls,
    state: props.state,
    scenarios: props.scenarios.length,
    unfilled: props.unfilled ?? [],
  });
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
        <DefineTabs {...props} />
        <ZoomTabs {...props} />
      </div>
      <p data-mirror-title className="text-body font-semibold">
        {props.title}
      </p>
      <div data-tools className="flex flex-wrap items-center gap-2">
        {tools.picker ? <ScenarioPicker {...props} /> : null}
        <LayerToggles words={props.words} state={props.state} onLayer={props.onLayer} layers={tools.layers} />
      </div>
    </div>
  );
}
