import type { TargetProps } from '@/lib/context-link.pure';
import { cn } from '@/lib/utils';
import type { CSSProperties, ReactNode } from 'react';
import styles from './board.module.css';

/** One column of a board: a pill header over its notes. */
export interface BoardColumnProps {
  slug: string;
  label: ReactNode;
  /** The column to look at: a primary ring. */
  primary?: boolean;
  /** A dashed, empty-looking column, such as a month out of reach; its notes keep full colour. */
  dashed?: boolean;
  children?: ReactNode;
}

export interface BoardProps {
  columns?: readonly BoardColumnProps[];
  /** Fixed note rows under the pill row: the columns share them through a subgrid and keep their count at every width. */
  rows?: number;
  /** The Slide's own free layout inside one surface; used only when there are no columns. */
  children?: ReactNode;
  /** Painted last, on the same grid as the columns or the surface. */
  overlay?: ReactNode;
  'aria-label'?: string;
  target?: TargetProps;
  className?: string;
}

function Column({ label, primary, dashed, children, track }: BoardColumnProps & { track?: number }) {
  return (
    <section
      data-board-column=""
      data-primary={primary ? '' : undefined}
      data-dashed={dashed ? '' : undefined}
      style={track === undefined ? undefined : { gridColumn: track }}
      className={cn(styles.column, 'rounded-lg bg-muted')}
    >
      <h4
        className={cn(styles.pill, 'rounded-full bg-foreground px-3 py-0.5 text-caption font-medium text-background')}
      >
        {label}
      </h4>
      {children}
    </section>
  );
}

/**
 * The neutral surface every board in the Episode is drawn on: columns with pill headers, or one free surface. The
 * column count is `--columns`, defaulting to the number of columns, so a Slide reflows it per breakpoint in its
 * own `className`; a board with `rows` never reflows. A server part with plain props (FE-007 §5.2).
 */
export function Board({ columns, rows, children, overlay, 'aria-label': ariaLabel, target, className }: BoardProps) {
  if (!columns) {
    return (
      <figure {...target} data-board="" aria-label={ariaLabel} className={cn(styles.board, 'grid', className)}>
        <div data-board-surface="" className="col-start-1 row-start-1 rounded-lg bg-muted p-4 sm:p-6">
          {children}
        </div>
        {overlay}
      </figure>
    );
  }
  const grid = { '--board-columns': columns.length, '--rows': rows } as CSSProperties;
  return (
    <figure
      {...target}
      data-board=""
      aria-label={ariaLabel}
      style={grid}
      className={cn(styles.board, styles.columns, rows !== undefined && styles.rows, className)}
    >
      {columns.map((column, position) => (
        // Fixed rows pin each column to its track: an overlay placed in a column's rows would otherwise push it aside.
        <Column key={column.slug} {...column} track={rows === undefined ? undefined : position + 1} />
      ))}
      {overlay}
    </figure>
  );
}
