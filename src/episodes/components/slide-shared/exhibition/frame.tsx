import { cn } from '@/shared/lib/utils';
import type { ReactNode } from 'react';

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
