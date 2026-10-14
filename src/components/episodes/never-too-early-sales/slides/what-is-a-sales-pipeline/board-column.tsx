import { clsx } from 'clsx';
import type { CSSProperties, ReactNode } from 'react';
import { BoardNote } from './board-note';
import styles from './what-is-a-sales-pipeline.module.css';

interface BoardColumnProps {
  label: string;
  caption: string;
  tells: ReactNode;
  /** Entrance order, left to right. */
  step: number;
  children: ReactNode;
  'data-target'?: string;
}

const COLUMN = clsx(
  styles.column,
  'flex min-w-0 flex-col gap-4 rounded-lg border border-border bg-muted/40 p-4',
  '@xl:grid @xl:grid-cols-[minmax(0,14rem)_minmax(0,1fr)] @xl:items-start @3xl:flex @3xl:items-stretch',
);

/**
 * One column of the pipeline board: a header chip, a drawing of what it
 * counts, one plain sentence, and the note naming what it tells you. From a
 * 576px Foreground the drawing sits left of the text; from 768px the columns
 * stand side by side. Server only, plain props.
 */
export function BoardColumn({ label, caption, tells, step, children, ...rest }: BoardColumnProps) {
  return (
    <li data-target={rest['data-target']} style={{ '--step': step } as CSSProperties} className={COLUMN}>
      <h4 className="text-body font-semibold text-foreground @xl:col-span-2">{label}</h4>
      <div aria-hidden="true" className="min-w-0">
        {children}
      </div>
      <div className="flex min-w-0 flex-col gap-4">
        <p className="text-body text-muted-foreground">{caption}</p>
        <BoardNote className="text-body">{tells}</BoardNote>
      </div>
    </li>
  );
}
