const MARK = /^(?:Agent|Edited-by): *(\S+) *$/;

export function agentOf(text: string): string | null {
  const finalParagraphCountsAsGitTrailers =
    text
      .trimEnd()
      .split(/\n[ \t]*\n/)
      .pop() ?? '';
  const lines = finalParagraphCountsAsGitTrailers.split('\n');
  if (!lines.every((line) => /^[A-Za-z-]+: /.test(line))) return null;
  let job: string | null = null;
  for (const line of lines) {
    const match = MARK.exec(line);
    if (match) job = match[1];
  }
  return job;
}
