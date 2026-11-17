import { crestPath, waveCrest } from '@/shared/lib/wave-crest.pure';
import styles from './wave-front.module.css';

const WIDTH = 2000;
const HEIGHT = 100;
const FRONT = waveCrest({ seed: 11, width: WIDTH, height: HEIGHT, peaks: 13 });
const BACK = waveCrest({ seed: 29, width: WIDTH, height: HEIGHT, peaks: 9 });
const FRONT_PATH = crestPath(FRONT, HEIGHT);
const BACK_PATH = crestPath(BACK, HEIGHT);
const FOAM = FRONT.map(([x, y]) => `${x},${y}`).join(' ');

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
