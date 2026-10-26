// The append-only guard for an Episode's `events.jsonl`: reads a staged diff (`git diff --cached -U0`)
// and names every events.jsonl that remains and loses a line. Pure; `skills/new-episode/scripts/check-events-append-only.ts` feeds it git's output.

const LOG_PATH = /(^|\/)events\.jsonl$/;

function removedLines(section: string[]): number {
  const start = section.findIndex((line) => line.startsWith('@@'));
  return start < 0 ? 0 : section.slice(start).filter((line) => line.startsWith('-')).length;
}

/** Promotion deletes the staging folder after archiving the log to `.logs/`, so a whole-file deletion is allowed. */
function deletedWhole(section: string[]): boolean {
  return section.includes('+++ /dev/null');
}

function oldPath(section: string[]): string | undefined {
  const header = section.find((line) => line.startsWith('--- a/'));
  return header?.slice('--- a/'.length);
}

export function eventLogDeletions(stagedDiff: string): string[] {
  const offenders = stagedDiff
    .split(/^(?=diff --git )/m)
    .map((section) => section.split('\n'))
    .filter((section) => removedLines(section) > 0 && !deletedWhole(section))
    .map(oldPath)
    .filter((file): file is string => file !== undefined && LOG_PATH.test(file));
  return [...new Set(offenders)];
}
