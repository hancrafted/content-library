import { AiIcon, BackSvg, beat, Label, Person, type BackProps } from './back-parts';
import styles from './trait-flip.module.css';

/** The redaction bars' widths, one per handbook line. */
const BARS = [46, 34, 42, 28, 40];

/** Beat 2: the "How we work here" handbook arrives with every line blacked out. */
function Handbook({ title }: { title: string }) {
  const arrives = 1.6;
  return (
    <g transform="translate(124 6)">
      <g className={styles.enter} style={beat({ d: arrives })}>
        <rect width="64" height="60" rx="3" className="fill-card stroke-border" strokeWidth="1.4" />
        <Label x={32} y={11} size={6.5} className="fill-foreground font-semibold">
          {title}
        </Label>
        <path d="M6 15h52" className="stroke-border" strokeWidth="1" />
        {BARS.map((width, line) => (
          <rect
            key={line}
            className={`${styles.redact} fill-foreground`}
            x="7"
            y={20 + line * 8}
            width={width}
            height="5"
            rx="1"
            style={beat({ d: Math.round((arrives + 0.5 + line * 0.22) * 100) / 100 })}
          />
        ))}
      </g>
    </g>
  );
}

/** The trades the freelancer knows: code, maths, money, law. */
const DIPLOMAS = [
  { slug: 'code', x: 4, y: 6, glyph: '</>' },
  { slug: 'maths', x: 28, y: 2, glyph: '∑' },
  { slug: 'money', x: 52, y: 8, glyph: '€' },
  { slug: 'law', x: 54, y: 32, glyph: '§' },
] as const;

/** The documents a globe feeds into the AI, each from its offset on the globe. */
const DOCUMENTS = [
  [-6, -10],
  [6, -6],
  [-8, 4],
  [8, 8],
  [0, -2],
] as const;

/** Beat 1, the freelancer: diplomas light up around them. */
function Diplomas() {
  return (
    <>
      <Person x={30} y={46} />
      {DIPLOMAS.map((diploma, index) => (
        <g key={diploma.slug} transform={`translate(${diploma.x} ${diploma.y})`}>
          <g className={styles.enter} style={beat({ d: Math.round((0.2 + index * 0.25) * 100) / 100 })}>
            <rect width="20" height="13" rx="2" className="fill-primary" />
            <Label x={10} y={9.5} size={7.5} className="fill-primary-foreground font-semibold">
              {diploma.glyph}
            </Label>
          </g>
        </g>
      ))}
    </>
  );
}

/** Beat 1, the AI: a globe feeds documents into it. */
function Globe() {
  return (
    <>
      <g transform="translate(22 36)">
        <circle r="15" className="fill-card stroke-foreground" strokeWidth="1.4" />
        <ellipse rx="6" ry="15" className="fill-none stroke-muted-foreground" strokeWidth="1" />
        <path d="M-15 0H15M-13 -7H13M-13 7H13" className="stroke-muted-foreground" strokeWidth="1" />
      </g>
      {DOCUMENTS.map(([sx, sy], index) => (
        <g key={`${sx} ${sy}`} transform={`translate(${22 + sx} ${36 + sy})`}>
          <g
            className={styles.fly}
            style={beat({ d: Math.round((0.2 + index * 0.22) * 100) / 100, tx: 56 - sx, ty: -sy, s: 0.3 })}
          >
            <rect x="-4" y="-5" width="8" height="10" rx="1" className="fill-card stroke-ai" strokeWidth="1" />
          </g>
        </g>
      ))}
      <AiIcon x={78} y={36} className={styles.glow} />
    </>
  );
}

/**
 * Informed, "Redacted": diplomas light up around the freelancer, or a globe feeds documents into the AI; then the
 * "How we work here" handbook arrives with every line blacked out.
 */
export function InformedBack({ ai, handbook }: BackProps & { handbook: string }) {
  return (
    <BackSvg>
      {ai ? <Globe /> : <Diplomas />}
      <Handbook title={handbook} />
    </BackSvg>
  );
}
