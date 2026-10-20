/*
 * The `--forbid` check of `episode:spec-assemble`: a rename leaves old terms behind in the Brief, the Dossier and the
 * title Slide. Takes file text and returns one finding per file line holding a term (case-insensitive, literal).
 */

import { parseArgs } from 'node:util';

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

export type SpecAssembleArgs = { episode: string; forbid: string[] | undefined } | { error: string };

const USAGE = 'usage: npm run episode:spec-assemble -- <slug | Episode folder> [--forbid <word,word…>]';

/** The command line of `episode:spec-assemble`: one Episode and an optional, non-empty `--forbid` list. */
export function parseSpecAssembleArgs(argv: readonly string[]): SpecAssembleArgs {
  try {
    const { values, positionals } = parseArgs({
      args: [...argv],
      options: { forbid: { type: 'string' } },
      allowPositionals: true,
    });
    const [episode, ...extra] = positionals;
    if (episode === undefined || extra.length > 0) return { error: USAGE };
    if (values.forbid === undefined) return { episode, forbid: undefined };
    const forbid = parseForbidden(values.forbid);
    if (forbid.length === 0) return { error: `--forbid names no term\n${USAGE}` };
    return { episode, forbid };
  } catch (error) {
    return { error: `${(error as Error).message}\n${USAGE}` };
  }
}
