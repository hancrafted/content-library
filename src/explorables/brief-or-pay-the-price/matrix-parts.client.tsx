'use client';

import { cn } from '@/shared/lib/utils';
import { memo } from 'react';
import type { MirrorRow, MoveId, TraitId } from './brief-or-pay-the-price.types';
import type { CellKey, Lit } from './explorable-state.pure';
import type { CellMark } from './matrix-data.pure';
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
  before.row === after.row && before.on === after.on && before.handlers === after.handlers;

// decision: FE-012 §4.2
export const ColumnHead = memo(function ColumnHead({ row, head, on, handlers }: HeadProps) {
  return (
    <th
      scope="col"
      data-trait={head.id}
      {...headHandlers(handlers, head)}
      className={cn('p-1 align-bottom font-normal', on && LIT)}
    >
      <span className="flex flex-col items-center gap-0.5 text-center">
        <span translate="no" data-head-letter="column" className="inline-block text-heading leading-none font-semibold">
          {row.letter}
        </span>
        <span data-head-rest className="flex flex-col items-center">
          <HeadNames row={row} />
        </span>
      </span>
    </th>
  );
}, sameHead);

// decision: FE-012 §4.2
export const RowHead = memo(function RowHead({ row, head, on, handlers }: HeadProps) {
  return (
    <th
      scope="row"
      data-move={head.id}
      {...headHandlers(handlers, head)}
      className={cn('p-1 text-left align-middle font-normal', on && LIT)}
    >
      <span className="flex items-center gap-2">
        <span
          translate="no"
          data-head-letter="row"
          className="inline-block text-heading leading-none font-semibold text-ai"
        >
          {row.letter}
        </span>
        <span data-head-rest className="flex flex-col">
          <HeadNames row={row} />
        </span>
      </span>
    </th>
  );
}, sameHead);

interface CellProps {
  readonly cell: CellKey;
  readonly mark: CellMark;
  readonly on: boolean;
  readonly label: string;
  readonly contextLabel: string;
  readonly handlers: MatrixHandlers;
}

const sameCell = (before: CellProps, after: CellProps): boolean =>
  before.cell.move === after.cell.move &&
  before.cell.trait === after.cell.trait &&
  before.mark === after.mark &&
  before.on === after.on &&
  before.label === after.label &&
  before.contextLabel === after.contextLabel &&
  before.handlers === after.handlers;

const BUTTON_BASE =
  'mx-auto flex min-h-11 w-11 touch-manipulation flex-col items-center justify-center gap-0.5 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring @3xl:w-auto @3xl:min-w-11 @3xl:px-2';

const BUTTON: Readonly<Record<Exclude<CellMark, 'none'>, string>> = {
  on: 'bg-ai/20 hover:bg-ai/35',
  mark: 'bg-ai/40 ring-2 ring-ai hover:bg-ai/55',
  dim: 'bg-ai/10 opacity-50 hover:opacity-100',
  context: 'border-2 border-dashed border-ai hover:bg-ai/10',
};

const DOT: Readonly<Record<Exclude<CellMark, 'none'>, string>> = {
  on: 'bg-ai',
  mark: 'bg-ai',
  dim: 'bg-ai/60',
  context: 'ring-2 ring-ai',
};

function CellButton({
  cell,
  mark,
  label,
  contextLabel,
  handlers,
}: Omit<CellProps, 'on'> & { mark: Exclude<CellMark, 'none'> }) {
  return (
    <button
      type="button"
      data-cell={`${cell.move}|${cell.trait}`}
      data-mark={mark}
      aria-label={label}
      onClick={(event) => {
        event.stopPropagation();
        handlers.onOpenCell(cell, event.currentTarget);
      }}
      className={cn(styles.cellButton, BUTTON_BASE, BUTTON[mark])}
    >
      <span data-dot className={cn('size-3 rounded-full', DOT[mark])} />
      {mark === 'context' ? (
        <span data-context-label className="hidden text-caption leading-tight text-ai @3xl:block">
          {contextLabel}
        </span>
      ) : null}
    </button>
  );
}

// decision: FE-012 §4.2
export const MatrixCell = memo(function MatrixCell({ mark, on, ...rest }: CellProps) {
  return (
    <td data-move={rest.cell.move} data-trait={rest.cell.trait} className={cn('p-1 text-center', on && LIT)}>
      {mark === 'none' ? (
        <span aria-hidden="true" className="mx-auto block size-11" />
      ) : (
        <CellButton mark={mark} {...rest} />
      )}
    </td>
  );
}, sameCell);

export const isOn = (lit: Lit | null, kind: Lit['kind'], id: string): boolean => lit?.kind === kind && lit.id === id;
