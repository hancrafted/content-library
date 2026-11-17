import { Badge } from './badge';

export interface BadgeItem {
  readonly id: string;
  readonly label: string;
  readonly tooltip?: string;
}

interface BadgeListProps {
  items: readonly BadgeItem[];
  data: Record<`data-${string}`, string>;
}

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
