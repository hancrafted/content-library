'use client';

import { Separator } from '@/shared/components/ui/separator';
import type { ReactNode } from 'react';
import type { StepKit } from './step-kit.types';
import { stepTitle } from './words.pure';

interface SectionProps {
  readonly n: number;
  readonly title: string;
  /** What to do in this step; shown only while the info toggle is on. */
  readonly info: string;
  readonly kit: StepKit;
  readonly children: ReactNode;
}

/** One numbered step: "Step 2: Title", its explanation when the info toggle is on, then its controls. */
export function StepSection({ n, title, info, kit, children }: SectionProps) {
  return (
    <section className="flex min-w-0 flex-col gap-3">
      {n > 1 && <Separator className="mb-1" />}
      <h4 className="text-body font-semibold">{stepTitle(kit.words, n, title)}</h4>
      {kit.info && (
        <p data-explain="" className="text-body text-muted-foreground">
          {info}
        </p>
      )}
      {children}
    </section>
  );
}
