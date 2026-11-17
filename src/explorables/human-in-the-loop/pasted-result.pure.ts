const LEAD = /^\s*(?:Result|Ergebnis):[ \t]*\r?\n/i;
const OPEN = /^(`{3,})[^\n`]*\r?\n/;

const PATH_LINE = /^(?=\S+$)(?:\S*[/\\]\S*|\S*\.[A-Za-z0-9]{1,5})$/;

const looksLikePath = (line: string) => PATH_LINE.test(line.trim());

const isFramed = (rest: readonly string[]) => rest.length === 0 || (rest.length === 1 && looksLikePath(rest[0] ?? ''));

function lastClosing(lines: readonly string[], length: number): number {
  const isClosing = (line: string) => /^`+$/.test(line.trim()) && line.trim().length >= length;
  return lines.map(isClosing).lastIndexOf(true);
}

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
