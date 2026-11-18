'use client';

import { Button } from '@/shared/components/ui/button';
import { useEffect, useMemo, useReducer, type Dispatch } from 'react';
import {
  DEFINITION_IDS,
  type Definition,
  type DefinitionId,
  type ViewId,
  type Words,
} from './brief-or-pay-the-price.types';
import {
  currentMirror,
  isWiping,
  nextTimer,
  rowAt,
  start,
  step,
  type ExplorableEvent,
  type ExplorableState,
  type Side,
  type Target,
} from './explorable-state.pure';
import { Mirror } from './mirror.client';

export interface BriefOrPayThePriceClientProps {
  readonly words: Words;
  readonly definitions: Readonly<Record<DefinitionId, Definition>>;
  readonly stages: Readonly<Record<string, Definition>>;
}

const TAB_ORDER = ['price', 'brief', 'stages', 'brace'] as const satisfies readonly ViewId[];

const rowCounts = ({ definitions, stages }: Pick<BriefOrPayThePriceClientProps, 'definitions' | 'stages'>) => ({
  ...Object.fromEntries(DEFINITION_IDS.map((id) => [id, definitions[id].rows.length])),
  ...Object.fromEntries(Object.entries(stages).map(([id, each]) => [`stages:${id}`, each.rows.length])),
});

const definitionOf = (
  { definitions, stages }: Pick<BriefOrPayThePriceClientProps, 'definitions' | 'stages'>,
  state: Pick<ExplorableState, 'view' | 'scenario'>,
): Definition => (state.view === 'stages' ? (stages[state.scenario] as Definition) : definitions[state.view]);

function useDismiss(open: Target | null, dispatch: Dispatch<ExplorableEvent>) {
  useEffect(() => {
    if (open === null) return;
    const dismiss = () => dispatch({ type: 'dismiss' });
    const onKey = (keyEvent: KeyboardEvent) => keyEvent.key === 'Escape' && dismiss();
    document.addEventListener('click', dismiss);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('click', dismiss);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, dispatch]);
}

function useExplorable(data: Pick<BriefOrPayThePriceClientProps, 'definitions' | 'stages'>) {
  const [state, dispatch] = useReducer(step, data, (own) => start(rowCounts(own), Object.keys(own.stages)[0]));
  const { open, blank, rows } = currentMirror(state);
  const pass = open === null || open === 'closing' ? 0 : (rows[open]?.passes ?? 0);
  const beats = definitionOf(data, state).rows.map((row) => row.beatMilliseconds);
  useEffect(() => {
    const timer = nextTimer({ open, blank }, beats);
    if (timer === null) return;
    const id = window.setTimeout(() => dispatch(timer.event), timer.milliseconds);
    return () => window.clearTimeout(id);
  }, [open, blank, pass]);
  useDismiss(open, dispatch);
  const handlers = useMemo(
    () => ({
      onOpen: (target: Target) => dispatch({ type: 'open', target }),
      onLeave: (target: Target) => dispatch({ type: 'leave', target }),
      onTurn: (row: number, side: Side) => dispatch({ type: 'turn', row, side }),
    }),
    [dispatch],
  );
  return { state, dispatch, handlers };
}

function ViewButton({
  view,
  definition,
  pressed,
  onView,
}: {
  readonly view: ViewId;
  readonly definition: Definition;
  readonly pressed: boolean;
  readonly onView: (view: ViewId) => void;
}) {
  return (
    <Button
      type="button"
      size="sm"
      variant={pressed ? 'default' : 'outline'}
      aria-pressed={pressed}
      data-view-go={view}
      onClick={() => onView(view)}
    >
      {definition.acronym}
    </Button>
  );
}

interface DefineBarProps {
  readonly words: Words;
  readonly tabs: Readonly<Record<ViewId, Definition>>;
  readonly view: ViewId;
  readonly onView: (view: ViewId) => void;
}

function DefineBar({ words, tabs, view, onView }: DefineBarProps) {
  const { chrome } = words;
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
      <div role="group" aria-label={chrome.views} className="flex flex-wrap items-center gap-2">
        <span className="text-caption font-semibold tracking-wide text-muted-foreground uppercase">
          {chrome.define}
        </span>
        {TAB_ORDER.map((id) => (
          <ViewButton key={id} view={id} definition={tabs[id]} pressed={view === id} onView={onView} />
        ))}
      </div>
      <p data-mirror-title className="text-body font-semibold">
        {tabs[view].words.title}
      </p>
    </div>
  );
}

function Foot({
  chrome,
  onShowAll,
  onReset,
}: {
  readonly chrome: Words['chrome'];
  readonly onShowAll: () => void;
  readonly onReset: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button type="button" size="sm" variant="outline" data-show-all onClick={onShowAll}>
        {chrome.showAll}
      </Button>
      <Button type="button" size="sm" variant="outline" data-reset onClick={onReset}>
        {chrome.dayOne}
      </Button>
      <span className="text-caption text-muted-foreground">{chrome.caption}</span>
    </div>
  );
}

export function BriefOrPayThePriceClient({ words, definitions, stages }: BriefOrPayThePriceClientProps) {
  const { state, dispatch, handlers } = useExplorable({ definitions, stages });
  const definition = definitionOf({ definitions, stages }, state);
  const tabs = useMemo(
    () => ({ ...definitions, stages: stages[state.scenario] as Definition }),
    [definitions, stages, state.scenario],
  );
  const labels = useMemo(() => ({ backs: words.backs, turn: words.chrome.turn }), [words]);
  return (
    <div data-explorable="brief-or-pay-the-price" className="@container flex w-full flex-col gap-6 text-body">
      <DefineBar words={words} tabs={tabs} view={state.view} onView={(view) => dispatch({ type: 'view', view })} />
      <Mirror
        definition={definition}
        reads={definition.rows.map((_, index) => rowAt(state, index))}
        wiping={isWiping(state)}
        labels={labels}
        handlers={handlers}
      />
      <Foot
        chrome={words.chrome}
        onShowAll={() => dispatch({ type: 'showAll' })}
        onReset={() => dispatch({ type: 'reset' })}
      />
    </div>
  );
}
