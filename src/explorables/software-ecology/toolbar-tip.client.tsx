'use client';

import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/components/ui/tooltip';
import type { ReactElement } from 'react';

export function ToolTip({
  tip,
  side = 'bottom',
  children,
}: {
  readonly tip: string;
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
