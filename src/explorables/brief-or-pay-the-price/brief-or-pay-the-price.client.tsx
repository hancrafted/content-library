'use client';

import { Button } from '@/shared/components/ui/button';
import { useEffect, useMemo, useReducer, type Dispatch } from 'react';
import { DEFINITION_IDS, type Definition, type DefinitionId, type Words } from './brief-or-pay-the-price.types';
import {
  currentMirror,
  isWiping,
  nextTimer,
  rowAt,
  start,
  step,
  type ExplorableEvent,
  type Side,
  type Target,
} from './explorable-state.pure';
import { Mirror } from './mirror.client';

export interface BriefOrPayThePriceClientProps {
  readonly words: Words;
  readonly definitions: Readonly<Record<DefinitionId, Definition>>;
}

const rowCounts = (definitions: BriefOrPayThePriceClientProps['definitions']) =>
  Object.fromEntries(DEFINITION_IDS.map((id) => [id, definitions[id].rows.length])) as Record<DefinitionId, number>;

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

function useExplorable({ definitions }: Pick<BriefOrPayThePriceClientProps, 'definitions'>) {
  const [state, dispatch] = useReducer(step, definitions, (own) => start(rowCounts(own)));
  const { open, blank, rows } = currentMirror(state);
  const pass = open === null || open === 'closing' ? 0 : (rows[open]?.passes ?? 0);
  const beats = definitions[state.view].rows.map((row) => row.beatMilliseconds);
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
  definition,
  pressed,
  onView,
}: {
  readonly definition: Definition;
  readonly pressed: boolean;
  readonly onView: (view: DefinitionId) => void;
}) {
  return (
    <Button
      type="button"
      size="sm"
      variant={pressed ? 'default' : 'outline'}
      aria-pressed={pressed}
      data-view-go={definition.id}
      onClick={() => onView(definition.id)}
    >
      {definition.acronym}
    </Button>
  );
}

function DefineBar({
  words,
  definitions,
  view,
  onView,
}: Pick<BriefOrPayThePriceClientProps, 'words' | 'definitions'> & {
  readonly view: DefinitionId;
  readonly onView: (view: DefinitionId) => void;
}) {
  const { chrome } = words;
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
      <div role="group" aria-label={chrome.views} className="flex flex-wrap items-center gap-2">
        <span className="text-caption font-semibold tracking-wide text-muted-foreground uppercase">
          {chrome.define}
        </span>
        {DEFINITION_IDS.map((id) => (
          <ViewButton key={id} definition={definitions[id]} pressed={view === id} onView={onView} />
        ))}
      </div>
      <p data-mirror-title className="text-body font-semibold">
        {definitions[view].words.title}
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

export function BriefOrPayThePriceClient({ words, definitions }: BriefOrPayThePriceClientProps) {
  const { state, dispatch, handlers } = useExplorable({ definitions });
  const definition = definitions[state.view];
  return (
    <div data-explorable="brief-or-pay-the-price" className="@container flex w-full flex-col gap-6 text-body">
      <DefineBar
        words={words}
        definitions={definitions}
        view={state.view}
        onView={(view) => dispatch({ type: 'view', view })}
      />
      <Mirror
        definition={definition}
        reads={definition.rows.map((_, index) => rowAt(state, index))}
        wiping={isWiping(state)}
        labels={{ backs: words.backs, turn: words.chrome.turn }}
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
