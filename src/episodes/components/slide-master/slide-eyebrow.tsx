import { TypedText, typedLength } from './typed-text';

export interface EyebrowText {
  readonly section: string;
  readonly position: number;
  readonly count: number;
  readonly label?: string;
}

function counterOf({ position, count }: EyebrowText): string {
  return `(${position}/${count})`;
}

export function eyebrowLength(eyebrow: EyebrowText): number {
  return typedLength(`${eyebrow.section}${counterOf(eyebrow)}`);
}

// decision: docs/decision-records/0012-slide-header-and-play-once-motion.md
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
      <TypedText
        text={eyebrow.section}
        delaysMilliseconds={delays?.slice(0, split)}
        caretMovesOnAtMilliseconds={delays?.[split] ?? next}
      />{' '}
      <span aria-hidden={eyebrow.label ? 'true' : undefined} className="tabular-nums">
        <TypedText
          text={counterOf(eyebrow)}
          delaysMilliseconds={delays?.slice(split)}
          caretMovesOnAtMilliseconds={next}
        />
      </span>
      {eyebrow.label && <span className="sr-only">{eyebrow.label}</span>}
    </p>
  );
}
