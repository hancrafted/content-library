/*
 * A coding agent's reply to a job is `Result:`, one code fence holding the file, and the file's path. The fence
 * and its two framing lines are not part of the result: the inside is what the run model reads (its H3s become
 * rounds). Anything that is not exactly that shape is stored as pasted.
 */

const LEAD = /^\s*(?:Result|Ergebnis):[ \t]*\r?\n/i;
const OPEN = /^(`{3,})[^\n`]*\r?\n/;

/** A single token that looks like a file path: it holds a slash or backslash, or ends in a file extension such as `.md`. */
const PATH_LINE = /^(?=\S+$)(?:\S*[/\\]\S*|\S*\.[A-Za-z0-9]{1,5})$/;

const looksLikePath = (line: string) => PATH_LINE.test(line.trim());

const isFramed = (rest: readonly string[]) => rest.length === 0 || (rest.length === 1 && looksLikePath(rest[0] ?? ''));

/** The index of the last bare fence line at least `length` backticks long, or -1. */
function lastClosing(lines: readonly string[], length: number): number {
  const isClosing = (line: string) => /^`+$/.test(line.trim()) && line.trim().length >= length;
  return lines.map(isClosing).lastIndexOf(true);
}

/**
 * The text to store for a pasted result: the inside of a single wrapping backtick code fence, else the paste
 * unchanged (a `~~~` fence is not unwrapped). The closing fence is the last bare fence line at least as long as the
 * opening one, so a code block quoted inside the result stays in it. At most one path-like line may follow it.
 */
export function unwrapPastedResult(pasted: string): string {
  const withoutLead = pasted.replace(LEAD, '').replace(/^\s*\n/, '');
  const open = OPEN.exec(withoutLead);
  if (!open?.[1]) return pasted;
  const lines = withoutLead.slice(open[0].length).trimEnd().split(/\r?\n/);
  const closing = lastClosing(lines, open[1].length);
  if (closing < 0) return pasted;
  const inside = lines.slice(0, closing).join('\n');
  const rest = lines.slice(closing + 1).filter((line) => line.trim() !== '');
  return isFramed(rest) && inside.trim() !== '' ? inside : pasted;
}
