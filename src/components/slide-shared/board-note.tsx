import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

// Surfaces only (FE-011 tokens). `revenue` is the cashflow board's revenue surface; `unknown` is dashed and muted: something not known yet.
const TONE = {
  card: 'border-border bg-card text-foreground shadow-sm',
  muted: 'border-border bg-muted text-muted-foreground',
  unknown: 'border-dashed border-border bg-muted/40 text-muted-foreground',
  revenue: 'border-transparent bg-(--success) text-success-foreground shadow-sm',
  result: 'border-transparent bg-primary text-primary-foreground shadow-sm',
} as const;

export type BoardNoteTone = keyof typeof TONE;

/**
 * A sticky note: the cashflow board's note shape, `rounded-sm` in a tone.
 * Server only, plain props (FE-007 §5). Layout, padding and entrance classes
 * come in through `className`.
 */
export function BoardNote({
  tone = 'card',
  className,
  children,
}: {
  tone?: BoardNoteTone;
  className?: string;
  children: ReactNode;
}) {
  return <span className={cn('block rounded-sm border p-3 text-body', TONE[tone], className)}>{children}</span>;
}
