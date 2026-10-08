import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

/**
 * The slide master: universals every variant shares — the frame, spacing and
 * type scale. Variants compose these parts; a one-off slide can use them
 * directly with any markup. Anchors and order belong to the tower, not here.
 */
export function SlideFrame({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <article className={cn('flex min-h-[calc(100svh-8rem)] flex-col py-16 md:py-24', className)}>{children}</article>
  );
}

const TITLE_SIZE = {
  h2: 'text-4xl md:text-6xl',
  h3: 'text-3xl md:text-5xl',
  h4: 'text-xl md:text-2xl',
} as const;

/** H-level follows the spine: section slide `h2`, page slide `h3`, inside a slide `h4`. */
export function SlideTitle({ as: Heading, children }: { as: keyof typeof TITLE_SIZE; children: ReactNode }) {
  return <Heading className={cn('font-semibold tracking-tight text-balance', TITLE_SIZE[Heading])}>{children}</Heading>;
}

export function SlideCaption({ children }: { children: ReactNode }) {
  return <p className="mt-4 max-w-prose text-lg text-balance text-muted-foreground md:text-xl">{children}</p>;
}

export function SlideProse({ children }: { children: ReactNode }) {
  return <p className="max-w-prose text-base leading-relaxed md:text-lg">{children}</p>;
}
