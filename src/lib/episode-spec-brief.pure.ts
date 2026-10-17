/*
 * The Brief card of the Spec intro (design-ADR 0011): the Brief headings Han reviews as the skeleton Spec, each with
 * a note field keyed `brief--<heading-slug>`. Imports only `.ts` paths, so the new-episode scripts run it under bare node.
 */

import { gateTier } from './staging-file.pure.ts';
import { bodyLines } from './staging-markdown.pure.ts';

/** The Brief headings the card shows, in card order. */
export const BRIEF_HEADINGS = ['Learning goal', 'Actionables', 'Research questions', 'Style', 'Constraints'] as const;

export const BRIEF_KEY_PREFIX = 'brief--';

/** The key slug of a card heading (a fixed, plain-word list). Not the Dossier anchor slug of episode-spec-source.pure.ts. */
const cardHeadingSlug = (heading: string): string => heading.toLowerCase().replace(/\s+/g, '-');

/** The feedback key of a card heading's note: `brief--learning-goal`. */
export const briefKey = (heading: string): string => `${BRIEF_KEY_PREFIX}${cardHeadingSlug(heading)}`;

/** Every key a Brief note may carry. */
export const BRIEF_KEYS: readonly string[] = BRIEF_HEADINGS.map(briefKey);

export interface BriefCardEntry {
  heading: string;
  key: string;
  /** The heading's lines, trimmed of blank edges. */
  lines: string[];
}

function under(lines: readonly string[], heading: string): string[] {
  const start = lines.indexOf(`## ${heading}`);
  if (start === -1) return [];
  const rest = lines.slice(start + 1);
  const end = rest.findIndex((line) => line.startsWith('#'));
  const text = (end === -1 ? rest : rest.slice(0, end)).join('\n').trim();
  return text === '' ? [] : text.split('\n');
}

/** The card's entries for the headings the Brief has, and whether the Brief is approved, so the card is read-only. */
export function briefCard(brief: string): { entries: BriefCardEntry[]; approved: boolean } {
  const lines = bodyLines(brief);
  const entries = BRIEF_HEADINGS.filter((heading) => lines.includes(`## ${heading}`)).map((heading) => ({
    heading,
    key: briefKey(heading),
    lines: under(lines, heading),
  }));
  return { entries, approved: gateTier(brief) === 'approved' };
}
