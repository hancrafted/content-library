import { cn } from '@/lib/utils';
import styles from './sales-is-more-than-selling.module.css';

export interface BoardNoteProps {
  readonly text: string;
  readonly tone: 'neutral' | 'result';
  /** Entrance order on the board: the CSS module keys each note's delay on it. */
  readonly step: number;
}

// A slight tilt, alternating per note, so the notes read as pinned to a board.
const TILT = ['-rotate-1', 'rotate-1', ''] as const;

/**
 * One sticky note: the same note shape as the Episode's cashflow board. Local
 * until a second Slide needs it (FE-007 Do 7). `result` is the one note to look at.
 */
export function BoardNote({ text, tone, step }: BoardNoteProps) {
  const result = tone === 'result';
  return (
    <div
      data-step={step}
      className={cn(
        result ? styles.result : styles.note,
        'rounded-sm border p-4 text-body shadow-sm',
        result
          ? 'border-transparent bg-primary text-center font-semibold text-primary-foreground'
          : ['border-border bg-card text-foreground', TILT[step % TILT.length]],
      )}
    >
      {text}
    </div>
  );
}
