import { cn } from '@/shared/lib/utils';
import { Slot } from '@radix-ui/react-slot';
import type * as React from 'react';

/**
 * The shadcn card surface. `asChild` lends its classes to the one element passed in, so a card can be an `<article>`
 * or an `<li>` without a wrapper. The sections shadcn ships beside it (header, title, footer) are left out until a card
 * needs them.
 */
function Card({ className, asChild = false, ...props }: React.ComponentProps<'div'> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : 'div';
  return (
    <Comp
      data-slot="card"
      className={cn('flex flex-col gap-6 rounded-xl border bg-card py-6 text-card-foreground shadow-sm', className)}
      {...props}
    />
  );
}

export { Card };
