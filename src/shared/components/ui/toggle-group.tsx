import * as ToggleGroupPrimitive from '@radix-ui/react-toggle-group';
import type * as React from 'react';

import { cn } from '@/shared/lib/utils';

/** A row of toggles, single or multiple choice; Radix gives it roving focus and `aria-pressed` or `aria-checked`. */
function ToggleGroup({ className, ...props }: React.ComponentProps<typeof ToggleGroupPrimitive.Root>) {
  return (
    <ToggleGroupPrimitive.Root
      data-slot="toggle-group"
      className={cn('flex w-fit flex-wrap items-center gap-2', className)}
      {...props}
    />
  );
}

/** One toggle: an outlined pill, filled with the selected colour while on. */
function ToggleGroupItem({ className, ...props }: React.ComponentProps<typeof ToggleGroupPrimitive.Item>) {
  return (
    <ToggleGroupPrimitive.Item
      data-slot="toggle-group-item"
      className={cn(
        'inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-full border border-border bg-transparent px-3.5 text-caption font-medium whitespace-nowrap text-muted-foreground transition-[color,background-color,border-color] outline-none hover:border-foreground/40 hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 data-[state=on]:border-selected data-[state=on]:bg-selected data-[state=on]:text-selected-foreground motion-reduce:transition-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*="size-"])]:size-4',
        className,
      )}
      {...props}
    />
  );
}

export { ToggleGroup, ToggleGroupItem };
