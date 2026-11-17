'use client';
// decision: docs/adr/0024-software-ecology-flow-model-and-use-case-files.md
// decision: FE-009 §8
import { useEpisodePortalRoot } from '@/shared/hooks/use-episode-portal-root';
import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import { DASH_MAX, placeDash, type DashPlace, type Rect } from './dash-placement.pure.ts';
import styles from './software-ecology.module.css';

export interface DashPopoverProps {
  readonly id: string;
  readonly floor: RefObject<HTMLDivElement | null>;
  readonly wrap: RefObject<HTMLElement | null>;
  readonly labelledBy: string;
  readonly children: ReactNode;
}

const rectOf = (el: Element): Rect => {
  const r = el.getBoundingClientRect();
  return { left: r.left, top: r.top, width: r.width, height: r.height };
};

const boxOf = (p: DashPlace | null): CSSProperties =>
  p
    ? ({ left: p.x, top: p.y, width: p.width, '--tail': `${p.tail}px` } as CSSProperties)
    : { left: 0, top: 0, width: DASH_MAX, visibility: 'hidden' };

function usePlace(p: DashPopoverProps, pop: RefObject<HTMLDivElement | null>) {
  const [place, setPlace] = useState<DashPlace | null>(null);
  useLayoutEffect(() => {
    const el = pop.current,
      card = p.floor.current?.querySelector(`[data-id="${p.id}"]`),
      wrap = p.wrap.current;
    if (!el || !card || !wrap) return;
    const view = () => ({ left: 0, top: 0, width: window.innerWidth, height: window.innerHeight });
    const again = () =>
      setPlace(placeDash({ card: rectOf(card), stage: rectOf(wrap), height: el.offsetHeight, view: view() }));
    again();
    const ro = new ResizeObserver(again);
    ro.observe(el);
    ro.observe(wrap);
    window.addEventListener('scroll', again, { capture: true, passive: true });
    window.addEventListener('resize', again, { passive: true });
    return () => {
      ro.disconnect();
      window.removeEventListener('scroll', again, { capture: true });
      window.removeEventListener('resize', again);
    };
  }, [p.id, p.floor, p.wrap, pop]);
  return place;
}

export function DashPopover(p: DashPopoverProps) {
  const root = useEpisodePortalRoot(),
    pop = useRef<HTMLDivElement>(null);
  const place = usePlace(p, pop);
  const placed = place !== null;
  useLayoutEffect(() => {
    if (placed) pop.current?.focus({ preventScroll: true });
  }, [placed, p.id]);
  const dialog = (
    <div
      ref={pop}
      className={`${styles.popover} shadow-md`}
      role="dialog"
      aria-labelledby={p.labelledBy}
      tabIndex={-1}
      data-side={place?.side}
      style={boxOf(place)}
    >
      {p.children}
    </div>
  );
  return root ? createPortal(dialog, root) : dialog;
}
