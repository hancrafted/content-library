import { Badge } from './badge';

/** One label a card lists: its id for tests and probes, its text, and the tooltip that explains it. */
export interface BadgeItem {
  readonly id: string;
  readonly label: string;
  readonly tooltip?: string;
}

interface BadgeListProps {
  items: readonly BadgeItem[];
  /** The list's own data attribute, so each card kind keeps its hook (`data-episode-tags`, `data-event-tags`). */
  data: Record<`data-${string}`, string>;
}

/**
 * A card's labels as quiet badges: no filter acts on them, and each explains itself on hover. It sits above the card's
 * stretched link, so the tooltip stays reachable.
 */
export function BadgeList({ items, data }: BadgeListProps) {
  if (items.length === 0) return null;
  return (
    <ul {...data} className="relative z-20 flex flex-wrap gap-1.5">
      {items.map((item) => (
        <Badge key={item.id} asChild variant="muted" className="text-caption">
          <li data-tag={item.id} title={item.tooltip}>
            {item.label}
          </li>
        </Badge>
      ))}
    </ul>
  );
}
