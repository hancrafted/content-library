import { PolyBubble } from '@/shared/components/core-components/poly-bubble/poly-bubble';
import { placeTransform, type GroupProps } from './creature-group.pure';
import styles from './scenery.module.css';
import { scatter } from './scenery.pure';

const BUBBLE_RADIUS = 6;
const BUBBLE_BEAT_SECONDS = 1.3;
const SIDES = [7, 6, 8] as const;

export function Bubbles({ x, y, at, count = 7, seed = 1, scale = 1 }: Omit<GroupProps, 'flip'>) {
  const bubbles =
    at ?? scatter({ count, seed, spread: [24 * scale, 70 * scale], gap: [10 * scale, 14 * scale], sizes: [0.5, 1.2] });
  return (
    <g className={styles.scenery} data-bubbles transform={`translate(${x} ${y})`}>
      {bubbles.map((p, index) => (
        <g key={`${p.x}:${p.y}`} transform={placeTransform(p, scale)}>
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
