import { crestPath, waveCrest } from '@/shared/lib/wave-crest.pure';
import styles from './wave-front.module.css';

/** The crest's drawing box: twice the host's width, so the swell can travel across it as the edge progresses. */
const WIDTH = 2000;
const HEIGHT = 100;
const FRONT = waveCrest({ seed: 11, width: WIDTH, height: HEIGHT, peaks: 13 });
const BACK = waveCrest({ seed: 29, width: WIDTH, height: HEIGHT, peaks: 9 });
const FRONT_PATH = crestPath(FRONT, HEIGHT);
const BACK_PATH = crestPath(BACK, HEIGHT);
const FOAM = FRONT.map(([x, y]) => `${x},${y}`).join(' ');

/**
 * The `bubbles` transition's rising water: a canvas filled with `color`, its top edge an irregular, faceted crest
 * (`wave-crest.pure.ts`) over a paler back swell. No filter, blur or shadow: the page clock moves the water by its
 * transform (`inkTransform`), and the two crests drift sideways in opposite directions on the inherited
 * `--surface-edge-progress`, both transform only.
 */
export function WaveFront({ color, bleed }: { color: string; bleed: string }) {
  return (
    <div className={styles.canvas} style={{ inset: `calc(-1 * ${bleed})` }}>
      <div data-ink-scale data-wave-front className={styles.water} style={{ backgroundColor: color }}>
        <svg
          data-wave-crest="back"
          className={styles.back}
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          preserveAspectRatio="none"
          aria-hidden="true"
          style={{ fill: color }}
        >
          <path d={BACK_PATH} />
        </svg>
        <svg
          data-wave-crest="front"
          className={styles.front}
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          preserveAspectRatio="none"
          aria-hidden="true"
          style={{ fill: color }}
        >
          <path d={FRONT_PATH} />
          <polyline className={styles.foam} points={FOAM} />
        </svg>
      </div>
    </div>
  );
}
