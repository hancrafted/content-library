import { cn } from '@/shared/lib/utils';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';

interface PartProps {
  'data-target'?: string;
  children: ReactNode;
}

export function SlideFrame({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <article
      className={cn(
        'flex min-h-[calc(100svh-8rem)] flex-col py-16 md:py-24',
        '[[data-headed]>&]:min-h-0 [[data-headed]>&]:pt-0! [[data-headed=fill]>&]:flex-1 [[data-headed=hug]>&]:mb-auto',
        className,
      )}
    >
      {children}
    </article>
  );
}

// decision: FE-009 §7
// decision: FE-009 §6
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

// decision: FE-002 §4
export function SlideTitle({ as: Heading, children, ...props }: PartProps & { as: keyof typeof TITLE_ROLE }) {
  return (
    <Heading {...props} className={cn('font-semibold text-balance hyphens-auto', TITLE_ROLE[Heading])}>
      {children}
    </Heading>
  );
}

export function HeroTitle({ className, children, ...props }: ComponentPropsWithoutRef<'h1'>) {
  return (
    <h1 {...props} className={cn('font-semibold text-balance text-hero', className)}>
      {children}
    </h1>
  );
}

export function SlideCaption({ children, ...props }: PartProps) {
  return (
    <p {...props} className="mt-4 text-caption text-muted-foreground">
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
