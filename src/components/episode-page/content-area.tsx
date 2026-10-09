import { cn } from '@/lib/utils';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';

export const EPISODE_PORTAL_ROOT_ID = 'episode-portal-root';

export interface ContentAreaProps extends ComponentPropsWithoutRef<'main'> {
  children?: ReactNode;
}

/**
 * The Content area (FE-009 §2): a single-column CSS grid, one cell per Slide
 * wrapper. A future overview mode re-tiles the cells into columns without
 * restructuring markup, so it must stay a grid.
 *
 * It alone owns the rhythm between Slides: the rule under each wrapper lives
 * here, never on the wrapper. It also hosts the Episode portal root, so
 * popovers escape a wrapper without clipping.
 */
export function ContentArea({ className, children, ...props }: ContentAreaProps) {
  return (
    <main
      data-slot="slides"
      data-testid="episode-page"
      className={cn(
        'grid min-w-0 grid-cols-1 pb-24 md:ml-12',
        // Rhythm: a rule under every Slide wrapper. Sections between the grid
        // and a wrapper are `display: contents`, so the rule targets the
        // wrappers, not the grid's direct children.
        '[&_[data-slide]]:border-b [&_[data-slide]]:border-border/60',
        className,
      )}
      {...props}
    >
      {children}
      <div id={EPISODE_PORTAL_ROOT_ID} data-slot="portal-root" className="pointer-events-none fixed inset-0 z-50" />
    </main>
  );
}
