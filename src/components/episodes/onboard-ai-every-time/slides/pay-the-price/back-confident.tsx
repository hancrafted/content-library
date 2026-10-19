import { BackSvg, beat, Who, type BackProps } from './back-parts';
import styles from './trait-flip.module.css';

/** The three pieces that fit, each with its delay. */
const PIECES = [
  { x: 2, y: 2, d: 0.2 },
  { x: 24, y: 2, d: 0.45 },
  { x: 2, y: 24, d: 0.7 },
] as const;

/** Three pieces fit; a triangle wider than the square slot lodges crooked in it. */
function Puzzle({ fill }: { fill: string }) {
  return (
    <g transform="translate(6 13)">
      <rect width="46" height="46" rx="3" className="fill-none stroke-border" strokeWidth="1.2" />
      <rect
        x="24"
        y="24"
        width="20"
        height="20"
        rx="1.5"
        className="fill-none stroke-muted-foreground"
        strokeWidth="1.2"
        strokeDasharray="2.5 2"
      />
      {PIECES.map((piece) => (
        <rect
          key={`${piece.x} ${piece.y}`}
          className={`${styles.drop} ${fill}`}
          x={piece.x}
          y={piece.y}
          width="20"
          height="20"
          rx="1.5"
          style={beat({ d: piece.d })}
        />
      ))}
      <path className={`${styles.misfit} ${fill}`} d="M34 18 49 48H19Z" style={beat({ d: 1.1 })} />
    </g>
  );
}

/** Then a speech bubble (an AI chat bubble on the right) lands, and a checkmark draws in it. */
function SureBubble({ ai }: BackProps) {
  const ink = ai ? 'stroke-ai' : 'stroke-foreground';
  return (
    <>
      <g transform="translate(108 8)">
        <g className={styles.enter} style={beat({ d: 1.9 })}>
          <path
            d="M4 0h44a4 4 0 0 1 4 4v26a4 4 0 0 1-4 4h-30l-8 7v-7h-6a4 4 0 0 1-4-4v-26a4 4 0 0 1 4-4z"
            className={`${ai ? 'fill-ai/10' : 'fill-card'} ${ink}`}
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </g>
      </g>
      <path
        className={`${styles.draw} fill-none ${ink}`}
        style={beat({ d: 2.2, t: 0.45 })}
        pathLength={1}
        strokeDasharray="1"
        d="M123 25 131 33 146 17"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  );
}

/**
 * Confident, "Guesses": three puzzle pieces fit, a triangle wider than the square slot lodges crooked in it, then a
 * speech bubble with a checkmark lands, sure of itself.
 */
export function ConfidentBack({ ai }: BackProps) {
  return (
    <BackSvg>
      <Puzzle fill={ai ? 'fill-ai' : 'fill-foreground'} />
      <Who ai={ai} x={86} y={52} />
      <SureBubble ai={ai} />
    </BackSvg>
  );
}
