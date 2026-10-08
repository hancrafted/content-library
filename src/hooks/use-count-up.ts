import { prefersReducedMotion } from '@/hooks/prefers-reduced-motion';
import { countUpAt } from '@/lib/story-matrix.pure';
import { useEffect, useState } from 'react';

const COUNT_UP_MS = 1200;

/**
 * The value a stat shows while counting up to `target`, once `revealed` turns true.
 * Shows the target before the first observation (`null`), so server HTML carries the real number,
 * and zero while waiting below the fold. Runs once; reduced motion jumps straight to the target.
 */
export function useCountUp(target: number, revealed: boolean | null, delayMs: number): number {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    if (revealed !== true) return;
    let start: number | null = null;
    let frame = requestAnimationFrame(function tick(now) {
      start ??= now + delayMs;
      const into = prefersReducedMotion() ? COUNT_UP_MS : now - start;
      setElapsed(into);
      if (into < COUNT_UP_MS) frame = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(frame);
  }, [revealed, delayMs]);
  if (revealed === null) return target;
  return countUpAt(target, elapsed, COUNT_UP_MS);
}
