'use client';

import { cn } from '@/shared/lib/utils';
import type { MatrixWords, MirrorRow, MoveId, TraitId } from './brief-or-pay-the-price.types';
import type { Lit, View } from './explorable-state.pure';
import { isCounter, plain, type Counters } from './matrix-data.pure';
import { MatrixLegendView } from './matrix-legend-view';
import { ColumnHead, MatrixCell, RowHead, isOn, type MatrixHandlers } from './matrix-parts.client';
import styles from './matrix.module.css';

export type { MatrixHandlers } from './matrix-parts.client';

export interface MatrixProps {
  readonly words: MatrixWords;
  readonly traits: readonly MirrorRow[];
  readonly moves: readonly MirrorRow[];
  readonly counters: Counters;
  readonly lit: Lit | null;
  readonly arrival: View | null;
  readonly handlers: MatrixHandlers;
}

function arrivalClass(arrival: View | null): string | false {
  if (arrival === null) return false;
  const from = { price: styles.fromPrice, brief: styles.fromBrief }[arrival as 'price' | 'brief'];
  return cn(styles.assembles, from ?? styles.fromOther);
}

type PartsProps = Pick<MatrixProps, 'words' | 'traits' | 'moves' | 'lit' | 'handlers'>;

function ColumnHeads({ words, traits, lit, handlers }: PartsProps) {
  return (
    <tr>
      <td className="w-12 @3xl:w-56">
        <span aria-hidden="true" className={cn(styles.rest, 'hidden text-caption text-muted-foreground @3xl:block')}>
          {words.corner}
        </span>
      </td>
      {traits.map((trait, index) => (
        <ColumnHead
          key={trait.id}
          row={trait}
          index={index}
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
  readonly moveIndex: number;
}

function TraitCell({
  trait,
  traitIndex,
  ...props
}: MoveRowProps & { readonly trait: MirrorRow; readonly traitIndex: number }) {
  const { words, counters, move, moveIndex, lit, handlers } = props;
  const cell = { move: move.id as MoveId, trait: trait.id as TraitId };
  const names = { move: move.words.name, trait: trait.words.name };
  return (
    <MatrixCell
      cell={cell}
      filled={isCounter(counters, cell)}
      on={isOn(lit, 'move', move.id) || isOn(lit, 'trait', trait.id)}
      label={plain(words.cellName, names)}
      delay={moveIndex + traitIndex}
      handlers={handlers}
    />
  );
}

function MoveRow(props: MoveRowProps) {
  const { traits, move, moveIndex, lit, handlers } = props;
  return (
    <tr>
      <RowHead
        row={move}
        index={moveIndex}
        head={{ kind: 'move', id: move.id as MoveId }}
        on={isOn(lit, 'move', move.id)}
        handlers={handlers}
      />
      {traits.map((trait, traitIndex) => (
        <TraitCell key={trait.id} trait={trait} traitIndex={traitIndex} {...props} />
      ))}
    </tr>
  );
}

export function Matrix({ counters, arrival, ...props }: MatrixProps) {
  return (
    <div data-matrix className={cn(arrivalClass(arrival), 'flex flex-col gap-4')}>
      <table className="w-full table-fixed border-separate border-spacing-0">
        <caption className="sr-only">{props.words.corner}</caption>
        <thead>
          <ColumnHeads {...props} />
        </thead>
        <tbody>
          {props.moves.map((move, moveIndex) => (
            <MoveRow key={move.id} move={move} moveIndex={moveIndex} counters={counters} {...props} />
          ))}
        </tbody>
      </table>
      <MatrixLegendView title={props.words.legend} traits={props.traits} moves={props.moves} />
    </div>
  );
}
