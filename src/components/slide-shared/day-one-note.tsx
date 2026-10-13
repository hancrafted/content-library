import { cn } from '@/lib/utils';
import type { CSSProperties, ReactNode } from 'react';

interface DayOneNoteRow {
  id: string;
  term: string;
  text: ReactNode;
  marker?: ReactNode;
  className?: string;
}

interface DayOneNoteProps {
  label: ReactNode;
  rows: readonly DayOneNoteRow[];
  rowClassName?: string;
  className?: string;
  'data-target'?: string;
  /** Drawn on the paper after the label, for a note that is not rows of a term and its text (a stepper's `<ol>`). */
  children?: ReactNode;
}

// One line of the note: the term, its text and, when set, a marker; its index as `--i` for a Slide's stagger.
function NoteRow({ row, index, className }: { row: DayOneNoteRow; index: number; className?: string }) {
  return (
    <div
      style={{ '--i': index } as CSSProperties}
      className={cn(
        'grid grid-cols-1 gap-x-6 gap-y-1 py-3 sm:grid-cols-[8rem_1fr_auto] sm:items-baseline',
        className,
        row.className,
      )}
    >
      <dt className="text-caption text-muted-foreground">{row.term}</dt>
      <dd className="text-body text-foreground">{row.text}</dd>
      {row.marker !== undefined && <dd>{row.marker}</dd>}
    </div>
  );
}

/**
 * The day-one note: a plain written page, a label over rows of a term and its text, with an optional marker beside a
 * row. The Episode's recurring object (the brief, the plan, the note before you type), drawn the same on every Slide.
 * Each row carries its index as `--i` for a Slide's own stagger; the note itself has no motion. Children follow the
 * label, and with no rows the term list is left out, so a note can hold content that cannot sit in a `<dl>`.
 * Shared by every Slide of an Episode that shows the note (FE-007: promoted once a second Slide needed it).
 */
export function DayOneNote({
  label,
  rows,
  rowClassName,
  className,
  'data-target': dataTarget,
  children,
}: DayOneNoteProps) {
  return (
    <figure data-target={dataTarget} className={cn('rounded-lg border border-border bg-card p-6 md:p-8', className)}>
      <figcaption className="text-caption font-medium text-muted-foreground">{label}</figcaption>
      {children}
      {rows.length > 0 && (
        <dl className="mt-4 divide-y divide-border">
          {rows.map((row, index) => (
            <NoteRow key={row.id} row={row} index={index} className={rowClassName} />
          ))}
        </dl>
      )}
    </figure>
  );
}
