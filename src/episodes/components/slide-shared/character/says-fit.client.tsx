'use client';

import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import styles from './emote.module.css';
import { saysFit } from './says.pure';

/** The scale the `transform` attributes between `node` and `root` apply, CSS motion left out. */
function transformScale(node: SVGGraphicsElement, root: SVGSVGElement): number {
  let scale = 1;
  for (let el: Element | null = node; el && el !== root; el = el.parentElement) {
    const matrix = el instanceof SVGGraphicsElement ? el.transform.baseVal.consolidate()?.matrix : undefined;
    if (matrix) scale *= Math.hypot(matrix.a, matrix.b);
  }
  return scale;
}

/** Screen pixels per user unit of the picture itself, from its layout size, viewBox and aspect-ratio rule. */
function viewBoxScale(root: SVGSVGElement): number {
  const box = root.viewBox.baseVal;
  if (!box || box.width === 0 || box.height === 0) return 1;
  const [x, y] = [root.clientWidth / box.width, root.clientHeight / box.height];
  const { align, meetOrSlice } = root.preserveAspectRatio.baseVal;
  if (align === SVGPreserveAspectRatio.SVG_PRESERVEASPECTRATIO_NONE) return x;
  return meetOrSlice === SVGPreserveAspectRatio.SVG_MEETORSLICE_SLICE ? Math.max(x, y) : Math.min(x, y);
}

/**
 * Screen pixels per user unit at `node`, from the picture's layout size and the `transform` attributes between them.
 * CSS motion (the emote's pop, a panel sliding in) is left out on purpose: a measure taken mid-animation would turn
 * the words up for good.
 */
function unitPx(node: SVGGraphicsElement): number {
  const root = node.ownerSVGElement;
  return root ? transformScale(node, root) * viewBoxScale(root) : 0;
}

/**
 * The speech bubble's words at their size (decision 53): drawn at the figure's scale times the Scene's
 * `--says-scale`, and turned up by `--says-fit` wherever that would draw them smaller than their caption size. It
 * remeasures when the picture resizes; until hydration the words draw at the figure's scale.
 */
export function SaysFit({ children }: { readonly children: ReactNode }) {
  const ref = useRef<SVGGElement>(null);
  const [fit, setFit] = useState(1);
  useLayoutEffect(() => {
    const node = ref.current;
    const root = node?.ownerSVGElement;
    if (!node || !root) return;
    const measure = () => {
      const scale = Number.parseFloat(getComputedStyle(node).getPropertyValue('--says-scale')) || 1;
      setFit(saysFit({ unitPx: unitPx(node), scale }));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(root);
    return () => observer.disconnect();
  }, []);
  return (
    <g
      ref={ref}
      data-says-fit={fit === 1 ? undefined : fit.toFixed(2)}
      className={styles.saysScale}
      style={{ '--says-fit': fit } as CSSProperties}
    >
      {children}
    </g>
  );
}
