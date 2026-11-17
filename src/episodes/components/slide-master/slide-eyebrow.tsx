import { TypedText, typedLength } from './typed-text';

export interface EyebrowText {
  readonly section: string;
  readonly position: number;
  readonly count: number;
  /** The counter's reading for assistive tech, translated ("Page 1 of 2"); the bracketed `(1/2)` is hidden from it. */
  readonly label?: string;
}

function counterOf({ position, count }: EyebrowText): string {
  return `(${position}/${count})`;
}

export function eyebrowLength(eyebrow: EyebrowText): number {
  return typedLength(`${eyebrow.section}${counterOf(eyebrow)}`);
}

// decision: docs/adr/0012-slide-header-and-play-once-motion.md
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
