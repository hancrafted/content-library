import { cn } from '@/lib/utils';
import type { CSSProperties } from 'react';
import styles from './twenty-times-on-paper.module.css';

const FILL = { foreground: 'bg-foreground', human: 'bg-human' } as const;

/**
 * A row of `total` tally marks, the first `filled` solid in the `tone` colour, the rest outlined: the gap, drawn.
 * Decorative (`aria-hidden`); the figure beside it carries the claim. `filling` marks the row whose marks grow in
 * reading order on entry; each mark carries its index as `--i` for the stagger.
 */
export function Tally({
  filled,
  total,
  tone,
  filling = false,
}: {
  filled: number;
  total: number;
  tone: keyof typeof FILL;
  filling?: boolean;
}) {
  return (
    <span aria-hidden className={cn('flex flex-wrap gap-1', filling && styles.filling)}>
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          style={{ '--i': i } as CSSProperties}
          className={cn('h-6 w-1.5', styles.mark, i < filled ? FILL[tone] : 'border border-border')}
        />
      ))}
    </span>
  );
}
