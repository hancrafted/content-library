import type { CSSProperties } from 'react';
import { Art } from '../../art/art';
import { artName } from '../../art/art.pure';
import styles from './sky.module.css';
import { SKY_TONES, skyColour, skyFacets } from './sky.pure';

/*
 * The Surface's sky and water (feedback 2, decision 8, as feedback 3, decision 41 changes it): the sky is a few large,
 * soft, low-contrast facets as in the Spec's Option 0a (`sky.pure.ts`); the Surface water stays flat, so sky and sea
 * read apart at a glance, with the lit waterline between them. By night (`.dark`) the sky turns a deep blue with a few
 * stars and the waterline stays lit, so sky and water separate in dark mode too.
 */

/** A few stars, as shares of the sky's width and height, kept clear of the low horizon. */
const STARS: readonly (readonly [number, number, number])[] = [
  [0.06, 0.12, 1],
  [0.17, 0.32, 0.7],
  [0.29, 0.08, 0.8],
  [0.41, 0.24, 1.1],
  [0.52, 0.06, 0.7],
  [0.63, 0.3, 0.9],
  [0.74, 0.14, 0.7],
  [0.86, 0.42, 0.8],
  [0.95, 0.22, 1],
];
const STAR_RADIUS = 3.5;

/** A four-pointed star of radius `r` at (x, y), as `points`. */
const star = (x: number, y: number, r: number) => {
  const w = r * 0.3;
  return `${x},${y - r} ${x + w},${y - w} ${x + r},${y} ${x + w},${y + w} ${x},${y + r} ${x - w},${y + w} ${x - r},${y} ${x - w},${y - w}`;
};

/** A path of every facet in one tone. */
const pathOf = (points: readonly string[]) =>
  points.map((corners) => `M${corners.split(' ').join('L').replaceAll(',', ' ')}Z`).join('');

/** The day tones as custom properties, read by the sky's CSS module, which swaps them for the night's under `.dark`. */
const DAY = Object.fromEntries(SKY_TONES.map((tone) => [`--${tone}-day`, skyColour(tone)])) as CSSProperties;

export interface SkyProps {
  /** Where the sky starts across; a hero sky starts a drawing's width left of the drawing, for its bleed. */
  readonly x?: number;
  readonly width: number;
  /** From the top of the drawing to the waterline. */
  readonly height: number;
  /** How far the sky runs on above the drawing's top, for a drawing its Scene moves down. */
  readonly rise?: number;
  readonly seed?: number;
}

/** The sky from the top of the Scene to the waterline: soft facets in four tones, stars by night. */
export function Sky({ x = 0, width, height, rise = 0, seed = 3 }: SkyProps) {
  const facets = skyFacets({ left: x, width, height, rise, seed });
  const tones = SKY_TONES.map((tone) => ({
    tone,
    points: facets.filter((facet) => facet.tone === tone).map(({ points }) => points),
  })).filter(({ points }) => points.length > 0);
  return (
    <g data-band="sky" className={styles.sky} style={DAY}>
      <Art name={artName('sky', { x, width, height, rise, seed })}>
        {tones.map(({ tone, points }) => (
          <path key={tone} data-tone={tone} d={pathOf(points)} />
        ))}
      </Art>
      <g data-stars>
        <Art name={artName('stars', { x, width, height })}>
          {STARS.map(([sx, sy, size]) => (
            <polygon key={`${sx}:${sy}`} points={star(x + sx * width, sy * height, STAR_RADIUS * size)} />
          ))}
        </Art>
      </g>
    </g>
  );
}

/** Flat water under the waterline, in the Scene's `--water`, a shade deeper towards the bottom. */
export function FlatWater({ width, height }: { readonly width: number; readonly height: number }) {
  return (
    <g data-band="water" className={styles.water}>
      <rect data-water-step={0} x={0} y={0} width={width} height={height * 0.55} />
      <rect data-water-step={1} x={0} y={height * 0.55} width={width} height={height * 0.45} />
    </g>
  );
}

const WATERLINE_GLINT = 4;

/** The lit line where sky meets water, so the two read apart by day and by night. */
export function LitWaterline({ width, y }: { readonly width: number; readonly y: number }) {
  return (
    <rect
      data-lit-waterline
      x={0}
      y={y - WATERLINE_GLINT / 2}
      width={width}
      height={WATERLINE_GLINT}
      className={styles.waterline}
    />
  );
}
