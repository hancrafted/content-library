'use client';

import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/components/ui/tooltip';
import { cn } from '@/shared/lib/utils';
import { CircleHelp } from 'lucide-react';
import { useState } from 'react';
import { modelNote, type ModelWords } from './model-tier.pure';
import type { ModelTier } from './workflow-schema.types';

/*
 * The model the step's job is best run with, in the action row right of the chat buttons: "Model: High · deep
 * thinking" and a `?` that shows the tier's one standard tooltip. Hover and keyboard focus open it as with any
 * Tooltip; a press opens it and keeps it open, where Radix alone closes it again on click and never opens it on a tap.
 */

interface ModelNoteProps {
  readonly words: ModelWords;
  readonly tier: ModelTier;
  /** The note of a review step: its tooltip says why Low fits this check only. */
  readonly review?: boolean;
}

export function ModelNote({ words, tier, review }: ModelNoteProps) {
  const [open, setOpen] = useState(false);
  const { label, tip } = modelNote(words, tier, review);
  return (
    <span data-model-note={tier} className="inline-flex items-center gap-1 text-caption text-muted-foreground">
      <span>{label}</span>
      <Tooltip open={open} onOpenChange={setOpen}>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-label={`${words.modelInfo}: ${label}`}
            data-control="model-info"
            onClick={(event) => {
              event.preventDefault();
              setOpen(true);
            }}
            className={cn(
              'inline-flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-full outline-none',
              'hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring',
            )}
          >
            <CircleHelp aria-hidden="true" className="size-4" />
          </button>
        </TooltipTrigger>
        <TooltipContent>{tip}</TooltipContent>
      </Tooltip>
    </span>
  );
}
