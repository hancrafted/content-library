import { Art } from '../../art/art';
import { placeTransform, type GroupProps } from './creature-group.pure';
import styles from './lanternfish.module.css';
import { scatter } from './scenery.pure';

const DART_STAGGER_SECONDS = 1.7;

export function Lanternfish({ x, y, at, count = 9, seed = 3, scale = 1.2, flip = false }: GroupProps) {
  const school = at ?? scatter({ count, seed, spread: [120, 44], gap: [34 * scale, 14 * scale] });
  return (
    <g className={styles.lanternfish} data-lanternfish-school transform={`translate(${x} ${y})`}>
      {school.map((p, index) => (
        <g key={`${p.x}:${p.y}`} data-lanternfish transform={placeTransform(p, scale, flip)}>
          <g
            className={styles.dart}
            data-motion="ambient"
            style={{ animationDelay: `${-index * DART_STAGGER_SECONDS}s` }}
          >
            <Art name="lanternfish">
              {LANTERNFISH.map(({ tone, points }) => (
                <polygon key={points} data-tone={tone} points={points} />
              ))}
            </Art>
          </g>
        </g>
      ))}
    </g>
  );
}

const light = (x: number, y = 2.6, r = 0.9) => `${x},${y - r} ${x + r},${y} ${x},${y + r} ${x - r},${y}`;

const LANTERNFISH: readonly { readonly tone: string; readonly points: string }[] = [
  { tone: 'lantern-lit', points: '12,0 2,-5 -8,-2 0,0' },
  { tone: 'lantern', points: '12,0 0,0 -8,2 2,4.5' },
  { tone: 'lantern-lit', points: '-8,-2 -14.5,-6 -12,0' },
  { tone: 'lantern', points: '-12,0 -14.5,6 -8,2' },
  { tone: 'glint', points: '7,-2 9.5,-1.2 8,0.4' },
  ...[-4, -1, 2, 5].map((x) => ({ tone: 'lantern-glow', points: light(x) })),
];
