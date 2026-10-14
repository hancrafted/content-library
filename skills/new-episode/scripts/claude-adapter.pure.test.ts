import { describe, expect, it } from 'vitest';
import { frontmatterModel } from './agent-definition.pure.ts';
import {
  adaptSubagent,
  parseDescription,
  runUsageEvent,
  subagentFiles,
  type AdapterInput,
} from './claude-adapter.pure.ts';
import { parseMarker } from './marker.pure.ts';
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
const marker = JSON.stringify({
  log: 'docs/episodes/x/events.jsonl',
  session_id: SESSION,
  trace_id: TRACE,
  job_span_id: JOB_SPAN,
});
const meta = (description: string): string =>
  JSON.stringify({
    agentType: 'general-purpose',
    description,
    toolUseId: 't1',
    model: 'sonnet',
    requestShape: 'background',
  });
const user = (t: string, text: string): string =>
  JSON.stringify({ type: 'user', timestamp: t, message: { role: 'user', content: text } });
const assistant = (t: string, id: string, usage: Record<string, number>): string =>
  JSON.stringify({
    type: 'assistant',
    timestamp: t,
    message: { id, role: 'assistant', model: 'claude-sonnet-5-5', usage },
  });
const transcript = [
  user('2026-10-09T10:00:00.000Z', 'Review the dossier.'),
  assistant('2026-10-09T10:00:05.000Z', 'm1', { input_tokens: 10, output_tokens: 1, cache_read_input_tokens: 100 }),
  assistant('2026-10-09T10:00:09.000Z', 'm1', { input_tokens: 10, output_tokens: 4, cache_read_input_tokens: 100 }),
  assistant('2026-10-09T10:01:00.000Z', 'm2', { input_tokens: 20, output_tokens: 6, cache_read_input_tokens: 50 }),
].join('\n');

const base = (over: Partial<AdapterInput> & { description?: string }): AdapterInput => ({
  event: 'start',
  payload: {
    session_id: SESSION,
    transcript_path: '/home/s/main.jsonl',
    cwd: '/w',
    agent_id: 'a1',
    agent_type: 'general-purpose',
  },
  marker,
  meta: meta(over.description ?? 'write-dossier#2/reviewer'),
  transcript,
  log: [jobLine],
  ...over,
});

const jobLine: RunLogLine = {
  kind: 'start',
  t: '2026-10-09T09:00:00Z',
  seq: 1,
  trace_id: TRACE,
  span_id: JOB_SPAN,
  type: 'job',
  name: 'write-dossier',
  job: 'write-dossier',
  parent_span_id: 'cccccccccccccccc',
};
const ATTEMPT_SPAN = 'dddddddddddddddd';
const attemptLine = (span: string, seq: number, attempt: number): RunLogLine => ({
  kind: 'start',
  t: '2026-10-09T09:30:00Z',
  seq,
  trace_id: TRACE,
  span_id: span,
  type: 'attempt',
  name: `write-dossier#${attempt}`,
  job: 'write-dossier',
  attempt,
  parent_span_id: JOB_SPAN,
});
const startLine: RunLogLine = {
  kind: 'start',
  t: '2026-10-09T10:00:00.000Z',
  'gen_ai.input.messages': 'Review the dossier.',
  seq: 2,
  trace_id: TRACE,
  span_id: AGENT_SPAN,
  type: 'agent',
  name: 'x',
  parent_span_id: JOB_SPAN,
  transcript_path: TRANSCRIPT,
};

describe('success cases', () => {
  it('parses job, attempt and role', () => {
    // ARRANGE
    const description = 'write-dossier#2/reviewer';
    // ACT
    const parsed = parseDescription(description);
    // ASSERT
    expect(parsed).toEqual({ job: 'write-dossier', attempt: 2, role: 'reviewer' });
  });

  it.each(['reviewer-standards', 'reviewer-spec'])('parses the per-ticket %s role', (role) => {
    // ARRANGE
    const description = `implement-episode#1/${role}/#174`;
    // ACT
    const parsed = parseDescription(description);
    // ASSERT
    expect(parsed).toEqual({ job: 'implement-episode', attempt: 1, role, ticket: 174 });
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
      request_shape: 'background',
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
    const input = base({
      event: 'stop',
      log: [jobLine, startLine],
      payload: { ...base({}).payload, last_assistant_message: long, transcript_path: '/home/s/main.jsonl' },
    });
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
      'gen_ai.request.model': 'sonnet',
      'gen_ai.response.model': 'claude-sonnet-5-5',
      'gen_ai.usage.input_tokens': 30,
      'gen_ai.usage.output_tokens': 10,
      'gen_ai.usage.cache_read.input_tokens': 150,
      skills_invoked: [],
    });
  });
});

describe('nesting and late facts', () => {
  it('nests a parsed agent under the open Attempt of its Job and number', () => {
    // ARRANGE
    const input = base({ log: [jobLine, attemptLine(ATTEMPT_SPAN, 2, 2)] });
    // ACT
    const event = adaptSubagent(input);
    // ASSERT
    expect(event).toMatchObject({ parent_span_id: ATTEMPT_SPAN });
  });

  it('nests under the latest open Attempt when an earlier one of that number ended', () => {
    // ARRANGE
    const older = attemptLine('eeeeeeeeeeeeeeee', 2, 2);
    const ended: RunLogLine = {
      kind: 'end',
      t: '2026-10-09T09:40:00Z',
      seq: 3,
      trace_id: TRACE,
      span_id: ATTEMPT_SPAN,
      status: 'error',
    };
    const input = base({ log: [jobLine, older, attemptLine(ATTEMPT_SPAN, 4, 2), ended] });
    // ACT
    const event = adaptSubagent(input);
    // ASSERT
    expect(event).toMatchObject({ parent_span_id: 'eeeeeeeeeeeeeeee' });
  });

  it('falls back to the marker Job when the Attempt was never logged', () => {
    // ARRANGE
    const input = base({ log: [jobLine, attemptLine(ATTEMPT_SPAN, 2, 1)] });
    // ACT
    const event = adaptSubagent(input);
    // ASSERT
    expect(event).toMatchObject({ parent_span_id: JOB_SPAN });
  });

  it('keeps a skill-spawned agent under the marker Job even with an Attempt open', () => {
    // ARRANGE
    const input = base({ description: 'Spec review of hero changes', log: [jobLine, attemptLine(ATTEMPT_SPAN, 2, 1)] });
    // ACT
    const event = adaptSubagent(input);
    // ASSERT
    expect(event).toMatchObject({ parent_span_id: JOB_SPAN });
  });

  it('files an unparsed agent under the one open Job even when the marker points at an ended one', () => {
    // ARRANGE
    const openJob: RunLogLine = { ...jobLine, seq: 3, span_id: 'eeeeeeeeeeeeeee1', name: 'other', job: 'other' };
    const endMarkerJob: RunLogLine = {
      kind: 'end',
      t: '2026-10-09T09:40:00Z',
      seq: 4,
      trace_id: TRACE,
      span_id: JOB_SPAN,
      status: 'ok',
    };
    const input = base({ description: 'Spec review of hero changes', log: [jobLine, openJob, endMarkerJob] });
    // ACT
    const event = adaptSubagent(input);
    // ASSERT
    expect(event).toMatchObject({ job: 'other', role: 'skill-spawned', parent_span_id: 'eeeeeeeeeeeeeee1' });
  });

  it('files an unparsed agent under the Run, never a guessed Job, when two Jobs are open', () => {
    // ARRANGE
    const runStart: RunLogLine = {
      kind: 'start-run',
      t: '2026-10-09T08:00:00Z',
      seq: 0,
      trace_id: TRACE,
      span_id: 'ffffffffffffffff',
      run_id: 'r',
    };
    const otherJob: RunLogLine = { ...jobLine, seq: 3, span_id: 'eeeeeeeeeeeeeee1', name: 'other', job: 'other' };
    const description = 'Spec review of hero changes';
    const input = base({ description, log: [runStart, jobLine, otherJob] });
    // ACT
    const event = adaptSubagent(input);
    // ASSERT
    expect(event).toMatchObject({ role: 'skill-spawned', description, parent_span_id: 'ffffffffffffffff' });
    expect(event).not.toHaveProperty('job');
  });

  it('files an agent whose named Job is not open under the Run, never the Job the marker points at', () => {
    // ARRANGE
    const runStart: RunLogLine = {
      kind: 'start-run',
      t: '2026-10-09T08:00:00Z',
      seq: 0,
      trace_id: TRACE,
      span_id: 'ffffffffffffffff',
      run_id: 'r',
    };
    const input = base({ description: 'brief-grill#1/writer', log: [runStart, jobLine] });
    // ACT
    const event = adaptSubagent(input);
    // ASSERT
    expect(event).toMatchObject({ job: 'brief-grill', attempt: 1, role: 'writer', parent_span_id: 'ffffffffffffffff' });
  });

  it('carries the prompt and launch time on the end line when the start ran before the transcript existed', () => {
    // ARRANGE
    const lateStart: RunLogLine = { ...startLine, t: '2026-10-09T10:00:00Z', 'gen_ai.input.messages': undefined };
    const noPrompt = base({ log: [jobLine], transcript: '' });
    const input = base({
      event: 'stop',
      log: [jobLine, lateStart],
      transcript: transcript.replace('10:00:00.000Z', '09:59:58.000Z'),
    });
    // ACT
    const atStart = adaptSubagent(noPrompt);
    const atStop = adaptSubagent(input);
    // ASSERT
    expect(atStart).not.toHaveProperty('gen_ai.input.messages');
    expect(atStart).not.toHaveProperty('t');
    expect(atStop).toMatchObject({
      start_t: '2026-10-09T09:59:58.000Z',
      'gen_ai.input.messages': 'Review the dossier.',
    });
  });

  it('adds nothing to the end line that the start already measured', () => {
    // ARRANGE
    const input = base({ event: 'stop', log: [jobLine, startLine] });
    // ACT
    const event = adaptSubagent(input);
    // ASSERT
    expect(event).not.toHaveProperty('start_t');
    expect(event).not.toHaveProperty('gen_ai.input.messages');
  });
});

describe('skills invoked and the summary at SubagentStop', () => {
  const skillCall = (name: string): string =>
    JSON.stringify({
      type: 'assistant',
      timestamp: '2026-10-09T10:00:20.000Z',
      message: {
        id: `s-${name}`,
        role: 'assistant',
        content: [{ type: 'tool_use', name: 'Skill', input: { skill: name } }],
      },
    });
  const bash = JSON.stringify({
    type: 'assistant',
    timestamp: '2026-10-09T10:00:30.000Z',
    message: { id: 'b', role: 'assistant', content: [{ type: 'tool_use', name: 'Bash', input: { skill: 'nope' } }] },
  });
  const stop = (text: string | null, last?: string) =>
    adaptSubagent(
      base({
        event: 'stop',
        log: [jobLine, startLine],
        transcript: text,
        payload: { ...base({}).payload, last_assistant_message: last },
      }),
    );

  it('records the Skill tool calls of the subagent transcript, plugin skills as plugin:skill, once each', () => {
    // ARRANGE
    const text = [transcript, skillCall('tdd'), skillCall('ui-ux-pro-max:slides'), skillCall('tdd'), bash].join('\n');
    // ACT
    const event = stop(text);
    // ASSERT
    expect(event).toMatchObject({ skills_invoked: ['tdd', 'ui-ux-pro-max:slides'] });
  });

  it('names a skill as the PostToolUse hook does: skill or the older command, trimmed, blanks left out', () => {
    // ARRANGE
    const call = (input: Record<string, unknown>): string =>
      JSON.stringify({
        type: 'assistant',
        timestamp: '2026-10-09T10:00:20.000Z',
        message: { id: 'c', role: 'assistant', content: [{ type: 'tool_use', name: 'Skill', input }] },
      });
    const text = [transcript, call({ skill: ' tdd ' }), call({ command: 'a:b' }), call({ skill: '  ' })].join('\n');
    const expected = ['tdd', 'a:b'];
    // ACT
    const event = stop(text);
    // ASSERT
    expect(event?.skills_invoked).toEqual(expected);
  });

  it('records an empty list for a readable transcript with no Skill call, and nothing for an unreadable one', () => {
    expect(stop(transcript)).toMatchObject({ skills_invoked: [] });
    expect(stop(null)).not.toHaveProperty('skills_invoked');
  });

  it('stores the summary verdict-first with the absolute path shortened', () => {
    // ARRANGE
    const last = 'Written at /Users/han/repo/.worktrees/w/docs/episodes/x/dossier.md. pass';
    // ACT
    const event = stop(transcript, last);
    // ASSERT
    expect(event?.summary).toBe('Written at docs/episodes/x/dossier.md. pass');
  });
});

describe('orchestrator usage', () => {
  const RUN_SPAN = 'ffffffffffffffff';
  const runStart: RunLogLine = {
    kind: 'start-run',
    t: '2026-10-09T08:00:00Z',
    seq: 1,
    trace_id: TRACE,
    span_id: RUN_SPAN,
    run_id: 'r',
  };
  const runEnd: RunLogLine = {
    kind: 'end-run',
    t: '2026-10-09T11:00:00Z',
    seq: 9,
    trace_id: TRACE,
    span_id: RUN_SPAN,
    status: 'ok',
    summary: 'done',
  };
  const parsed = parseMarker(marker) as NonNullable<ReturnType<typeof parseMarker>>;

  it('repeats the Run end with the orchestrator session model and summed usage', () => {
    // ARRANGE
    const expected = {
      kind: 'end-run',
      span_id: RUN_SPAN,
      status: 'ok',
      summary: 'done',
      source: 'measured',
      'gen_ai.response.model': 'claude-sonnet-5-5',
      'gen_ai.usage.input_tokens': 30,
      'gen_ai.usage.output_tokens': 10,
      'gen_ai.usage.cache_read.input_tokens': 150,
    };
    // ACT
    const event = runUsageEvent([runStart, runEnd], parsed, [transcript]);
    // ASSERT
    expect(event).toEqual(expected);
  });

  it('counts what the orchestrator spent within the second the Run ended in, since line times are whole seconds', () => {
    // ARRANGE
    const late = assistant('2026-10-09T11:00:00.700Z', 'm9', { input_tokens: 5, output_tokens: 7 });
    const after = assistant('2026-10-09T11:00:01.200Z', 'm10', { input_tokens: 1000, output_tokens: 1000 });
    // ACT
    const event = runUsageEvent([runStart, runEnd], parsed, [[late, after].join('\n')]);
    // ASSERT
    expect(event).toMatchObject({ 'gen_ai.usage.input_tokens': 5, 'gen_ai.usage.output_tokens': 7 });
  });

  it('writes nothing before the Run has ended, twice, or without usage', () => {
    // ARRANGE
    const counted: RunLogLine = { ...runEnd, 'gen_ai.usage.input_tokens': 1 };
    // ACT
    const open = runUsageEvent([runStart], parsed, [transcript]);
    const again = runUsageEvent([runStart, counted], parsed, [transcript]);
    const empty = runUsageEvent([runStart, runEnd], parsed, [null]);
    // ASSERT
    expect([open, again, empty]).toEqual([null, null, null]);
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

  it('writes no second end for a stop delivered twice', () => {
    // ARRANGE
    const endLine: RunLogLine = {
      kind: 'end',
      t: '2026-10-09T10:01:00.000Z',
      seq: 3,
      trace_id: TRACE,
      span_id: AGENT_SPAN,
      status: 'ok',
    };
    const input = base({ event: 'stop', log: [jobLine, startLine, endLine] });
    // ACT
    const event = adaptSubagent(input);
    // ASSERT
    expect(event).toBeNull();
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

  it.each([
    'write-dossier#0/reviewer',
    'write-dossier#x/reviewer',
    'write-dossier#1/',
    '#1/reviewer',
    'a#1/b/#0',
    'a#1/b/c',
  ])('does not parse %s', (description) => {
    // ARRANGE
    const text = description;
    // ACT
    const parsed = parseDescription(text);
    // ASSERT
    expect(parsed).toBeNull();
  });

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
    const input = base({
      event: 'stop',
      log: [jobLine, startLine],
      transcript: user('2026-10-09T10:00:00.000Z', 'hi'),
    });
    // ACT
    const event = adaptSubagent(input);
    // ASSERT
    expect(event).not.toHaveProperty('gen_ai.usage.input_tokens');
  });
});

describe('identity on the end line (R1)', () => {
  const provisional: RunLogLine = {
    ...startLine,
    role: 'skill-spawned',
    job: 'write-dossier',
    name: 'write-dossier/skill-spawned',
  };

  it('puts the identity meta.json now names on the end line, and its parent', () => {
    // ARRANGE
    const input = base({
      event: 'stop',
      description: 'write-dossier#2/ticket-implementor/#148',
      log: [jobLine, attemptLine(ATTEMPT_SPAN, 2, 2), provisional],
    });
    // ACT
    const event = adaptSubagent(input);
    // ASSERT
    expect(event).toMatchObject({
      kind: 'end',
      job: 'write-dossier',
      attempt: 2,
      role: 'ticket-implementor',
      ticket: 148,
      parent_span_id: ATTEMPT_SPAN,
      name: 'write-dossier#2/ticket-implementor/#148',
      description: 'write-dossier#2/ticket-implementor/#148',
    });
  });

  it('leaves a start that already parsed alone', () => {
    // ARRANGE
    const parsed: RunLogLine = { ...startLine, role: 'reviewer', job: 'write-dossier', attempt: 2 };
    const input = base({ event: 'stop', log: [jobLine, parsed] });
    // ACT
    const event = adaptSubagent(input);
    // ASSERT
    for (const key of ['job', 'attempt', 'role', 'ticket', 'parent_span_id', 'name'])
      expect(event).not.toHaveProperty(key);
  });

  it('adds no identity when meta.json still does not parse', () => {
    // ARRANGE
    const input = base({ event: 'stop', description: 'Spec review', log: [jobLine, provisional] });
    // ACT
    const event = adaptSubagent(input);
    // ASSERT
    expect(event).not.toHaveProperty('role');
  });

  it('puts the model meta.json names on the end line when the start had none', () => {
    // ARRANGE
    const input = base({ event: 'stop', log: [jobLine, provisional] });
    // ACT
    const event = adaptSubagent(input);
    // ASSERT
    expect(event).toMatchObject({ 'gen_ai.request.model': 'sonnet' });
  });
});

describe('requested model fallback (R8)', () => {
  const noModel = JSON.stringify({ agentType: 'ticket-implementor', description: 'write-dossier#2/reviewer' });

  it('uses the agent definition model when meta.json has none, at start', () => {
    // ARRANGE
    const input = base({ meta: noModel, agentModel: 'opus' });
    // ACT
    const event = adaptSubagent(input);
    // ASSERT
    expect(event).toMatchObject({ 'gen_ai.request.model': 'opus' });
  });

  it('prefers meta.json', () => {
    // ARRANGE
    const input = base({ agentModel: 'opus' });
    // ACT
    const event = adaptSubagent(input);
    // ASSERT
    expect(event).toMatchObject({ 'gen_ai.request.model': 'sonnet' });
  });

  it('reads the model from frontmatter', () => {
    // ARRANGE
    const text = '---\nname: x\nmodel: "haiku"\n---\nbody\nmodel: opus\n';
    // ACT
    const model = frontmatterModel(text);
    // ASSERT
    expect(model).toBe('haiku');
    expect(frontmatterModel('no frontmatter')).toBeUndefined();
    expect(frontmatterModel('---\nmodel: inherit\n---\n')).toBeUndefined();
  });
});

describe('sessions (S2)', () => {
  const resumed = JSON.stringify({
    log: 'docs/episodes/x/events.jsonl',
    session_id: 'session-2',
    session_ids: [SESSION, 'session-2'],
    trace_id: TRACE,
    job_span_id: JOB_SPAN,
  });
  const forOld = (event: 'start' | 'stop'): AdapterInput => base({ event, marker: resumed, log: [jobLine, startLine] });

  it('accepts a stop from an earlier session of the Run', () => {
    // ACT
    const event = adaptSubagent(forOld('stop'));
    // ASSERT
    expect(event).toMatchObject({ kind: 'end', span_id: AGENT_SPAN });
  });

  it('still refuses a start from an earlier session, and a stop from a stranger', () => {
    // ARRANGE
    const stranger = { ...forOld('stop'), payload: { ...forOld('stop').payload, session_id: 'other' } };
    // ACT / ASSERT
    expect(adaptSubagent(forOld('start'))).toBeNull();
    expect(adaptSubagent(stranger)).toBeNull();
  });

  it('accepts a start from the current session', () => {
    // ARRANGE
    const input = { ...forOld('start'), payload: { ...forOld('start').payload, session_id: 'session-2' } };
    // ACT / ASSERT
    expect(adaptSubagent(input)).toMatchObject({ kind: 'start' });
  });
});
