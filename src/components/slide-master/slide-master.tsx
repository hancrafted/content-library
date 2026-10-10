import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

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
    <article className={cn('flex min-h-[calc(100svh-8rem)] flex-col py-16 md:py-24', className)}>{children}</article>
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

const TITLE_SIZE = {
  h1: 'text-5xl md:text-7xl',
  h2: 'text-4xl md:text-6xl',
  h3: 'text-3xl md:text-5xl',
  h4: 'text-xl md:text-2xl',
} as const;

/**
 * H-level follows the manuscript's spine (FE-002): Title slide `h1`, section
 * slide `h2`, page slide `h3`; `h4` and below are free inside a slide.
 */
export function SlideTitle({ as: Heading, children, ...props }: PartProps & { as: keyof typeof TITLE_SIZE }) {
  return (
    <Heading {...props} className={cn('font-semibold tracking-tight text-balance', TITLE_SIZE[Heading])}>
      {children}
    </Heading>
  );
}

export function SlideCaption({ children, ...props }: PartProps) {
  return (
    <p {...props} className="mt-4 max-w-prose text-lg text-balance text-muted-foreground md:text-xl">
      {children}
    </p>
  );
}

export function SlideProse({ children, ...props }: PartProps) {
  return (
    <p {...props} className="max-w-prose text-base leading-relaxed md:text-lg">
      {children}
    </p>
  );
}
