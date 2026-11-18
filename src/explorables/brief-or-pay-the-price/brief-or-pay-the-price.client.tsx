'use client';

import { useEffect, useMemo, useReducer, useRef, type Dispatch, type RefObject } from 'react';
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
import { cellsIn } from './matrix-data.pure';
import type { WorkflowScenario } from './scenario.types';
import { Toolbar, type ToolbarProps } from './toolbar.client';
import { useCellKeys } from './use-cell-keys';
import { useCellZoom } from './use-cell-zoom';
import { useZoomFlights } from './use-zoom-flights';

export interface BriefOrPayThePriceClientProps {
  readonly words: Words;
  readonly definitions: Readonly<Record<DefinitionId, Definition>>;
  readonly stages: Readonly<Record<string, Definition>>;
  readonly scenarios: Readonly<Record<string, WorkflowScenario>>;
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

const shownOf = (scenarios: BriefOrPayThePriceClientProps['scenarios'], id: string): WorkflowScenario =>
  (scenarios[id] ?? Object.values(scenarios)[0]) as WorkflowScenario;

interface AgentInput {
  readonly state: ExplorableState;
  readonly dispatch: Dispatch<ExplorableEvent>;
  readonly container: RefObject<HTMLDivElement | null>;
  readonly data: Pick<BriefOrPayThePriceClientProps, 'matrix' | 'scenarios'>;
}

function useAgent({ state, dispatch, container, data }: AgentInput) {
  const { nodes } = shownOf(data.scenarios, state.scenario).scenario;
  const node = nodes.find((each) => each.id === state.node) ?? null;
  const cells = useMemo(() => cellsIn(data.matrix.counters, node), [data.matrix.counters, node]);
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
  return matrixHandlers;
}

interface ToolbarInput {
  readonly data: BriefOrPayThePriceClientProps;
  readonly state: ExplorableState;
  readonly dispatch: Dispatch<ExplorableEvent>;
}

function useToolbar({ data, state, dispatch }: ToolbarInput): ToolbarProps {
  const { scenarios, stages, definitions } = data;
  const picks = useMemo(
    () =>
      Object.entries(scenarios).map(([id, { scenario }]) => ({
        id,
        name: scenario.acronym ?? stages[id]?.acronym ?? id,
      })),
    [scenarios, stages],
  );
  const tabs = useMemo(
    () => ({ ...definitions, stages: stages[state.scenario] as Definition }),
    [definitions, stages, state.scenario],
  );
  const nodeLabel = shownOf(scenarios, state.scenario).words.nodes[state.node ?? '']?.label;
  return {
    words: data.words,
    tabs,
    state,
    scenarios: picks,
    title: titleOf(data, tabs, { ...state, nodeLabel }),
    onView: (view) => dispatch({ type: 'view', view }),
    onScenario: (scenario) => dispatch({ type: 'scenario', scenario }),
    onZoom: (level) => dispatch({ type: 'zoom', level }),
  };
}

export function BriefOrPayThePriceClient(props: BriefOrPayThePriceClientProps) {
  const { words } = props;
  const { state, dispatch: reduce, handlers } = useExplorable(props);
  const container = useRef<HTMLDivElement>(null);
  const shown = shownOf(props.scenarios, state.scenario);
  const dispatch = useZoomFlights({ container, state, scenario: shown.scenario, dispatch: reduce });
  const matrixHandlers = useAgent({ state, dispatch, container, data: props });
  const toolbar = useToolbar({ data: props, state, dispatch });
  const labels = useMemo(() => ({ backs: words.backs, turn: words.chrome.turn }), [words]);
  return (
    <div
      ref={container}
      data-explorable="brief-or-pay-the-price"
      data-level={state.level}
      className="@container flex w-full flex-col gap-6 text-body"
    >
      <Toolbar {...toolbar} />
      <div data-zoom-root data-agent-root={state.level === 'agent' ? '' : undefined} className="flex flex-col gap-6">
        {LEVEL[state.level]({ data: props, state, dispatch, handlers, matrixHandlers, labels })}
      </div>
    </div>
  );
}
