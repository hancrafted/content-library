import { cn } from '@/shared/lib/utils';
import type { ReactNode } from 'react';

/**
 * The hairline frame of an exhibit on the gallery wall: a thin line on a narrow white fillet, square corners, raised
 * on hover. The `lead` exhibit, the one to look at, carries a `primary` line and a wider fillet; its size and its
 * darker line single it out, not weight. `className` places it, e.g. on a shared subgrid.
 */
export function Frame({
  lead = false,
  className,
  children,
  ...rest
}: {
  lead?: boolean;
  className?: string;
  children: ReactNode;
  'data-target'?: string;
}) {
  return (
    <div
      {...rest}
      className={cn(
        'card-hover card-hover--raise border bg-card',
        lead ? 'border-primary p-3 shadow-md' : 'border-foreground/25 p-2 shadow-sm',
        className,
      )}
    >
      {children}
    </div>
  );
}
