import { polyBubbleFacets, toPoints } from '@/shared/lib/poly-bubble.pure';
import { cn } from '@/shared/lib/utils';
import type { CSSProperties } from 'react';
import styles from './poly-bubble.module.css';

/**
 * What a host may say a bubble does, written to `data-motion`. The bubble never moves itself: its host moves it, by
 * transform or opacity only.
 * - `ambient`: a host's CSS loop (the Abyss scenery); browser checks exclude it from `settled`.
 * - `progress`: a host's scroll clock (the `bubbles` transition), so it has no end of its own.
 */
export const POLY_BUBBLE_MOTIONS = ['ambient', 'progress'] as const;
export type PolyBubbleMotion = (typeof POLY_BUBBLE_MOTIONS)[number];

/**
 * The custom properties a bubble mixes its colours from (FE-011-design-tokens; no raw colour). A host sets the first
 * on the bubble or any ancestor; the other two are global tokens.
 * - `--poly-bubble-tint`: the water's colour, by default `--info`.
 * - `--on-brand-accent`: the light, the lit facet and the glint.
 * - `--foreground`: the rim, mixed in so the bubble reads on any surface.
 */
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

/**
 * One faceted air bubble in the Iceberg style's low-poly manner: a 6- to 8-sided outline, a lit facet toward the
 * upper left, a shade facet opposite and one glint. A server component, plain inline SVG.
 *
 * Frozen interface (a later redraw changes the drawing only, never this): the props above; the anchor box, the
 * element's own box, square, with the bubble centred and touching its edges (`viewBox="-10 -10 20 20"`); the tokens in
 * `POLY_BUBBLE_TOKENS`; the `data-motion` names in `POLY_BUBBLE_MOTIONS`; and the `data-poly-bubble` hook.
 */
export function PolyBubble({ sides = 7, motion, x, y, size, className, style }: PolyBubbleProps) {
  const [body, shade, lit, glint] = FACETS[sides];
  // Only the props a host set: an unset one would still cost bytes in the RSC payload, forty times per edge.
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
      {/* In order, as the CSS module reads them: body (its stroke the rim), shade, lit, glint. */}
      <polygon points={body} />
      <polygon points={shade} />
      <polygon points={lit} />
      <polygon points={glint} />
    </svg>
  );
}
