import { EPISODE_PORTAL_ROOT_ID } from '@/shared/lib/episode-portal.pure';
import { cn } from '@/shared/lib/utils';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';

export interface ContentAreaProps extends ComponentPropsWithoutRef<'main'> {
  children?: ReactNode;
}

// decision: FE-009 §2
export function ContentArea({ className, children, ...props }: ContentAreaProps) {
  return (
    <main
      data-slot="slides"
      data-testid="episode-page"
      className={cn(
        'grid min-w-0 grid-cols-1 [--content-end:--spacing(24)] pb-(--content-end)',
        // decision: FE-009 §2
        '[&_[data-slide]]:pl-(--inset-l) [&_[data-slide]]:pr-(--inset-r)',
        '[&_[data-slide]]:border-b [&_[data-slide]]:border-border/60',
        '[&_[data-slide][data-surface-edge]]:border-b-0',
        '[&>section:last-of-type>[data-slide]:last-child]:[--slide-surface-reach:var(--content-end)]',
        '[&>section:last-of-type>[data-slide]:last-child]:border-b-0',
        className,
      )}
      {...props}
    >
      {children}
      <div id={EPISODE_PORTAL_ROOT_ID} data-slot="portal-root" className="pointer-events-none fixed inset-0 z-50" />
    </main>
  );
}
