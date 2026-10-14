import { BoardNote } from '@/components/slide-shared/board-note';
import type { TargetProps } from '@/lib/context-link.pure';
import { cn } from '@/lib/utils';
import { useId } from 'react';
import styles from './sales-is-more-than-selling.module.css';

export interface BoardColumnItem {
  readonly slug: string;
  readonly text: string;
}

export interface BoardColumnProps {
  readonly slug: string;
  readonly title: string;
  readonly items: readonly BoardColumnItem[];
  /** The first note's entrance step; the column's notes follow it one by one. */
  readonly firstStep: number;
  readonly targetProps: TargetProps;
}

// A slight tilt, alternating per note, so the notes read as pinned to a board.
const TILT = ['-rotate-1', 'rotate-1', ''] as const;

/** One board column: a hairline, its header and its sticky notes. */
export function BoardColumn({ slug, title, items, firstStep, targetProps }: BoardColumnProps) {
  const id = `${slug}-${useId()}`;
  return (
    <article {...targetProps} aria-labelledby={id} className="border-t border-border pt-6">
      <h4 id={id} className="text-body font-semibold text-foreground">
        {title}
      </h4>
      <ul className="mt-4 flex list-none flex-col gap-3">
        {items.map((item, index) => (
          <li key={item.slug} data-step={firstStep + index}>
            <BoardNote className={cn(styles.note, 'p-4', TILT[(firstStep + index) % TILT.length])}>
              {item.text}
            </BoardNote>
          </li>
        ))}
      </ul>
    </article>
  );
}
