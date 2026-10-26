import { AiIcon, BackSvg, beat, Label, Person, type BackProps } from './back-parts';
import styles from './trait-flip.module.css';

/** The words a redacted handbook still shows: the first of line one, one on line two, a small one on the last. */
export interface HandbookWords {
  first: string;
  second: string;
  last: string;
}

/** The handbook's lines: the word left showing, if any, its baseline and size, and where the redaction starts. */
const LINES = [
  { word: 'first', y: 30, size: 9, from: 28 },
  { word: 'second', y: 42, size: 9, from: 48 },
  { word: null, y: 54, size: 9, from: 7 },
  { word: 'last', y: 64, size: 6, from: 30 },
] as const;

const PAGE_WIDTH = 100;
const LINE_END = PAGE_WIDTH - 7;

/** One handbook line: its word, if one is left showing, the words after it, and the bar that blacks them out. */
function HandbookLine({ line, word, redacts }: { line: (typeof LINES)[number]; word: string | null; redacts: number }) {
  const height = line.size * 0.7;
  return (
    <g>
      {word && (
        <Label x={7} y={line.y} size={line.size} anchor="start" className="fill-foreground">
          {word}
        </Label>
      )}
      <path
        d={`M${line.from} ${line.y - height / 2}H${LINE_END}`}
        className="stroke-muted-foreground"
        strokeWidth={height * 0.6}
        strokeDasharray="9 2.5 6 2.5 12 2.5"
      />
      <rect
        className={`${styles.redact} fill-foreground`}
        x={line.from}
        y={line.y - height}
        width={LINE_END - line.from}
        height={height}
        rx="1"
        style={beat({ d: redacts })}
      />
    </g>
  );
}

/**
 * Beat 2: the "How we work here" handbook arrives as lines of words, then most of them are blacked out, line by
 * line; a word or two is left showing, so the rest reads as withheld.
 */
function Handbook({ title, words, x }: { title: string; words: HandbookWords; x: number }) {
  const arrives = 1.6;
  return (
    <g transform={`translate(${x} 2)`}>
      <g className={styles.enter} style={beat({ d: arrives })}>
        <rect width={PAGE_WIDTH} height="68" rx="3" className="fill-card stroke-border" strokeWidth="1.4" />
        <Label x={PAGE_WIDTH / 2} y={13} size={9.75} className="fill-foreground font-semibold">
          {title}
        </Label>
        <path d={`M6 18H${PAGE_WIDTH - 6}`} className="stroke-border" strokeWidth="1" />
        {LINES.map((line, index) => (
          <HandbookLine
            key={line.y}
            line={line}
            word={line.word && words[line.word]}
            redacts={Math.round((arrives + 0.6 + index * 0.3) * 100) / 100}
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

/** Beat 1, the freelancer: diplomas light up around them, the group's left edge at `x`. */
function Diplomas({ x }: { x: number }) {
  return (
    <g transform={`translate(${x} 0)`}>
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
    </g>
  );
}

const GLOBE = 17;
const AI_ICON = 58;

/** Beat 1, the AI: a globe feeds documents into it, both there from the start. */
function Globe() {
  return (
    <>
      <g transform={`translate(${GLOBE} 36)`}>
        <circle r="15" className="fill-card stroke-foreground" strokeWidth="1.4" />
        <ellipse rx="6" ry="15" className="fill-none stroke-muted-foreground" strokeWidth="1" />
        <path d="M-15 0H15M-13 -7H13M-13 7H13" className="stroke-muted-foreground" strokeWidth="1" />
      </g>
      {DOCUMENTS.map(([sx, sy], index) => (
        <g key={`${sx} ${sy}`} transform={`translate(${GLOBE + sx} ${36 + sy})`}>
          <g
            className={styles.fly}
            style={beat({ d: Math.round((0.2 + index * 0.22) * 100) / 100, tx: AI_ICON - GLOBE - sx, ty: -sy, s: 0.3 })}
          >
            <rect x="-4" y="-5" width="8" height="10" rx="1" className="fill-card stroke-ai" strokeWidth="1" />
          </g>
        </g>
      ))}
      <AiIcon x={AI_ICON} y={36} />
    </>
  );
}

/**
 * Informed: diplomas light up around the freelancer, or a globe feeds documents into the AI; then the
 * "How we work here" handbook arrives and is mostly blacked out. Read from the chip outwards: who knows, then the
 * handbook.
 */
export function InformedBack({ ai, handbook, words }: BackProps & { handbook: string; words: HandbookWords }) {
  return ai ? (
    <BackSvg width={182}>
      <Globe />
      <Handbook title={handbook} words={words} x={80} />
    </BackSvg>
  ) : (
    <BackSvg width={188}>
      <Handbook title={handbook} words={words} x={1} />
      <Diplomas x={112} />
    </BackSvg>
  );
}
