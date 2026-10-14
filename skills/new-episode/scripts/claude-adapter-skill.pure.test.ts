import { describe, expect, it } from 'vitest';
import { adaptSkill, type SkillHookInput } from './claude-adapter-skill.pure.ts';
import type { RunLogLine } from './run-log.pure.ts';

/*
 * The adapter's PostToolUse half (design-ADR 0009): a Skill tool call's hook payload, the active-run marker and the
 * run log in; one `skill` event on the span that made the call out, or none when the span cannot be told for sure.
 */
const TRACE = '0123456789abcdef0123456789abcdef';
const RUN_SPAN = 'cccccccccccccccc';
const JOB_SPAN = 'aaaaaaaaaaaaaaaa';
const AGENT_SPAN = 'bbbbbbbbbbbbbbbb';
const SESSION = 'session-1';
const MAIN_TRANSCRIPT = '/home/s/main.jsonl';
const AGENT_TRANSCRIPT = '/home/s/main/subagents/agent-a1.jsonl';

const markerIn = (jobSpan: string): string =>
  JSON.stringify({ log: 'docs/episodes/x/events.jsonl', session_id: SESSION, trace_id: TRACE, job_span_id: jobSpan });
const runLine: RunLogLine = {
  kind: 'start-run',
  t: '2026-10-09T09:00:00Z',
  seq: 1,
  trace_id: TRACE,
  span_id: RUN_SPAN,
  run_id: 'r',
};
const jobLine: RunLogLine = {
  kind: 'start',
  t: '2026-10-09T09:00:01Z',
  seq: 2,
  trace_id: TRACE,
  span_id: JOB_SPAN,
  parent_span_id: RUN_SPAN,
  type: 'job',
  name: 'brief-grill',
  job: 'brief-grill',
};
const agentLine: RunLogLine = {
  kind: 'start',
  t: '2026-10-09T09:00:02Z',
  seq: 3,
  trace_id: TRACE,
  span_id: AGENT_SPAN,
  parent_span_id: JOB_SPAN,
  type: 'agent',
  name: 'brief-grill#1/reviewer',
  job: 'brief-grill',
  role: 'reviewer',
  transcript_path: AGENT_TRANSCRIPT,
};

const input = (over: Partial<SkillHookInput> & { agent?: boolean; toolInput?: Record<string, unknown> }) => ({
  payload: {
    session_id: SESSION,
    transcript_path: MAIN_TRANSCRIPT,
    tool_name: 'Skill',
    tool_input: over.toolInput ?? { skill: 'writing-for-agents' },
    ...(over.agent && { agent_id: 'a1', agent_type: 'general-purpose' }),
  },
  marker: markerIn(JOB_SPAN),
  log: [runLine, jobLine, agentLine],
  ...over,
});

describe('success cases', () => {
  it('files a subagent skill call on the agent span the subagent started', () => {
    // ARRANGE
    const expected = { kind: 'skill', span_id: AGENT_SPAN, name: 'writing-for-agents', source: 'measured' };
    // ACT
    const event = adaptSkill(input({ agent: true }));
    // ASSERT
    expect(event).toEqual(expected);
  });

  it("files the orchestrator's own skill call on the Job the marker says it is in", () => {
    // ARRANGE
    const expected = { kind: 'skill', span_id: JOB_SPAN, name: 'grilling', source: 'measured' };
    // ACT
    const event = adaptSkill(input({ toolInput: { skill: 'grilling', args: 'x' } }));
    // ASSERT
    expect(event).toEqual(expected);
  });

  it('names a plugin skill as the tool call does, plugin:skill', () => {
    // ARRANGE
    const name = 'skill-creator:skill-creator';
    // ACT
    const event = adaptSkill(input({ agent: true, toolInput: { skill: name } }));
    // ASSERT
    expect(event?.name).toBe(name);
  });
});

describe('failure cases', () => {
  it('writes nothing for a session the marker does not list, or without a marker', () => {
    // ARRANGE
    const foreign = input({ agent: true });
    foreign.payload.session_id = 'session-2';
    // ACT
    const events = [adaptSkill(foreign), adaptSkill(input({ agent: true, marker: null }))];
    // ASSERT
    expect(events).toEqual([null, null]);
  });

  it('writes nothing for a subagent whose start is not in the log', () => {
    // ACT
    const event = adaptSkill(input({ agent: true, log: [runLine, jobLine] }));
    // ASSERT
    expect(event).toBeNull();
  });

  it('writes nothing for the orchestrator between Jobs, when the marker points at the Run', () => {
    // ACT
    const event = adaptSkill(input({ marker: markerIn(RUN_SPAN) }));
    // ASSERT
    expect(event).toBeNull();
  });

  it('writes nothing for another tool or a call without a skill name', () => {
    // ARRANGE
    const read = input({ agent: true });
    read.payload.tool_name = 'Read';
    // ACT
    const events = [adaptSkill(read), adaptSkill(input({ agent: true, toolInput: { skill: '' } }))];
    // ASSERT
    expect(events).toEqual([null, null]);
  });
});

describe('edge cases', () => {
  it('writes nothing for the orchestrator once the marker Job has ended', () => {
    // ARRANGE
    const ended: RunLogLine = { kind: 'end', t: '2026-10-09T09:05:00Z', seq: 4, trace_id: TRACE, span_id: JOB_SPAN };
    // ACT
    const event = adaptSkill(input({ log: [runLine, jobLine, agentLine, ended] }));
    // ASSERT
    expect(event).toBeNull();
  });

  it('trims the name, and writes nothing for a blank one, as skills_invoked does', () => {
    // ARRANGE
    const name = 'a:b';
    // ACT
    const events = [
      adaptSkill(input({ agent: true, toolInput: { skill: ` ${name} ` } }))?.name,
      adaptSkill(input({ agent: true, toolInput: { skill: '   ' } })),
    ];
    // ASSERT
    expect(events).toEqual([name, null]);
  });

  it('reads an older Skill tool input that names the skill as command', () => {
    // ARRANGE
    const name = 'tdd';
    // ACT
    const event = adaptSkill(input({ agent: true, toolInput: { command: name } }));
    // ASSERT
    expect(event?.name).toBe(name);
  });
});
