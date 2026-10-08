import { prefersReducedMotion } from '@/hooks/prefers-reduced-motion';
import { countUpAt } from '@/lib/story-matrix.pure';
import { useEffect, useState } from 'react';

const COUNT_UP_MS = 1200;

/**
 * How far a stat has counted up, from 0 to 1, once `revealed` turns true.
 * Full (1) before the first observation (`null`), so server HTML carries the real number,
 * and 0 while waiting below the fold. Runs once; reduced motion jumps straight to 1.
 */
export function useCountUp(revealed: boolean | null, delayMs: number): number {
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
  if (revealed === null) return 1;
  return countUpAt(1, elapsed, COUNT_UP_MS);
}
