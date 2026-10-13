// The agent marks, read back: the job id behind a commit message's
// `Agent:` trailer or an issue body's `Edited-by:` footer, null when the
// text is unmarked, which means Han wrote it. The `write-design-spec`
// approved-as-drafted / edited metric and `harvest-run` use it to tell an
// agent's edit from Han's.

const MARK = /^(?:Agent|Edited-by): *(\S+) *$/;

export function agentOf(text: string): string | null {
  const lines = text.trimEnd().split('\n');
  let job: string | null = null;
  for (let i = lines.length - 1; i >= 0; i--) {
    const match = MARK.exec(lines[i]);
    if (!match) {
      // Trailers and footers sit together at the end; a Source: line may sit among them.
      if (/^[A-Za-z-]+: /.test(lines[i])) continue;
      break;
    }
    job ??= match[1];
  }
  return job;
}
