'use client';

import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/components/ui/tooltip';
import type { ReactElement } from 'react';

/*
 * The site's tooltip on a toolbar control (feedback 08): it opens on hover and on keyboard focus, so an icon button's
 * name is readable without a pointer. The control keeps its own accessible name; the tooltip repeats or extends it. A
 * child that is no focusable element (the Context marker's host) still opens it, as focus bubbles to the trigger.
 */
export function ToolTip({ tip, children }: { readonly tip: string; readonly children: ReactElement }) {
  if (!tip) return children;
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side="bottom">{tip}</TooltipContent>
    </Tooltip>
  );
}
