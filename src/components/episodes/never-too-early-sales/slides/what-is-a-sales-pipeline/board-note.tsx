// `clsx`, not `cn`: tailwind-merge reads a type role such as `text-body` as a colour and drops it or the tone's colour.
import { clsx } from 'clsx';
import type { ReactNode } from 'react';

// The Episode's sticky note: the cashflow board's note shape, on a card or a muted surface.
const TONE = {
  card: 'border-border bg-card text-foreground shadow-sm',
  muted: 'border-border bg-muted text-muted-foreground',
} as const;

export function BoardNote({
  tone = 'card',
  className,
  children,
}: {
  tone?: keyof typeof TONE;
  className?: string;
  children: ReactNode;
}) {
  return <span className={clsx('block w-fit rounded-sm border p-3', TONE[tone], className)}>{children}</span>;
}
