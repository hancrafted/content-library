import type { TargetProps } from '@/lib/context-link.pure';
import { cn } from '@/lib/utils';
import type { CSSProperties, ReactNode } from 'react';
import styles from './sticky-note.module.css';

/** What a note's colour means: cash is neutral, then cost, revenue and a warning such as a zero-cash month. */
export type NoteTone = 'neutral' | 'cost' | 'revenue' | 'warning';

export interface StickyNoteProps {
  tone: NoteTone;
  /** The one thing to look at on the Slide: a primary ring. */
  primary?: boolean;
  /** Fills its grid cell and lets a line of text wrap, left-aligned; every note with `children` takes it. */
  fill?: boolean;
  label: ReactNode;
  value?: ReactNode;
  /** A rich body under the label, such as a `<ul>` or `<dl>`; the root becomes a `<div>`. */
  children?: ReactNode;
  target?: TargetProps;
  /** Merged last, so a Slide adds its motion or layout class. */
  className?: string;
  /** Carries `--i` and a grid row. */
  style?: CSSProperties;
  dataSlot?: string;
}

/** A boolean prop as a present-or-absent data attribute. */
const flag = (on: boolean | undefined) => (on ? '' : undefined);

function NoteText({ label, value, children }: Pick<StickyNoteProps, 'label' | 'value' | 'children'>) {
  const rich = children !== undefined;
  return (
    <>
      <span className={cn('text-caption', rich && 'font-semibold')}>{label}</span>
      {value !== undefined && (
        <span className="text-caption font-semibold whitespace-nowrap tabular-nums">{value}</span>
      )}
      {rich && <div className="mt-1 text-caption">{children}</div>}
    </>
  );
}

/**
 * One sticky note on a board: a label, a short figure or a short body, all in the caption role, hierarchy from
 * weight. A server part with plain props (FE-007 §5.2).
 */
export function StickyNote({ tone, primary, fill, target, className, style, dataSlot, ...text }: StickyNoteProps) {
  const Root = text.children === undefined ? 'p' : 'div';
  return (
    <Root
      {...target}
      data-board-note=""
      data-tone={tone}
      data-slot={dataSlot}
      data-primary={flag(primary)}
      data-fill={flag(fill)}
      style={style}
      className={cn(
        styles.note,
        'flex flex-col justify-center rounded-sm p-1.5 text-center text-foreground',
        fill && 'p-3 text-left',
        className,
      )}
    >
      <NoteText {...text} />
    </Root>
  );
}
