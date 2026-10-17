// The append-only guard for an Episode's `events.jsonl`: reads a staged diff (`git diff --cached -U0`)
// and names every events.jsonl that loses a line. Pure; `check-events-append-only.ts` feeds it git's output.

const LOG_PATH = /(^|\/)events\.jsonl$/;

function removedLines(section: string[]): number {
  const start = section.findIndex((line) => line.startsWith('@@'));
  return start < 0 ? 0 : section.slice(start).filter((line) => line.startsWith('-')).length;
}

function oldPath(section: string[]): string | undefined {
  const header = section.find((line) => line.startsWith('--- a/'));
  return header?.slice('--- a/'.length);
}

export function eventLogDeletions(stagedDiff: string): string[] {
  const offenders = stagedDiff
    .split(/^(?=diff --git )/m)
    .map((section) => section.split('\n'))
    .filter((section) => removedLines(section) > 0)
    .map(oldPath)
    .filter((file): file is string => file !== undefined && LOG_PATH.test(file));
  return [...new Set(offenders)];
}
