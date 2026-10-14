import { SlideTitle } from '@/components/slide-master/slide-master';
import { cn } from '@/lib/utils';
import type { CSSProperties } from 'react';
import styles from './start-steps.module.css';

export interface StartStep {
  readonly slug: string;
  readonly text: string;
}

function StepRow({ step, index }: { step: StartStep; index: number }) {
  return (
    <li
      style={{ '--step': index } as CSSProperties}
      className={cn(styles.step, 'grid grid-cols-[1.75rem_1fr] gap-3', index > 0 && 'border-t border-border pt-3')}
    >
      <span aria-hidden="true" className="text-body font-semibold text-muted-foreground tabular-nums">
        {index + 1}
      </span>
      <span className="text-body text-pretty text-foreground">{step.text}</span>
    </li>
  );
}

/**
 * The answer beside the board: the four first steps, then one line that
 * narrows them to one this week. The board's surface, not a sticky note: the
 * notes' colours stay reserved for cash, cost, revenue and zero cash.
 */
export function StartSteps({
  heading,
  steps,
  footer,
}: {
  heading: string;
  steps: readonly StartStep[];
  footer: string;
}) {
  return (
    <section className="rounded-lg border border-border bg-card p-6">
      <SlideTitle as="h4">{heading}</SlideTitle>
      <ol className="mt-4 flex flex-col gap-3">
        {steps.map((step, index) => (
          <StepRow key={step.slug} step={step} index={index} />
        ))}
      </ol>
      <p className={cn(styles.footer, 'mt-4 border-t border-border pt-4 text-caption text-muted-foreground')}>
        {footer}
      </p>
    </section>
  );
}
