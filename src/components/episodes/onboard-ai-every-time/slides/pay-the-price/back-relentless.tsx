import { BackSvg, beat, type BackProps } from './back-parts';
import styles from './trait-flip.module.css';

/** A clock whose hand turns twice a pass, centred on `x`. */
function Clock({ x, ink }: { x: number; ink: string }) {
  return (
    <g transform={`translate(${x} 36)`}>
      <circle r="15" className={`fill-card ${ink}`} strokeWidth="1.6" />
      {Array.from({ length: 12 }, (_, tick) => (
        <path key={tick} d="M0 -12v2" transform={`rotate(${tick * 30})`} className={ink} strokeWidth="1.2" />
      ))}
      <path d="M0 0V-10" className={`${styles.spin} ${ink}`} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M0 0H6" className={ink} strokeWidth="1.6" strokeLinecap="round" />
      <circle r="1.6" className="fill-foreground" />
    </g>
  );
}

/** Food, drink, sleep and toilet: what the freelancer goes without, banned one after another. */
const NEEDS = [
  { slug: 'food', x: 0, y: 22, d: 'M-4 -6v5a2 2 0 0 0 4 0v-5M-2 -6v12M3 -6c2 0 2 4 2 6h-2v6' },
  { slug: 'drink', x: 28, y: 22, d: 'M-5 -5h9l-1 11h-7zM4 -2h2a2 2 0 0 1 0 4h-2' },
  { slug: 'sleep', x: 0, y: 50, d: 'M2 -6a6 6 0 1 0 4 10a5 5 0 0 1-4-10z' },
  { slug: 'toilet', x: 28, y: 50, d: 'M-7 -3l1.5 6 1.5-4.5 1.5 4.5 1.5-6M5 -2.2a2.6 3 0 1 0 0 4.4' },
] as const;

const PAGES = 10;

/** Each need with its ban landing over it, one after another; the first column centred on `x`. */
function Bans({ x }: { x: number }) {
  return (
    <>
      {NEEDS.map((need, index) => (
        <g key={need.slug} transform={`translate(${x + need.x} ${need.y})`}>
          <path
            d={need.d}
            className="fill-none stroke-foreground"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <g className={styles.ban} style={beat({ d: Math.round((0.6 + index * 0.5) * 10) / 10 })}>
            <circle r="10" className="fill-none stroke-destructive" strokeWidth="1.8" />
            <path d="M-7 -7 7 7" className="stroke-destructive" strokeWidth="1.8" />
          </g>
        </g>
      ))}
    </>
  );
}

/** The pile of pages growing throughout, its left edge at `x`. */
function Pile({ ai, x }: BackProps & { x: number }) {
  const page = ai ? 'fill-ai/20 stroke-ai' : 'fill-card stroke-foreground';
  return (
    <>
      {Array.from({ length: PAGES }, (_, index) => (
        <rect
          key={index}
          className={`${styles.drop} ${page}`}
          x={x}
          y={64 - 6 * index}
          width="58"
          height="4.5"
          rx="1"
          strokeWidth="1"
          style={beat({ d: Math.round((0.3 + index * 0.3) * 100) / 100 })}
        />
      ))}
    </>
  );
}

/**
 * Relentless: a clock turns, food, drink, sleep and toilet are banned one after another, and a pile of pages grows
 * throughout. Read from the chip outwards: the clock, the bans, the pile; the AI side has the clock and the pile only.
 */
export function RelentlessBack({ ai }: BackProps) {
  return ai ? (
    <BackSvg width={104}>
      <Clock x={17} ink="stroke-ai" />
      <Pile ai x={44} />
    </BackSvg>
  ) : (
    <BackSvg width={154}>
      <Pile ai={false} x={2} />
      <Bans x={78} />
      <Clock x={137} ink="stroke-foreground" />
    </BackSvg>
  );
}
