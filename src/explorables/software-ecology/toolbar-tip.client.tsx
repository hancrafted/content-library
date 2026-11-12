'use client';

import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/components/ui/tooltip';
import type { ReactElement } from 'react';

/*
 * The site's tooltip on a toolbar or Settings control (feedback 08): it opens on hover and on keyboard focus, so an icon
 * button's name is readable without a pointer, and it is portaled, so the Settings popover's overflow never clips it.
 * The control keeps its own accessible name; the tooltip repeats or extends it. An empty tip shows nothing but keeps the
 * same tree, so a control whose tip comes and goes (the active state's dot) is never remounted and keeps its focus.
 */
export function ToolTip({
  tip,
  side = 'bottom',
  children,
}: {
  readonly tip: string;
  /** Which side of the control the tip opens on; the red damage signs open it on top, above the card. */
  readonly side?: 'top' | 'bottom';
  readonly children: ReactElement;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      {tip ? <TooltipContent side={side}>{tip}</TooltipContent> : null}
    </Tooltip>
  );
}
