'use client';

import type { MatrixWords, MirrorRow, MoveId, TraitId } from './brief-or-pay-the-price.types';
import type { Lit } from './explorable-state.pure';
import { markOf, plain, type CellMark, type Counters } from './matrix-data.pure';
import { MatrixLegendView } from './matrix-legend-view';
import { ColumnHead, MatrixCell, RowHead, isOn, type MatrixHandlers } from './matrix-parts.client';
import type { ScenarioNode } from './scenario.types';

export type { MatrixHandlers } from './matrix-parts.client';

export interface MatrixProps {
  readonly words: MatrixWords;
  readonly traits: readonly MirrorRow[];
  readonly moves: readonly MirrorRow[];
  readonly counters: Counters;
  readonly lit: Lit | null;
  readonly node?: ScenarioNode | null;
  readonly handlers: MatrixHandlers;
}

type PartsProps = Pick<MatrixProps, 'words' | 'traits' | 'moves' | 'lit' | 'handlers'> & {
  readonly node: ScenarioNode | null;
};

function ColumnHeads({ words, traits, lit, handlers, node }: PartsProps) {
  return (
    <tr>
      <td className="w-12 @3xl:w-56">
        <span aria-hidden="true" data-head-rest className="hidden text-caption text-muted-foreground @3xl:block">
          {node === null ? words.corner : words.nodeCorner}
        </span>
      </td>
      {traits.map((trait) => (
        <ColumnHead
          key={trait.id}
          row={trait}
          head={{ kind: 'trait', id: trait.id as TraitId }}
          on={isOn(lit, 'trait', trait.id)}
          handlers={handlers}
        />
      ))}
    </tr>
  );
}

interface MoveRowProps extends PartsProps {
  readonly counters: Counters;
  readonly move: MirrorRow;
}

const labelOf = (words: MatrixWords, mark: CellMark): string =>
  ({ on: words.cellName, dim: words.cellName, mark: words.cellNameMarked, context: words.cellNameContext, none: '' })[
    mark
  ];

function TraitCell({ trait, ...props }: MoveRowProps & { readonly trait: MirrorRow }) {
  const { words, counters, move, lit, handlers, node } = props;
  const cell = { move: move.id as MoveId, trait: trait.id as TraitId };
  const mark = markOf(counters, node, cell);
  return (
    <MatrixCell
      cell={cell}
      mark={mark}
      on={isOn(lit, 'move', move.id) || isOn(lit, 'trait', trait.id)}
      label={plain(labelOf(words, mark), { move: move.words.name, trait: trait.words.name })}
      contextLabel={words.ctxLabel}
      handlers={handlers}
    />
  );
}

function MoveRow(props: MoveRowProps) {
  const { traits, move, lit, handlers } = props;
  return (
    <tr>
      <RowHead
        row={move}
        head={{ kind: 'move', id: move.id as MoveId }}
        on={isOn(lit, 'move', move.id)}
        handlers={handlers}
      />
      {traits.map((trait) => (
        <TraitCell key={trait.id} trait={trait} {...props} />
      ))}
    </tr>
  );
}

export function Matrix({ counters, node = null, ...props }: MatrixProps) {
  return (
    <div data-matrix data-from-node={node?.id} className="flex flex-col gap-4">
      <table className="w-full table-fixed border-separate border-spacing-0">
        <caption className="sr-only">{node === null ? props.words.corner : props.words.nodeCorner}</caption>
        <thead>
          <ColumnHeads {...props} node={node} />
        </thead>
        <tbody>
          {props.moves.map((move) => (
            <MoveRow key={move.id} move={move} counters={counters} node={node} {...props} />
          ))}
        </tbody>
      </table>
      <MatrixLegendView title={props.words.legend} traits={props.traits} moves={props.moves} />
    </div>
  );
}
