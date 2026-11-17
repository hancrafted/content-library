import { cn } from '@/shared/lib/utils';
import type { CSSProperties, ReactNode } from 'react';
import styles from './trait-flip.module.css';

/*
 * What every back shares, from the prototype (`build2.py`): the 200 × 72 canvas, the freelancer, the AI chat icon with
 * its star, and a label sized from a type role. An element the beat moves sits inside its own `<g>`, never on a
 * `transform` attribute, so the CSS animation never replaces where the element is placed.
 */

export interface BackProps {
  ai: boolean;
}

/** The beat's timing variables: `d` the delay in seconds, `tx`/`ty`/`fx` offsets in px, `s` an end scale, `t` a duration. */
export function beat(vars: {
  d?: number;
  tx?: number;
  ty?: number;
  fx?: number;
  s?: number;
  t?: number;
}): CSSProperties {
  return {
    ...(vars.d !== undefined && { '--d': `${vars.d}s` }),
    ...(vars.tx !== undefined && { '--tx': `${vars.tx}px` }),
    ...(vars.ty !== undefined && { '--ty': `${vars.ty}px` }),
    ...(vars.fx !== undefined && { '--fx': `${vars.fx}px` }),
    ...(vars.s !== undefined && { '--s': vars.s }),
    ...(vars.t !== undefined && { '--t': `${vars.t}s` }),
  } as CSSProperties;
}

export function BackSvg({ width, children }: { width: number; children: ReactNode }) {
  return (
    <svg
      className={styles.anim}
      viewBox={`0 0 ${width} 72`}
      style={{ flexBasis: `${width / 16}rem`, aspectRatio: `${width} / 72` }}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

/** The caption role's size, in px; a label's size in user units scales it, so no font size is written here. */
const CAPTION_PIXELS = 14;

export function Label({
  x,
  y,
  size,
  className,
  anchor = 'middle',
  children,
}: {
  x: number;
  y: number;
  size: number;
  className: string;
  anchor?: 'start' | 'middle';
  children: ReactNode;
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${size / CAPTION_PIXELS})`}>
      <text textAnchor={anchor} className={cn('text-caption', className)}>
        {children}
      </text>
    </g>
  );
}

export function Person({ x, y, className }: { x: number; y: number; className?: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <g className={className}>
        <circle cx="0" cy="-5" r="4" className="fill-none stroke-foreground" strokeWidth="1.6" />
        <path
          d="M-8 9c1-5 4-7 8-7s7 2 8 7"
          className="fill-none stroke-foreground"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </g>
    </g>
  );
}

export function AiIcon({ x, y, className }: { x: number; y: number; className?: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <g className={className}>
        <path
          d="M-10 -8h20a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-12l-5 4v-4h-3a2 2 0 0 1-2-2v-10a2 2 0 0 1 2-2z"
          className="fill-ai/10 stroke-ai"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
        <path d="M0 -5 1.3 -1.3 5 0 1.3 1.3 0 5 -1.3 1.3 -5 0 -1.3 -1.3Z" className="fill-ai" />
      </g>
    </g>
  );
}

export function Who({ ai, x, y, className }: BackProps & { x: number; y: number; className?: string }) {
  return ai ? <AiIcon x={x} y={y} className={className} /> : <Person x={x} y={y} className={className} />;
}
