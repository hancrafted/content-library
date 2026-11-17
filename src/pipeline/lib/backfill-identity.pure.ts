// decision: docs/adr/0007-pipeline-runs-are-logged-as-spans-in-append-only-jsonl.md
import { identityFact } from './claude-adapter.pure.ts';
import { currentRun, fold, type LogEvent, type RunLogLine } from './run-log.pure.ts';

export const metaPathOf = (transcriptPath: string): string => transcriptPath.replace(/\.jsonl$/, '.meta.json');

export interface Backfill {
  events: LogEvent[];
  elsewhere: number;
}

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
