import { TypedText, typedLength } from './typed-text';

/** A page Slide's Eyebrow: computed by the container from the table of contents, never authored. */
export interface EyebrowText {
  readonly section: string;
  readonly position: number;
  readonly count: number;
  /** The counter's reading for assistive tech, translated ("Page 1 of 2"); the bracketed `(1/2)` is hidden from it. */
  readonly label?: string;
}

/** The counter as the eyebrow shows it, in brackets. */
function counterOf({ position, count }: EyebrowText): string {
  return `(${position}/${count})`;
}

/** The Eyebrow's characters in typing order: the Section title, then `(n/N)`. */
export function eyebrowLength(eyebrow: EyebrowText): number {
  return typedLength(`${eyebrow.section}${counterOf(eyebrow)}`);
}

/**
 * The Eyebrow (design-ADR-0012): the line above a page Slide's title, its Section on
 * its place among that Section's page Slides in brackets, `(n/N)`, right after
 * it, as one line. Small, uppercase, muted, in the body font. `delays` types it in.
 */
export function SlideEyebrow({
  eyebrow,
  delays,
  next,
}: {
  eyebrow: EyebrowText;
  delays?: readonly number[];
  next: number;
}) {
  const split = typedLength(eyebrow.section);
  return (
    <p data-slot="slide-eyebrow" className="text-caption tracking-wide text-muted-foreground uppercase">
      <TypedText text={eyebrow.section} delays={delays?.slice(0, split)} next={delays?.[split] ?? next} />{' '}
      <span aria-hidden={eyebrow.label ? 'true' : undefined} className="tabular-nums">
        <TypedText text={counterOf(eyebrow)} delays={delays?.slice(split)} next={next} />
      </span>
      {eyebrow.label && <span className="sr-only">{eyebrow.label}</span>}
    </p>
  );
}
