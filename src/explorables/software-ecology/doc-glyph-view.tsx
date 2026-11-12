import styles from './software-ecology.module.css';

/*
 * A document as the canvas draws it (doc-sprites.ts `drawDoc`), in SVG for the DOM legend: the sheet with a folded
 * corner, a red minus when bad, a red warning for a complaint or rework, and an AI-made one tinted with a star.
 */

const DW = 9,
  DH = 11.5,
  DF = 3;
const SHEET = `M${-DW / 2} ${-DH / 2}L${DW / 2 - DF} ${-DH / 2}L${DW / 2} ${-DH / 2 + DF}L${DW / 2} ${DH / 2}L${-DW / 2} ${DH / 2}Z`;
const FOLD = `M${DW / 2 - DF} ${-DH / 2}L${DW / 2 - DF} ${-DH / 2 + DF}L${DW / 2} ${-DH / 2 + DF}Z`;
const starAt = (x: number, y: number, r: number) =>
  Array.from({ length: 8 }, (_, i) => {
    const a = (i * Math.PI) / 4 - Math.PI / 2,
      rr = i % 2 ? r * 0.32 : r;
    return `${i ? 'L' : 'M'}${(x + Math.cos(a) * rr).toFixed(2)} ${(y + Math.sin(a) * rr).toFixed(2)}`;
  }).join('') + 'Z';
const STAR = starAt(-DW / 2 + 0.3, -DH / 2 + 0.3, 3.4);
const sz = 0.95;

function Warn() {
  return (
    <>
      <path d="M0 -2.6L3.9 3.6L-3.9 3.6Z" className={styles.dDestr} />
      <rect x={-0.45 * sz} y={1.3 - 1.7 * sz} width={0.9 * sz} height={2.3 * sz} className={styles.dPaper} />
      <rect x={-0.45 * sz} y={1.3 + sz} width={0.9 * sz} height={0.85 * sz} className={styles.dPaper} />
    </>
  );
}

function Mark({ good, warn }: { good: boolean; warn: boolean }) {
  if (warn) return <Warn />;
  return good ? null : <rect x="-3" y="-0.95" width="6" height="1.9" rx="0.9" className={styles.dDestr} />;
}

export interface DocGlyphProps {
  readonly good: boolean;
  readonly ai?: boolean;
  readonly warn?: boolean;
}

/** One legend document, 18 by 21 CSS pixels; decorative. */
export function DocGlyph({ good, ai = false, warn = false }: DocGlyphProps) {
  return (
    <svg className={styles.docicon} viewBox="0 0 20 23" aria-hidden="true">
      <g transform="translate(10 11.6) scale(1.55)" strokeLinejoin="round">
        <path d={SHEET} className={ai ? styles.dAiSheet : styles.dSheet} strokeWidth={ai ? 1.5 : 0.9} />
        <path d={FOLD} className={styles.dFold} strokeWidth="0.7" />
        <Mark good={good} warn={warn} />
        {ai ? <path d={STAR} className={styles.dAi} /> : null}
      </g>
    </svg>
  );
}
