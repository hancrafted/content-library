import { type Finding } from './finding.pure';
import { type Block } from './staging-markdown.pure';

/* A Visual under the h1 is the Visual check's finding, not this one's. */
const TITLE_BLOCKS = ['Speaker notes', 'Voice script'];

/**
 * The Title slide's block (the h1 and its h4s): no prose, and only the optional
 * Speaker notes and Voice script, which the writing jobs leave out and a
 * feedback round adds (FE-004 §6). Each is checked like any Slide's.
 */
export function checkTitleSlide(blocks: readonly Block[]): Finding[] {
  const finding = (message: string): Finding => ({ kind: 'title-slide', file: 'dossier.md', message });
  const end = blocks.findIndex(({ heading }, index) => index > 0 && heading.level <= 3);
  const title = blocks.slice(0, end === -1 ? blocks.length : end);
  if (title[0]?.heading.level !== 1) return [];
  const stray = title
    .slice(1)
    .filter(({ heading }) => heading.level !== 4 || ![...TITLE_BLOCKS, 'Visual'].includes(heading.text))
    .map(({ heading }) =>
      finding(`The Title slide holds "${heading.text}"; only Speaker notes and Voice script may sit under the h1.`),
    );
  const proseFindings = title[0].body
    .filter((line) => line.trim() !== '')
    .map((line) =>
      finding(
        `The Title slide's h1 holds prose "${line}"; the spoken opening goes under the first h2, or in a Voice script block.`,
      ),
    );
  return [...proseFindings, ...stray];
}
