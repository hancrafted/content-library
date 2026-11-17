'use client';

import { inExcludedRegion, slideKeyTarget } from '@/episodes/lib/slide-key-target.pure';
import { useActiveSlide, useUrlState } from '@/shared/hooks/use-url-state';
import { useEffect, useRef } from 'react';

// decision: FE-001 §2
export function SlideKeys({ ids }: { ids: readonly string[] }) {
  const url = useUrlState();
  const active = useRef<string | null>(null);
  active.current = useActiveSlide();
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.defaultPrevented) return;
      const focus = event.target instanceof Element ? event.target : null;
      const target = slideKeyTarget(event, inExcludedRegion(focus), { ids, active: active.current });
      const wrapper = target === null ? null : document.getElementById(target);
      if (!wrapper || !url || target === null) return;
      event.preventDefault();
      url.navigateTo(target);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [ids, url]);
  return null;
}
