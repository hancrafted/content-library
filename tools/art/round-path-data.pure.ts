/*
 * Rounds the coordinates of SVG path data held in source text: every single- or double-quoted string that is path
 * data (it opens with a moveto and holds only path commands and numbers). Numbers outside such strings, such as an
 * opacity, a scale factor or a transform, stay as written. One coordinate always rounds to one value, so facets that
 * share a vertex still share it after rounding.
 */

const QUOTED = /(["'])((?:(?!\1)[^\\\n])*)\1/g;
const PATH_DATA = /^\s*[Mm][\s\d.,eE+\-MmLlHhVvCcSsQqTtAaZz]*$/;
const NUMBER = /-?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?/g;

function roundNumber(text: string, decimals: number): string {
  const factor = 10 ** decimals;
  const rounded = Math.round(Number(text) * factor) / factor;
  return String(Object.is(rounded, -0) ? 0 : rounded);
}

/** One path string with each number rounded, a space kept wherever two numbers would otherwise run together. */
function roundPath(path: string, decimals: number): string {
  return path.replace(NUMBER, (text: string, offset: number) => {
    const rounded = roundNumber(text, decimals);
    const runsOn = offset > 0 && /[\d.]/.test(path[offset - 1] ?? '') && !rounded.startsWith('-');
    return runsOn ? ` ${rounded}` : rounded;
  });
}

/** The source with every path data string's coordinates rounded to `decimals` places, integers by default. */
export function roundPathData(source: string, decimals = 0): string {
  return source.replace(QUOTED, (whole: string, quote: string, body: string) =>
    PATH_DATA.test(body) ? `${quote}${roundPath(body, decimals)}${quote}` : whole,
  );
}
