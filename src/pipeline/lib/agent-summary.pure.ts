const FRONT_MATTER = /^---\n[\s\S]*?\n---[ \t]*(\n|$)/;
const FENCE = /^(```|~~~)[^\n]*\n[\s\S]*?(\n\1[^\n]*(\n|$)|$)/;
const HEADING = /^#{1,6}\s[^\n]*(\n|$)/;
const PATH_LINE = /^[-*]?\s*`?(\/|[\w.@-]+\/)[^\s`]*`?[ \t]*(\n|$)/;
const VERDICT_LINE = /^[\s>*_#-]*(pass|fail|needs[ -]human)(?=[\s*_]*(?:[:.,—–]|-\s|$))/i;
const HOIST_WITHIN = 12;
const WORKTREE_PREFIX = /\/\S*?\.worktrees\/[^/\s`]+\//g;
const ABSOLUTE_DIRS = /(?<![\w.@:~-])(?:\/[\w.@+-]+){2,}\/(?=[\w.@+-])/g;

function withoutOpeningDraft(text: string): string {
  let rest = text.trimStart();
  for (;;) {
    const next = [FRONT_MATTER, FENCE, HEADING, PATH_LINE].reduce((t, rule) => t.replace(rule, ''), rest).trimStart();
    if (next === rest) return rest;
    rest = next;
  }
}

function shortenPaths(text: string): string {
  return text.replace(WORKTREE_PREFIX, '').replace(ABSOLUTE_DIRS, '');
}

function hoistVerdict(text: string): string {
  const lines = text.split('\n');
  const at = lines.slice(0, HOIST_WITHIN).findIndex((line) => VERDICT_LINE.test(line));
  if (at <= 0) return text;
  return [lines[at], '', ...lines.slice(0, at), ...lines.slice(at + 1)].join('\n').trim();
}

export function verdictFirst(message: string, max: number): string {
  const cleaned = hoistVerdict(shortenPaths(withoutOpeningDraft(message))).trim();
  return (cleaned === '' ? message.trim() : cleaned).slice(0, max);
}
