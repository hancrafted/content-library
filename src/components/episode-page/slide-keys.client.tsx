'use client';

import { useActiveSlide } from '@/hooks/use-url-state';
import { inExcludedRegion, slideKeyAction } from '@/lib/slide-key-action.pure';
import { useEffect } from 'react';

/**
 * Arrow-key navigation between Slides, owned by the Episode page container.
 * ← and → scroll the previous or next Slide wrapper into view (smooth, instant
 * under reduced motion; the wrapper's scroll margin applies). It writes
 * nothing to the URL: the Slide observer reports the new reading Slide and the
 * URL service updates the hash as after any scroll (FE-001 §2). Focus stays
 * where it is. `ids` starts with the Title slide's. Renders nothing.
 */
export function SlideKeys({ ids }: { ids: readonly string[] }) {
  const active = useActiveSlide();
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.defaultPrevented) return;
      const focus = event.target instanceof Element ? event.target : null;
      const target = slideKeyAction(event, inExcludedRegion(focus), { ids, active });
      const wrapper = target === null ? null : document.getElementById(target);
      if (!wrapper) return;
      event.preventDefault();
      const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      wrapper.scrollIntoView({ behavior: still ? 'instant' : 'smooth' });
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [ids, active]);
  return null;
}
