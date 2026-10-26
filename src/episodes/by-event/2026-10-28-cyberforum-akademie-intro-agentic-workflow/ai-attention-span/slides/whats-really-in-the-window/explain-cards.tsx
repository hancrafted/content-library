import type { TargetProps } from '@/shared/lib/context-link.pure';
import { cn } from '@/shared/lib/utils';
import type { ReactNode } from 'react';

/* The cornerstone's two machine parts the Slide explains, in its colours: the starting instructions and memory. */
const SWATCH = {
  start: 'bg-machine',
  memory: 'bg-machine/45',
} as const;

/** One part of the window explained in plain words: its swatch and name, what it is, and what it costs. */
export function ExplainCard({
  swatch,
  title,
  lead,
  more,
  target,
}: {
  swatch: keyof typeof SWATCH;
  title: string;
  lead: ReactNode;
  more: ReactNode;
  target: TargetProps;
}) {
  return (
    <div
      {...target}
      className="card-hover card-hover--raise flex flex-col gap-2 rounded-xl border-2 border-primary bg-card p-4 shadow-md"
    >
      <p className="flex items-center gap-2 text-body font-semibold">
        <span aria-hidden className={cn('size-3 shrink-0 rounded-sm', SWATCH[swatch])} />
        <span className="flex-1">{title}</span>
      </p>
      <p className="text-body">{lead}</p>
      <p className="text-muted-foreground">{more}</p>
    </div>
  );
}

/** The parts the Slide only names: a dashed box listing them, and the one line on past chats. */
export function NamedList({
  heading,
  items,
  pastChats,
  target,
}: {
  heading: string;
  items: readonly string[];
  pastChats: ReactNode;
  target: TargetProps;
}) {
  return (
    <div
      {...target}
      className="flex flex-col gap-2 rounded-xl border border-dashed border-border p-4 text-caption text-muted-foreground"
    >
      <p className="font-semibold tracking-wide uppercase">{heading}</p>
      <ul className="flex flex-col gap-1.5">
        {items.map((item) => (
          <li key={item} className="flex items-center gap-2">
            <span aria-hidden className="size-3 shrink-0 rounded-sm bg-muted-foreground/30" />
            {item}
          </li>
        ))}
      </ul>
      <p>{pastChats}</p>
    </div>
  );
}
