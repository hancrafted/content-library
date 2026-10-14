// The agent `summary` on an end line: the last assistant message, verdict-first, so the cut at SUMMARY_MAX keeps what a
// reader scans for. A reviewer's verdict is its first word, `pass`, `fail` or `needs human` (bold, headed or alone on
// its line: `**fail**: ...`, `**#176 STANDARDS: fail.**`, `pass\n\n...`); an implementor's is what it did. What buries
// either is what the message opens with: a pasted draft (front matter, a fenced block, headings), a bare path line,
// and absolute worktree paths, which are shortened to the repo-relative path. Pure.

const FRONT_MATTER = /^---\n[\s\S]*?\n---[ \t]*(\n|$)/;
const FENCE = /^(```|~~~)[^\n]*\n[\s\S]*?(\n\1[^\n]*(\n|$)|$)/;
const HEADING = /^#{1,6}\s[^\n]*(\n|$)/;
/** A line that is only a path, bare or as a list item, backticked or not: `docs/x/research.md`, `- \`/abs/p.md\``. */
const PATH_LINE = /^[-*]?\s*`?(\/|[\w.@-]+\/)[^\s`]*`?[ \t]*(\n|$)/;
const VERDICT_LINE = /^[\s>*_#-]*(pass|fail|needs[ -]human)(?=[\s*_]*(?:[:.,—–]|-\s|$))/i;
/** How far down a verdict line is looked for: a report's verdict is near its top, a list item further down is not one. */
const HOIST_WITHIN = 12;
const WORKTREE_PREFIX = /\/\S*?\.worktrees\/[^/\s`]+\//g;
const ABSOLUTE_DIRS = /(?<![\w.@:~-])(?:\/[\w.@+-]+){2,}\/(?=[\w.@+-])/g;

/** Removes what the message opens with that is not a verdict or a statement: blank space, front matter, fences, headings, path lines. */
function withoutOpeningDraft(text: string): string {
  let rest = text.trimStart();
  for (;;) {
    const next = [FRONT_MATTER, FENCE, HEADING, PATH_LINE].reduce((t, rule) => t.replace(rule, ''), rest).trimStart();
    if (next === rest) return rest;
    rest = next;
  }
}

/** Absolute paths shortened: a path inside a worktree to its repo-relative form, any other to its last segment. */
function shortenPaths(text: string): string {
  return text.replace(WORKTREE_PREFIX, '').replace(ABSOLUTE_DIRS, '');
}

/** The message with its verdict line first: the first line that starts with a verdict word moves to the top when it is not already there. */
function hoistVerdict(text: string): string {
  const lines = text.split('\n');
  const at = lines.slice(0, HOIST_WITHIN).findIndex((line) => VERDICT_LINE.test(line));
  if (at <= 0) return text;
  return [lines[at], '', ...lines.slice(0, at), ...lines.slice(at + 1)].join('\n').trim();
}

/** The summary to store: opening draft and absolute paths stripped, the verdict first, cut at `max` characters. Falls back to the plain message when stripping leaves nothing. */
export function verdictFirst(message: string, max: number): string {
  const cleaned = hoistVerdict(shortenPaths(withoutOpeningDraft(message))).trim();
  return (cleaned === '' ? message.trim() : cleaned).slice(0, max);
}
