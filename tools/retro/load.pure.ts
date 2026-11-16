// The retro's judgement over Claude Code session logs: how agents loaded the machine in a time window. The process
// side, finding and reading the logs and printing the table, lives in load.ts.

/** One session log: its JSON lines as written, and whether a subagent wrote it rather than a main session. */
export interface SessionLog {
  subagent: boolean;
  lines: readonly string[];
}

/** The time window a report covers: lines stamped outside it are ignored. */
export interface Window {
  since: Date;
  until: Date;
}

/** How long one thing took across its runs, in seconds. */
export interface Durations {
  runs: number;
  p50: number;
  p90: number;
  max: number;
}

export interface LoadReport {
  /** Each verify step by name (`typecheck`, `test`, …), from the `✔ name (12.3s)` lines the verify runner prints. */
  steps: Record<string, Durations>;
  /** Failed git hooks by hook, from husky's `husky - pre-commit script failed` line. */
  hookFailures: Record<string, number>;
  /** Tests Vitest stopped at its timeout, counted by test file. */
  timeouts: Record<string, number>;
  /** Each command kind (`commit`, `push`, `verify`, `verify:quick`) agents ran through Bash. */
  commands: Record<CommandKind, CommandStats>;
  /** The most logs open at once, and the most main-session logs open at once; a log is open from its first line to its last. */
  peak: { all: number; main: number };
}

/** Who ran a command kind how often, how many runs failed, and how long a foreground run took. */
export interface CommandStats {
  main: number;
  subagent: number;
  failed: number;
  took: Durations;
}

/** Each command kind the report counts, and the Bash command that runs it. */
const COMMANDS = {
  commit: /\bgit(?: -C \S+)? commit\b/u,
  push: /\bgit(?: -C \S+)? push\b/u,
  verify: /\bnpm run verify(?![\w:-])/u,
  'verify:quick': /\bnpm run verify:quick\b/u,
} as const;

type CommandKind = keyof typeof COMMANDS;

/** The parts of a log line the report reads. */
interface LogLine {
  timestamp?: string;
  message?: { content?: unknown };
}

/** A tool call (`id`, `name`, `input`) or a tool result (`tool_use_id`, `content`, `is_error`). */
interface ContentBlock {
  type?: string;
  id?: string;
  tool_use_id?: string;
  name?: string;
  input?: { command?: unknown; run_in_background?: unknown };
  content?: unknown;
  is_error?: boolean;
}

/** When a log was open inside the window, and who wrote it. */
interface Span {
  from: number;
  to: number;
  subagent: boolean;
}

/** A verify runner's finished-step line: `✔ lint (2.0s)` or `✖ test (30.5s)`. */
const STEP_LINE = /^[✔✖] (\S+) \((\d+(?:\.\d+)?)s\)$/gmu;

/** Husky's line for a failed hook, naming the hook. */
const HOOK_FAILED = /^husky - (\S+) script failed/gmu;

/** Vitest's report of a test it stopped at its timeout: the `FAIL  file > test` line, then the timeout error. */
const TIMED_OUT = /^ *FAIL +(\S+) > .*\n.*Test timed out in \d+ms/gmu;

/** Adds one to `key`'s count in `counts`. */
function bump(counts: Map<string, number>, key: string): void {
  counts.set(key, (counts.get(key) ?? 0) + 1);
}

/** `counts` as a plain record, its keys in order. */
function sortedRecord<T>(entries: Map<string, T>): Record<string, T> {
  return Object.fromEntries([...entries].sort(([a], [b]) => a.localeCompare(b)));
}

/** The `q` quantile of ascending `sorted` by nearest rank, so it is always a value that occurred. */
function quantile(sorted: readonly number[], q: number): number {
  return sorted[Math.max(0, Math.ceil(q * sorted.length) - 1)] ?? 0;
}

/** `values`, in seconds, summarised. */
function durations(values: readonly number[]): Durations {
  const sorted = [...values].sort((a, b) => a - b);
  return { runs: sorted.length, p50: quantile(sorted, 0.5), p90: quantile(sorted, 0.9), max: sorted.at(-1) ?? 0 };
}

/** A tool result's text, whether the log holds it as a string or as text blocks. */
function resultText(content: unknown): string {
  if (!Array.isArray(content)) return typeof content === 'string' ? content : '';
  return content.map((part: { text?: unknown }) => (typeof part.text === 'string' ? part.text : '')).join('\n');
}

/** A log line's JSON, or nothing for a line cut off mid-write. */
function parse(line: string): LogLine | undefined {
  try {
    return JSON.parse(line) as LogLine;
  } catch {
    return undefined;
  }
}

/** Every line of `log` stamped inside `window`, with its stamp. */
function* linesIn(log: SessionLog, window: Window): Generator<{ at: Date; line: LogLine }> {
  for (const raw of log.lines) {
    const line = parse(raw);
    if (!line?.timestamp) continue;
    const at = new Date(line.timestamp);
    if (at >= window.since && at <= window.until) yield { at, line };
  }
}

/** A line's content blocks: tool calls on an assistant line, tool results on a user line. */
function blocksOf(line: LogLine): ContentBlock[] {
  const content = line.message?.content;
  return Array.isArray(content) ? (content as ContentBlock[]) : [];
}

/** The most of `spans` open at one instant; a span that closes as another opens does not overlap it. */
function peakOpen(spans: readonly Span[]): number {
  const events = spans.flatMap(({ from, to }) => [
    { at: from, step: 1 },
    { at: to, step: -1 },
  ]);
  events.sort((a, b) => a.at - b.at || a.step - b.step);
  let open = 0;
  let peak = 0;
  for (const { step } of events) {
    open += step;
    peak = Math.max(peak, open);
  }
  return peak;
}

/** A Bash call still waiting for its result: the command kinds it ran, when, and whether in the foreground. */
interface PendingCall {
  kinds: CommandKind[];
  at: Date;
  foreground: boolean;
}

/** The running totals `analyzeLoad` collects before it summarises them. */
interface Tally {
  stepSeconds: Map<string, number[]>;
  hookFailures: Map<string, number>;
  timeouts: Map<string, number>;
  commands: Map<CommandKind, { main: number; subagent: number; failed: number; seconds: number[] }>;
}

/** What reading one log needs: the totals, its calls still waiting for a result, and whether a subagent wrote it. */
interface LogContext {
  tally: Tally;
  pending: Map<string, PendingCall>;
  subagent: boolean;
}

/** The kinds of command a Bash call runs: none for a call that is not Bash. */
function kindsOf(call: ContentBlock): CommandKind[] {
  const command = call.name === 'Bash' && typeof call.input?.command === 'string' ? call.input.command : '';
  return (Object.keys(COMMANDS) as CommandKind[]).filter((kind) => COMMANDS[kind].test(command));
}

/** Counts a Bash call by the command kinds it runs, and remembers it until its result arrives. */
function tallyCall({ tally, pending, subagent }: LogContext, call: ContentBlock, at: Date): void {
  const kinds = kindsOf(call);
  for (const kind of kinds) tally.commands.get(kind)![subagent ? 'subagent' : 'main'] += 1;
  if (kinds.length === 0 || !call.id) return;
  pending.set(call.id, { kinds, at, foreground: call.input?.run_in_background !== true });
}

/** Settles the call a result answers: whether it failed, and how long a foreground call took. */
function settleCall({ tally, pending }: LogContext, result: ContentBlock, at: Date): void {
  const call = pending.get(result.tool_use_id ?? '');
  if (!call) return;
  pending.delete(result.tool_use_id!);
  for (const kind of call.kinds) {
    const stats = tally.commands.get(kind)!;
    if (result.is_error) stats.failed += 1;
    if (call.foreground) stats.seconds.push((at.getTime() - call.at.getTime()) / 1000);
  }
}

/** Counts the verify step, husky and Vitest timeout lines in a tool result's text. */
function tallyOutput(tally: Tally, text: string): void {
  for (const [, name, seconds] of text.matchAll(STEP_LINE)) {
    tally.stepSeconds.set(name!, [...(tally.stepSeconds.get(name!) ?? []), Number(seconds)]);
  }
  for (const [, hook] of text.matchAll(HOOK_FAILED)) bump(tally.hookFailures, hook!);
  for (const [, file] of text.matchAll(TIMED_OUT)) bump(tally.timeouts, file!);
}

/** Tallies one log's lines inside `window`, and returns when it was open, or nothing when no line fell inside. */
function tallyLog(tally: Tally, log: SessionLog, window: Window): Span | undefined {
  let span: Span | undefined;
  const context: LogContext = { tally, pending: new Map(), subagent: log.subagent };
  for (const { at, line } of linesIn(log, window)) {
    span ??= { from: at.getTime(), to: at.getTime(), subagent: log.subagent };
    span.to = at.getTime();
    for (const block of blocksOf(line)) {
      if (block.type === 'tool_use') tallyCall(context, block, at);
      if (block.type !== 'tool_result') continue;
      settleCall(context, block, at);
      tallyOutput(tally, resultText(block.content));
    }
  }
  return span;
}

/** Mines `logs` for the load agents put on the machine inside `window`. */
export function analyzeLoad(logs: readonly SessionLog[], window: Window): LoadReport {
  const tally: Tally = {
    stepSeconds: new Map(),
    hookFailures: new Map(),
    timeouts: new Map(),
    commands: new Map(
      Object.keys(COMMANDS).map((kind) => [kind as CommandKind, { main: 0, subagent: 0, failed: 0, seconds: [] }]),
    ),
  };
  const spans = logs.flatMap((log) => tallyLog(tally, log, window) ?? []);
  return {
    steps: sortedRecord(new Map([...tally.stepSeconds].map(([name, values]) => [name, durations(values)]))),
    hookFailures: sortedRecord(tally.hookFailures),
    timeouts: sortedRecord(tally.timeouts),
    commands: Object.fromEntries(
      [...tally.commands].map(([kind, { seconds, ...counts }]) => [kind, { ...counts, took: durations(seconds) }]),
    ) as Record<CommandKind, CommandStats>,
    peak: { all: peakOpen(spans), main: peakOpen(spans.filter((span) => !span.subagent)) },
  };
}
