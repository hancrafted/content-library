import { type Finding } from './finding.pure';
import { frontmatterField } from './staging-file.pure';
import { bodyLines, headingsOf } from './staging-markdown.pure';

const SLUG_SUFFIX = / \{#[a-z0-9-]+\}$/;

// decision: docs/decision-records/0005-frontmatter-follows-okf.md
export function checkTitleMatchesH1(file: string, markdown: string): Finding[] {
  const title = frontmatterField(markdown, 'title');
  if (title === null) return [];
  const h1 = headingsOf(bodyLines(markdown))
    .find(({ level }) => level === 1)
    ?.text.replace(SLUG_SUFFIX, '');
  const message =
    h1 === undefined
      ? `The title is "${title}", but the file has no h1: add "# ${title}" or remove the title.`
      : `The title is "${title}", but the h1 is "${h1}": make the two equal.`;
  return title === h1 ? [] : [{ kind: 'title', file, message }];
}
