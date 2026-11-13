import { FISH, JELLY, WHALE } from './facet-data';
import { Facets } from './facets';
import styles from './scenery.module.css';
import { bubbleShape, scatter, type Placement } from './scenery.pure';

/*
 * The sea life `ZoneScene` draws, one creature per zone, each carrying its zone's one slow ambient loop: the fish
 * school sways (Sunlit), the jellies bob (Twilight), the whale glides (Midnight), the bubbles rise (Abyss and the
 * descent). Scenery only: the loop runs on the active Slide alone and is gone under reduced motion, leaving each
 * creature where it is drawn.
 */

interface GroupProps {
  /** The group's centre in the Scene. */
  readonly x: number;
  readonly y: number;
  /** Explicit members, relative to the centre; when given, `count` and `seed` are ignored. */
  readonly at?: readonly Placement[];
  readonly count?: number;
  /** Picks the scatter; the same seed always draws the same group. */
  readonly seed?: number;
  readonly scale?: number;
  /** Faces the group left instead of right. */
  readonly flip?: boolean;
}

const placeAt = (p: Placement, scale: number, flip = false) =>
  `translate(${p.x} ${p.y}) scale(${(flip ? -1 : 1) * p.s * scale} ${p.s * scale})`;

/** A school of small yellow fish, the Sunlit zone's creature; the school sways as one. */
export function FishSchool({ x, y, at, count = 11, seed = 1, scale = 1.3, flip = false }: GroupProps) {
  const fish = at ?? scatter({ count, seed, spread: [110, 32], gap: [30 * scale, 16 * scale] });
  return (
    <g className={styles.scenery} data-fish-school transform={`translate(${x} ${y})`}>
      <g className={styles.school} data-motion="ambient">
        {fish.map((p) => (
          <g key={`${p.x}:${p.y}`} data-fish transform={placeAt(p, scale, flip)}>
            <Facets layers={FISH} />
          </g>
        ))}
      </g>
    </g>
  );
}

const JELLY_BLOOM: readonly Placement[] = [
  { x: 0, y: 0, s: 1.4 },
  { x: 50, y: 40, s: 1 },
];

const JELLY_STAGGER_SECONDS = 3;

/** Pale jellyfish, the Twilight zone's creatures; each bobs on its own slow beat. Two by default, as the Spec drew. */
export function Jellies({ x, y, at, count, seed = 1, scale = 1 }: Omit<GroupProps, 'flip'>) {
  const jellies = at ?? (count === undefined ? JELLY_BLOOM : scatter({ count, seed, spread: [80, 50], gap: [26, 30] }));
  return (
    <g className={styles.scenery} data-jellies transform={`translate(${x} ${y})`}>
      {jellies.map((p, index) => (
        <g key={`${p.x}:${p.y}`} transform={placeAt(p, scale)}>
          <g
            className={styles.bob}
            data-jelly
            data-motion="ambient"
            style={{ animationDelay: `${-index * JELLY_STAGGER_SECONDS}s` }}
          >
            <Facets layers={JELLY} />
          </g>
        </g>
      ))}
    </g>
  );
}

export interface WhaleProps {
  /** The whale's centre in the Scene. */
  readonly x: number;
  readonly y: number;
  readonly scale?: number;
  /** Faces the whale left instead of right. */
  readonly flip?: boolean;
}

/** A humpback in large hand-cut planes, the Midnight zone's creature, gliding slowly back and forth. */
export function Whale({ x, y, scale = 0.8, flip = false }: WhaleProps) {
  return (
    <g
      className={styles.scenery}
      data-whale
      transform={`translate(${x} ${y}) scale(${(flip ? -1 : 1) * scale} ${scale})`}
    >
      <g className={styles.glide} data-motion="ambient">
        <Facets layers={WHALE} />
      </g>
    </g>
  );
}

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
