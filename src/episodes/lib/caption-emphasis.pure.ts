// decision: docs/adr/0012-slide-header-and-play-once-motion.md
export const EMPHASIS_OPEN = '\u0001';
export const EMPHASIS_CLOSE = '\u0002';

export interface TextRange {
  readonly start: number;
  readonly end: number;
}

export function splitEmphasis(marked: string): { text: string; emphasis: TextRange[] } {
  const emphasis: TextRange[] = [];
  let text = '';
  let open: number | undefined;
  for (const character of marked) {
    if (character === EMPHASIS_OPEN || character === EMPHASIS_CLOSE) {
      if ((character === EMPHASIS_OPEN) !== (open === undefined))
        throw new Error(`Caption has unbalanced emphasis: "${marked}".`);
      if (open === undefined) open = text.length;
      else {
        emphasis.push({ start: open, end: text.length });
        open = undefined;
      }
    } else text += character;
  }
  if (open !== undefined) throw new Error(`Caption has unbalanced emphasis: "${marked}".`);
  return { text, emphasis };
}

export function isEmphasised(index: number, ranges: readonly TextRange[]): boolean {
  return ranges.some(({ start, end }) => index >= start && index < end);
}

export function runsOf(text: string, ranges: readonly TextRange[]): { text: string; emphasis: boolean }[] {
  const edges = [...new Set([0, ...ranges.flatMap(({ start, end }) => [start, end]), text.length])].sort(
    (a, b) => a - b,
  );
  return edges
    .slice(0, -1)
    .map((start, index) => ({ text: text.slice(start, edges[index + 1]), emphasis: isEmphasised(start, ranges) }))
    .filter((run) => run.text !== '');
}
