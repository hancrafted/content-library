/*
 * The feedback rounds of a staging folder (design-ADR 0004): each item of the form its `via` asks for, and keyed
 * by a page Slide anchor of the Episode's source: the Dossier, or the Spec once its Gate deleted the Dossier.
 * markdown-harness holds the file's frontmatter and h1; the items sit inside a list, where it cannot see.
 */

import { unless, type Finding } from './finding.pure';
import { frontmatterField } from './staging-file.pure';
import { bodyLines, headingsOf } from './staging-markdown.pure';

const FEEDBACK_FILE = /^feedback\/[^/]+\/feedback\.md$/;
const FEEDBACK_ITEM = /^- `([a-z0-9-]+--[a-z0-9-]+)` · (content|implementation|practice|design) — \S.*$/;

/*
 * A Spec review (`via: spec`) has its own item form: per Slide its picks, a pick of none needing a note, and one
 * optional `visual-language` item carrying the Visual language note alone.
 */
const SPEC_SLIDE_ITEM =
  /^- `([a-z0-9-]+--[a-z0-9-]+)` · design — picked: (?:none — \S.*|\d+[a-z](?:, \d+[a-z])*(?: — \S.*)?)$/;
const SPEC_VISUAL_LANGUAGE_ITEM = /^- `visual-language` · design — (?!picked:)\S.*$/;

/** The page Slide anchors feedback items may name, and the source they come from, as a finding names it. */
export interface FeedbackAnchors {
  anchors: readonly string[];
  source: 'Dossier' | 'Spec';
}

function unknownAnchor(anchor: string, { anchors, source }: FeedbackAnchors): string[] {
  return unless(anchors.includes(anchor), `Feedback anchor "${anchor}" is no page slide in the ${source}.`);
}

function checkSpecFeedbackLine(line: string, anchors: FeedbackAnchors): string[] {
  if (SPEC_VISUAL_LANGUAGE_ITEM.test(line)) return [];
  const item = SPEC_SLIDE_ITEM.exec(line);
  if (item === null)
    return [
      `Spec review line not of the form "- \`<section>--<slide>\` · design — picked: <option ids>|none — note" (the note required with none) or "- \`visual-language\` · design — note": "${line}".`,
    ];
  return unknownAnchor(item[1], anchors);
}

function checkFeedbackFile(file: string, markdown: string, anchors: FeedbackAnchors): Finding[] {
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
      ...unknownAnchor(anchor, anchors),
    ];
  });
  return messages.map((message): Finding => ({ kind: 'feedback', file, message }));
}

/** Every feedback round of the folder, its items checked against the page Slide anchors of the Episode's source. */
export function checkFeedback(files: Readonly<Record<string, string>>, anchors: FeedbackAnchors): Finding[] {
  return Object.entries(files)
    .filter(([file]) => FEEDBACK_FILE.test(file))
    .flatMap(([file, markdown]) => checkFeedbackFile(file, markdown, anchors));
}
