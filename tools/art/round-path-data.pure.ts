const QUOTED = /(["'])((?:(?!\1)[^\\\n])*)\1/g;
const PATH_DATA = /^\s*[Mm][\s\d.,eE+\-MmLlHhVvCcSsQqTtAaZz]*$/;
const NUMBER = /-?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?/g;

function roundNumber(text: string, decimals: number): string {
  const factor = 10 ** decimals;
  const rounded = Math.round(Number(text) * factor) / factor;
  return String(Object.is(rounded, -0) ? 0 : rounded);
}

function roundPath(path: string, decimals: number): string {
  return path.replace(NUMBER, (text: string, offset: number) => {
    const rounded = roundNumber(text, decimals);
    const runsOn = offset > 0 && /[\d.]/.test(path[offset - 1] ?? '') && !rounded.startsWith('-');
    return runsOn ? ` ${rounded}` : rounded;
  });
}

export function roundPathData(source: string, decimals = 0): string {
  return source.replace(QUOTED, (whole: string, quote: string, body: string) =>
    PATH_DATA.test(body) ? `${quote}${roundPath(body, decimals)}${quote}` : whole,
  );
}
