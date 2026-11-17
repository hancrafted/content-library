// decision: docs/decision-records/0011-episode-design-is-reviewed-as-a-static-html-spec.md
import { gateTier } from './staging-file.pure.ts';
import { bodyLines } from './staging-markdown.pure.ts';

export const BRIEF_HEADINGS = [
  'Format',
  'Audience',
  'Style',
  'Learning goal',
  'Actionables',
  'Hook',
  'Red thread',
  'Analogy',
  'Constraints',
  'Research questions',
] as const;

export const BRIEF_KEY_PREFIX = 'brief--';

const cardHeadingSlug = (heading: string): string => heading.toLowerCase().replace(/\s+/g, '-');

export const briefKey = (heading: string): string => `${BRIEF_KEY_PREFIX}${cardHeadingSlug(heading)}`;

export const BRIEF_KEYS: readonly string[] = BRIEF_HEADINGS.map(briefKey);

export interface BriefCardEntry {
  heading: string;
  key: string;
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

export function briefCard(brief: string): { entries: BriefCardEntry[]; approved: boolean } {
  const lines = bodyLines(brief);
  const entries = BRIEF_HEADINGS.filter((heading) => lines.includes(`## ${heading}`)).map((heading) => ({
    heading,
    key: briefKey(heading),
    lines: under(lines, heading),
  }));
  return { entries, approved: gateTier(brief) === 'approved' };
}
