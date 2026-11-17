import { useSlideZone } from '@/episodes/hooks/use-slide-zone';
import { advanceKey, nextRevealStep, startRevealStep } from '@/episodes/lib/reveal-steps.pure';
import { inExcludedRegion } from '@/episodes/lib/slide-key-target.pure';
import { prefersReducedMotion } from '@/shared/hooks/prefers-reduced-motion';
import { useCallback, useEffect, useState } from 'react';

// decision: FE-001 §1
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
