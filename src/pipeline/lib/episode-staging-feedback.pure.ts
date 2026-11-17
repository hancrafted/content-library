// decision: docs/adr/0004-episode-content-is-staged-then-promoted.md
import { TITLE_ANCHOR } from '../../shared/lib/title-anchor.pure';
import { SPEC_LINE_FORM, specLine } from './episode-spec-feedback-line.pure';
import { unless, type Finding } from './finding.pure';
import { frontmatterField } from './staging-file.pure';
import { bodyLines, headingsOf } from './staging-markdown.pure';

const FEEDBACK_FILE = /^feedback\/[^/]+\/feedback\.md$/;
const FEEDBACK_ITEM = /^- `([a-z0-9-]+(?:--[a-z0-9-]+)?)` · (content|implementation|practice|design) — \S.*$/;

export interface FeedbackAnchors {
  anchors: readonly string[];
  sections: readonly string[];
  source: 'Dossier' | 'Spec';
}

function unknownAnchor(anchor: string, { anchors, sections, source }: FeedbackAnchors): string[] {
  // Every Episode has a Title slide, so its anchor is always known.
  if (anchor === TITLE_ANCHOR) return [];
  if (!anchor.includes('--'))
    return unless(sections.includes(anchor), `Feedback anchor "${anchor}" is no section slide in the ${source}.`);
  return unless(anchors.includes(anchor), `Feedback anchor "${anchor}" is no page slide in the ${source}.`);
}

function checkSpecFeedbackLine(line: string, anchors: FeedbackAnchors): string[] {
  const item = specLine(line);
  if (item === undefined) return [`${SPEC_LINE_FORM}: "${line}".`];
  return item.kind === 'slide' ? unknownAnchor(item.anchor, anchors) : [];
}

function checkFeedbackLine(line: string, practice: boolean, anchors: FeedbackAnchors): string[] {
  const item = FEEDBACK_ITEM.exec(line);
  if (item === null) {
    const tags = practice ? 'content|implementation|practice' : 'content|implementation|design';
    return [
      `Feedback line not of the form "- \`top\`|\`<section>\`|\`<section>--<slide>\` · ${tags} — text": "${line}".`,
    ];
  }
  const [, anchor, tag] = item;
  return [
    ...unless(
      tag !== 'practice' || practice,
      `Feedback item "${line}" is tagged practice, which only a file with "via: practice" may use.`,
    ),
    ...unless(
      tag !== 'design' || !practice,
      `Feedback item "${line}" is tagged design, which a file with "via: practice" may not use: it reviews the recording.`,
    ),
    ...unknownAnchor(anchor, anchors),
  ];
}

function checkFeedbackFile(file: string, markdown: string, anchors: FeedbackAnchors): Finding[] {
  const via = frontmatterField(markdown, 'via');
  const h1 = headingsOf(bodyLines(markdown)).find(({ level }) => level === 1)?.line;
  const messages = bodyLines(markdown).flatMap((line, index) => {
    if (line.trim() === '' || index === h1) return [];
    if (via === 'spec') return checkSpecFeedbackLine(line, anchors);
    return checkFeedbackLine(line, via === 'practice', anchors);
  });
  return messages.map((message): Finding => ({ kind: 'feedback', file, message }));
}

export function checkFeedback(files: Readonly<Record<string, string>>, anchors: FeedbackAnchors): Finding[] {
  return Object.entries(files)
    .filter(([file]) => FEEDBACK_FILE.test(file))
    .flatMap(([file, markdown]) => checkFeedbackFile(file, markdown, anchors));
}
