'use client';

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/shared/components/ui/collapsible';
import { Separator } from '@/shared/components/ui/separator';
import { ChevronRight } from 'lucide-react';
import type { ReactNode } from 'react';
import type { StepKit } from './step-kit.types';
import { stepTitle } from './words.pure';

interface SectionProps {
  readonly n: number;
  readonly title: string;
  /** What to do in this step; shown only while the info toggle is on. */
  readonly info: string;
  readonly kit: StepKit;
  /** Open at first; a step with nothing to do starts folded. */
  readonly open?: boolean;
  readonly children: ReactNode;
}

/** The step's title, the trigger that folds it. */
function StepTitle({ n, title, kit }: Pick<SectionProps, 'n' | 'title' | 'kit'>) {
  return (
    <h4 className="text-body font-semibold">
      <CollapsibleTrigger className="flex w-fit cursor-pointer items-center gap-1.5 rounded-sm text-left outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50">
        <ChevronRight
          aria-hidden="true"
          className="size-4 shrink-0 transition-transform group-data-[state=open]/step:rotate-90"
        />
        {stepTitle(kit.words, n, title)}
      </CollapsibleTrigger>
    </h4>
  );
}

/** One numbered step, folded by its title: "Step 2: Title", its explanation when the info toggle is on, then its controls. */
export function StepSection({ n, title, info, kit, open = true, children }: SectionProps) {
  return (
    <Collapsible defaultOpen={open} data-step-section={n} className="group/step flex min-w-0 flex-col">
      {n > 1 && <Separator className="mb-5.5" />}
      {/* The step's box: light grey while the pointer is inside it. Its padding sits in the gap, so the spacing stays. */}
      <div
        data-step-box=""
        className="-my-3 flex min-w-0 flex-col gap-3 rounded-lg px-3 py-3 transition-colors hover:bg-muted"
      >
        <StepTitle n={n} title={title} kit={kit} />
        {kit.info && (
          <p data-explain="" className="text-body text-muted-foreground">
            {info}
          </p>
        )}
        <CollapsibleContent className="flex min-w-0 flex-col gap-3">{children}</CollapsibleContent>
      </div>
    </Collapsible>
  );
}
