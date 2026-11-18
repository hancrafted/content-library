'use client';

import { cn } from '@/shared/lib/utils';
import { memo, type CSSProperties } from 'react';
import type { MirrorRow, MoveId, TraitId } from './brief-or-pay-the-price.types';
import type { CellKey, Lit } from './explorable-state.pure';
import styles from './matrix.module.css';

export interface MatrixHandlers {
  readonly onLight: (lit: Lit) => void;
  readonly onUnlight: () => void;
  readonly onOpenCell: (cell: CellKey, button: HTMLElement) => void;
}

type Head = { readonly kind: 'move'; readonly id: MoveId } | { readonly kind: 'trait'; readonly id: TraitId };

const LIT = 'bg-ai/10';

function headHandlers({ onLight, onUnlight }: MatrixHandlers, lit: Lit) {
  return {
    onPointerEnter: () => onLight(lit),
    onPointerLeave: onUnlight,
  };
}

interface HeadProps {
  readonly row: MirrorRow;
  readonly index: number;
  readonly head: Head;
  readonly on: boolean;
  readonly handlers: MatrixHandlers;
}

function HeadNames({ row }: { readonly row: MirrorRow }) {
  const { words } = row;
  return (
    <>
      <span translate="no" className="hidden text-caption leading-tight font-semibold @3xl:block">
        {words.name}
      </span>
      {words.gloss === '' ? null : (
        <span lang="de" className="hidden text-caption leading-tight text-muted-foreground @3xl:block">
          {words.gloss}
        </span>
      )}
    </>
  );
}

const sameHead = (before: HeadProps, after: HeadProps): boolean =>
  before.row === after.row &&
  before.index === after.index &&
  before.on === after.on &&
  before.handlers === after.handlers;

// decision: FE-012 §4.2
export const ColumnHead = memo(function ColumnHead({ row, index, head, on, handlers }: HeadProps) {
  return (
    <th
      scope="col"
      data-trait={head.id}
      {...headHandlers(handlers, head)}
      style={{ '--i': index } as CSSProperties}
      className={cn('p-1 align-bottom font-normal', on && LIT)}
    >
      <span className="flex flex-col items-center gap-0.5 text-center">
        <span translate="no" className={cn(styles.letterCol, 'inline-block text-heading leading-none font-semibold')}>
          {row.letter}
        </span>
        <span className={cn(styles.rest, 'flex flex-col items-center')}>
          <HeadNames row={row} />
        </span>
      </span>
    </th>
  );
}, sameHead);

// decision: FE-012 §4.2
export const RowHead = memo(function RowHead({ row, index, head, on, handlers }: HeadProps) {
  return (
    <th
      scope="row"
      data-move={head.id}
      {...headHandlers(handlers, head)}
      style={{ '--i': index } as CSSProperties}
      className={cn('p-1 text-left align-middle font-normal', on && LIT)}
    >
      <span className="flex items-center gap-2">
        <span
          translate="no"
          className={cn(styles.letterRow, 'inline-block text-heading leading-none font-semibold text-ai')}
        >
          {row.letter}
        </span>
        <span className={cn(styles.rest, 'flex flex-col')}>
          <HeadNames row={row} />
        </span>
      </span>
    </th>
  );
}, sameHead);

interface CellProps {
  readonly cell: CellKey;
  readonly filled: boolean;
  readonly on: boolean;
  readonly label: string;
  readonly delay: number;
  readonly handlers: MatrixHandlers;
}

const sameCell = (before: CellProps, after: CellProps): boolean =>
  before.cell.move === after.cell.move &&
  before.cell.trait === after.cell.trait &&
  before.filled === after.filled &&
  before.on === after.on &&
  before.label === after.label &&
  before.handlers === after.handlers;

// decision: FE-012 §4.2
export const MatrixCell = memo(function MatrixCell({ cell, filled, on, label, delay, handlers }: CellProps) {
  return (
    <td
      data-move={cell.move}
      data-trait={cell.trait}
      className={cn('p-1 text-center', on && LIT)}
      style={{ '--d': delay } as CSSProperties}
    >
      {filled ? (
        <button
          type="button"
          data-cell={`${cell.move}|${cell.trait}`}
          aria-label={label}
          onClick={(event) => {
            event.stopPropagation();
            handlers.onOpenCell(cell, event.currentTarget);
          }}
          className={cn(
            styles.cellButton,
            'mx-auto grid size-11 touch-manipulation place-items-center rounded-lg bg-ai/20 outline-none hover:bg-ai/35 focus-visible:ring-2 focus-visible:ring-ring',
          )}
        >
          <span className={cn(styles.dot, 'size-3 rounded-full bg-ai')} />
        </button>
      ) : (
        <span aria-hidden="true" className="mx-auto block size-11" />
      )}
    </td>
  );
}, sameCell);

export const isOn = (lit: Lit | null, kind: Lit['kind'], id: string): boolean => lit?.kind === kind && lit.id === id;
