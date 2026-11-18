'use client';

import { useLayoutEffect, useRef, useState, type CSSProperties, type RefObject } from 'react';
import styles from './thought-experiment.module.css';

interface Arc {
  readonly path: string;
  readonly width: number;
  readonly height: number;
  readonly textX: number;
  readonly textY: number;
}

const GAP = 6;
const MAX_DIP = 40;

function bottomCentre(board: DOMRect, element: Element): { x: number; y: number } {
  const box = element.getBoundingClientRect();
  return { x: box.left + box.width / 2 - board.left, y: box.bottom - board.top + GAP };
}

function measure(board: HTMLElement, from: string, to: string): Arc | null {
  const start = board.querySelector(`[data-note="${from}"]`);
  const end = board.querySelector(`[data-note="${to}"]`);
  if (start === null || end === null) return null;
  const box = board.getBoundingClientRect();
  const a = bottomCentre(box, start);
  const b = bottomCentre(box, end);
  const dip = Math.min(MAX_DIP, box.height * 0.28);
  return {
    path: `M${a.x} ${a.y}C${a.x} ${a.y + dip} ${b.x} ${b.y + dip} ${b.x} ${b.y}`,
    width: box.width,
    height: box.height,
    textX: (a.x + b.x) / 2,
    textY: Math.max(a.y, b.y) + dip * 0.75 + 16,
  };
}

function useArc(svg: RefObject<SVGSVGElement | null>, from: string, to: string): Arc | null {
  const [arc, setArc] = useState<Arc | null>(null);
  useLayoutEffect(() => {
    const board = svg.current?.parentElement;
    if (!board) return;
    const draw = () => setArc(measure(board, from, to));
    draw();
    const observer = new ResizeObserver(draw);
    observer.observe(board);
    return () => observer.disconnect();
  }, [svg, from, to]);
  return arc;
}

export function SeamArc({ from, to, label }: { readonly from: string; readonly to: string; readonly label: string }) {
  const svg = useRef<SVGSVGElement>(null);
  const arc = useArc(svg, from, to);
  return (
    <svg
      ref={svg}
      data-seam
      aria-hidden="true"
      viewBox={arc ? `0 0 ${arc.width} ${arc.height}` : undefined}
      className={`pointer-events-none absolute inset-0 size-full overflow-visible ${styles.rise}`}
      style={{ '--delay': '2.2s' } as CSSProperties}
    >
      {arc ? (
        <>
          <path d={arc.path} className={styles.seam} />
          <text x={arc.textX} y={arc.textY} textAnchor="middle" className="fill-destructive text-caption font-semibold">
            {label}
          </text>
        </>
      ) : null}
    </svg>
  );
}
