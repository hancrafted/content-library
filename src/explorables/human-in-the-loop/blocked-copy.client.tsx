'use client';

import { CopyButton } from '@/shared/components/core-components/try-prompt/prompt-actions.client';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/components/ui/tooltip';
import { useId } from 'react';
import type { UiWords } from './human-in-the-loop.types';

interface BlockedCopyProps {
  readonly words: UiWords;
  readonly label: string;
  /** A blank field of the step still waits for the viewer's text: a copy would carry a raw marker, so the button is disabled. */
  readonly blocked: boolean;
  readonly lead?: boolean;
  readonly edited?: boolean;
  readonly onCopy: () => Promise<boolean>;
}

/** A copy button that stays disabled until the blank field is typed in, and says why in a tooltip and to a screen reader. */
export function BlockedCopy({ words, label, blocked, lead = false, edited, onCopy }: BlockedCopyProps) {
  const id = useId();
  const button = (
    <CopyButton
      label={label}
      done={words.copied}
      lead={lead && !blocked}
      edited={edited}
      disabled={blocked}
      aria-describedby={blocked ? id : undefined}
      onCopy={onCopy}
    />
  );
  if (!blocked) return button;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span data-blocked="">{button}</span>
      </TooltipTrigger>
      <TooltipContent>{words.typeFirst}</TooltipContent>
      <span id={id} className="sr-only">
        {words.typeFirst}
      </span>
    </Tooltip>
  );
}
