'use client';

import type { Dispatch, KeyboardEvent, MouseEvent } from 'react';
import type { Definition, MirrorRow, MoveId, TraitId, Words } from './brief-or-pay-the-price.types';
import type { ExplorableEvent, ExplorableState } from './explorable-state.pure';
import type { Counters } from './matrix-data.pure';
import { isCounter } from './matrix-data.pure';
import type { ScenarioLocale } from './scenario.types';
import { SCENARIO_IDS, allScenarios, scenarioFor, type ScenarioId } from './scenarios';
import { WorkflowControls } from './workflow-controls.client';
import { WorkflowView } from './workflow-view';

export interface WorkflowLevelProps {
  readonly words: Words['workflow'];
  readonly locale: ScenarioLocale;
  readonly state: ExplorableState;
  readonly counters: Counters;
  readonly braceRows: readonly MirrorRow[];
  readonly stages: Readonly<Record<string, Definition>>;
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

const scenarioOf = (id: string) =>
  scenarioFor((SCENARIO_IDS.includes(id as ScenarioId) ? id : SCENARIO_IDS[0]) as ScenarioId);

export function WorkflowLevel({ words, locale, state, counters, braceRows, stages, dispatch }: WorkflowLevelProps) {
  const scenario = scenarioOf(state.scenario);
  const scenarios = allScenarios().map(({ id, acronym }) => ({ id, name: acronym ?? stages[id]?.acronym ?? id }));
  const shared = {
    scenario,
    words: scenario.i18n[locale],
    ui: words,
    step: state.step,
    counters: (move: MoveId, trait: TraitId) => isCounter(counters, { move, trait }),
  };
  return (
    <>
      <WorkflowControls words={words} state={state} scenarios={scenarios} braceRows={braceRows} dispatch={dispatch} />
      <div data-workflow-root role="presentation" {...nodeHandlers(dispatch)}>
        <div className="@3xl:hidden">
          <WorkflowView {...shared} layout={scenario.layouts.vertical} />
        </div>
        <div className="hidden @3xl:block">
          <WorkflowView {...shared} layout={scenario.layouts.horizontal} />
        </div>
      </div>
    </>
  );
}
