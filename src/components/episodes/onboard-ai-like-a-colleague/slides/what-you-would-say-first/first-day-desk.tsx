import type { TargetProps } from '@/lib/context-link.pure';
import styles from './first-day-desk.module.css';

/** One spoken line: its slug, its text and, when a Speaker note explains it, the note's target. */
export interface SpeechLine {
  slug: string;
  text: string;
  target?: TargetProps;
}

/** The new colleague, seated at an empty desk: no laptop, no papers, no label. Decorative. */
function DeskDrawing(props: TargetProps) {
  return (
    <div {...props} className="text-muted-foreground">
      <svg viewBox="0 0 240 240" aria-hidden="true" className={styles.desk}>
        {/* the figure: head, back, thigh, shin, arm */}
        <circle cx="62" cy="62" r="16" />
        <path d="M62 80 L66 140 L112 140 L114 196" />
        <path d="M64 100 L104 118" />
        {/* the chair */}
        <path d="M44 96 L48 146 L96 146 M56 146 L52 210 M90 146 L94 210" />
        {/* the empty desk */}
        <path d="M100 124 L224 124 M112 124 L112 210 M212 124 L212 210" />
      </svg>
    </div>
  );
}

/** One line as speech: the quote marks quieter than the words. */
function Speech({ line, quote }: { line: SpeechLine; quote: { open: string; close: string } }) {
  return (
    <li {...line.target} className="text-body text-pretty text-foreground">
      <span aria-hidden="true" className="text-muted-foreground">
        {quote.open}
      </span>
      {line.text}
      <span aria-hidden="true" className="text-muted-foreground">
        {quote.close}
      </span>
    </li>
  );
}

/*
 * A server part of this Slide: a seated figure at an empty desk, and the
 * sentences you would say to them, in the order you would say them. The lines
 * carry no labels and no numbers: nothing groups them. It takes plain props,
 * never the kit; the Slide passes the `data-target`s its notes name.
 */
export function FirstDayDesk({
  desk,
  lines,
  quote,
  ...props
}: {
  desk: TargetProps;
  lines: readonly SpeechLine[];
  quote: { open: string; close: string };
  'data-target'?: string;
}) {
  return (
    <div className="mt-12 grid items-center gap-12 md:grid-cols-[2fr_3fr]">
      <DeskDrawing {...desk} />
      <ol {...props} className={`${styles.lines} list-none`}>
        {lines.map((line) => (
          <Speech key={line.slug} line={line} quote={quote} />
        ))}
      </ol>
    </div>
  );
}
