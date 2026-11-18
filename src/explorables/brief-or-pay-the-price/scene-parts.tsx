import { cn } from '@/shared/lib/utils';
import type { CSSProperties, ReactNode } from 'react';
import styles from './mirror.module.css';

export interface SceneProps {
  ai: boolean;
}

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

export function SceneSvg({ width, children }: { width: number; children: ReactNode }) {
  return (
    <svg
      className={styles.anim}
      viewBox={`0 0 ${width} 72`}
      style={{ aspectRatio: `${width} / 72` }}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

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

export function Who({ ai, x, y, className }: SceneProps & { x: number; y: number; className?: string }) {
  return ai ? <AiIcon x={x} y={y} className={className} /> : <Person x={x} y={y} className={className} />;
}

export const inkOf = (ai: boolean): string => (ai ? 'fill-none stroke-ai' : 'fill-none stroke-foreground');
export const paperOf = (ai: boolean): string => (ai ? 'fill-ai/10 stroke-ai' : 'fill-card stroke-foreground');
export const textOf = (ai: boolean): string => (ai ? 'fill-ai' : 'fill-foreground');

export function DrawnArrow({
  x1,
  x2,
  y,
  ai,
  d,
  t = 0.4,
}: SceneProps & { x1: number; x2: number; y: number; d: number; t?: number }) {
  return (
    <path
      className={`${styles.draw} ${inkOf(ai)}`}
      style={beat({ d, t })}
      pathLength={1}
      strokeDasharray="1"
      d={`M${x1} ${y}H${x2}m-4 -4 4 4-4 4`}
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
}

export function Check({ x, y, d }: { x: number; y: number; d: number }) {
  return (
    <g className={styles.pop} style={beat({ d, fx: 0 })}>
      <path
        d={`M${x - 5} ${y}l3.5 3.5 6.5 -7`}
        className="fill-none stroke-foreground"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  );
}

export function Mark({
  x,
  y,
  size,
  ai,
  d,
  children,
}: SceneProps & {
  x: number;
  y: number;
  size: number;
  d: number;
  children: ReactNode;
}) {
  return (
    <g className={styles.pop} style={beat({ d, fx: 0 })}>
      <Label x={x} y={y} size={size} className={`${textOf(ai)} font-semibold`}>
        {children}
      </Label>
    </g>
  );
}
