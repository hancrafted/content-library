'use client';

import { useEffect, useRef, useState, type RefObject } from 'react';
import { prefersReducedMotion } from './reduced-motion';

const HALF_MILLISECONDS = 200;
const STAGGER_MILLISECONDS = 40;
const EDGE_ON = 'perspective(600px) rotateX(90deg)';
const FACE_ON = 'perspective(600px) rotateX(0deg)';
const EDGE_OVER = 'perspective(600px) rotateX(-90deg)';

interface Flipper<T> {
  readonly ref: RefObject<HTMLButtonElement | null>;
  readonly shown: T;
}

export function useFlip<T>(value: T, index: number): Flipper<T> {
  const ref = useRef<HTMLButtonElement>(null);
  const [seen, setSeen] = useState(value);
  const [held, setHeld] = useState<T | null>(null);
  if (seen !== value) {
    setSeen(value);
    if (!prefersReducedMotion()) setHeld(seen);
  }
  useEffect(() => {
    const element = ref.current;
    if (held === null || element === null) return;
    const out = element.animate([{ transform: FACE_ON }, { transform: EDGE_ON }], {
      duration: HALF_MILLISECONDS,
      delay: index * STAGGER_MILLISECONDS,
      easing: 'ease-in',
      fill: 'both',
    });
    out.onfinish = () => {
      element.animate([{ transform: EDGE_OVER }, { transform: FACE_ON }], {
        duration: HALF_MILLISECONDS,
        easing: 'ease-out',
      });
      out.cancel();
      setHeld(null);
    };
    return () => out.cancel();
  }, [held, index]);
  return { ref, shown: held ?? value };
}
