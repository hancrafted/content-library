export interface KeyedLine {
  readonly key: string;
  readonly line: string;
}

/**
 * Keys each line by its text and how many equal lines came before it, so a block whose lines repeat (a front matter's
 * two `---` fences) still gives React one key per line.
 */
export function keyedLines(lines: readonly string[]): readonly KeyedLine[] {
  const seen = new Map<string, number>();
  return lines.map((line) => {
    const count = seen.get(line) ?? 0;
    seen.set(line, count + 1);
    return { key: `${line}#${count}`, line };
  });
}
