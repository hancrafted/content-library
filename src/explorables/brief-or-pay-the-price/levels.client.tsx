'use client';

import { Button } from '@/shared/components/ui/button';
import type { Dispatch, ReactNode } from 'react';
import { Matrix, type MatrixHandlers } from './agent-matrix.client';
import type { MatrixData } from './brief-or-pay-the-price-data';
import type { Words } from './brief-or-pay-the-price.types';
import { CellView } from './cell-view.client';
import {
  isWiping,
  rowAt,
  type CellKey,
  type ExplorableEvent,
  type ExplorableState,
  type Level,
} from './explorable-state.pure';
import { definitionOf, rowOf, type ViewData } from './explorable-view.pure';
import { cellsIn, format, isCounter, neighbour } from './matrix-data.pure';
import type { SceneLabels } from './mirror-card.client';
import type { MirrorHandlers } from './mirror-row.client';
import { Mirror } from './mirror.client';
import { RoleStripView } from './role-strip-view';
import type { WorkflowScenario } from './scenario.types';
import { WorkflowLevel } from './workflow-level.client';

type Scenarios = Readonly<Record<string, WorkflowScenario>>;

export interface LevelProps {
  readonly data: ViewData & { readonly matrix: MatrixData; readonly scenarios: Scenarios };
  readonly state: ExplorableState;
  readonly dispatch: Dispatch<ExplorableEvent>;
  readonly handlers: MirrorHandlers;
  readonly matrixHandlers: MatrixHandlers;
  readonly labels: SceneLabels;
}

function DefineFoot({
  chrome,
  dispatch,
}: {
  readonly chrome: Words['chrome'];
  readonly dispatch: LevelProps['dispatch'];
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button type="button" size="sm" variant="outline" data-show-all onClick={() => dispatch({ type: 'showAll' })}>
        {chrome.showAll}
      </Button>
      <Button type="button" size="sm" variant="outline" data-reset onClick={() => dispatch({ type: 'reset' })}>
        {chrome.dayOne}
      </Button>
      <span className="text-caption text-muted-foreground">{chrome.caption}</span>
    </div>
  );
}

function DefineLevel({ data, state, dispatch, handlers, labels }: LevelProps) {
  const definition = definitionOf(data, state);
  return (
    <>
      <Mirror
        definition={definition}
        reads={definition.rows.map((_, index) => rowAt(state, index))}
        wiping={isWiping(state)}
        labels={labels}
        handlers={handlers}
      />
      <DefineFoot chrome={data.words.chrome} dispatch={dispatch} />
    </>
  );
}

const nodeOf = ({ data, state }: Pick<LevelProps, 'data' | 'state'>) => {
  const found = data.scenarios[state.scenario] ?? Object.values(data.scenarios)[0];
  const node = found?.scenario.nodes.find((each) => each.id === state.node) ?? null;
  return found && node ? { node, said: found.words } : null;
};

function BackToWorkflow({ label, dispatch }: { readonly label: string; readonly dispatch: LevelProps['dispatch'] }) {
  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      data-agent-back
      className="self-start"
      onClick={() => dispatch({ type: 'zoom', level: 'workflow' })}
    >
      {label}
    </Button>
  );
}

function MatrixLevel(props: LevelProps) {
  const { data, state, matrixHandlers, dispatch } = props;
  const { words, definitions, matrix } = data;
  const from = nodeOf(props);
  return (
    <>
      {from ? <BackToWorkflow label={words.matrix.backToWorkflow} dispatch={dispatch} /> : null}
      {from ? <RoleStripView words={words.matrix} node={from.node} said={from.said} /> : null}
      <Matrix
        words={words.matrix}
        traits={definitions.price.rows}
        moves={definitions.brief.rows}
        counters={matrix.counters}
        node={from?.node ?? null}
        lit={state.lit}
        handlers={matrixHandlers}
      />
      <p className="text-caption text-muted-foreground">{from ? words.matrix.nodeCaption : words.matrix.caption}</p>
    </>
  );
}

type From = NonNullable<ReturnType<typeof nodeOf>>;

function exampleOf(from: From, cell: CellKey, words: Words['matrix']) {
  const found = from.node.cells.find((each) => each.move === cell.move && each.trait === cell.trait);
  const said = found && from.said.cells[found.id];
  const text = from.said.nodes[from.node.id];
  if (!said || !text) return null;
  return { heading: format(words.inNode, text), freelancer: said.freelancer, ai: said.ai };
}

function inNode(from: From | null, cell: CellKey, words: Words) {
  if (from === null) return { crumbs: [words.chrome.agent], example: null, caption: words.matrix.cellCaption };
  return {
    crumbs: [words.chrome.workflow, from.said.nodes[from.node.id]?.label ?? from.node.id],
    example: exampleOf(from, cell, words.matrix),
    caption: words.matrix.nodeCellCaption,
  };
}

const positionOf = (cells: readonly CellKey[], cell: CellKey) => ({
  at: cells.findIndex((one) => one.move === cell.move && one.trait === cell.trait),
  of: cells.length,
});

function CellLevel({ cell, ...props }: LevelProps & { readonly cell: CellKey }) {
  const { data, state, dispatch, handlers, labels } = props;
  const { words, definitions, matrix } = data;
  const from = nodeOf(props);
  const cells = cellsIn(matrix.counters, from?.node ?? null);
  const { crumbs, example, caption } = inNode(from, cell, words);
  return (
    <>
      <CellView
        words={words.matrix}
        crumbs={crumbs}
        cell={cell}
        counter={isCounter(matrix.counters, cell)}
        example={example}
        position={positionOf(cells, cell)}
        trait={rowOf(definitions.price, cell.trait)}
        move={rowOf(definitions.brief, cell.move)}
        reads={[rowAt(state, 0), rowAt(state, 1)]}
        evidence={{ text: words.matrix.evidenceOf[cell.move], source: matrix.sources[cell.move] }}
        labels={labels}
        handlers={handlers}
        onBack={() => dispatch({ type: 'closeCell' })}
        onStep={(delta) => dispatch({ type: 'openCell', cell: neighbour(cells, cell, delta) })}
      />
      <p className="text-caption text-muted-foreground">{caption}</p>
    </>
  );
}

function AgentLevel(props: LevelProps) {
  const { cell } = props.state;
  return cell === null ? <MatrixLevel {...props} /> : <CellLevel {...props} cell={cell} />;
}

function WorkflowZoom({ data, state, dispatch }: LevelProps) {
  return (
    <WorkflowLevel
      words={data.words.workflow}
      state={state}
      counters={data.matrix.counters}
      braceRows={data.definitions.brace.rows}
      scenarios={data.scenarios}
      dispatch={dispatch}
    />
  );
}

export const LEVEL: Readonly<Record<Level, (props: LevelProps) => ReactNode>> = {
  define: (props) => <DefineLevel {...props} />,
  agent: (props) => <AgentLevel {...props} />,
  workflow: (props) => <WorkflowZoom {...props} />,
};
