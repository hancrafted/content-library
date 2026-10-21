import { cn } from '@/lib/utils';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';

/** What a part takes besides its content: the `data-target` a Slide kit's `target(…)` returns. */
interface PartProps {
  'data-target'?: string;
  children: ReactNode;
}

/**
 * The Slide master: universals every Slide layout shares — the frame (the
 * Foreground), the Backdrop, spacing and type scale. Slide layouts compose these parts; a one-off slide can use
 * them directly with any markup. Anchors and order belong to
 * `EpisodePageContainer`, not here.
 */
export function SlideFrame({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <article
      className={cn(
        'flex min-h-[calc(100svh-8rem)] flex-col py-16 md:py-24',
        // Under the Slide header (design-ADR-0012) the header holds the top space; the frame fills the rest of the wrapper, or
        // on the Title slide hugs its hero so the header and hero sit together, centred.
        '[[data-headed]>&]:min-h-0 [[data-headed]>&]:pt-0! [[data-headed=fill]>&]:flex-1 [[data-headed=hug]>&]:mb-auto',
        className,
      )}
    >
      {children}
    </article>
  );
}

/**
 * The Backdrop (FE-009 §7): the Scene's full-bleed, decorative layer, behind the
 * Foreground. It covers the Slide wrapper's padding box, so it reaches both
 * viewport edges whatever the insets; it clips only its own content. Hidden
 * below `md` unless `mobile` opts a cheap one in, and never printed. Put
 * decoration only here; a looping island inside it pauses while it is hidden
 * (FE-009 §6).
 */
export function SlideBackdrop({ mobile = false, children }: { mobile?: boolean; children?: ReactNode }) {
  return (
    <div
      data-slot="slide-backdrop"
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute inset-0 -z-10 overflow-hidden print:hidden',
        !mobile && 'hidden md:block',
      )}
    >
      {children}
    </div>
  );
}

const TITLE_ROLE = {
  h2: 'text-heading',
  h3: 'text-subheading',
  h4: 'text-body',
} as const;

/**
 * H-level follows the Episode's spine (FE-002): section slide `h2`, page
 * slide `h3`; `h4` and below are free inside a slide. Size follows the level's
 * role, never a breakpoint. The Title slide's `h1` is `HeroTitle`.
 */
export function SlideTitle({ as: Heading, children, ...props }: PartProps & { as: keyof typeof TITLE_ROLE }) {
  return (
    <Heading {...props} className={cn('font-semibold text-balance hyphens-auto', TITLE_ROLE[Heading])}>
      {children}
    </Heading>
  );
}

/**
 * The page's `h1` in the hero role, the only user of `text-hero`: the Title
 * slide and the landing hero render it. Takes rich children and passes `id`,
 * `className` and data attributes through to the `h1`.
 */
export function HeroTitle({ className, children, ...props }: ComponentPropsWithoutRef<'h1'>) {
  return (
    <h1 {...props} className={cn('font-semibold text-balance text-hero', className)}>
      {children}
    </h1>
  );
}

export function SlideCaption({ children, ...props }: PartProps) {
  return (
    <p {...props} className="mt-4 max-w-prose text-caption text-balance text-muted-foreground">
      {children}
    </p>
  );
}

export function SlideProse({ children, ...props }: PartProps) {
  return (
    <p {...props} className="max-w-prose text-body">
      {children}
    </p>
  );
}
