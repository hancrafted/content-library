import type { TargetProps } from '@/lib/context-link.pure';
import { cn } from '@/lib/utils';
import styles from './deal-board.module.css';

export interface DealCard {
  readonly slug: string;
  readonly name: string;
  /** Localized value as shown, e.g. "$8k". */
  readonly value: string;
  readonly target?: TargetProps;
}

export interface DealColumn {
  readonly slug: string;
  readonly title: string;
  /** The pre-formatted header, e.g. "3 · $29k": the part formats nothing. */
  readonly summary: string;
  readonly target?: TargetProps;
  readonly cards: readonly DealCard[];
}

export interface DealBoardProps {
  /** Accessible name of the board. */
  readonly label: string;
  /** Order = columns, one per stage. */
  readonly columns: readonly DealColumn[];
  /** A card that has just moved, and the column slug it left: ringed, with a dashed ghost in `from`. */
  readonly moved?: { readonly card: string; readonly from: string };
  /** One column slug drawn with the `primary` ring. */
  readonly highlight?: string;
  readonly className?: string;
}

function requireColumn(columns: readonly DealColumn[], slug: string): void {
  if (!columns.some((column) => column.slug === slug)) throw new Error(`DealBoard: unknown column "${slug}".`);
}

/** The checks the props' types cannot make, so a wrong board fails the build instead of drawing a lie. */
function validate({ columns, moved, highlight }: DealBoardProps): void {
  if (moved) {
    const known = columns.some((column) => column.cards.some((card) => card.slug === moved.card));
    if (!known) throw new Error(`DealBoard: unknown card "${moved.card}".`);
    requireColumn(columns, moved.from);
  }
  if (highlight !== undefined) requireColumn(columns, highlight);
}

const CARD = 'rounded-md p-3';

function Card({ card, moved }: { card: DealCard; moved: boolean }) {
  return (
    <li
      {...card.target}
      className={cn(
        CARD,
        'flex min-w-0 flex-col bg-card shadow-sm',
        moved ? [styles.moved, 'border-2 border-primary'] : 'border border-border',
      )}
    >
      <span className="text-caption font-medium wrap-break-word text-foreground">{card.name}</span>
      <span className="text-caption text-muted-foreground tabular-nums">{card.value}</span>
    </li>
  );
}

/** Where a moved card stood: an empty dashed outline at a card's height. */
function Ghost() {
  return (
    <li
      aria-hidden="true"
      className={cn(CARD, styles.ghost, 'flex flex-col border-2 border-dashed border-muted-foreground')}
    >
      <span className="text-caption">{' '}</span>
      <span className="text-caption">{' '}</span>
    </li>
  );
}

interface ColumnProps {
  readonly column: DealColumn;
  readonly moved: DealBoardProps['moved'];
  readonly highlighted: boolean;
}

function Column({ column, moved, highlighted }: ColumnProps) {
  return (
    <div
      {...column.target}
      role="group"
      aria-label={column.title}
      className={cn('flex flex-col gap-2 rounded-lg bg-muted p-3', highlighted && 'ring-2 ring-primary')}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-2">
        <span className="text-body font-semibold text-foreground">{column.title}</span>
        <span className="text-caption text-muted-foreground tabular-nums">{column.summary}</span>
      </div>
      <ul className="m-0 flex list-none flex-col gap-2 p-0">
        {column.cards.map((card) => (
          <Card key={card.slug} card={card} moved={moved?.card === card.slug} />
        ))}
        {moved?.from === column.slug && <Ghost />}
      </ul>
    </div>
  );
}

/**
 * A deal board: one column per stage, one card per deal, each column headed
 * by its count and value. Server only, plain props (FE-007 §5.2). The base
 * styles are the finished board; a moved card slides in only on the active
 * Slide, while the columns sit side by side and never under reduced motion
 * (FE-009 §6). Four columns are keyed on the board's own width (`@2xl`), not
 * the viewport: beside the table of contents a `md` page leaves too little.
 */
export function DealBoard(props: DealBoardProps) {
  validate(props);
  const { label, columns, moved, highlight, className } = props;
  return (
    <div role="group" aria-label={label} className={cn('@container', className)}>
      <div className={cn(styles.board, 'grid grid-cols-2 gap-3 @2xl:grid-cols-4')}>
        {columns.map((column) => (
          <Column key={column.slug} column={column} moved={moved} highlighted={highlight === column.slug} />
        ))}
      </div>
    </div>
  );
}
