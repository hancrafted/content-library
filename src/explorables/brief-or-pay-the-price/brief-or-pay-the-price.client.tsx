'use client';

import { useEffect, useMemo, useReducer, useRef, type Dispatch } from 'react';
import type { MatrixData } from './brief-or-pay-the-price-data';
import type { Definition, DefinitionId, Words } from './brief-or-pay-the-price.types';
import {
  currentMirror,
  nextTimer,
  start,
  step,
  type ExplorableEvent,
  type ExplorableState,
  type Lit,
  type Side,
  type Target,
} from './explorable-state.pure';
import { beatsOf, rowCounts, titleOf } from './explorable-view.pure';
import { LEVEL } from './levels.client';
import { cellsOf } from './matrix-data.pure';
import { Toolbar } from './toolbar.client';
import { useCellKeys } from './use-cell-keys';
import { useCellZoom } from './use-cell-zoom';

export interface BriefOrPayThePriceClientProps {
  readonly words: Words;
  readonly definitions: Readonly<Record<DefinitionId, Definition>>;
  readonly stages: Readonly<Record<string, Definition>>;
  readonly matrix: MatrixData;
}

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

function useExplorable(data: Pick<BriefOrPayThePriceClientProps, 'definitions' | 'stages' | 'matrix'>) {
  const [state, dispatch] = useReducer(step, data, (own) => start(rowCounts(own), Object.keys(own.stages)[0]));
  const { open, blank, rows } = currentMirror(state);
  const pass = open === null || open === 'closing' ? 0 : (rows[open]?.passes ?? 0);
  const beats = beatsOf(data, state);
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

function useAgent(state: ExplorableState, dispatch: Dispatch<ExplorableEvent>, matrix: MatrixData) {
  const container = useRef<HTMLDivElement>(null);
  const cells = useMemo(() => cellsOf(matrix.counters), [matrix.counters]);
  useCellKeys(state.cell, cells, dispatch);
  const onOpenCell = useCellZoom({ container, cell: state.cell, restore: state.restore, dispatch });
  const matrixHandlers = useMemo(
    () => ({
      onLight: (lit: Lit) => dispatch({ type: 'light', lit }),
      onUnlight: () => dispatch({ type: 'unlight' }),
      onOpenCell,
    }),
    [dispatch, onOpenCell],
  );
  return { container, matrixHandlers };
}

export function BriefOrPayThePriceClient(props: BriefOrPayThePriceClientProps) {
  const { words, definitions, stages, matrix } = props;
  const { state, dispatch, handlers } = useExplorable(props);
  const { container, matrixHandlers } = useAgent(state, dispatch, matrix);
  const tabs = useMemo(
    () => ({ ...definitions, stages: stages[state.scenario] as Definition }),
    [definitions, stages, state.scenario],
  );
  const labels = useMemo(() => ({ backs: words.backs, turn: words.chrome.turn }), [words]);
  return (
    <div
      ref={container}
      data-explorable="brief-or-pay-the-price"
      data-level={state.level}
      className="@container flex w-full flex-col gap-6 text-body"
    >
      <Toolbar
        words={words}
        tabs={tabs}
        state={state}
        title={titleOf(props, tabs, state)}
        onView={(view) => dispatch({ type: 'view', view })}
        onZoom={(zoom) => dispatch({ type: 'zoom', level: zoom })}
      />
      <div data-agent-root={state.level === 'agent' ? '' : undefined} className="flex flex-col gap-6">
        {LEVEL[state.level]({ data: props, state, dispatch, handlers, matrixHandlers, labels })}
      </div>
    </div>
  );
}
