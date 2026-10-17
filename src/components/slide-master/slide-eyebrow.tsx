import { TypedText, typedLength } from './typed-text';

/** A page Slide's Eyebrow: computed by the container from the table of contents, never authored. */
export interface EyebrowText {
  readonly section: string;
  readonly position: number;
  readonly count: number;
}

/** The Eyebrow's characters in typing order: the Section title, then `n/N`. */
export function eyebrowLength(eyebrow: EyebrowText): number {
  return typedLength(`${eyebrow.section}${eyebrow.position}/${eyebrow.count}`);
}

/**
 * The Eyebrow (design-ADR-0012): the line above a page Slide's title, its Section on
 * the left and its place among that Section's page Slides, `n / N`, on the
 * right. Small, uppercase, muted, in the body font. `delays` types it in.
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
    <p
      data-slot="slide-eyebrow"
      className="mb-4 flex justify-between gap-6 text-caption tracking-wide text-muted-foreground uppercase"
    >
      <span>
        <TypedText text={eyebrow.section} delays={delays?.slice(0, split)} next={delays?.[split] ?? next} />
      </span>
      <span className="shrink-0 tabular-nums">
        <TypedText text={`${eyebrow.position} / ${eyebrow.count}`} delays={delays?.slice(split)} next={next} />
      </span>
    </p>
  );
}
