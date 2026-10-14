import { describe, expect, it } from 'vitest';
import { adaptSubagent, parseDescription, parseMarker, subagentFiles, type AdapterInput } from './claude-adapter.pure.ts';
import type { RunLogLine } from './run-log.pure.ts';

/*
 * The Claude Code adapter: a SubagentStart/SubagentStop payload, the subagent's meta.json and transcript, and
 * the active-run marker in; the run-log event to append, or none, out.
 */
const JOB_SPAN = 'aaaaaaaaaaaaaaaa';
const AGENT_SPAN = 'bbbbbbbbbbbbbbbb';
const TRACE = '0123456789abcdef0123456789abcdef';
const SESSION = 'session-1';
const TRANSCRIPT = '/home/s/main/subagents/agent-a1.jsonl';
const marker = JSON.stringify({ log: 'docs/episodes/x/events.jsonl', session_id: SESSION, trace_id: TRACE, job_span_id: JOB_SPAN});
const meta = (description: string): string => JSON.stringify({ agentType: 'general-purpose', description, toolUseId: 't1', model: 'sonnet' });
const user = (t: string, text: string): string => JSON.stringify({ type: 'user', timestamp: t, message: { role: 'user', content: text } });
const assistant = (t: string, id: string, usage: Record<string, number>): string =>
  JSON.stringify({ type: 'assistant', timestamp: t, message: { id, role: 'assistant', model: 'claude-sonnet-5-5', usage } });
const transcript = [
  user('2026-10-09T10:00:00.000Z', 'Review the dossier.'),
  assistant('2026-10-09T10:00:05.000Z', 'm1', { input_tokens: 10, output_tokens: 1, cache_read_input_tokens: 100 }),
  assistant('2026-10-09T10:00:09.000Z', 'm1', { input_tokens: 10, output_tokens: 4, cache_read_input_tokens: 100 }),
  assistant('2026-10-09T10:01:00.000Z', 'm2', { input_tokens: 20, output_tokens: 6, cache_read_input_tokens: 50 }),
].join('\n');

const base = (over: Partial<AdapterInput> & { description?: string }): AdapterInput => ({
  event: 'start',
  payload: { session_id: SESSION, transcript_path: '/home/s/main.jsonl', cwd: '/w', agent_id: 'a1', agent_type: 'general-purpose' },
  marker,
  meta: meta(over.description ?? 'write-dossier#2/reviewer'),
  transcript,
  log: [jobLine],
  ...over,
});

const jobLine: RunLogLine = { kind: 'start', t: '2026-10-09T09:00:00Z', seq: 1, trace_id: TRACE, span_id: JOB_SPAN, type: 'job', name: 'write-dossier', job: 'write-dossier', parent_span_id: 'cccccccccccccccc' };
const startLine: RunLogLine = { kind: 'start', t: '2026-10-09T10:00:00Z', seq: 2, trace_id: TRACE, span_id: AGENT_SPAN, type: 'agent', name: 'x', parent_span_id: JOB_SPAN, transcript_path: TRANSCRIPT };

describe('success cases', () => {
  it('parses job, attempt and role', () => {
    // ARRANGE
    const description = 'write-dossier#2/reviewer';
    // ACT
    const parsed = parseDescription(description);
    // ASSERT
    expect(parsed).toEqual({ job: 'write-dossier', attempt: 2, role: 'reviewer' });
  });

  it('parses the optional ticket', () => {
    // ARRANGE
    const description = 'implement-episode#1/ticket-implementor/#148';
    // ACT
    const parsed = parseDescription(description);
    // ASSERT
    expect(parsed).toEqual({ job: 'implement-episode', attempt: 1, role: 'ticket-implementor', ticket: 148 });
  });

  it('maps a start to an agent span under the marker job with the measured launch facts', () => {
    // ARRANGE
    const input = base({});
    const expected = {
      kind: 'start',
      type: 'agent',
      t: '2026-10-09T10:00:00.000Z',
      parent_span_id: JOB_SPAN,
      name: 'write-dossier#2/reviewer',
      job: 'write-dossier',
      attempt: 2,
      role: 'reviewer',
      harness: 'claude-code',
      source: 'measured',
      description: 'write-dossier#2/reviewer',
      transcript_path: TRANSCRIPT,
      'gen_ai.agent.name': 'general-purpose',
      'gen_ai.request.model': 'sonnet',
      'gen_ai.input.messages': 'Review the dossier.',
    };
    // ACT
    const event = adaptSubagent(input);
    // ASSERT
    expect(event).toEqual(expected);
  });

  it('maps a stop to an end of the matching start with model, summed usage and a capped summary', () => {
    // ARRANGE
    const long = 'x'.repeat(600);
    const input = base({ event: 'stop', log: [jobLine, startLine], payload: { ...base({}).payload, last_assistant_message: long, transcript_path: '/home/s/main.jsonl' } });
    const expectedSummary = 'x'.repeat(500);
    // ACT
    const event = adaptSubagent(input);
    // ASSERT
    expect(event).toEqual({
      kind: 'end',
      span_id: AGENT_SPAN,
      status: 'ok',
      source: 'measured',
      t: '2026-10-09T10:01:00.000Z',
      summary: expectedSummary,
      transcript_path: TRANSCRIPT,
      'gen_ai.response.model': 'claude-sonnet-5-5',
      'gen_ai.usage.input_tokens': 30,
      'gen_ai.usage.output_tokens': 10,
      'gen_ai.usage.cache_read.input_tokens': 150,
    });
  });
});

describe('failure cases', () => {
  it('acts on nothing without a marker', () => {
    // ARRANGE
    const input = base({ marker: null });
    // ACT
    const event = adaptSubagent(input);
    // ASSERT
    expect(event).toBeNull();
  });

  it('acts on nothing when the marker belongs to another session', () => {
    // ARRANGE
    const input = base({ payload: { ...base({}).payload, session_id: 'other' } });
    // ACT
    const event = adaptSubagent(input);
    // ASSERT
    expect(event).toBeNull();
  });

  it('acts on nothing for a malformed marker', () => {
    // ARRANGE
    const broken = '{"log": ';
    // ACT
    const parsed = parseMarker(broken);
    // ASSERT
    expect(parsed).toBeNull();
  });

  it('writes no end for a stop whose start was never logged', () => {
    // ARRANGE
    const input = base({ event: 'stop', log: [jobLine] });
    // ACT
    const event = adaptSubagent(input);
    // ASSERT
    expect(event).toBeNull();
  });
});

describe('edge cases', () => {
  it('finds the subagent files beside the session transcript', () => {
    // ARRANGE
    const payload = base({}).payload;
    const expected = { transcript: TRANSCRIPT, meta: '/home/s/main/subagents/agent-a1.meta.json' };
    // ACT
    const files = subagentFiles(payload);
    // ASSERT
    expect(files).toEqual(expected);
  });

  it('attaches an unparsed description to the marker job as skill-spawned with the raw description', () => {
    // ARRANGE
    const description = 'Spec review of hero changes';
    // ACT
    const event = adaptSubagent(base({ description }));
    // ASSERT
    expect(event).toMatchObject({ job: 'write-dossier', role: 'skill-spawned', description, parent_span_id: JOB_SPAN });
    expect(event).not.toHaveProperty('attempt');
  });

  it.each(['write-dossier#0/reviewer', 'write-dossier#x/reviewer', 'write-dossier#1/', '#1/reviewer', 'a#1/b/#0', 'a#1/b/c'])(
    'does not parse %s',
    (description) => {
      // ARRANGE
      const text = description;
      // ACT
      const parsed = parseDescription(text);
      // ASSERT
      expect(parsed).toBeNull();
    },
  );

  it('reports the model the transcript resolved when it differs from the one requested', () => {
    // ARRANGE
    const swapped = transcript.replaceAll('claude-sonnet-5-5', 'claude-haiku-4-5');
    const input = base({ event: 'stop', log: [jobLine, startLine], transcript: swapped });
    // ACT
    const event = adaptSubagent(input);
    // ASSERT
    expect(event).toMatchObject({ 'gen_ai.response.model': 'claude-haiku-4-5' });
  });

  it('skips the usage of a transcript that reports none', () => {
    // ARRANGE
    const input = base({ event: 'stop', log: [jobLine, startLine], transcript: user('2026-10-09T10:00:00.000Z', 'hi') });
    // ACT
    const event = adaptSubagent(input);
    // ASSERT
    expect(event).not.toHaveProperty('gen_ai.usage.input_tokens');
  });
});
