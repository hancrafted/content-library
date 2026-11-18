'use client';

import { Button } from '@/shared/components/ui/button';
import type { Definition, ViewId, Words } from './brief-or-pay-the-price.types';
import { ZOOM_LEVELS, type ExplorableState, type ZoomLevel } from './explorable-state.pure';

export const TAB_ORDER = ['price', 'brief', 'stages', 'brace'] as const satisfies readonly ViewId[];

const ZOOM_LABEL: Readonly<Record<ZoomLevel, (chrome: Words['chrome']) => string>> = {
  agent: (chrome) => chrome.agent,
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
  readonly state: Pick<ExplorableState, 'view' | 'level'>;
  readonly title: string;
  readonly onView: (view: ViewId) => void;
  readonly onZoom: (level: ZoomLevel) => void;
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

export function Toolbar(props: ToolbarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
        <DefineTabs {...props} />
        <ZoomTabs {...props} />
      </div>
      <p data-mirror-title className="text-body font-semibold">
        {props.title}
      </p>
    </div>
  );
}
