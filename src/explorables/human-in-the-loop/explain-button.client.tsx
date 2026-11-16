'use client';

import { CopyButton } from '@/shared/components/core-components/try-prompt/prompt-actions.client';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/components/ui/tooltip';
import type { StepKit } from './step-kit.types';

/** Copy explanation prompt: the prompt wrapped in a request to explain it. It never leads. */
export function ExplainButton({ kit, onCopy }: { kit: StepKit; onCopy: () => Promise<boolean> }) {
  const { words } = kit;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span>
          <CopyButton label={words.copyExplanation} done={words.copied} onCopy={onCopy} />
        </span>
      </TooltipTrigger>
      <TooltipContent align="end">{words.copyExplanationTip}</TooltipContent>
    </Tooltip>
  );
}
