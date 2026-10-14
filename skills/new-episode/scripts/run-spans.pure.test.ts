import { describe, expect, it } from 'vitest';
import type { Span } from './run-log.pure.ts';
import { openSpan, scoreTarget } from './run-spans.pure.ts';

/* The span lookups over plain spans: open-ness, narrowing and what a Score target names. */

const span = (seq: number, over: Partial<Span>): Span => ({
  trace_id: 't',
  span_id: `s${seq}`,
  parent_span_id: null,
  type: 'job',
  name: 'n',
  status: 'ok',
  start_t: 'x',
  end_t: null,
  duration_ms: null,
  summary: null,
  seq,
  ...over,
});

describe('openSpan', () => {
  it('returns the latest open span of the type, narrowed by Job id or name, and skips ended ones', () => {
    const spans = [
      span(1, { job: 'a' }),
      span(2, { job: 'a' }),
      span(3, { job: 'a', end_t: 'y' }),
      span(4, { type: 'gate', name: 'g' }),
    ];
    expect([
      openSpan(spans, 'job', { job: 'a' })?.span_id,
      openSpan(spans, 'gate', { name: 'g' })?.span_id,
      openSpan(spans, 'job', { job: 'b' }),
    ]).toEqual(['s2', 's4', undefined]);
  });
});

describe('scoreTarget', () => {
  const spans = [
    span(1, { job: 'a' }),
    span(2, { type: 'attempt', job: 'a', attempt: 2 }),
    span(3, { type: 'gate', name: 'draft x' }),
  ];

  it('names a Job by id, an Attempt as job#n and a Gate as gate:name', () => {
    expect(['a', 'a#2', 'gate:draft x'].map((target) => scoreTarget(spans, target)?.span_id)).toEqual([
      's1',
      's2',
      's3',
    ]);
  });

  it('names nothing for an unknown target', () => {
    expect(scoreTarget(spans, 'a#9')).toBeUndefined();
  });
});
