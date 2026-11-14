import { PolyBubble } from '@/shared/components/core-components/poly-bubble/poly-bubble';
import type { GroupProps } from './creature-group.pure';
import styles from './scenery.module.css';
import { scatter } from './scenery.pure';

/*
 * The Abyss's rising bubbles, its ambient loop and the descent's. Each is the shared faceted `PolyBubble`
 * (src/shared/components/core-components/poly-bubble/), the same drawing the `bubbles` transition uses; this group only places and
 * moves them. The other sea creatures each live in their own file behind a frozen interface (`fish-school.tsx`,
 * `jellies.tsx`, `whale.tsx`, `lanternfish.tsx`, `siphonophore.tsx`), so a Fable redraw touches one creature at a
 * time. Scenery only: the loop runs on the active Slide alone and is gone under reduced motion, leaving each bubble
 * where it is drawn.
 */

const BUBBLE_RADIUS = 6;
const BUBBLE_BEAT_SECONDS = 1.3;
/** Sides per bubble in turn, so a column never repeats one outline. */
const SIDES = [7, 6, 8] as const;

/** Rising bubbles, the Abyss zone's loop and the descent's: each rises from where it is drawn and fades. */
export function Bubbles({ x, y, at, count = 7, seed = 1, scale = 1 }: Omit<GroupProps, 'flip'>) {
  const bubbles = at ?? scatter({ count, seed, spread: [24, 70], gap: [10, 14], sizes: [0.5, 1.2] });
  return (
    <g className={styles.scenery} data-bubbles transform={`translate(${x} ${y}) scale(${scale})`}>
      {bubbles.map((p, index) => (
        <g key={`${p.x}:${p.y}`} transform={`translate(${p.x} ${p.y}) scale(${p.s})`}>
          {/* The host moves the bubble (rise and fade); the bubble names that motion and draws itself. */}
          <g className={styles.rise} data-bubble style={{ animationDelay: `${-index * BUBBLE_BEAT_SECONDS}s` }}>
            <PolyBubble
              sides={SIDES[index % SIDES.length]}
              motion="ambient"
              x={-BUBBLE_RADIUS}
              y={-BUBBLE_RADIUS}
              size={BUBBLE_RADIUS * 2}
            />
          </g>
        </g>
      ))}
    </g>
  );
}
