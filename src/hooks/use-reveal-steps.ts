import { prefersReducedMotion } from '@/hooks/prefers-reduced-motion';
import { useSlideZone } from '@/hooks/use-slide-zone';
import { advanceKey, nextRevealStep, startRevealStep } from '@/lib/reveal-steps.pure';
import { inExcludedRegion } from '@/lib/slide-key-target.pure';
import { useCallback, useEffect, useState } from 'react';

/**
 * A Slide's progressive disclosure (`reveal-steps.pure.ts`): the step the presenter has reached, and `advance` for a
 * click. `null` before hydration, so the static HTML, print and a reader without script see the finished frame; the
 * resting frame from mount on, or the finished one under reduced motion. Transient (FE-001 §1): a Slide that remounts
 * starts again at rest.
 *
 * While its Slide is active, a bare → reveals the next step. The listener runs in the capture phase, before the Episode
 * page's own arrow keys, and takes the press only while a step is left to show: on the finished frame → moves on to
 * the next Slide as usual.
 */
export function useRevealSteps(steps: number): { step: number | null; advance: () => void } {
  const zone = useSlideZone();
  const [step, setStep] = useState<number | null>(null);

  useEffect(() => {
    setStep(startRevealStep({ reducedMotion: prefersReducedMotion(), steps }));
  }, [steps]);

  const advance = useCallback(() => setStep((at) => (at === null ? at : nextRevealStep(at, steps))), [steps]);

  useEffect(() => {
    if (zone !== 'active' || step === null || step >= steps) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.defaultPrevented || !advanceKey(event)) return;
      if (inExcludedRegion(event.target instanceof Element ? event.target : null)) return;
      event.preventDefault();
      advance();
    };
    window.addEventListener('keydown', onKey, { capture: true });
    return () => window.removeEventListener('keydown', onKey, { capture: true });
  }, [zone, step, steps, advance]);

  return { step, advance };
}
