export const SCRATCH = '.scratch';
export const LOG_FILE = 'drive.log.jsonl';

export interface CommandEntry {
  t: string;
  cmd: string;
  branch: string | null;
  base: string | null;
  exit: number | null;
  result: string;
}

export interface SubagentEntry {
  t: string;
  event: 'subagent-start' | 'subagent-stop';
  session: string;
  transcript: string;
  agent: string | null;
  branch: string | null;
}

export type LogEntry = CommandEntry | SubagentEntry;

export function topicOfBranch(branch: string | null): string | null {
  const slash = branch?.indexOf('/') ?? -1;
  if (branch === null || slash <= 0) return null;
  const slug = branch.slice(slash + 1).split('--')[0] ?? '';
  return slug === '' ? null : slug;
}

export const logPath = (topic: string): string => `${SCRATCH}/${topic}/${LOG_FILE}`;

export const serializeEntry = (entry: LogEntry): string => `${JSON.stringify(entry)}\n`;

export const baseOfArgs = (args: readonly string[]): string | null => {
  const at = args.indexOf('--base');
  return at === -1 ? null : (args[at + 1] ?? null);
};

const RESULT_LIMIT = 300;

export const commandEntry = (
  facts: { argv: readonly string[]; branch: string | null; base: string | null; exit: number; lastError: string },
  now: Date,
): CommandEntry => ({
  t: now.toISOString(),
  cmd: facts.argv.join(' '),
  branch: facts.branch,
  base: baseOfArgs(facts.argv) ?? facts.base,
  exit: facts.exit,
  result: facts.exit === 0 ? 'ok' : facts.lastError.slice(0, RESULT_LIMIT),
});

export function parseLog(text: string): LogEntry[] {
  return text
    .split('\n')
    .filter((line) => line.trim() !== '')
    .flatMap((line): LogEntry[] => {
      try {
        const parsed = JSON.parse(line) as LogEntry;
        return typeof parsed === 'object' && parsed !== null ? [parsed] : [];
      } catch {
        return [];
      }
    });
}

export const isSubagentEntry = (entry: LogEntry): entry is SubagentEntry => 'event' in entry;
