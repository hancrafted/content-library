import { EPISODE_PORTAL_ROOT_ID } from '@/shared/lib/episode-portal.pure';
import { cn } from '@/shared/lib/utils';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';

export interface ContentAreaProps extends ComponentPropsWithoutRef<'main'> {
  children?: ReactNode;
}

/**
 * The Content area (FE-009 §2): a single-column CSS grid, one cell per Slide
 * wrapper. A future overview mode re-tiles the cells into columns without
 * restructuring markup, so it must stay a grid.
 *
 * It alone owns the rhythm between Slides: the rule under each wrapper lives
 * here, never on the wrapper, and so does the space after the last Slide,
 * which that Slide's surface fills. It also hosts the Episode portal root, so
 * popovers escape a wrapper without clipping.
 */
export function ContentArea({ className, children, ...props }: ContentAreaProps) {
  return (
    <main
      data-slot="slides"
      data-testid="episode-page"
      className={cn(
        'grid min-w-0 grid-cols-1 [--content-end:--spacing(24)] pb-(--content-end)',
        // The insets are the only width mechanism (FE-009 §2): the container sets the variables, and every
        // wrapper takes them as inline padding. No transition, so a drawer switch reflows once.
        '[&_[data-slide]]:pl-(--inset-l) [&_[data-slide]]:pr-(--inset-r)',
        // Rhythm: a rule under every Slide wrapper. Sections between the grid
        // and a wrapper are `display: contents`, so the rule targets the
        // wrappers, not the grid's direct children.
        '[&_[data-slide]]:border-b [&_[data-slide]]:border-border/60',
        '[&_[data-slide][data-surface-edge]]:border-b-0',
        // The space after the last Slide is its own: its surface reaches down through it, with no rule between, so
        // the page never shows a band of another background under it, whatever surface the Slide takes.
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
