export interface SessionLog {
  subagent: boolean;
  lines: readonly string[];
}

export interface Window {
  since: Date;
  until: Date;
}

export interface Durations {
  runs: number;
  p50: number;
  p90: number;
  max: number;
}

export interface LoadReport {
  steps: Record<string, Durations>;
  hookFailures: Record<string, number>;
  timeouts: Record<string, number>;
  commands: Record<CommandKind, CommandStats>;
  peak: { all: number; main: number };
}

export interface CommandStats {
  main: number;
  subagent: number;
  failed: number;
  took: Durations;
}

const COMMANDS = {
  commit: /\bgit(?: -C \S+)? commit\b/u,
  push: /\bgit(?: -C \S+)? push\b/u,
  verify: /\bnpm run verify(?![\w:-])/u,
  'verify:quick': /\bnpm run verify:quick\b/u,
} as const;

type CommandKind = keyof typeof COMMANDS;

interface LogLine {
  timestamp?: string;
  message?: { content?: unknown };
}

interface ContentBlock {
  type?: string;
  id?: string;
  tool_use_id?: string;
  name?: string;
  input?: { command?: unknown; run_in_background?: unknown };
  content?: unknown;
  is_error?: boolean;
}

interface Span {
  from: number;
  to: number;
  subagent: boolean;
}

const STEP_LINE = /^[✔✖] (\S+) \((\d+(?:\.\d+)?)s\)$/gmu;

const HOOK_FAILED = /^husky - (\S+) script failed/gmu;

const TIMED_OUT = /^ *FAIL +(\S+) > .*\n.*Test timed out in \d+ms/gmu;

function bump(counts: Map<string, number>, key: string): void {
  counts.set(key, (counts.get(key) ?? 0) + 1);
}

function sortedRecord<T>(entries: Map<string, T>): Record<string, T> {
  return Object.fromEntries([...entries].sort(([a], [b]) => a.localeCompare(b)));
}

function quantile(sorted: readonly number[], q: number): number {
  return sorted[Math.max(0, Math.ceil(q * sorted.length) - 1)] ?? 0;
}

function durations(values: readonly number[]): Durations {
  const sorted = [...values].sort((a, b) => a - b);
  return { runs: sorted.length, p50: quantile(sorted, 0.5), p90: quantile(sorted, 0.9), max: sorted.at(-1) ?? 0 };
}

function resultText(content: unknown): string {
  if (!Array.isArray(content)) return typeof content === 'string' ? content : '';
  return content.map((part: { text?: unknown }) => (typeof part.text === 'string' ? part.text : '')).join('\n');
}

function parse(line: string): LogLine | undefined {
  try {
    return JSON.parse(line) as LogLine;
  } catch {
    return undefined;
  }
}

function* linesIn(log: SessionLog, window: Window): Generator<{ at: Date; line: LogLine }> {
  for (const raw of log.lines) {
    const line = parse(raw);
    if (!line?.timestamp) continue;
    const at = new Date(line.timestamp);
    if (at >= window.since && at <= window.until) yield { at, line };
  }
}

function blocksOf(line: LogLine): ContentBlock[] {
  const content = line.message?.content;
  return Array.isArray(content) ? (content as ContentBlock[]) : [];
}

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

interface PendingCall {
  kinds: CommandKind[];
  at: Date;
  foreground: boolean;
}

interface Tally {
  stepSeconds: Map<string, number[]>;
  hookFailures: Map<string, number>;
  timeouts: Map<string, number>;
  commands: Map<CommandKind, { main: number; subagent: number; failed: number; seconds: number[] }>;
}

interface LogContext {
  tally: Tally;
  pending: Map<string, PendingCall>;
  subagent: boolean;
}

function kindsOf(call: ContentBlock): CommandKind[] {
  const command = call.name === 'Bash' && typeof call.input?.command === 'string' ? call.input.command : '';
  return (Object.keys(COMMANDS) as CommandKind[]).filter((kind) => COMMANDS[kind].test(command));
}

function tallyCall({ tally, pending, subagent }: LogContext, call: ContentBlock, at: Date): void {
  const kinds = kindsOf(call);
  for (const kind of kinds) tally.commands.get(kind)![subagent ? 'subagent' : 'main'] += 1;
  if (kinds.length === 0 || !call.id) return;
  pending.set(call.id, { kinds, at, foreground: call.input?.run_in_background !== true });
}

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

function tallyOutput(tally: Tally, text: string): void {
  for (const [, name, seconds] of text.matchAll(STEP_LINE)) {
    tally.stepSeconds.set(name!, [...(tally.stepSeconds.get(name!) ?? []), Number(seconds)]);
  }
  for (const [, hook] of text.matchAll(HOOK_FAILED)) bump(tally.hookFailures, hook!);
  for (const [, file] of text.matchAll(TIMED_OUT)) bump(tally.timeouts, file!);
}

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
