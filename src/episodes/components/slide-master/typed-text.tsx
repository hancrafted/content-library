import { isEmphasised, runsOf, type TextRange } from '@/episodes/lib/caption-emphasis.pure';
import type { CSSProperties } from 'react';

const EMPHASIS_CLASS = 'font-semibold text-primary';

export function typedLength(text: string): number {
  return Array.from(text.replace(/\s+/g, '')).length;
}

function charStyle(delayMilliseconds: number, holdMilliseconds: number): CSSProperties {
  return {
    '--d': `${delayMilliseconds.toFixed(1)}ms`,
    '--h': `${Math.max(holdMilliseconds, 0).toFixed(1)}ms`,
  } as CSSProperties;
}

interface TypedProps {
  readonly text: string;
  readonly delaysMilliseconds: readonly number[];
  readonly caretMovesOnAtMilliseconds: number;
  readonly emphasis?: readonly TextRange[];
}

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

function holdMilliseconds(delaysMilliseconds: readonly number[], at: number, caretMovesOnAtMilliseconds: number) {
  return (delaysMilliseconds[at + 1] ?? caretMovesOnAtMilliseconds) - delaysMilliseconds[at];
}

function TypedCharacters({ text, delaysMilliseconds, caretMovesOnAtMilliseconds, emphasis = [] }: TypedProps) {
  let index = 0;
  const spanOf = (character: string, offset: number, key: number) => {
    const at = index++;
    const set = isEmphasised(offset, emphasis);
    return (
      <TypedCharacter
        key={key}
        character={character}
        style={charStyle(delaysMilliseconds[at], holdMilliseconds(delaysMilliseconds, at, caretMovesOnAtMilliseconds))}
        emphasised={set}
      />
    );
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

export function TypedText({
  text,
  delaysMilliseconds,
  caretMovesOnAtMilliseconds,
  emphasis,
}: Omit<TypedProps, 'delaysMilliseconds'> & { readonly delaysMilliseconds?: readonly number[] }) {
  if (delaysMilliseconds === undefined) return <PlainText text={text} emphasis={emphasis} />;
  return (
    <>
      <span className="sr-only">{text}</span>
      <TypedCharacters
        text={text}
        delaysMilliseconds={delaysMilliseconds}
        caretMovesOnAtMilliseconds={caretMovesOnAtMilliseconds}
        emphasis={emphasis}
      />
    </>
  );
}
