'use client';

import { useRevealSteps } from '@/episodes/hooks/use-reveal-steps';
import { revealedSteps } from '@/episodes/lib/reveal-steps.pure';
import { cn } from '@/shared/lib/utils';
import type { MouseEvent, ReactNode } from 'react';
import styles from './reveal-steps.module.css';

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
