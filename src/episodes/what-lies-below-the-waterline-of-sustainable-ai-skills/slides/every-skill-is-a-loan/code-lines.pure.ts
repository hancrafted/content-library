export interface KeyedLine {
  readonly key: string;
  readonly line: string;
}

export function keyedLines(lines: readonly string[]): readonly KeyedLine[] {
  const seen = new Map<string, number>();
  return lines.map((line) => {
    const count = seen.get(line) ?? 0;
    seen.set(line, count + 1);
    return { key: `${line}#${count}`, line };
  });
}
