'use client';

import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import styles from './emote.module.css';
import { saysFit, saysRoom } from './says.pure';

function transformScale(node: SVGGraphicsElement, root: SVGSVGElement): number {
  let scale = 1;
  for (let el: Element | null = node; el && el !== root; el = el.parentElement) {
    const matrix = el instanceof SVGGraphicsElement ? el.transform.baseVal.consolidate()?.matrix : undefined;
    if (matrix) scale *= Math.hypot(matrix.a, matrix.b);
  }
  return scale;
}

function viewBoxScale(root: SVGSVGElement): number {
  const box = root.viewBox.baseVal;
  if (!box || box.width === 0 || box.height === 0) return 1;
  const [x, y] = [root.clientWidth / box.width, root.clientHeight / box.height];
  const { align, meetOrSlice } = root.preserveAspectRatio.baseVal;
  if (align === SVGPreserveAspectRatio.SVG_PRESERVEASPECTRATIO_NONE) return x;
  return meetOrSlice === SVGPreserveAspectRatio.SVG_MEETORSLICE_SLICE ? Math.max(x, y) : Math.min(x, y);
}

function unitPixels(node: SVGGraphicsElement): number {
  const root = node.ownerSVGElement;
  return root ? transformScale(node, root) * viewBoxScale(root) : 0;
}

const drawnPerCss = (words: HTMLElement, drawn: DOMRect) => (words.offsetWidth ? drawn.width / words.offsetWidth : 0);

function whilePopping(node: SVGGElement, then: () => void): boolean {
  const bubble = node.closest('[data-says-bubble]');
  const popping = bubble?.getAnimations().some((animation) => animation.playState === 'running') ?? false;
  if (popping) bubble?.addEventListener('animationend', then, { once: true });
  return popping;
}

function fitRoom(node: SVGGElement, side: 1 | -1) {
  const words = node.querySelector<HTMLElement>('[data-says]');
  const root = node.ownerSVGElement;
  if (!words || !root || whilePopping(node, () => fitRoom(node, side))) return;
  node.style.setProperty('--says-room', 'none');
  const drawn = words.getBoundingClientRect();
  const bubble = { left: drawn.left, right: drawn.right, drawnPerCss: drawnPerCss(words, drawn) };
  const room = saysRoom({ side, bubble, picture: root.getBoundingClientRect() });
  node.style.setProperty('--says-room', room === undefined ? 'none' : `${room}px`);
}

export function SaysFit({ side, children }: { readonly side: 1 | -1; readonly children: ReactNode }) {
  const ref = useRef<SVGGElement>(null);
  const [fit, setFit] = useState(1);
  useLayoutEffect(() => {
    const node = ref.current;
    const root = node?.ownerSVGElement;
    if (!node || !root) return;
    const measure = () => {
      const scale = Number.parseFloat(getComputedStyle(node).getPropertyValue('--says-scale')) || 1;
      setFit(saysFit({ unitPixels: unitPixels(node), scale }));
      requestAnimationFrame(() => fitRoom(node, side));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(root);
    return () => observer.disconnect();
  }, [side]);
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
