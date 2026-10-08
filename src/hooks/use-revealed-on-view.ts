import { prefersReducedMotion } from '@/hooks/prefers-reduced-motion';
import { useEffect, useState, type RefObject } from 'react';

const REVEAL_THRESHOLD = 0.2;

/**
 * Whether an element has entered the viewport, latched once true.
 * `null` before the first observation (server render, so content stays visible without JS),
 * `false` while it waits below the fold, `true` once seen — or straight away under reduced motion.
 */
export function useRevealedOnView(ref: RefObject<Element | null>): boolean | null {
  const [revealed, setRevealed] = useState<boolean | null>(null);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        const seen = prefersReducedMotion() || Boolean(entry?.isIntersecting);
        setRevealed(seen);
        if (seen) observer.disconnect();
      },
      { threshold: REVEAL_THRESHOLD },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);
  return revealed;
}
