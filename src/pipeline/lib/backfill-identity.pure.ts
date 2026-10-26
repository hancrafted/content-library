// The one-off repair for a run log written before identity-at-stop existed (design-ADR 0007): for every agent that
// started as `skill-spawned`, ended, and whose end line carries no identity, the `attrs` line that gives the fold the
// identity its meta.json names. Pure: the log's lines and a meta.json reader in, the events to append out.
import { identityFact } from './claude-adapter.pure.ts';
import { currentRun, fold, type LogEvent, type RunLogLine } from './run-log.pure.ts';

/** meta.json sits beside the subagent's transcript: `agent-<id>.jsonl` → `agent-<id>.meta.json`. */
export const metaPathOf = (transcriptPath: string): string => transcriptPath.replace(/\.jsonl$/, '.meta.json');

export interface Backfill {
  /** The `attrs` events to append, in log order; none once every repairable span carries its identity. */
  events: LogEvent[];
  /** Spans of an older Run that the writer cannot file a line for (it stamps the newest Run), left as they are. */
  elsewhere: number;
}

/**
 * The parent is computed from the lines before the agent's end line, which is what SubagentStop saw, so a backfilled
 * agent nests under the Attempt or Job that was open when it stopped. A span is repaired once: after its `attrs` line
 * the fold reads its role as parsed, so it no longer qualifies.
 */
export function identityBackfill(
  lines: readonly RunLogLine[],
  readMeta: (metaPath: string) => string | null,
): Backfill {
  const newest = currentRun(lines)?.trace_id;
  const candidates = fold(lines).spans.filter(
    (s) => s.type === 'agent' && s.role === 'skill-spawned' && s.end_t !== null && s.transcript_path !== undefined,
  );
  const events: LogEvent[] = [];
  let elsewhere = 0;
  for (const span of candidates) {
    const started = lines.find((l) => l.kind === 'start' && l.span_id === span.span_id);
    const ended = [...lines].reverse().find((l) => l.kind === 'end' && l.span_id === span.span_id);
    if (started === undefined || ended === undefined) continue;
    const fact = identityFact(
      readMeta(metaPathOf(span.transcript_path as string)),
      lines.filter((l) => l.seq < ended.seq && l.trace_id === started.trace_id),
      started,
    );
    if (Object.keys(fact).length === 0) continue;
    if (span.trace_id === newest) events.push({ kind: 'attrs', span_id: span.span_id, ...fact });
    else elsewhere += 1;
  }
  return { events, elsewhere };
}
