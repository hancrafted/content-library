'use client';

import { useRevealSteps } from '@/hooks/use-reveal-steps';
import { revealedSteps } from '@/lib/reveal-steps.pure';
import { cn } from '@/lib/utils';
import type { MouseEvent, ReactNode } from 'react';
import styles from './reveal-steps.module.css';

/**
 * The wall the presenter reveals step by step: a click on it, or → while the Slide is active, shows the next layer.
 * A click on a Context marker or a link inside opens that instead. It writes the step as `data-step` and the steps
 * shown as `data-revealed`, which the CSS module reads; without script it writes neither, and every layer shows.
 */
export function RevealSteps({
  steps,
  className,
  children,
}: {
  steps: number;
  className?: string;
  children: ReactNode;
}) {
  const { step, advance } = useRevealSteps(steps);
  const onClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target instanceof Element && event.target.closest('button, a')) return;
    advance();
  };
  return (
    <div
      data-step={step ?? undefined}
      data-revealed={step === null ? undefined : revealedSteps(step)}
      data-done={step !== null && step >= steps ? '' : undefined}
      onClick={onClick}
      className={cn(styles.wall, className)}
    >
      {children}
    </div>
  );
}
