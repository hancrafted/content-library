// How `npm run retro:load` prints a load report: plain-text tables a retro reads in the terminal. The report itself
// comes from load.pure.ts.
import type { Durations, LoadReport, Window } from './load.pure.ts';

/** A seconds cell, or `-` when nothing ran. */
function seconds(value: number, runs: number): string {
  return runs === 0 ? '-' : `${value.toFixed(1)}s`;
}

/** Rows under a header, each cell right-aligned to its width, the first column padded to fit the longest row label. */
function table(header: readonly string[], widths: readonly number[], rows: readonly (readonly string[])[]): string[] {
  const labelWidth = Math.max(16, ...rows.map(([label]) => label!.length + 1));
  const line = ([label, ...cells]: readonly string[]) =>
    (label!.padEnd(labelWidth) + cells.map((cell, i) => cell.padStart(widths[i]!)).join('')).trimEnd();
  return [line(header), ...(rows.length > 0 ? rows.map(line) : ['none'])];
}

/** The commands table's rows: who ran each kind, how many failed, and how long a foreground run took. */
function commandRows(commands: LoadReport['commands']): string[][] {
  return Object.entries(commands).map(([kind, c]) => [
    kind,
    String(c.main),
    String(c.subagent),
    String(c.failed),
    ...took(c.took),
  ]);
}

/** A duration's p50, p90 and max cells. */
function took({ p50, p90, max, runs }: Durations): string[] {
  return [p50, p90, max].map((value) => seconds(value, runs));
}

/** `report` as the plain-text tables `npm run retro:load` prints for `window`. */
export function formatReport(report: LoadReport, window: Window): string {
  const counts = (record: Record<string, number>) => Object.entries(record).map(([key, n]) => [key, String(n)]);
  return [
    `Load from ${window.since.toISOString()} to ${window.until.toISOString()}`,
    '',
    ...table(
      ['Verify steps', 'runs', 'p50', 'p90', 'max'],
      [5, 7, 7, 7],
      Object.entries(report.steps).map(([name, d]) => [name, String(d.runs), ...took(d)]),
    ),
    '',
    ...table(
      ['Commands', 'main', 'subagent', 'failed', 'p50', 'p90', 'max'],
      [5, 10, 8, 7, 7, 7],
      commandRows(report.commands),
    ),
    '',
    ...table(['Hook failures'], [5], counts(report.hookFailures)),
    '',
    ...table(['Test timeouts by file'], [5], counts(report.timeouts)),
    '',
    `Peak concurrent logs: ${report.peak.all} (main sessions: ${report.peak.main})`,
  ].join('\n');
}
