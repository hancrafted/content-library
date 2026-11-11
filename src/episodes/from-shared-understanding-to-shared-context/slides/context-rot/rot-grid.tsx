import { BenchVignette, type MessId } from '@/episodes/components/slide-shared/bike-bench/bench-vignette';
import { cn } from '@/shared/lib/utils';
import type { ReactNode } from 'react';

export interface RotColumn {
  readonly label: string;
  readonly term: string;
  readonly marker?: ReactNode;
  readonly target?: { 'data-target': string };
}

export interface RotRow {
  readonly label: string;
  readonly when: string;
  /** `strong` edges the dynamic row in full `machine`, `faint` the static one in `machine/40`. */
  readonly edge: 'strong' | 'faint';
  readonly target?: { 'data-target': string };
  readonly cells: readonly { mess: MessId; text: string; marker?: ReactNode }[];
}

/** The tilt each cell's card takes, by row and column, so the cells read as pinned up by hand. */
const TILT = [
  ['-rotate-1', 'rotate-1', '', '-rotate-1'],
  ['rotate-1', '', '-rotate-1', '-rotate-1'],
];

/** One mess at the bench: its vignette and its plain label, the column's label repeated above it on a phone. */
function Cell({ column, cell, tilt }: { column: RotColumn; cell: RotRow['cells'][number]; tilt: string }) {
  return (
    <div
      data-cell={cell.mess}
      className={cn(
        'focus-group__item card-hover card-hover--raise flex flex-col gap-2 rounded-lg bg-card p-3 shadow-md',
        tilt,
      )}
    >
      <p className="flex items-center gap-1 text-caption font-semibold @3xl:hidden">
        {column.label} · <span className="font-normal text-muted-foreground">{column.term}</span>
        {column.marker}
      </p>
      <div className="rounded-md bg-muted p-1">
        <BenchVignette id={cell.mess} label={cell.text} />
      </div>
      <p className="flex items-start justify-between gap-1 text-caption font-medium">
        {cell.text}
        {cell.marker}
      </p>
    </div>
  );
}

/** The header row: the names' credit, then the four plain mess labels with their terms, from the `3xl` width. */
function Header({ credit, columns }: { credit: ReactNode; columns: readonly RotColumn[] }) {
  return (
    <div className="grid gap-4 @3xl:grid-cols-12">
      <div className="flex items-end pb-2 @3xl:col-span-2">{credit}</div>
      <div className="hidden grid-cols-4 gap-4 px-1 @3xl:col-span-10 @3xl:grid">
        {columns.map((column) => (
          <div key={column.term} {...column.target} className="flex flex-col gap-1 border-b-2 border-(--warning) pb-2">
            <p className="inline-flex items-center gap-1 text-body font-semibold">
              {column.label}
              {column.marker}
            </p>
            <p className="text-caption text-muted-foreground">{column.term}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/** One row: its label and when it lands, edged in `machine`, then its four cells. */
function Row({ row, rowIndex, columns }: { row: RotRow; rowIndex: number; columns: readonly RotColumn[] }) {
  return (
    <div {...row.target} className="grid gap-4 @3xl:grid-cols-12">
      <div
        className={cn(
          'flex flex-col justify-center gap-1 border-l-4 pl-3 @3xl:col-span-2 @3xl:border-r-4 @3xl:border-l-0 @3xl:pr-3 @3xl:pl-0',
          row.edge === 'strong' ? 'border-machine' : 'border-machine/40',
        )}
      >
        <p className="text-body font-semibold">{row.label}</p>
        <p className="text-caption text-muted-foreground">{row.when}</p>
      </div>
      <div className="grid gap-4 p-1 @xl:grid-cols-2 @3xl:col-span-10 @3xl:grid-cols-4">
        {row.cells.map((cell, index) => (
          <Cell
            key={cell.mess}
            column={columns[index] ?? { label: '', term: '' }}
            cell={cell}
            tilt={TILT[rowIndex]?.[index] ?? ''}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * The rot grid: four plain mess labels across, each with its term as a small caption, static and dynamic down, each
 * cell a bench vignette with its mess in `warning`. A row header plus four equal columns; below the `3xl` container
 * width one column per row, the column label repeated in each cell. Hovering a cell dims the others.
 */
export function RotGrid(props: { credit: ReactNode; columns: readonly RotColumn[]; rows: readonly RotRow[] }) {
  return (
    <div className="flex flex-col gap-3 rounded-xl bg-muted p-4 shadow-md @3xl:p-6">
      <Header credit={props.credit} columns={props.columns} />
      <div className="focus-group focus-group--dim-others flex flex-col gap-4">
        {props.rows.map((row, rowIndex) => (
          <Row key={row.label} row={row} rowIndex={rowIndex} columns={props.columns} />
        ))}
      </div>
    </div>
  );
}
