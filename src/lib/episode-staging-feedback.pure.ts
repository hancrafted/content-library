/*
 * The feedback rounds of a staging folder (design-ADR 0004): each item of the form its `via` asks for, and keyed
 * by a page Slide anchor of the Dossier. markdown-harness holds the file's frontmatter and h1; the items sit inside
 * a list, where it cannot see.
 */

import { unless, type Finding } from './finding.pure';
import { frontmatterField } from './staging-file.pure';
import { bodyLines, headingsOf, slideAnchors, type Block } from './staging-markdown.pure';

const FEEDBACK_FILE = /^feedback\/[^/]+\/feedback\.md$/;
const FEEDBACK_ITEM = /^- `([a-z0-9-]+--[a-z0-9-]+)` · (content|implementation|practice|design) — \S.*$/;

/*
 * A Spec review (`via: spec`) has its own item form: per Slide its picks, a pick of none needing a note, and one
 * optional `visual-language` item carrying the Visual language note alone.
 */
const SPEC_SLIDE_ITEM =
  /^- `([a-z0-9-]+--[a-z0-9-]+)` · design — picked: (?:none — \S.*|\d+[a-z](?:, \d+[a-z])*(?: — \S.*)?)$/;
const SPEC_VISUAL_LANGUAGE_ITEM = /^- `visual-language` · design — (?!picked:)\S.*$/;

function checkSpecFeedbackLine(line: string, anchors: readonly string[]): string[] {
  if (SPEC_VISUAL_LANGUAGE_ITEM.test(line)) return [];
  const item = SPEC_SLIDE_ITEM.exec(line);
  if (item === null)
    return [
      `Spec review line not of the form "- \`<section>--<slide>\` · design — picked: <option ids>|none — note" (the note required with none) or "- \`visual-language\` · design — note": "${line}".`,
    ];
  return unless(anchors.includes(item[1]), `Feedback anchor "${item[1]}" is no page slide in the Dossier.`);
}

function checkFeedbackFile(file: string, markdown: string, anchors: readonly string[]): Finding[] {
  const via = frontmatterField(markdown, 'via');
  const practice = via === 'practice';
  const h1 = headingsOf(bodyLines(markdown)).find(({ level }) => level === 1)?.line;
  const messages = bodyLines(markdown).flatMap((line, index) => {
    if (line.trim() === '' || index === h1) return [];
    if (via === 'spec') return checkSpecFeedbackLine(line, anchors);
    const item = FEEDBACK_ITEM.exec(line);
    if (item === null) {
      const tags = practice ? 'content|implementation|practice' : 'content|implementation';
      return [`Feedback line not of the form "- \`<section>--<slide>\` · ${tags} — text": "${line}".`];
    }
    const [, anchor, tag] = item;
    return [
      ...unless(
        tag !== 'practice' || practice,
        `Feedback item "${line}" is tagged practice, which only a file with "via: practice" may use.`,
      ),
      ...unless(
        tag !== 'design',
        `Feedback item "${line}" is tagged design, which only a Spec review, a file with "via: spec", may use.`,
      ),
      ...unless(anchors.includes(anchor), `Feedback anchor "${anchor}" is no page slide in the Dossier.`),
    ];
  });
  return messages.map((message): Finding => ({ kind: 'feedback', file, message }));
}

/** Every feedback round of the folder, its items checked against the Dossier's page Slide anchors. */
export function checkFeedback(files: Readonly<Record<string, string>>, dossier: readonly Block[]): Finding[] {
  const anchors = slideAnchors(dossier);
  return Object.entries(files)
    .filter(([file]) => FEEDBACK_FILE.test(file))
    .flatMap(([file, markdown]) => checkFeedbackFile(file, markdown, anchors));
}
