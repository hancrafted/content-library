import { readingFraction, type PageBox } from '@/shared/lib/reading-line.pure';
import { openSectionIds, type TocSection } from '@/shared/lib/table-of-contents.pure';
import { useEffect, useState } from 'react';

/** How long the compact loading box holds after mount, so the table never visibly settles into place. */
const REVEAL_AFTER_MS = 300;
const NOTHING_TOGGLED: ReadonlySet<string> = new Set();

/**
 * Calls back with the element's page box and the document height whenever either resizes. A ResizeObserver reports
 * after layout, so reading boxes there forces no synchronous layout; the returned function stops observing.
 */
function observePageBox(element: Element | null, measured: (box: PageBox | null, documentHeight: number) => void) {
  const root = document.documentElement;
  const observer = new ResizeObserver(() => {
    const rect = element?.getBoundingClientRect();
    measured(rect ? { top: rect.top + window.scrollY, height: rect.height } : null, root.scrollHeight);
  });
  observer.observe(root);
  if (element) observer.observe(element);
  return () => observer.disconnect();
}

/** How far the reading line has travelled through the active element, sampled once per frame; 1 at the page end. */
export function useFractionInto(active: string | null, targetAttribute: string): number {
  // Keyed by the entry it was measured on, so a new active entry never borrows the previous one's fraction.
  const [sample, setSample] = useState({ active, fraction: 0 });
  useEffect(() => {
    const element = active ? document.querySelector(`[${targetAttribute}="${CSS.escape(active)}"]`) : null;
    let [box, documentHeight, frame]: [PageBox | null, number, number] = [null, Number.POSITIVE_INFINITY, 0];
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const view = { scrollY: window.scrollY, viewportHeight: window.innerHeight, documentHeight };
        // Hundredths are plenty for a progress bar and skip re-renders between them.
        setSample({ active, fraction: Math.round(readingFraction(box, view) * 100) / 100 });
      });
    };
    const stopObserving = observePageBox(element, (measuredBox, measuredHeight) => {
      [box, documentHeight] = [measuredBox, measuredHeight];
      schedule();
    });
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      cancelAnimationFrame(frame);
      stopObserving();
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

/** True once 300ms have passed since mount and the first observation has painted; until then the table shows its loading box. */
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

/**
 * Whether the table of contents chrome is collapsed. Transient (FE-001): a reload always
 * starts expanded, so the static page and the first client render agree.
 */
export function useTocCollapse(): [boolean, () => void] {
  const [collapsed, setCollapsed] = useState(false);
  const toggle = () => setCollapsed((prev) => !prev);
  return [collapsed, toggle];
}
