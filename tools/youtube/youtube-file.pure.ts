// The format of `recording/youtube.<lang>.md`, the copy `youtube:apply` writes to a video. Pure parse/serialize, shared
// by `youtube:chapters` (rewrites the block), the authoring skill (writes the text) and apply (reads all three parts).
//
//   ## Description        the video description; holds the generated block between the chapter markers
//   ## Pinned comment     the comment text
//   ## Comment ID         the posted comment's ID, empty until apply posted one
//   ## Applied fingerprint  optional: the fingerprint of the description apply last sent, so it can see Studio edits
//
// The markers are `<!-- chapters:start -->` / `<!-- chapters:end -->`; they are for the repo and never reach YouTube:
// send `publishedDescription(file)`, not `file.description`.
import { CHAPTER_END_MARKER, CHAPTER_START_MARKER } from './chapters.pure.ts';

export interface YoutubeFile {
  /** The description as stored, markers included. */
  readonly description: string;
  readonly pinnedComment: string;
  /** The posted comment's ID; '' until posted. */
  readonly commentId: string;
  /** The fingerprint of the description `youtube:apply` last sent; absent until it sent or confirmed one. */
  readonly appliedFingerprint?: string;
}

const HEADINGS = ['## Description', '## Pinned comment', '## Comment ID'] as const;
const APPLIED_HEADING = '## Applied fingerprint';

/** The `youtube.<lang>.md` file names; the language is the capture. */
export const YOUTUBE_FILE = /^youtube\.([a-z]{2})\.md$/;

/** The file name of the YouTube copy in a language. */
export function youtubeFileName(language: string): string {
  return `youtube.${language}.md`;
}

/** The text of a YouTube file. */
export function serializeYoutubeFile(file: YoutubeFile): string {
  const parts = [file.description, file.pinnedComment, file.commentId];
  const section = (heading: string, text: string): string => {
    const body = text.trim();
    return body === '' ? `${heading}\n` : `${heading}\n\n${body}\n`;
  };
  const sections = HEADINGS.map((heading, index) => section(heading, parts[index] ?? ''));
  if (file.appliedFingerprint) sections.push(section(APPLIED_HEADING, file.appliedFingerprint));
  return sections.join('\n');
}

/** The three parts of a YouTube file's text, or why it is none. */
export function parseYoutubeFile(text: string): { value: YoutubeFile } | { problems: string[] } {
  const all = text.replace(/\r\n/g, '\n').split('\n');
  const appliedAt = all.indexOf(APPLIED_HEADING);
  const lines = appliedAt === -1 ? all : all.slice(0, appliedAt);
  const applied =
    appliedAt === -1
      ? ''
      : all
          .slice(appliedAt + 1)
          .join('\n')
          .trim();
  const at = HEADINGS.map((heading) => lines.indexOf(heading));
  const ordered = at.every((position, index) => position !== -1 && position > (at[index - 1] ?? -1));
  if (!ordered) return { problems: [`must hold the headings ${HEADINGS.join(', ')} once each, in this order`] };
  const body = (index: number): string =>
    lines
      .slice((at[index] ?? 0) + 1, at[index + 1] ?? lines.length)
      .join('\n')
      .trim();
  const file = { description: body(0), pinnedComment: body(1), commentId: body(2) };
  return { value: applied === '' ? file : { ...file, appliedFingerprint: applied } };
}

/** The chapter lines between the markers of a description, or undefined when it has no complete block. */
export function chapterBlockLines(description: string): string[] | undefined {
  const lines = description.split('\n');
  const start = lines.indexOf(CHAPTER_START_MARKER);
  const end = lines.indexOf(CHAPTER_END_MARKER);
  return start === -1 || end <= start ? undefined : lines.slice(start + 1, end);
}

/** `description` with its block replaced by `block`, the text around it untouched; the block is appended when absent. */
export function withChapterBlock(description: string, block: string): string {
  const lines = description.split('\n');
  const start = lines.indexOf(CHAPTER_START_MARKER);
  const end = lines.indexOf(CHAPTER_END_MARKER);
  if (start === -1 || end <= start) return description.trim() === '' ? block : `${description.trimEnd()}\n\n${block}`;
  return [...lines.slice(0, start), block, ...lines.slice(end + 1)].join('\n');
}

/** The description as YouTube shows it: the marker lines removed, the chapter lines kept. */
export function publishedDescription(file: YoutubeFile): string {
  return file.description
    .split('\n')
    .filter((line) => line !== CHAPTER_START_MARKER && line !== CHAPTER_END_MARKER)
    .join('\n');
}
