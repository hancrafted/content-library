import type { GroupProps } from './creature-group.pure';
import styles from './scenery.module.css';
import { bubbleShape, scatter } from './scenery.pure';

/*
 * The Abyss's rising bubbles, its ambient loop and the descent's. The other sea creatures each live in their own
 * file behind a frozen interface (`fish-school.tsx`, `jellies.tsx`, `whale.tsx`, `lanternfish.tsx`,
 * `siphonophore.tsx`), so a Fable redraw touches one creature at a time. Scenery only: the loop runs on the active
 * Slide alone and is gone under reduced motion, leaving each bubble where it is drawn.
 */

const BUBBLE_RADIUS = 6;
const BUBBLE_BEAT_SECONDS = 1.3;

/** Rising bubbles, the Abyss zone's loop and the descent's: each rises from where it is drawn and fades. */
export function Bubbles({ x, y, at, count = 7, seed = 1, scale = 1 }: Omit<GroupProps, 'flip'>) {
  const bubbles = at ?? scatter({ count, seed, spread: [24, 70], gap: [10, 14], sizes: [0.5, 1.2] });
  const shape = bubbleShape(BUBBLE_RADIUS);
  return (
    <g className={styles.scenery} data-bubbles transform={`translate(${x} ${y}) scale(${scale})`}>
      {bubbles.map((p, index) => (
        <g key={`${p.x}:${p.y}`} transform={`translate(${p.x} ${p.y}) scale(${p.s})`}>
          <g
            className={styles.rise}
            data-bubble
            data-motion="ambient"
            style={{ animationDelay: `${-index * BUBBLE_BEAT_SECONDS}s` }}
          >
            <polygon data-tone="bubble" points={shape.body} />
            <polygon data-tone="glint" points={shape.glint} />
          </g>
        </g>
      ))}
    </g>
  );
}
