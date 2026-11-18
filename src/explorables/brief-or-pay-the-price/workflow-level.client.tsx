'use client';

import type { Dispatch, KeyboardEvent, MouseEvent } from 'react';
import type { MirrorRow, MoveId, TraitId, Words } from './brief-or-pay-the-price.types';
import type { ExplorableEvent, ExplorableState } from './explorable-state.pure';
import type { Counters } from './matrix-data.pure';
import { isCounter } from './matrix-data.pure';
import type { WorkflowScenario } from './scenario.types';
import { WorkflowControls } from './workflow-controls.client';
import { WorkflowView } from './workflow-view';

export interface WorkflowLevelProps {
  readonly words: Words['workflow'];
  readonly state: ExplorableState;
  readonly counters: Counters;
  readonly braceRows: readonly MirrorRow[];
  readonly scenarios: Readonly<Record<string, WorkflowScenario>>;
  readonly dispatch: Dispatch<ExplorableEvent>;
}

const nodeOf = (target: EventTarget): string | undefined =>
  (target as Element).closest('[data-node]')?.getAttribute('data-node') ?? undefined;

const NODE_KEYS = new Set(['Enter', ' ']);

function nodeHandlers(dispatch: Dispatch<ExplorableEvent>) {
  const select = (node: string | undefined) => node !== undefined && dispatch({ type: 'node', node });
  return {
    onClick: (event: MouseEvent) => select(nodeOf(event.target)),
    onKeyDown: (event: KeyboardEvent) => {
      const node = NODE_KEYS.has(event.key) ? nodeOf(event.target) : undefined;
      if (node === undefined) return;
      event.preventDefault();
      select(node);
    },
  };
}

export function WorkflowLevel({ words, state, counters, braceRows, scenarios, dispatch }: WorkflowLevelProps) {
  const { scenario, words: scenarioWords } = (scenarios[state.scenario] ??
    Object.values(scenarios)[0]) as WorkflowScenario;
  const shared = {
    scenario,
    words: scenarioWords,
    ui: words,
    step: state.braceStep,
    counters: (move: MoveId, trait: TraitId) => isCounter(counters, { move, trait }),
  };
  return (
    <>
      <div data-workflow-root role="presentation" {...nodeHandlers(dispatch)}>
        <div className="@3xl:hidden">
          <WorkflowView {...shared} layout={scenario.layouts.vertical} />
        </div>
        <div className="hidden @3xl:block">
          <WorkflowView {...shared} layout={scenario.layouts.horizontal} />
        </div>
      </div>
      <WorkflowControls words={words} state={state} braceRows={braceRows} dispatch={dispatch} />
    </>
  );
}
