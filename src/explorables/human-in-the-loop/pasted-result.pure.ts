/*
 * A coding agent's reply to a job is `Result:`, one code fence holding the file, and the file's path. The fence
 * and its two framing lines are not part of the result: the inside is what the run model reads (its H3s become
 * rounds). Anything that is not exactly that shape is stored as pasted.
 */

const LEAD = /^\s*(?:Result|Ergebnis):[ \t]*\r?\n/i;
const OPEN = /^(`{3,})[^\n`]*\r?\n/;

const isFenceFor = (fence: string) => (line: string) => line.trim() === fence;

/** The text to store for a pasted result: the inside of a single wrapping code fence, else the paste unchanged. */
export function unwrapPastedResult(pasted: string): string {
  const withoutLead = pasted.replace(LEAD, '').replace(/^\s*\n/, '');
  const open = OPEN.exec(withoutLead);
  const fence = open?.[1];
  if (!open || !fence) return pasted;
  const lines = withoutLead.slice(open[0].length).trimEnd().split(/\r?\n/);
  const closing = lines.findIndex(isFenceFor(fence));
  const inside = lines.slice(0, closing).join('\n');
  const rest = lines.slice(closing + 1).filter((line) => line.trim() !== '');
  return closing < 0 || inside.trim() === '' || !isPathLine(rest) ? pasted : inside;
}

/** Nothing after the closing fence, or one line that is not another fence. */
function isPathLine(rest: readonly string[]): boolean {
  return rest.length === 0 || (rest.length === 1 && !/^\s*`{3,}/.test(rest[0] ?? ''));
}
