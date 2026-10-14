// `clsx`, not `cn`: tailwind-merge reads a type role such as `text-body` as a colour and drops it or the tone's colour.
import { clsx } from 'clsx';
import type { ReactNode } from 'react';

// The Episode's sticky note: the cashflow board's note shape. `revenue` is the board's revenue surface (FE-011 status token).
const TONE = {
  card: 'border-border bg-card text-foreground',
  revenue: 'border-transparent bg-(--success) text-success-foreground',
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
  return <span className={clsx('block w-fit rounded-sm border p-3 shadow-sm', TONE[tone], className)}>{children}</span>;
}
