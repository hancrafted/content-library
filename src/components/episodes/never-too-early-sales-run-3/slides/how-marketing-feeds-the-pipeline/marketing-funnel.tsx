import type { CSSProperties, ReactNode } from 'react';
import { FunnelMotion } from './funnel-motion.client';
import styles from './how-marketing-feeds-the-pipeline.module.css';

/** The funnel's words: the mouth's label, its volume line, the three sources marketing speaks through, its name. */
export interface Funnel {
  label: string;
  volume: ReactNode;
  name: string;
  sources: { slug: 'content' | 'ads' | 'web'; label: string }[];
}

/** One line doodle per source, drawn on its note. */
const DOODLE = {
  content: <path d="M5 4 H15 L19 8 V20 H5 Z M8 11 H16 M8 15 H14" strokeLinejoin="round" />,
  ads: <path d="M4 10 V14 H7 L15 19 V5 L7 10 Z M18 9 C 20 11, 20 13, 18 15" strokeLinejoin="round" />,
  web: <path d="M3 5 H21 V19 H3 Z M3 9 H21 M6 7 H7 M9 7 H10" />,
} as const;

const TILT = ['-rotate-2', 'rotate-1', '-rotate-1'] as const;

/** The crowd in the funnel, wide at the mouth and narrowing to the spout. */
const CROWD = [
  [22, 40],
  [40, 90],
  [18, 140],
  [46, 190],
  [24, 240],
  [44, 290],
  [20, 320],
  [70, 60],
  [80, 130],
  [72, 230],
  [84, 300],
  [110, 105],
  [120, 175],
  [112, 255],
  [160, 140],
  [166, 215],
  [205, 168],
] as const;

/** The two dots leaving through the spout, in `primary`. */
const SPOUT = [
  [238, 185],
  [272, 178],
] as const;

/** A dot of the crowd: `--x` is how far it travels from the mouth, `--i` its turn. */
function Dot({ x, y, order, spout }: { x: number; y: number; order: number; spout: boolean }) {
  return (
    <circle
      data-funnel="dot"
      cx={x}
      cy={y}
      r={spout ? 6 : 5}
      style={{ '--x': x, '--i': order } as CSSProperties}
      className={spout ? 'fill-primary' : 'fill-muted-foreground'}
    />
  );
}

/** The funnel's mouth: its label, the three source notes with their doodles, and the volume line. */
function Mouth({ funnel }: { funnel: Funnel }) {
  return (
    <div className="relative z-10 flex flex-col gap-4">
      <p className="font-mono text-caption font-semibold tracking-widest text-foreground uppercase">{funnel.label}</p>
      <ul role="list" className={styles.sources}>
        {funnel.sources.map((source, index) => (
          <li key={source.slug} className={`bg-card px-4 py-3 shadow-md ${TILT[index % TILT.length]}`}>
            <svg
              viewBox="0 0 24 24"
              className="mb-1 w-5 fill-none stroke-foreground"
              strokeWidth="1.5"
              aria-hidden="true"
            >
              {DOODLE[source.slug]}
            </svg>
            <p className="text-caption font-semibold text-foreground">{source.label}</p>
          </li>
        ))}
      </ul>
      <p className="font-mono text-caption text-muted-foreground">{funnel.volume}</p>
    </div>
  );
}

/** The funnel itself: a pale shape, the crowd narrowing inside it, and the `primary` spout. */
function Shape() {
  return (
    <svg viewBox="0 0 300 360" className={styles.shape} aria-hidden="true">
      <path
        d="M0 6 C 140 20, 210 150, 300 160 L300 200 C 210 210, 140 340, 0 354 Z"
        className="fill-muted stroke-border"
        strokeWidth="2"
      />
      {CROWD.map(([x, y], index) => (
        <Dot key={`${x}-${y}`} x={x} y={y} order={index} spout={false} />
      ))}
      {SPOUT.map(([x, y], index) => (
        <Dot key={`${x}-${y}`} x={x} y={y} order={CROWD.length + index} spout />
      ))}
      <path
        data-funnel="spout"
        d="M282 180 H300"
        className="fill-none stroke-primary"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * Marketing as a funnel in the board idiom: a mouth of three source notes with line doodles over "massive volume",
 * then a funnel of dots narrowing to a `primary` spout that points into the pipeline's first stage. The dots travel
 * in once on the Slide's first `active` and again on every mouse enter and keyboard focus.
 */
export function MarketingFunnel({ funnel }: { funnel: Funnel }) {
  return (
    <FunnelMotion label={funnel.name} className={styles.funnel}>
      <Mouth funnel={funnel} />
      <Shape />
    </FunnelMotion>
  );
}
