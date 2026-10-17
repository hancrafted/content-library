/*
 * Emphasis in a Slide header's caption (design-ADR-0012): the `<b>` runs a caption's message marks, as plain text plus the
 * ranges they cover, so the header can type the caption character by character and still set those characters off.
 * `t.markup` wraps each `<b>` chunk in the two marks below; they never occur in written text.
 */

export const EMPHASIS_OPEN = '\u0001';
export const EMPHASIS_CLOSE = '\u0002';

/** An emphasised run of a text: from `start`, up to but excluding `end`, in UTF-16 indices. */
export interface TextRange {
  readonly start: number;
  readonly end: number;
}

/** A marked caption as its plain text and its emphasised ranges; throws on a mark left open or closed twice. */
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

/** Whether the character at `index` of the text lies in an emphasised range. */
export function isEmphasised(index: number, ranges: readonly TextRange[]): boolean {
  return ranges.some(({ start, end }) => index >= start && index < end);
}

/** The text cut into runs at every range edge, each emphasised or not, in order; empty runs dropped. */
export function runsOf(text: string, ranges: readonly TextRange[]): { text: string; emphasis: boolean }[] {
  const edges = [...new Set([0, ...ranges.flatMap(({ start, end }) => [start, end]), text.length])].sort(
    (a, b) => a - b,
  );
  return edges
    .slice(0, -1)
    .map((start, index) => ({ text: text.slice(start, edges[index + 1]), emphasis: isEmphasised(start, ranges) }))
    .filter((run) => run.text !== '');
}
