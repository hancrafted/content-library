import { describe, expect, it } from 'vitest';
import {
  adaptInstructions,
  adaptRead,
  adaptSkill,
  type InstructionsHookInput,
  type ReadHookInput,
  type ToolHookInput,
} from './claude-adapter-event.pure.ts';
import type { RunLogLine } from './run-log.pure.ts';

/*
 * The adapter's point-fact half (design-ADR-0010): a PostToolUse (Skill, Read) or InstructionsLoaded hook payload, the
 * active-run marker and the run log in; one `event` on the span that made the call out, or none when the span cannot
 * be told for sure or the fact lies outside the repository.
 */
const TRACE = '0123456789abcdef0123456789abcdef';
const RUN_SPAN = 'cccccccccccccccc';
const JOB_SPAN = 'aaaaaaaaaaaaaaaa';
const AGENT_SPAN = 'bbbbbbbbbbbbbbbb';
const SESSION = 'session-1';
const MAIN_TRANSCRIPT = '/home/s/main.jsonl';
const AGENT_TRANSCRIPT = '/home/s/main/subagents/agent-a1.jsonl';
const ROOT = '/repo/wt';

const markerIn = (jobSpan: string): string =>
  JSON.stringify({ log: 'docs/episodes/x/events.jsonl', session_id: SESSION, trace_id: TRACE, job_span_id: jobSpan });
const runLine = {
  kind: 'start-run',
  t: '2026-10-09T09:00:00Z',
  seq: 1,
  trace_id: TRACE,
  span_id: RUN_SPAN,
  run_id: 'r',
} as RunLogLine;
const jobLine = {
  kind: 'start',
  t: '2026-10-09T09:00:01Z',
  seq: 2,
  trace_id: TRACE,
  span_id: JOB_SPAN,
  parent_span_id: RUN_SPAN,
  type: 'job',
  name: 'brief-grill',
  job: 'brief-grill',
} as RunLogLine;
const agentLine = {
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
} as RunLogLine;

const input = (over: Partial<ToolHookInput> & { agent?: boolean; toolInput?: Record<string, unknown> }) => ({
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

const readInput = (filePath: string, over: Partial<ReadHookInput> & { agent?: boolean } = { agent: true }) => ({
  payload: {
    session_id: SESSION,
    transcript_path: MAIN_TRANSCRIPT,
    tool_name: 'Read',
    tool_input: { file_path: filePath },
    ...(over.agent && { agent_id: 'a1', agent_type: 'general-purpose' }),
  },
  marker: markerIn(JOB_SPAN),
  log: [runLine, jobLine, agentLine],
  repoRoot: ROOT,
  ...over,
});

const RULE = `${ROOT}/.claude/rules/fe-001-state-management.md`;
const loadInput = (payload: Record<string, unknown>, resolvedPath: string | null): InstructionsHookInput => ({
  payload: {
    session_id: SESSION,
    transcript_path: MAIN_TRANSCRIPT,
    agent_id: 'a1',
    agent_type: 'general-purpose',
    file_path: RULE,
    load_reason: 'path_glob_match',
    ...payload,
  },
  marker: markerIn(JOB_SPAN),
  log: [runLine, jobLine, agentLine],
  repoRoot: ROOT,
  resolvedPath,
});
describe('success cases', () => {
  it('files a subagent skill call on the agent span the subagent started', () => {
    // ARRANGE
    const expected = {
      kind: 'event',
      span_id: AGENT_SPAN,
      name: 'skill.invoke',
      source: 'measured',
      attributes: { 'skill.name': 'writing-for-agents' },
    };
    // ACT
    const event = adaptSkill(input({ agent: true }));
    // ASSERT
    expect(event).toEqual(expected);
  });

  it("files the orchestrator's own skill call on the Job the marker says it is in", () => {
    // ARRANGE
    const expected = {
      kind: 'event',
      span_id: JOB_SPAN,
      name: 'skill.invoke',
      source: 'measured',
      attributes: { 'skill.name': 'grilling' },
    };
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
    expect(event?.attributes).toEqual({ 'skill.name': name });
  });
  it("files a subagent's Read of a repository file as a file.read, path repo-relative", () => {
    // ARRANGE
    const expected = {
      kind: 'event',
      span_id: AGENT_SPAN,
      name: 'file.read',
      source: 'measured',
      attributes: { 'file.path': 'src/lib/a.ts' },
    };
    // ACT
    const event = adaptRead(readInput(`${ROOT}/src/lib/a.ts`));
    // ASSERT
    expect(event).toEqual(expected);
  });

  it('files a rule loaded in a subagent as instructions.load, with the ADR its symlink resolves to and harness extras', () => {
    // ARRANGE
    const globs = ['src/**/*.ts'];
    const expected = {
      kind: 'event',
      span_id: AGENT_SPAN,
      name: 'instructions.load',
      source: 'measured',
      attributes: {
        'file.path': '.claude/rules/fe-001-state-management.md',
        load_reason: 'path_glob_match',
        'trigger_file.path': 'src/lib/a.ts',
        adr: 'FE-001-state-management',
      },
      payload: { claude_code: { memory_type: 'Project', globs } },
    };
    // ACT
    const event = adaptInstructions(
      loadInput(
        { memory_type: 'Project', globs, trigger_file_path: `${ROOT}/src/lib/a.ts` },
        `${ROOT}/.archgate/adrs/FE-001-state-management.md`,
      ),
    );
    // ASSERT
    expect(event).toEqual(expected);
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
    // ARRANGE
    const log = [runLine, jobLine];
    // ACT
    const event = adaptSkill(input({ agent: true, log }));
    // ASSERT
    expect(event).toBeNull();
  });

  it('writes nothing for the orchestrator between Jobs, when the marker points at the Run', () => {
    // ARRANGE
    const marker = markerIn(RUN_SPAN);
    // ACT
    const event = adaptSkill(input({ marker }));
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
  it('writes nothing for a Read outside the repository, beside it or elsewhere on disk', () => {
    // ARRANGE
    const outside = ['/etc/hosts', '/repo/other/a.ts', ''];
    // ACT
    const events = outside.map((file) => adaptRead(readInput(file)));
    // ASSERT
    expect(events).toEqual([null, null, null]);
  });

  it('writes nothing for an instructions load without a load reason or a file inside the repository', () => {
    // ARRANGE
    const outside = '/home/han/.claude/CLAUDE.md';
    // ACT
    const events = [
      adaptInstructions(loadInput({ load_reason: undefined }, null)),
      adaptInstructions(loadInput({ file_path: outside }, null)),
    ];
    // ASSERT
    expect(events).toEqual([null, null]);
  });
});

describe('edge cases', () => {
  it('writes nothing for the orchestrator once the marker Job has ended', () => {
    // ARRANGE
    const ended = { kind: 'end', t: '2026-10-09T09:05:00Z', seq: 4, trace_id: TRACE, span_id: JOB_SPAN } as RunLogLine;
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
      adaptSkill(input({ agent: true, toolInput: { skill: ` ${name} ` } }))?.attributes,
      adaptSkill(input({ agent: true, toolInput: { skill: '   ' } })),
    ];
    // ASSERT
    expect(events).toEqual([{ 'skill.name': name }, null]);
  });

  it('reads an older Skill tool input that names the skill as command', () => {
    // ARRANGE
    const name = 'tdd';
    // ACT
    const event = adaptSkill(input({ agent: true, toolInput: { command: name } }));
    // ASSERT
    expect(event?.attributes).toEqual({ 'skill.name': name });
  });

  it("files the orchestrator's Read on the marker's Job, and none between Jobs", () => {
    // ARRANGE
    const expected = { span_id: JOB_SPAN, attributes: { 'file.path': 'GLOSSARY.md' } };
    // ACT
    const inJob = adaptRead(readInput(`${ROOT}/GLOSSARY.md`, { agent: false }));
    const betweenJobs = adaptRead(readInput(`${ROOT}/GLOSSARY.md`, { agent: false, marker: markerIn(RUN_SPAN) }));
    // ASSERT
    expect(inJob).toMatchObject(expected);
    expect(betweenJobs).toBeNull();
  });

  it('names no ADR for an instruction file that resolves outside .archgate/adrs, and carries no empty payload', () => {
    // ARRANGE
    const expected = { 'file.path': 'CLAUDE.md', load_reason: 'session_start' };
    // ACT
    const event = adaptInstructions(
      loadInput({ file_path: `${ROOT}/CLAUDE.md`, load_reason: 'session_start' }, `${ROOT}/AGENTS.md`),
    );
    // ASSERT
    expect(event?.attributes).toEqual(expected);
    expect(event).not.toHaveProperty('payload');
  });
});
