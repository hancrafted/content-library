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
import { cellsOf, neighbour } from './matrix-data.pure';
import type { SceneLabels } from './mirror-card.client';
import type { MirrorHandlers } from './mirror-row.client';
import { Mirror } from './mirror.client';

export interface LevelProps {
  readonly data: ViewData & { readonly matrix: MatrixData };
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

function MatrixLevel({ data, state, matrixHandlers }: LevelProps) {
  const { words, definitions, matrix } = data;
  return (
    <>
      <Matrix
        words={words.matrix}
        traits={definitions.price.rows}
        moves={definitions.brief.rows}
        counters={matrix.counters}
        lit={state.lit}
        arrival={state.arrival}
        handlers={matrixHandlers}
      />
      <p className="text-caption text-muted-foreground">{words.matrix.caption}</p>
    </>
  );
}

function CellLevel({ cell, ...props }: LevelProps & { readonly cell: CellKey }) {
  const { data, state, dispatch, handlers, labels } = props;
  const { words, definitions, matrix } = data;
  const cells = cellsOf(matrix.counters);
  return (
    <>
      <CellView
        words={words.matrix}
        agent={words.chrome.agent}
        cell={cell}
        position={{
          at: cells.findIndex((one) => one.move === cell.move && one.trait === cell.trait),
          of: cells.length,
        }}
        trait={rowOf(definitions.price, cell.trait)}
        move={rowOf(definitions.brief, cell.move)}
        reads={[rowAt(state, 0), rowAt(state, 1)]}
        evidence={{ text: words.matrix.evidenceOf[cell.move], source: matrix.sources[cell.move] }}
        labels={labels}
        handlers={handlers}
        onBack={() => dispatch({ type: 'closeCell' })}
        onStep={(delta) => dispatch({ type: 'openCell', cell: neighbour(cells, cell, delta) })}
      />
      <p className="text-caption text-muted-foreground">{words.matrix.cellCaption}</p>
    </>
  );
}

function AgentLevel(props: LevelProps) {
  const { cell } = props.state;
  return cell === null ? <MatrixLevel {...props} /> : <CellLevel {...props} cell={cell} />;
}

export const LEVEL: Readonly<Record<Level, (props: LevelProps) => ReactNode>> = {
  define: (props) => <DefineLevel {...props} />,
  agent: (props) => <AgentLevel {...props} />,
};
