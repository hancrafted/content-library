import { Pin } from '@/episodes/components/slide-shared/pin/pin';
import type { ReactNode } from 'react';

export interface Step {
  readonly slug: string;
  readonly pin: 1 | 2 | 3 | 4;
  readonly text: ReactNode;
}

export function StepLegend({ steps }: { steps: readonly Step[] }) {
  return (
    <ol
      data-step-legend
      className="focus-group focus-group--dim-others grid grid-cols-1 gap-4 @2xl:grid-cols-2 @5xl:grid-cols-4 @5xl:gap-6"
    >
      {steps.map((step) => (
        <li key={step.slug} className="focus-group__item flex items-start gap-3 text-body [&_b]:font-semibold">
          <Pin n={step.pin} />
          <span>{step.text}</span>
        </li>
      ))}
    </ol>
  );
}
