import styles from './flat-sky.module.css';

/*
 * The Surface's flat sky and water (decision 8 of feedback 2): no facets above the waterline or on the Surface water,
 * only a few flat steps of colour, so the sky and the sea read apart at a glance. By night (`.dark`) the sky turns a
 * deep blue with a few stars and the waterline stays lit, so sky and water separate in dark mode too.
 */

/** Where the sky's colour steps, as shares of its height from the top: zenith, mid sky, horizon. */
const SKY_STEPS = [0, 0.45, 0.8] as const;

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

/** The sky from the top of the Scene to the waterline: flat steps of the Surface's colour, stars by night. */
export function FlatSky({ width, height }: { readonly width: number; readonly height: number }) {
  return (
    <g data-band="sky" className={styles.sky}>
      {SKY_STEPS.map((from, index) => {
        const to = SKY_STEPS[index + 1] ?? 1;
        return (
          <rect key={from} data-sky-step={index} x={0} y={from * height} width={width} height={(to - from) * height} />
        );
      })}
      <g data-stars>
        {STARS.map(([x, y, size]) => (
          <polygon key={`${x}:${y}`} points={star(x * width, y * height, STAR_RADIUS * size)} />
        ))}
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
