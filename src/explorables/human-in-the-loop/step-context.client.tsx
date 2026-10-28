'use client';

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/shared/components/ui/collapsible';
import { ChevronRight } from 'lucide-react';
import { needsInput, type Entry } from './context-entries.pure';
import { Fields } from './context-field.client';
import type { UiWords } from './human-in-the-loop.types';
import type { SlotState } from './step-kit.types';

interface ContextProps {
  readonly own: readonly Entry[];
  readonly earlier: readonly Entry[];
  readonly slots: SlotState;
  readonly words: UiWords;
  readonly lead?: boolean;
}

/** The inputs that fill the prompt: the plain ones, then the results of earlier steps folded away with their count. */
export function Context({ own, earlier, slots, words, lead }: ContextProps) {
  return (
    <div data-part="context" className="flex min-w-0 flex-col gap-3">
      <Fields entries={own} slots={slots} words={words} lead={lead} />
      {earlier.length > 0 && (
        <Collapsible
          data-previous=""
          defaultOpen={lead && needsInput(earlier, slots.values)}
          className="group flex flex-col gap-3"
        >
          <CollapsibleTrigger className="flex min-h-8 w-fit cursor-pointer items-center gap-1.5 text-caption font-medium">
            <ChevronRight
              aria-hidden="true"
              className="size-4 transition-transform group-data-[state=open]:rotate-90"
            />
            {words.previousResults} ({earlier.length})
          </CollapsibleTrigger>
          <CollapsibleContent className="flex flex-col gap-3">
            <Fields entries={earlier} slots={slots} words={words} lead={lead} />
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
}
