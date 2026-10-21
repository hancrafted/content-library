'use client';

import { useSlideEntry } from '@/hooks/use-slide-zone';
import { cn } from '@/lib/utils';
import { useEffect, useState, type FocusEvent, type ReactNode } from 'react';
import { CALL_STEP_MS, callStepShown, callStepsPlay, type CallStepProgress } from './call-steps.pure';

const TRIGGER = 'rounded-3xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring';

/** The step shown, and the replay a mouse enter or keyboard focus starts. */
function useCallStep(last: number) {
  const entry = useSlideEntry();
  const [entryAtMount] = useState(entry);
  const [replays, setReplays] = useState(0);
  const [progress, setProgress] = useState<CallStepProgress | null>(null);
  const plays = callStepsPlay({ entryAtMount, entry, replays });

  useEffect(() => {
    if (!plays) return;
    const run = replays;
    const timers = Array.from({ length: last }, (_, index) =>
      window.setTimeout(() => setProgress({ run, step: index + 1 }), (index + 1) * CALL_STEP_MS),
    );
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [plays, replays, last]);

  const step = callStepShown({ entryAtMount, entry, replays, progress, last });
  return { step, replay: () => setReplays((count) => count + 1) };
}

interface CallStepsProps {
  /** The end state's step. */
  last: number;
  /** The group's accessible name, which says what replays. */
  label: string;
  className?: string;
  children: ReactNode;
}

/**
 * The lighting steps of a call (design-ADR-0012 §9): sets `data-step` from 0 to `last` on its element, one step every
 * `CALL_STEP_MS`, once on the Slide's first `active` and again on every mouse enter and keyboard focus. The static
 * HTML and a Slide that entered before show `last`, the end state. What each step shows, and that reduced motion
 * shows the end state at once, lives in the Slide's own CSS module, keyed on `data-step` and the bubbles'
 * `data-light`.
 */
export function CallSteps({ last, label, className, children }: CallStepsProps) {
  const { step, replay } = useCallStep(last);
  // A click focuses the group after the pointer has already entered it: only keyboard focus on the group replays.
  const onFocus = (event: FocusEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget && event.currentTarget.matches(':focus-visible')) replay();
  };
  return (
    <div
      role="group"
      aria-label={label}
      tabIndex={0}
      data-step={step}
      onMouseEnter={replay}
      onFocus={onFocus}
      className={cn(TRIGGER, className)}
    >
      {children}
    </div>
  );
}
