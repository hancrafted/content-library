import { polyBubbleFacets, toPoints } from '@/shared/lib/poly-bubble.pure';
import { cn } from '@/shared/lib/utils';
import type { CSSProperties } from 'react';
import styles from './poly-bubble.module.css';

export const POLY_BUBBLE_MOTIONS = ['ambient', 'progress'] as const;
export type PolyBubbleMotion = (typeof POLY_BUBBLE_MOTIONS)[number];

// decision: FE-011 §4
export const POLY_BUBBLE_TOKENS = ['--poly-bubble-tint', '--on-brand-accent', '--foreground'] as const;

export interface PolyBubbleProps {
  readonly sides?: 6 | 7 | 8;
  readonly motion?: PolyBubbleMotion;
  readonly x?: number;
  readonly y?: number;
  readonly size?: number;
  readonly className?: string;
  readonly style?: CSSProperties;
}

const drawing = (sides: 6 | 7 | 8) => {
  const { outline, shade, lit, glint } = polyBubbleFacets(sides);
  return [outline, shade, lit, glint].map(toPoints);
};
const FACETS: Record<6 | 7 | 8, readonly string[]> = { 6: drawing(6), 7: drawing(7), 8: drawing(8) };

export function PolyBubble({ sides = 7, motion, x, y, size, className, style }: PolyBubbleProps) {
  const [body, shade, lit, glint] = FACETS[sides];
  const placed = Object.fromEntries(
    Object.entries({ x, y, width: size, height: size, 'data-motion': motion, style }).filter(
      ([, value]) => value !== undefined,
    ),
  );
  return (
    <svg
      viewBox="-10 -10 20 20"
      aria-hidden="true"
      data-poly-bubble
      className={cn(styles.bubble, className)}
      {...placed}
    >
      <polygon points={body} />
      <polygon points={shade} />
      <polygon points={lit} />
      <polygon points={glint} />
    </svg>
  );
}
