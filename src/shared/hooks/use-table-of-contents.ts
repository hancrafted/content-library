import { readingFraction, type PageBox } from '@/shared/lib/reading-line.pure';
import { openSectionIds, type TocSection } from '@/shared/lib/table-of-contents.pure';
import { useEffect, useState } from 'react';

const REVEAL_AFTER_MILLISECONDS = 300;
const NOTHING_TOGGLED: ReadonlySet<string> = new Set();

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

export function useFractionInto(active: string | null, targetAttribute: string): number {
  const [sample, setSample] = useState({ active, fraction: 0 });
  useEffect(() => {
    const element = active ? document.querySelector(`[${targetAttribute}="${CSS.escape(active)}"]`) : null;
    let [box, documentHeight, frame]: [PageBox | null, number, number] = [null, Number.POSITIVE_INFINITY, 0];
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const view = { scrollY: window.scrollY, viewportHeight: window.innerHeight, documentHeight };
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

export function useRevealed(settled: boolean): boolean {
  const [elapsed, setElapsed] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setElapsed(true), REVEAL_AFTER_MILLISECONDS);
    return () => clearTimeout(timer);
  }, []);
  return elapsed && settled;
}

export function useOpenSections(sections: readonly TocSection[], active: string | null) {
  const [owner] = openSectionIds(sections, active, NOTHING_TOGGLED);
  const [state, setState] = useState({ owner, toggled: NOTHING_TOGGLED });
  if (state.owner !== owner) setState({ owner, toggled: NOTHING_TOGGLED });
  const toggled = state.owner === owner ? state.toggled : NOTHING_TOGGLED;
  const toggle = (id: string) => {
    const next = new Set(toggled);
    if (!next.delete(id)) next.add(id);
    setState({ owner, toggled: next });
  };
  return { open: openSectionIds(sections, active, toggled), toggle };
}

// decision: FE-001 §1
export function useTocCollapse(): [boolean, () => void] {
  const [collapsed, setCollapsed] = useState(false);
  const toggle = () => setCollapsed((prev) => !prev);
  return [collapsed, toggle];
}
