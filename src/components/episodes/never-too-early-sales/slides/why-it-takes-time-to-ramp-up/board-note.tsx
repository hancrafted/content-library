// `clsx`, not `cn`: tailwind-merge reads a type role such as `text-body` as a colour and drops it or the tone's colour.
import { clsx } from 'clsx';
import type { ReactNode } from 'react';

// The Episode's sticky note: the cashflow board's note shape. `unknown` is dashed and muted: something not known yet.
const TONE = {
  card: 'border-border bg-card text-foreground shadow-sm',
  unknown: 'border-dashed border-border bg-muted/40 text-muted-foreground',
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
  return <div className={clsx('min-w-0 rounded-sm border p-4 text-body', TONE[tone], className)}>{children}</div>;
}
