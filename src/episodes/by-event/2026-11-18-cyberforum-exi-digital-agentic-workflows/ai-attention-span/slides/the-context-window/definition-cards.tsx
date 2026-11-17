import { cn } from '@/shared/lib/utils';
import type { ReactNode } from 'react';

export interface DefinitionCard {
  readonly name: string;
  readonly kicker: ReactNode;
  readonly body: ReactNode;
  readonly lit?: boolean;
  readonly aside?: ReactNode;
}

export function DefinitionCards({ items }: { readonly items: readonly DefinitionCard[] }) {
  return (
    <ul className="grid grid-cols-1 gap-6 md:grid-cols-3">
      {items.map((item) => (
        <li
          key={item.name}
          data-target={item.name}
          className={cn(
            'flex flex-col gap-2 rounded-xl border bg-card p-5 shadow-md',
            item.lit ? 'border-primary' : 'border-border',
          )}
        >
          <span className="flex items-center gap-1 text-caption tracking-wide text-muted-foreground uppercase">
            {item.kicker}
          </span>
          <p className="text-body">{item.body}</p>
          {item.aside}
        </li>
      ))}
    </ul>
  );
}
