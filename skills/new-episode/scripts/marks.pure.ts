// The agent marks, read back: the job id behind a commit message's
// `Agent:` trailer or an issue body's `Edited-by:` footer, null when the
// text is unmarked, which means the user wrote it, so a gate diff tells an agent's
// edit from the user's.

const MARK = /^(?:Agent|Edited-by): *(\S+) *$/;

export function agentOf(text: string): string | null {
  // Git trailer semantics: only the final paragraph counts, and only when every line of it is a `Key: value` trailer.
  const paragraph =
    text
      .trimEnd()
      .split(/\n[ \t]*\n/)
      .pop() ?? '';
  const lines = paragraph.split('\n');
  if (!lines.every((line) => /^[A-Za-z-]+: /.test(line))) return null;
  let job: string | null = null;
  for (const line of lines) {
    const match = MARK.exec(line);
    if (match) job = match[1];
  }
  return job;
}
