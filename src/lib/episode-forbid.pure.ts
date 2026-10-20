/*
 * The `--forbid` check of `episode:spec-assemble`: a rename leaves old terms behind in the Brief, the Dossier and the
 * title Slide. Takes file text and returns one finding per file line holding a term (case-insensitive, literal).
 */

export interface ForbiddenHit {
  file: string;
  line: number;
  term: string;
}

/** Splits `--forbid`'s value on commas; blanks are dropped. */
export const parseForbidden = (value: string): string[] =>
  value
    .split(',')
    .map((term) => term.trim())
    .filter((term) => term !== '');

export function findForbidden(files: Readonly<Record<string, string>>, terms: readonly string[]): ForbiddenHit[] {
  return Object.entries(files).flatMap(([file, text]) =>
    text
      .split('\n')
      .flatMap((content, index) =>
        terms
          .filter((term) => content.toLowerCase().includes(term.toLowerCase()))
          .map((term): ForbiddenHit => ({ file, line: index + 1, term })),
      ),
  );
}
