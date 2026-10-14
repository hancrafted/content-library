import { SlideTitle } from '@/components/slide-master/slide-master';
import { cn } from '@/lib/utils';
import type { CSSProperties } from 'react';
import styles from './pipeline-tools-in-practice.module.css';

interface DealCard {
  slug: string;
  name: string;
  status: string;
  /** The record the Slide follows: its one primary mark. */
  current?: boolean;
}

interface DealColumn {
  slug: string;
  title: string;
  outcome?: 'won' | 'lost';
  cards: readonly DealCard[];
}

/** A card's edge: the followed record in primary, a won one in success beside its "Won" heading, a lost one dashed. */
function cardTone(card: DealCard, outcome: DealColumn['outcome']): string {
  if (card.current) return 'border-l-2 border-l-primary';
  if (outcome === 'won') return 'border-l-2 border-l-success';
  if (outcome === 'lost') return 'border-dashed';
  return '';
}

function Card({ card, outcome, index }: { card: DealCard; outcome: DealColumn['outcome']; index: number }) {
  return (
    <li
      data-target={card.slug}
      data-current={card.current || undefined}
      style={{ '--column': index } as CSSProperties}
      className={cn(
        styles.card,
        'flex flex-col gap-1 rounded-md border border-border bg-card p-4',
        cardTone(card, outcome),
      )}
    >
      <span className={cn('text-body font-semibold', outcome === 'lost' ? 'text-muted-foreground' : 'text-foreground')}>
        {card.name}
      </span>
      <span className="text-caption text-muted-foreground">{card.status}</span>
    </li>
  );
}

function Column({ column, index }: { column: DealColumn; index: number }) {
  const { slug, title, outcome, cards } = column;
  return (
    <section data-target={slug} data-outcome={outcome} className={cn(styles.column, 'flex min-w-0 flex-col gap-3')}>
      <SlideTitle as="h4">{title}</SlideTitle>
      <ul className="flex flex-col gap-3">
        {cards.map((card) => (
          <Card key={card.slug} card={card} outcome={outcome} index={index} />
        ))}
      </ul>
    </section>
  );
}

/**
 * An original, fictional kanban board drawn in markup: open stages first,
 * then the won and lost outcomes kept apart. Every record reads at rest; no
 * screenshot, logo or win percentage.
 */
export function DealBoard({ label, columns }: { label: string; columns: readonly DealColumn[] }) {
  return (
    <div data-target="board" role="group" aria-label={label} className={cn(styles.board, 'grid gap-6')}>
      {columns.map((column, index) => (
        <Column key={column.slug} column={column} index={index} />
      ))}
    </div>
  );
}
