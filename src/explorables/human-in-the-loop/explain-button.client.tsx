'use client';

import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/components/ui/tooltip';
import { BlockedCopy } from './blocked-copy.client';
import type { StepKit } from './step-kit.types';

export function ExplainButton({
  kit,
  blocked = false,
  onCopy,
}: {
  kit: StepKit;
  blocked?: boolean;
  onCopy: () => Promise<boolean>;
}) {
  const { words } = kit;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span>
          <BlockedCopy words={words} label={words.copyExplanation} blocked={blocked} onCopy={onCopy} />
        </span>
      </TooltipTrigger>
      <TooltipContent align="end">{words.copyExplanationTip}</TooltipContent>
    </Tooltip>
  );
}
