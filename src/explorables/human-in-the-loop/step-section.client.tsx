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
  readonly info: string;
  readonly kit: StepKit;
  readonly open?: boolean;
  readonly children: ReactNode;
}

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

export function StepSection({ n, title, info, kit, open = true, children }: SectionProps) {
  return (
    <Collapsible defaultOpen={open} data-step-section={n} className="group/step flex min-w-0 flex-col">
      {n > 1 && <Separator className="mb-5.5" />}
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
