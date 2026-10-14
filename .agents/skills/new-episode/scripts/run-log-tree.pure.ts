// `renderTree`: prints folded spans as an indented tree with statuses, durations, models, tokens and scores.

import type { Folded, Score, Span } from './run-log.schema.pure.ts';

/** `90000` as `1m30s`; null as `…` (still open). */
export function formatDuration(ms: number | null): string {
  if (ms === null) return '…';
  const seconds = Math.round(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  if (minutes === 0) return `${seconds}s`;
  if (minutes < 60) return `${minutes}m${String(seconds % 60).padStart(2, '0')}s`;
  return `${Math.floor(minutes / 60)}h${String(minutes % 60).padStart(2, '0')}m`;
}

/** The model a span was asked for and the one it ran on; both, joined by an arrow, when they differ. */
function modelOf(span: Span): string | undefined {
  const asked = span['gen_ai.request.model'];
  const ran = span['gen_ai.response.model'];
  return asked !== undefined && ran !== undefined && asked !== ran ? `${asked}→${ran}` : (ran ?? asked);
}

function tokensOf(span: Span): string {
  const counts: [string, number | undefined][] = [
    ['in', span['gen_ai.usage.input_tokens']],
    ['out', span['gen_ai.usage.output_tokens']],
    ['cache', span['gen_ai.usage.cache_read.input_tokens']],
  ];
  return counts
    .filter(([, n]) => n !== undefined)
    .map(([label, n]) => `${label} ${n}`)
    .join(' ');
}

function describeSpan(span: Span): string {
  const parts = [`${span.status} ${span.type} ${span.name}`, formatDuration(span.duration_ms), modelOf(span), tokensOf(span)];
  return `${parts.filter((part) => part !== undefined && part !== '').join(' · ')}  [${span.span_id}]`;
}

function describeScore(score: Score): string {
  return `↳ ${score.name} ${score.value} · ${score.source}${score.rubric ? ` · ${score.rubric}` : ''}`;
}

/** The spans a render starts from: with `rootId` that one span, otherwise every span whose parent is absent. */
function rootsOf(spans: readonly Span[], rootId: string | undefined): Span[] {
  if (rootId !== undefined) return spans.filter((span) => span.span_id === rootId);
  const known = new Set(spans.map((span) => span.span_id));
  return spans.filter((span) => span.parent_span_id === null || !known.has(span.parent_span_id));
}

/**
 * The span tree as text, children by start time. Scores print under the span they judge. With `rootId`, only
 * that span's subtree; null when no such span exists.
 */
export function renderTree(folded: Folded, rootId?: string): string | null {
  const roots = rootsOf(folded.spans, rootId);
  if (roots.length === 0) return null;
  const out: string[] = [];
  const walk = (span: Span, depth: number): void => {
    const pad = '  '.repeat(depth);
    out.push(pad + describeSpan(span));
    for (const score of folded.scores.filter((s) => s.span_id === span.span_id)) out.push(`${pad}  ${describeScore(score)}`);
    for (const child of folded.spans.filter((s) => s.parent_span_id === span.span_id)) walk(child, depth + 1);
  };
  for (const root of roots) walk(root, 0);
  return out.join('\n');
}
