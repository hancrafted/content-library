import { BackSvg, beat, Label, Who, type BackProps } from './back-parts';
import styles from './trait-flip.module.css';

/** The column the source and its two receivers share, the middle the copies split from, and the two rows. */
const COLUMN = 14;
const MIDDLE = 37;
const ROWS = [14, 60] as const;

/** The source the brief comes from: a document for the freelancer, a box reading "prompt" for the AI. */
function Source({ ai }: BackProps) {
  return ai ? (
    <rect x="-17" y="-10" width="34" height="20" rx="5" className="fill-ai/10 stroke-ai" strokeWidth="1.4" />
  ) : (
    <rect x="-10" y="-13" width="20" height="26" rx="2" className="fill-card stroke-foreground" strokeWidth="1.4" />
  );
}

/** The source, fading as its two copies leave: the document with its lines, or the box reading "prompt". */
function Original({ ai, prompt }: BackProps & { prompt: string }) {
  return (
    <g className={styles.out} style={beat({ d: 0.45 })}>
      <g transform={`translate(${COLUMN} ${MIDDLE})`}>
        <Source ai={ai} />
        {!ai && <path d="M-5 -6h10M-5 -1h10M-5 4h7" className="stroke-muted-foreground" strokeWidth="1.2" />}
      </g>
      {ai && (
        <Label x={COLUMN} y={MIDDLE + 3} size={8} className="fill-ai">
          {prompt}
        </Label>
      )}
    </g>
  );
}

/** What the two receivers produce at the same moment: a circle from one, a triangle from the other. */
function Results({ ai }: BackProps) {
  const ink = ai ? 'stroke-ai' : 'stroke-foreground';
  return (
    <>
      <g className={styles.pop} style={beat({ d: 1.5, fx: -26 })}>
        <circle cx="72" cy={ROWS[0]} r="10" className={`fill-none ${ink}`} strokeWidth="2.4" />
      </g>
      <g className={styles.pop} style={beat({ d: 1.5, fx: -26 })}>
        <path d="M72 50 83 70H61Z" className={`fill-none ${ink}`} strokeWidth="2.4" strokeLinejoin="round" />
      </g>
    </>
  );
}

/** An arrow from each receiver to what it produced, drawn just before the shapes land. */
function Arrows({ ai }: BackProps) {
  const ink = ai ? 'stroke-ai' : 'stroke-foreground';
  return (
    <>
      {ROWS.map((y) => (
        <path
          key={y}
          pathLength={1}
          strokeDasharray="1"
          d={`M30 ${y}h26m-4 -4 4 4-4 4`}
          className={`${styles.draw} fill-none ${ink}`}
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={beat({ d: 1.15, t: 0.35 })}
        />
      ))}
    </>
  );
}

/**
 * Probabilistic: one document (or the prompt) splits up and down into two copies that shrink into two freelancers
 * (or two AI chats), stacked in two rows; at the same moment one points to a circle, the other to a triangle.
 */
export function ProbabilisticBack({ ai, prompt }: BackProps & { prompt: string }) {
  return (
    <BackSvg width={86}>
      <Original ai={ai} prompt={prompt} />
      {ROWS.map((row) => (
        <g key={row} transform={`translate(${COLUMN} ${MIDDLE})`}>
          <g className={styles.fly} style={beat({ d: 0.5, tx: 0, ty: row - MIDDLE })}>
            <Source ai={ai} />
          </g>
        </g>
      ))}
      {ROWS.map((row) => (
        <Who key={row} ai={ai} x={COLUMN} y={row} />
      ))}
      <Arrows ai={ai} />
      <Results ai={ai} />
    </BackSvg>
  );
}
