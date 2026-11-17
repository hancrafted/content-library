// decision: docs/adr/0011-episode-design-is-reviewed-as-a-static-html-spec.md
import { TITLE_ANCHOR } from '../../shared/lib/title-anchor.pure.ts';
import { BRIEF_KEYS } from './episode-spec-brief.pure.ts';

export type SpecLine =
  | { kind: 'slide'; anchor: string; picks: string[] }
  | { kind: 'brief'; key: string }
  | { kind: 'visual-language' }
  | { kind: 'page' }
  | { kind: 'next'; action: 'redesign' | 'approve' };

const SLIDE_ITEM = new RegExp(
  `^- \`(${TITLE_ANCHOR}|[a-z0-9-]+--[a-z0-9-]+)\` · design — picked: (none|\\d+[a-z](?:, \\d+[a-z])*)(?: — \\S.*)?$`,
);
const BRIEF_ITEM = new RegExp(`^- \`(${BRIEF_KEYS.join('|')})\` · design — \\S.*$`);
const VISUAL_LANGUAGE_ITEM = /^- `visual-language` · design — (?!picked:)\S.*$/;
const PAGE_ITEM = /^- `page` · design — (?!picked:)\S.*$/;
const NEXT_ITEM = /^- `next` · gate — (redesign|approve)$/;

function slideItem(line: string): SpecLine | undefined {
  const slide = SLIDE_ITEM.exec(line);
  if (slide === null) return undefined;
  return {
    kind: 'slide',
    anchor: slide[1] ?? '',
    picks: (slide[2] ?? '').split(', ').filter((pick) => pick !== 'none'),
  };
}

function otherItem(line: string): SpecLine | undefined {
  const brief = BRIEF_ITEM.exec(line);
  if (brief !== null) return { kind: 'brief', key: brief[1] ?? '' };
  const next = NEXT_ITEM.exec(line);
  if (next !== null) return { kind: 'next', action: next[1] === 'approve' ? 'approve' : 'redesign' };
  if (VISUAL_LANGUAGE_ITEM.test(line)) return { kind: 'visual-language' };
  return PAGE_ITEM.test(line) ? { kind: 'page' } : undefined;
}

export function specLine(line: string): SpecLine | undefined {
  return otherItem(line) ?? slideItem(line);
}

export const SPEC_LINE_FORM =
  'Spec review line not of the form "- `<section>--<slide>` · design — picked: <option ids>|none, then an optional — note" (`top` for the Title slide) or "- `visual-language` · design — note" or "- `brief--<heading-slug>` · design — note" or "- `page` · design — note" or "- `next` · gate — redesign|approve"';
