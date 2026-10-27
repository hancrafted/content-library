import { fractionInto, openSectionIds, type TocSection } from '@/shared/lib/table-of-contents.pure';
import { useEffect, useState } from 'react';

/** How long the compact loading box holds after mount, so the table never visibly settles into place. */
const REVEAL_AFTER_MS = 1000;
const NOTHING_TOGGLED: ReadonlySet<string> = new Set();

/** How far the reading line has travelled through the active element, sampled once per frame; 1 at the page end. */
export function useFractionInto(active: string | null, targetAttribute: string): number {
  // Keyed by the entry it was measured on, so a new active entry never borrows the previous one's fraction.
  const [sample, setSample] = useState({ active, fraction: 0 });
  useEffect(() => {
    const element = active ? document.querySelector(`[${targetAttribute}="${CSS.escape(active)}"]`) : null;
    let frame = 0;
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const page = {
          scrollY: window.scrollY,
          innerHeight: window.innerHeight,
          scrollHeight: document.documentElement.scrollHeight,
        };
        const box = element ? element.getBoundingClientRect() : null;
        setSample({ active, fraction: fractionInto(page, box) });
      });
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
