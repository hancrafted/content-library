'use client';

import { prefersReducedMotion } from '@/shared/hooks/prefers-reduced-motion';
import { useCallback, useEffect, useState, type RefObject } from 'react';
import styles from './ai-capability.module.css';

const cards = (list: HTMLElement) => [...list.querySelectorAll<HTMLElement>(':scope > [data-level]')];

function centred(list: HTMLElement): number {
  const middle = list.scrollLeft + list.clientWidth / 2;
  const items = cards(list);
  const distances = items.map((item) => Math.abs(item.offsetLeft + item.offsetWidth / 2 - middle));
  return distances.indexOf(Math.min(...distances));
}

export function useCarousel(list: RefObject<HTMLElement | null>) {
  const { index, narrow } = usePosition(list);
  const step = useCallback(
    (by: number) => {
      const element = list.current;
      if (element === null) return;
      const items = cards(element);
      const target = items[Math.max(0, Math.min(items.length - 1, index + by))];
      if (target === undefined) return;
      const left = target.offsetLeft - (element.clientWidth - target.offsetWidth) / 2;
      element.scrollTo({ left, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
    },
    [list, index],
  );
  return { index, narrow, step };
}

function usePosition(list: RefObject<HTMLElement | null>) {
  const [index, setIndex] = useState(0);
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const element = list.current;
    if (element === null) return;
    const measure = () => {
      setNarrow(element.scrollWidth > element.clientWidth + 1);
      setIndex(centred(element));
    };
    measure();
    element.addEventListener('scroll', measure, { passive: true });
    const resize = new ResizeObserver(measure);
    resize.observe(element);
    return () => {
      element.removeEventListener('scroll', measure);
      resize.disconnect();
    };
  }, [list]);
  return { index, narrow };
}

/** An arrow button, a 44 px target, faded at the carousel's end. */
function Arrow(props: {
  readonly label: string;
  readonly glyph: string;
  readonly disabled: boolean;
  readonly onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={props.label}
      disabled={props.disabled}
      onClick={props.onClick}
      className="grid size-11 place-items-center rounded-full border border-border bg-card disabled:opacity-35"
    >
      <span aria-hidden="true">{props.glyph}</span>
    </button>
  );
}

export function CarouselNav(props: {
  readonly count: number;
  readonly index: number;
  readonly onStep: (by: number) => void;
  readonly labels: { readonly previous: string; readonly next: string };
}) {
  return (
    <div className={`${styles.narrow} flex items-center justify-center gap-3`}>
      <Arrow label={props.labels.previous} glyph="‹" disabled={props.index === 0} onClick={() => props.onStep(-1)} />
      <span aria-hidden="true" className="flex gap-1.5">
        {Array.from({ length: props.count }, (_, each) => (
          <span key={each} className={`size-2 rounded-full ${each === props.index ? 'bg-foreground' : 'bg-border'}`} />
        ))}
      </span>
      <Arrow
        label={props.labels.next}
        glyph="›"
        disabled={props.index === props.count - 1}
        onClick={() => props.onStep(1)}
      />
    </div>
  );
}
