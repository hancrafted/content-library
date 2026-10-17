import type { CSSProperties } from 'react';

/** Characters typed one by one: whitespace takes no turn. */
export function typedLength(text: string): number {
  return Array.from(text.replace(/\s+/g, '')).length;
}

/** A typed character's custom properties: when it appears (`--d`) and how long the caret sits on it (`--h`). */
function charStyle(delay: number, hold: number): CSSProperties {
  return { '--d': `${delay.toFixed(1)}ms`, '--h': `${Math.max(hold, 0).toFixed(1)}ms` } as CSSProperties;
}

interface TypedProps {
  readonly text: string;
  /** One delay per typed character, in milliseconds. */
  readonly delays: readonly number[];
  /** When the character after this text's last one appears, so the caret moves on then. */
  readonly next: number;
}

/**
 * `text` split into `aria-hidden` character spans, grouped per word so a line
 * wraps only between words. CSS (`globals.css`, the typewriter) reveals each
 * at its `--d` and shows the caret on it for `--h`.
 */
function TypedCharacters({ text, delays, next }: TypedProps) {
  let index = 0;
  const spanOf = (character: string, key: number) => {
    const at = index++;
    const hold = (delays[at + 1] ?? next) - delays[at];
    return (
      <span key={key} data-char="" style={charStyle(delays[at], hold)}>
        {character}
      </span>
    );
  };
  const words = text.split(/(\s+)/).filter((part) => part !== '');
  return (
    <span aria-hidden="true" data-typed="">
      {words.map((word, key) =>
        /^\s+$/.test(word) ? (
          ' '
        ) : (
          <span key={key} className="whitespace-nowrap">
            {Array.from(word).map(spanOf)}
          </span>
        ),
      )}
    </span>
  );
}

/**
 * Header text as the reader sees it: whole without `delays`; with them, one
 * visually hidden copy for assistive tech and the typed characters beside it.
 */
export function TypedText({
  text,
  delays,
  next,
}: Omit<TypedProps, 'delays'> & { readonly delays?: readonly number[] }) {
  if (delays === undefined) return <>{text}</>;
  return (
    <>
      <span className="sr-only">{text}</span>
      <TypedCharacters text={text} delays={delays} next={next} />
    </>
  );
}
