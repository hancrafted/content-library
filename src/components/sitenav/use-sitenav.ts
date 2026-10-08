'use client';

import { useEffect, useMemo, useState } from 'react';
import { activeId, scrollProgress, type SitenavSection } from './sitenav.pure';

/** The reading line sits 35% down the viewport; an entry is active while it spans that line. */
const READING_LINE = '-35% 0px -65% 0px';

function pageOrder(sections: readonly SitenavSection[]): string[] {
  return sections.flatMap((section) => [section.id, ...section.items.map((item) => item.id)]);
}

/** Tracks which `[targetAttribute]` element spans the reading line. */
export function useActiveId(sections: readonly SitenavSection[], targetAttribute: string): string | null {
  const order = useMemo(() => pageOrder(sections), [sections]);
  const [active, setActive] = useState<string | null>(null);
  useEffect(() => {
    const intersecting = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = entry.target.getAttribute(targetAttribute) ?? '';
          if (entry.isIntersecting) intersecting.add(id);
          else intersecting.delete(id);
        }
        setActive((previous) => activeId(intersecting, order, previous));
      },
      { rootMargin: READING_LINE },
    );
    document.querySelectorAll(`[${targetAttribute}]`).forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [order, targetAttribute]);
  return active;
}

function readScroll(): number {
  const root = document.documentElement;
  return scrollProgress({
    scrollY: window.scrollY,
    scrollHeight: root.scrollHeight,
    viewportHeight: window.innerHeight,
  });
}

/** Whole-page scroll progress, 0 to 100, sampled at most once per frame. */
export function useScrollProgress(): number {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    let frame = 0;
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setProgress(readScroll()));
    };
    schedule();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, []);
  return progress;
}
