'use client';

import { Button } from '@/shared/components/ui/button';
import { Separator } from '@/shared/components/ui/separator';
import { ToggleGroup, ToggleGroupItem } from '@/shared/components/ui/toggle-group';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/components/ui/tooltip';
import { cn } from '@/shared/lib/utils';
import { Play, RotateCcw } from 'lucide-react';
import type { ComponentProps, ReactNode } from 'react';
import type { Definition, ViewId, Words } from './brief-or-pay-the-price.types';
import { toolsOf } from './controls.pure';
import type { ControlMap } from './controls.types';
import { ZOOM_LEVELS, type ExplorableState, type ZoomLevel } from './explorable-state.pure';
import { hasLayer, type Layer } from './layer-state.pure';

export const TAB_ORDER = ['price', 'brief', 'stages', 'brace'] as const satisfies readonly ViewId[];

const PILL = 'flex w-fit max-w-full flex-wrap items-center gap-0.5 rounded-full border bg-muted p-[3px]';
const GROUP = 'flex-nowrap gap-0.5';
const ON_BY_ARIA_SINCE_TOOLTIP_OVERWRITES_DATA_STATE =
  'h-8 border-transparent px-3 aria-checked:border-selected aria-checked:bg-selected aria-checked:text-selected-foreground aria-pressed:border-selected aria-pressed:bg-selected aria-pressed:text-selected-foreground';

type Titles = Readonly<Record<ZoomLevel, string>>;

export interface ToolbarProps {
  readonly words: Words;
  readonly tabs: Readonly<Record<ViewId, Definition>>;
  readonly state: Pick<ExplorableState, 'view' | 'level' | 'scenario' | 'cell' | 'layers'>;
  readonly scenarios: readonly { readonly id: string; readonly name: string }[];
  readonly controls: ControlMap;
  readonly titles: Titles;
  readonly onView: (view: ViewId) => void;
  readonly onScenario: (scenario: string) => void;
  readonly onZoom: (level: ZoomLevel) => void;
  readonly onLayer: (layer: Layer) => void;
  readonly onShowAll?: () => void;
  readonly onReset?: () => void;
  readonly unfilled?: readonly Layer[];
}

function Tip({ label, children }: { readonly label: string; readonly children: ReactNode }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

type ItemProps = Omit<ComponentProps<typeof ToggleGroupItem>, 'aria-label'> & {
  readonly tip: string;
};

function Item({ tip, className, children, ...rest }: ItemProps) {
  return (
    <Tip label={tip}>
      <ToggleGroupItem
        aria-label={tip}
        className={cn(ON_BY_ARIA_SINCE_TOOLTIP_OVERWRITES_DATA_STATE, className)}
        {...rest}
      >
        {children}
      </ToggleGroupItem>
    </Tip>
  );
}

function IconButton({ tip, children, ...rest }: Omit<ComponentProps<typeof Button>, 'aria-label'> & { tip: string }) {
  return (
    <Tip label={tip}>
      <Button type="button" variant="ghost" size="icon" aria-label={tip} className="size-8 rounded-full" {...rest}>
        {children}
      </Button>
    </Tip>
  );
}

function DefineTabs({ words, tabs, state, onView }: ToolbarProps) {
  return (
    <ToggleGroup
      type="single"
      aria-label={words.chrome.views}
      className={GROUP}
      value={state.level === 'define' ? state.view : ''}
      onValueChange={(view) => view !== '' && onView(view as ViewId)}
    >
      {TAB_ORDER.map((id) => (
        <Item key={id} value={id} tip={tabs[id].words.title} data-view-go={id}>
          {tabs[id].acronym}
        </Item>
      ))}
    </ToggleGroup>
  );
}

function ZoomTabs({ words, titles, state, onZoom }: ToolbarProps) {
  const label = { agent: words.chrome.agent, workflow: words.chrome.workflow };
  return (
    <ToggleGroup
      type="single"
      aria-label={words.chrome.zoom}
      data-zoom
      className={GROUP}
      value={state.level === 'define' ? '' : state.level}
      onValueChange={(level) => level !== '' && onZoom(level as ZoomLevel)}
    >
      {ZOOM_LEVELS.map((level) => (
        <Item key={level} value={level} tip={titles[level]} data-zoom-go={level}>
          {label[level]}
        </Item>
      ))}
    </ToggleGroup>
  );
}

function LayerToggles({ words, state, onLayer, layers }: ToolbarProps & { readonly layers: readonly Layer[] }) {
  return (
    <ToggleGroup
      type="multiple"
      data-layers
      className={GROUP}
      value={layers.filter((layer) => hasLayer(state, layer))}
      onValueChange={() => undefined}
    >
      {layers.map((layer) => (
        <Item
          key={layer}
          value={layer}
          tip={words.layers[layer]}
          data-layer-go={layer}
          className="group"
          onClick={() => onLayer(layer)}
        >
          <span
            aria-hidden="true"
            className="size-2.5 shrink-0 rounded-[2px] border border-current group-aria-pressed:bg-current"
          />
          {words.layers[layer]}
        </Item>
      ))}
    </ToggleGroup>
  );
}

function ScenarioPicker({ words, state, scenarios, onScenario }: ToolbarProps) {
  return (
    <ToggleGroup
      type="single"
      aria-label={words.workflow.scenario}
      data-scenario-picker
      className={GROUP}
      value={state.scenario}
      onValueChange={(id) => id !== '' && onScenario(id)}
    >
      {scenarios.map(({ id, name }) => (
        <Item key={id} value={id} tip={`${words.workflow.scenario}: ${name}`} data-scenario-go={id}>
          {name}
        </Item>
      ))}
    </ToggleGroup>
  );
}

function PlayIcons({ words, state, onShowAll, onReset }: ToolbarProps) {
  const { chrome } = words;
  return (
    <>
      <IconButton tip={chrome.showAll} data-show-all onClick={onShowAll}>
        <Play aria-hidden="true" />
      </IconButton>
      <IconButton tip={state.view === 'price' ? chrome.dayOne : chrome.reset} data-reset onClick={onReset}>
        <RotateCcw aria-hidden="true" />
      </IconButton>
    </>
  );
}

function Section({ show, children }: { readonly show: boolean; readonly children: ReactNode }) {
  if (!show) return null;
  return (
    <>
      <Separator orientation="vertical" className="mx-1 my-2" />
      {children}
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
    <div role="toolbar" aria-label={props.words.chrome.define} data-toolbar className={PILL}>
      <DefineTabs {...props} />
      <Section show>
        <ZoomTabs {...props} />
      </Section>
      <Section show={tools.layers.length > 0}>
        <LayerToggles {...props} layers={tools.layers} />
      </Section>
      <Section show={tools.picker}>
        <ScenarioPicker {...props} />
      </Section>
      <Section show={props.state.level === 'define'}>
        <PlayIcons {...props} />
      </Section>
    </div>
  );
}
