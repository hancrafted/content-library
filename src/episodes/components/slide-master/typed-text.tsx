import { isEmphasised, runsOf, type TextRange } from '@/episodes/lib/caption-emphasis.pure';
import type { CSSProperties } from 'react';

/** How an emphasised run of header text is set off: semibold, in `primary`. */
const EMPHASIS_CLASS = 'font-semibold text-primary';

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
  /** The runs of `text` to set off. */
  readonly emphasis?: readonly TextRange[];
}

/**
 * `text` split into `aria-hidden` character spans, grouped per word so a line
 * wraps only between words. CSS (`globals.css`, the typewriter) reveals each
 * at its `--d` and shows the caret on it for `--h`.
 */
/** The text's words and the whitespace between them, each with the index of its first character in the text. */
function partsOf(text: string): { part: string; offset: number }[] {
  let offset = 0;
  return text
    .split(/(\s+)/)
    .filter((part) => part !== '')
    .map((part) => {
      const at = offset;
      offset += part.length;
      return { part, offset: at };
    });
}

/** One typed character's span, set off when it lies in an emphasised run. */
function TypedCharacter({
  character,
  style,
  emphasised,
}: {
  character: string;
  style: CSSProperties;
  emphasised: boolean;
}) {
  return (
    <span
      data-char=""
      data-emphasis={emphasised ? '' : undefined}
      className={emphasised ? EMPHASIS_CLASS : undefined}
      style={style}
    >
      {character}
    </span>
  );
}

function TypedCharacters({ text, delays, next, emphasis = [] }: TypedProps) {
  let index = 0;
  const spanOf = (character: string, offset: number, key: number) => {
    const at = index++;
    const hold = (delays[at + 1] ?? next) - delays[at];
    const set = isEmphasised(offset, emphasis);
    return <TypedCharacter key={key} character={character} style={charStyle(delays[at], hold)} emphasised={set} />;
  };
  return (
    <span aria-hidden="true" data-typed="">
      {partsOf(text).map(({ part, offset }, key) =>
        /^\s+$/.test(part) ? (
          ' '
        ) : (
          <span key={key} className="whitespace-nowrap">
            {Array.from(part).map((character, i, all) =>
              spanOf(character, offset + all.slice(0, i).join('').length, i),
            )}
          </span>
        ),
      )}
    </span>
  );
}

/** Untyped text, its emphasised runs set off. */
function PlainText({ text, emphasis = [] }: { text: string; emphasis?: readonly TextRange[] }) {
  return runsOf(text, emphasis).map((run, key) =>
    run.emphasis ? (
      <b key={key} data-emphasis="" className={EMPHASIS_CLASS}>
        {run.text}
      </b>
    ) : (
      run.text
    ),
  );
}

/**
 * Header text as the reader sees it: whole without `delays`; with them, one
 * visually hidden copy for assistive tech and the typed characters beside it.
 * Either way its `emphasis` runs are set off in `primary` semibold.
 */
export function TypedText({
  text,
  delays,
  next,
  emphasis,
}: Omit<TypedProps, 'delays'> & { readonly delays?: readonly number[] }) {
  if (delays === undefined) return <PlainText text={text} emphasis={emphasis} />;
  return (
    <>
      <span className="sr-only">{text}</span>
      <TypedCharacters text={text} delays={delays} next={next} emphasis={emphasis} />
    </>
  );
}
