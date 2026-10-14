import { cn } from '@/lib/utils';
import type { CSSProperties } from 'react';
import styles from './ghost-note.module.css';

export interface GhostNoteProps {
  /** What moved away: the ghost's accessible name. */
  label: string;
  /** Writes the label inside the ghost too, muted. */
  showLabel?: boolean;
  /** Merged last, so a Slide adds its motion or placement class. */
  className?: string;
  /** Carries `--i` and a grid placement. */
  style?: CSSProperties;
}

/**
 * Where a sticky note was before it moved: the note's footprint, dashed and empty. A server part with plain props
 * (FE-007 §5.2).
 */
export function GhostNote({ label, showLabel, className, style }: GhostNoteProps) {
  return (
    <div
      role="img"
      aria-label={label}
      data-board-ghost=""
      style={style}
      className={cn(styles.ghost, 'flex items-center justify-center rounded-sm p-1.5 text-center', className)}
    >
      {showLabel && <span className="text-caption text-muted-foreground">{label}</span>}
    </div>
  );
}
