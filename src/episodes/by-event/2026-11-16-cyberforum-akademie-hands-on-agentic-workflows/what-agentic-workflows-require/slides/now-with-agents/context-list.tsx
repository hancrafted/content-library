import type { ReactNode } from 'react';

export interface ContextListProps {
  readonly title: string;
  readonly items: readonly { readonly slug: string; readonly text: string; readonly note: ReactNode }[];
}

export function ContextList({ title, items }: ContextListProps) {
  return (
    <div data-context-list className="flex flex-col gap-2 rounded-sm border border-border bg-card p-4 shadow-md">
      <p data-context-title className="text-caption font-medium text-muted-foreground uppercase">
        {title}
      </p>
      <ul className="flex flex-col gap-1.5">
        {items.map(({ slug, text, note }) => (
          <li key={slug} className="flex items-start gap-1.5 text-caption">
            <span className="pt-0.5">{text}</span>
            {note}
          </li>
        ))}
      </ul>
    </div>
  );
}
