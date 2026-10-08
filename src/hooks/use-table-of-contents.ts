import { activeId, openSectionIds, type TocSection } from '@/components/table-of-contents/table-of-contents.pure';
import { useEffect, useState } from 'react';

/** The reading line, as a share of the viewport height from its top. */
const READING_LINE = 0.35;
/** How long the compact loading box holds after mount, so the table never visibly settles into place. */
const REVEAL_AFTER_MS = 1000;
const NOTHING_TOGGLED: ReadonlySet<string> = new Set();

/** Tracks which `[targetAttribute]` element spans the reading line; `null` before the first observation. */
export function useActiveId(order: readonly string[], targetAttribute: string): string | null {
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
      { rootMargin: `-${READING_LINE * 100}% 0px -${(1 - READING_LINE) * 100}% 0px` },
    );
    document.querySelectorAll(`[${targetAttribute}]`).forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [order, targetAttribute]);
  return active;
}

function fractionInto(element: Element | null): number {
  const root = document.documentElement;
  if (window.scrollY + window.innerHeight >= root.scrollHeight - 1) return 1;
  if (!element) return 0;
  const box = element.getBoundingClientRect();
  return box.height > 0 ? (window.innerHeight * READING_LINE - box.top) / box.height : 0;
}

/** How far the reading line has travelled through the active element, sampled once per frame; 1 at the page end. */
export function useFractionInto(active: string | null, targetAttribute: string): number {
  // Keyed by the entry it was measured on, so a new active entry never borrows the previous one's fraction.
  const [sample, setSample] = useState({ active, fraction: 0 });
  useEffect(() => {
    const element = active && document.querySelector(`[${targetAttribute}="${CSS.escape(active)}"]`);
    let frame = 0;
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() =>
        // Hundredths are plenty for a progress bar and skip re-renders between them.
        setSample({ active, fraction: Math.round(fractionInto(element || null) * 100) / 100 }),
      );
    };
    schedule();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [active, targetAttribute]);
  return sample.active === active ? sample.fraction : 0;
}

/** True two frames after the first observation, once the restored scroll position has painted without motion. */
export function useSettled(observed: string | null): boolean {
  const [settled, setSettled] = useState(false);
  useEffect(() => {
    if (observed === null || settled) return;
    let inner = 0;
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => setSettled(true));
    });
    return () => {
      cancelAnimationFrame(outer);
      cancelAnimationFrame(inner);
    };
  }, [observed, settled]);
  return settled;
}

/** True once a second has passed since mount and the first observation has painted; until then the table shows its loading box. */
export function useRevealed(settled: boolean): boolean {
  const [elapsed, setElapsed] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setElapsed(true), REVEAL_AFTER_MS);
    return () => clearTimeout(timer);
  }, []);
  return elapsed && settled;
}

/**
 * The entry a table-of-contents click is gliding to. It stands in for the
 * observed entry until the glide ends, so sections open and the ring turns on
 * click, not after scrolling past everything in between.
 */
export function useHeadingTo(observed: string | null) {
  const [heading, setHeading] = useState<string | null>(null);
  // Arrived: hand back to the observer, during render so no frame shows the stale target.
  if (heading !== null && heading === observed) setHeading(null);
  useEffect(() => {
    if (heading === null) return;
    const arrive = () => setHeading(null);
    window.addEventListener('scrollend', arrive, { once: true });
    return () => window.removeEventListener('scrollend', arrive);
  }, [heading]);
  return { heading, headTo: setHeading };
}

/**
 * Open sections plus a chevron toggle. Toggles are remembered only while the
 * reader stays in the same section; scrolling into another one resets them.
 */
export function useOpenSections(sections: readonly TocSection[], active: string | null) {
  const [owner] = openSectionIds(sections, active, NOTHING_TOGGLED);
  const [state, setState] = useState({ owner, toggled: NOTHING_TOGGLED });
  // Adjusting state during render (not in an effect) drops stale toggles before they ever paint.
  if (state.owner !== owner) setState({ owner, toggled: NOTHING_TOGGLED });
  const toggled = state.owner === owner ? state.toggled : NOTHING_TOGGLED;
  const toggle = (id: string) => {
    const next = new Set(toggled);
    if (!next.delete(id)) next.add(id);
    setState({ owner, toggled: next });
  };
  return { open: openSectionIds(sections, active, toggled), toggle };
}
